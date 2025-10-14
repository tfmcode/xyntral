// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  // ✅ Validar que Mercado Pago esté configurado
  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const isDevelopmentMode =
    !MP_ACCESS_TOKEN ||
    MP_ACCESS_TOKEN.includes("your_") ||
    MP_ACCESS_TOKEN === "TEST-";

  if (isDevelopmentMode) {
    console.warn("⚠️ Mercado Pago no configurado - Modo desarrollo");
  }

  let dbClient = null;

  try {
    const body = await req.json();
    const { items, direccion, metodo_pago } = body;

    // ========================================
    // VALIDACIONES INICIALES
    // ========================================
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

    if (!direccion.nombre_contacto || !direccion.telefono_contacto) {
      return NextResponse.json(
        { message: "Faltan datos de contacto" },
        { status: 400 }
      );
    }

    if (!["mercadopago", "transferencia"].includes(metodo_pago)) {
      return NextResponse.json(
        { message: "Método de pago inválido" },
        { status: 400 }
      );
    }

    // ========================================
    // INICIAR TRANSACCIÓN
    // ========================================
    dbClient = await pool.connect();
    await dbClient.query("BEGIN");

    // ========================================
    // 1. INSERTAR DIRECCIÓN
    // ========================================
    const direccionQuery = `
      INSERT INTO direccion (
        usuario_id, nombre_contacto, telefono_contacto, direccion,
        ciudad, provincia, codigo_postal, referencias, es_principal, pais
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, 'Argentina')
      RETURNING id;
    `;

    const direccionResult = await dbClient.query(direccionQuery, [
      user.id,
      direccion.nombre_contacto.trim(),
      direccion.telefono_contacto.trim(),
      direccion.direccion.trim(),
      direccion.ciudad.trim(),
      direccion.provincia?.trim() || "",
      direccion.codigo_postal?.trim() || "",
      direccion.referencias?.trim() || null,
    ]);

    const direccionId = direccionResult.rows[0].id;

    // ========================================
    // 2. VALIDAR STOCK Y CALCULAR TOTALES
    // ========================================
    let subtotal = 0;
    const productosData = [];

    for (const item of items) {
      // ✅ Validar item
      if (!item.producto_id || !item.cantidad || item.cantidad <= 0) {
        throw new Error("Datos de producto inválidos en el carrito");
      }

      // ✅ Obtener producto con lock para evitar race conditions
      const productoQuery = await dbClient.query(
        "SELECT id, nombre, precio, stock, sku, activo FROM producto WHERE id = $1 FOR UPDATE",
        [item.producto_id]
      );

      if (productoQuery.rows.length === 0) {
        throw new Error(`Producto ${item.producto_id} no encontrado`);
      }

      const producto = productoQuery.rows[0];

      // ✅ Validar que esté activo
      if (!producto.activo) {
        throw new Error(`El producto ${producto.nombre} ya no está disponible`);
      }

      // ✅ Validar stock suficiente
      if (producto.stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, solicitado: ${item.cantidad}`
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

    // ========================================
    // 3. CALCULAR ENVÍO Y TOTAL
    // ========================================
    const totalItems = items.reduce(
      (sum: number, item: { cantidad: number }) => sum + item.cantidad,
      0
    );
    const costoEnvio = totalItems >= 2 ? 0 : 5000;
    const total = subtotal + costoEnvio;

    // ========================================
    // 4. GENERAR NÚMERO DE PEDIDO ÚNICO
    // ========================================
    const numeroPedido = `XYN-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // ========================================
    // 5. CREAR PEDIDO
    // ========================================
    const pedidoQuery = `
      INSERT INTO pedido (
        numero_pedido, usuario_id, direccion_id, subtotal, 
        descuento, costo_envio, total, estado, metodo_pago
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', $8)
      RETURNING id;
    `;

    const pedidoResult = await dbClient.query(pedidoQuery, [
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

    // ========================================
    // 6. INSERTAR DETALLES DEL PEDIDO
    // ========================================
    for (const item of productosData) {
      await dbClient.query(
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

      // ✅ Reducir stock
      const updateStockResult = await dbClient.query(
        "UPDATE producto SET stock = stock - $1, ventas = ventas + $2 WHERE id = $3 RETURNING stock",
        [item.cantidad, item.cantidad, item.producto_id]
      );

      // ✅ Verificar que el update funcionó
      if (updateStockResult.rows.length === 0) {
        throw new Error(
          `Error al actualizar stock del producto ${item.nombre}`
        );
      }

      console.log(
        `✅ Stock actualizado - Producto ${item.nombre}: ${updateStockResult.rows[0].stock} unidades restantes`
      );
    }

    // ========================================
    // 7. CREAR PREFERENCIA DE MERCADO PAGO
    // ========================================
    let initPoint = null;
    let preferenceId = null;

    if (metodo_pago === "mercadopago") {
      if (isDevelopmentMode) {
        // ✅ Modo desarrollo sin MP configurado
        console.log("🧪 Modo desarrollo - simulando pago exitoso");
        initPoint = `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/${pedidoId}/success`;

        await dbClient.query(
          "UPDATE pedido SET mercadopago_preference_id = $1 WHERE id = $2",
          ["DEV-MODE-NO-MP", pedidoId]
        );
      } else {
        // ✅ MP configurado correctamente
        try {
          const mpClient = new MercadoPagoConfig({
            accessToken: MP_ACCESS_TOKEN!,
          });
          const preference = new Preference(mpClient);

          const mpItems = productosData.map((item) => ({
            id: item.sku,
            title: item.nombre,
            quantity: item.cantidad,
            unit_price: item.precio,
            currency_id: "ARS" as const,
          }));

          // Agregar envío como ítem si tiene costo
          if (costoEnvio > 0) {
            mpItems.push({
              id: "ENVIO",
              title: "Costo de envío",
              quantity: 1,
              unit_price: costoEnvio,
              currency_id: "ARS" as const,
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
          await dbClient.query(
            "UPDATE pedido SET mercadopago_preference_id = $1 WHERE id = $2",
            [preferenceId, pedidoId]
          );

          console.log(`✅ Preferencia MP creada: ${preferenceId}`);
        } catch (mpError) {
          console.error("❌ Error al crear preferencia MP:", mpError);
          throw new Error(
            "Error al procesar el pago con Mercado Pago. Intentá nuevamente."
          );
        }
      }
    }

    // ========================================
    // 8. VACIAR CARRITO DEL USUARIO
    // ========================================
    await dbClient.query("DELETE FROM carrito WHERE usuario_id = $1", [
      user.id,
    ]);

    // ========================================
    // COMMIT TRANSACCIÓN
    // ========================================
    await dbClient.query("COMMIT");

    console.log(
      `✅ Pedido creado exitosamente: ${numeroPedido} (ID: ${pedidoId})`
    );

    return NextResponse.json({
      success: true,
      pedido_id: pedidoId,
      numero_pedido: numeroPedido,
      init_point: initPoint,
      preference_id: preferenceId,
      total: total,
      message: "Pedido creado exitosamente",
    });
  } catch (error) {
    // ========================================
    // ROLLBACK EN CASO DE ERROR
    // ========================================
    if (dbClient) {
      try {
        await dbClient.query("ROLLBACK");
        console.log("🔄 Transacción revertida por error");
      } catch (rollbackError) {
        console.error("❌ Error al hacer rollback:", rollbackError);
      }
    }

    console.error("❌ Error en checkout:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error al procesar el pedido. Intentá nuevamente.",
      },
      { status: 500 }
    );
  } finally {
    // ========================================
    // LIBERAR CONEXIÓN
    // ========================================
    if (dbClient) {
      dbClient.release();
    }
  }
}
