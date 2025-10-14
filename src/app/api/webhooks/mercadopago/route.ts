// src/app/api/webhooks/mercadopago/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const payment = new Payment(client);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("📧 Webhook de Mercado Pago recibido:", JSON.stringify(body));

    // Verificar que sea una notificación de pago
    if (body.type !== "payment") {
      console.log("ℹ️ Notificación ignorada, tipo:", body.type);
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      console.error("❌ Payment ID no encontrado en la notificación");
      return NextResponse.json(
        { error: "Payment ID missing" },
        { status: 400 }
      );
    }

    // Obtener información del pago desde MP
    const paymentInfo = await payment.get({ id: paymentId });

    console.log("💳 Información del pago:", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      external_reference: paymentInfo.external_reference,
    });

    const numeroPedido = paymentInfo.external_reference;

    if (!numeroPedido) {
      console.error("❌ External reference no encontrado");
      return NextResponse.json(
        { error: "External reference missing" },
        { status: 400 }
      );
    }

    // Buscar el pedido en la base de datos
    const pedidoQuery = await pool.query(
      "SELECT id, estado FROM pedido WHERE numero_pedido = $1",
      [numeroPedido]
    );

    if (pedidoQuery.rows.length === 0) {
      console.error("❌ Pedido no encontrado:", numeroPedido);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pedido = pedidoQuery.rows[0];

    // Mapear estado de MP a estado interno
    let nuevoEstado = pedido.estado;
    let fechaPago = null;

    switch (paymentInfo.status) {
      case "approved":
        nuevoEstado = "procesando";
        fechaPago = new Date().toISOString();
        console.log("✅ Pago aprobado");
        break;
      case "pending":
      case "in_process":
        nuevoEstado = "pendiente";
        console.log("⏳ Pago pendiente");
        break;
      case "rejected":
      case "cancelled":
        nuevoEstado = "cancelado";
        console.log("❌ Pago rechazado/cancelado");
        break;
      default:
        console.log("ℹ️ Estado de pago:", paymentInfo.status);
    }

    // Actualizar el pedido
    const updateQuery = `
      UPDATE pedido
      SET 
        estado = $1,
        mercadopago_payment_id = $2,
        mercadopago_status = $3,
        fecha_pago = COALESCE($4, fecha_pago),
        fecha_procesado = CASE WHEN $1 = 'procesando' THEN NOW() ELSE fecha_procesado END
      WHERE id = $5
      RETURNING id, numero_pedido, estado;
    `;

    const updateResult = await pool.query(updateQuery, [
      nuevoEstado,
      paymentInfo.id?.toString(),
      paymentInfo.status,
      fechaPago,
      pedido.id,
    ]);

    // Guardar registro del pago
    const pagoQuery = `
      INSERT INTO pago (
        pedido_id, mercadopago_payment_id, mercadopago_preference_id,
        status, status_detail, payment_method_id, payment_type_id,
        transaction_amount, payer_email, external_reference, raw_response
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (mercadopago_payment_id) 
      DO UPDATE SET
        status = EXCLUDED.status,
        status_detail = EXCLUDED.status_detail,
        fecha_actualizacion = NOW(),
        raw_response = EXCLUDED.raw_response;
    `;

    await pool.query(pagoQuery, [
      pedido.id,
      paymentInfo.id?.toString(),
      null, // preference_id no está disponible en PaymentResponse
      paymentInfo.status,
      paymentInfo.status_detail || null,
      paymentInfo.payment_method_id || null,
      paymentInfo.payment_type_id || null,
      paymentInfo.transaction_amount || 0,
      paymentInfo.payer?.email || null,
      numeroPedido,
      JSON.stringify(paymentInfo),
    ]);

    console.log(
      `✅ Pedido ${updateResult.rows[0].numero_pedido} actualizado a estado: ${updateResult.rows[0].estado}`
    );

    return NextResponse.json({
      received: true,
      pedido_id: pedido.id,
      nuevo_estado: nuevoEstado,
    });
  } catch (error) {
    console.error("❌ Error procesando webhook de MP:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
