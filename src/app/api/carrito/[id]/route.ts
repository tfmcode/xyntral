// PUT /api/carrito/[id] - Actualizar cantidad
// DELETE /api/carrito/[id] - Quitar producto
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import pool from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const { cantidad } = await req.json();

    if (cantidad <= 0) {
      return NextResponse.json(
        { message: "Cantidad inválida" },
        { status: 400 }
      );
    }

    // Verificar ownership y stock
    const checkQuery = `
      SELECT c.producto_id, p.stock
      FROM carrito c
      INNER JOIN producto p ON c.producto_id = p.id
      WHERE c.id = $1 AND c.usuario_id = $2
    `;

    const checkResult = await pool.query(checkQuery, [Number(id), user.id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Item no encontrado" },
        { status: 404 }
      );
    }

    const stock = checkResult.rows[0].stock;

    if (stock < cantidad) {
      return NextResponse.json(
        { message: `Solo hay ${stock} unidades disponibles` },
        { status: 400 }
      );
    }

    // Actualizar cantidad
    await pool.query(
      "UPDATE carrito SET cantidad = $1, fecha_actualizacion = NOW() WHERE id = $2",
      [cantidad, Number(id)]
    );

    return NextResponse.json({ message: "Cantidad actualizada" });
  } catch (error) {
    console.error("❌ Error al actualizar carrito:", error);
    return NextResponse.json(
      { message: "Error al actualizar carrito" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "cliente") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const result = await pool.query(
      "DELETE FROM carrito WHERE id = $1 AND usuario_id = $2 RETURNING id",
      [Number(id), user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Item no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error("❌ Error al eliminar del carrito:", error);
    return NextResponse.json(
      { message: "Error al eliminar del carrito" },
      { status: 500 }
    );
  }
}
