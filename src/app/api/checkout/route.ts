// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const preference = new Preference(client);

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { items, direccion, metodo_pago } = body;

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "El carrito está vacío" },
        { status: 400 }
      );
    }

    if (!direccion || !direccion.direccion || !direccion.ciudad) {
      return NextResponse.json(
        { message: "Faltan datos de dirección" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Insertar dirección
      const direccionQuery = `
        INSERT INTO direccion (
          usuario_id, nombre_contacto, telefono_contacto, direccion,
          ciudad, provincia, codigo_postal, referencias, es_principal, pais
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, 'Argentina')
        RETURNING id;
      `;

      const direccionResult = await client.query(direccionQuery, [
        user.id,
        direccion.nombre_contacto,
        direccion.telefono_contacto,
        direccion.direccion,
        direccion.ciudad,
        direccion.provincia || "",
        direccion.codigo_postal || "",
        direccion.referencias || null,
      ]);

      const direccionId = direccionResult.rows[0].id;

      // 2. Calcular totales
      let subtotal = 0;
      const productosData = [];

      for (const item of items) {
        const productoQuery = await client.query(
          "SELECT id, nombre, precio, stock, sku FROM producto WHERE id = $1",
          [item.producto_id]
        );

        if (productoQuery.rows.length === 0) {
          throw new Error(`Producto ${item.producto_id} no encontrado`);
        }

        const producto = productoQuery.rows[0];

        if (producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
          );
        }

        const itemSubtotal = producto.precio * item.cantidad;
        subtotal += itemSubtotal;

        productosData.push({
          producto_id: producto.id,
          nombre: producto.nombre,
          sku: producto.sku,
          cantidad: item.cantidad,
          precio: producto.precio,
          subtotal: itemSubtotal,
        });
      }

      // Calcular envío (gratis desde 2da unidad)
      const totalItems = items.reduce(
        (sum: number, item: { cantidad: number }) => sum + item.cantidad,
        0
      );
      const costoEnvio = totalItems >= 2 ? 0 : 5000;
      const total = subtotal + costoEnvio;

      // 3. Generar número de pedido único
      const numeroPedido = `XYN-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      // 4. Crear pedido
      const pedidoQuery = `
        INSERT INTO pedido (
          numero_pedido, usuario_id, direccion_id, subtotal, 
          descuento, costo_envio, total, estado, metodo_pago
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', $8)
        RETURNING id;
      `;

      const pedidoResult = await client.query(pedidoQuery, [
        numeroPedido,
        user.id,
        direccionId,
        subtotal,
        0, // descuento
        costoEnvio,
        total,
        metodo_pago,
      ]);

      const pedidoId = pedidoResult.rows[0].id;

      // 5. Insertar detalles del pedido
      for (const item of productosData) {
        await client.query(
          `INSERT INTO detalle_pedido (
            pedido_id, producto_id, nombre_producto, sku, 
            cantidad, precio_unitario, subtotal
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            pedidoId,
            item.producto_id,
            item.nombre,
            item.sku,
            item.cantidad,
            item.precio,
            item.subtotal,
          ]
        );

        // 6. Reducir stock
        await client.query(
          "UPDATE producto SET stock = stock - $1 WHERE id = $2",
          [item.cantidad, item.producto_id]
        );
      }

      // 7. Crear preferencia de Mercado Pago
      let initPoint = null;
      let preferenceId = null;

      if (metodo_pago === "mercadopago") {
        const mpItems = productosData.map((item) => ({
          id: item.sku,
          title: item.nombre,
          quantity: item.cantidad,
          unit_price: item.precio,
          currency_id: "ARS",
        }));

        // Agregar envío como ítem si tiene costo
        if (costoEnvio > 0) {
          mpItems.push({
            id: "ENVIO",
            title: "Costo de envío",
            quantity: 1,
            unit_price: costoEnvio,
            currency_id: "ARS",
          });
        }

        const preferenceData = {
          body: {
            items: mpItems,
            payer: {
              email: user.email,
              name: direccion.nombre_contacto,
              phone: {
                number: direccion.telefono_contacto,
              },
            },
            back_urls: {
              success: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/${pedidoId}/success`,
              failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/${pedidoId}/failure`,
              pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/${pedidoId}/pending`,
            },
            auto_return: "approved" as const,
            external_reference: numeroPedido,
            notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
            statement_descriptor: "XYNTRAL",
          },
        };

        const preferenceResponse = await preference.create(preferenceData);

        initPoint = preferenceResponse.init_point;
        preferenceId = preferenceResponse.id;

        // Guardar preference_id en el pedido
        await client.query(
          "UPDATE pedido SET mercadopago_preference_id = $1 WHERE id = $2",
          [preferenceId, pedidoId]
        );
      }

      await client.query("COMMIT");

      return NextResponse.json({
        pedido_id: pedidoId,
        numero_pedido: numeroPedido,
        init_point: initPoint,
        preference_id: preferenceId,
        total: total,
        message: "Pedido creado exitosamente",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error en checkout:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error al procesar el pedido",
      },
      { status: 500 }
    );
  }
}
