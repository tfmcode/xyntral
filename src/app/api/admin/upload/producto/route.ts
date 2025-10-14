import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  if (!user || user.rol !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No se envió ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Tipo de archivo no permitido" },
        { status: 400 }
      );
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "El archivo es demasiado grande (máx 5MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const ext = file.name.split(".").pop();
    const filename = `producto-${uniqueSuffix}.${ext}`;

    // Guardar en public/uploads/productos
    const uploadDir = join(process.cwd(), "public", "uploads", "productos");
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // URL pública
    const publicUrl = `/uploads/productos/${filename}`;

    console.log(`✅ Imagen subida: ${filename}`);

    return NextResponse.json({
      message: "Imagen subida exitosamente",
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    return NextResponse.json(
      { message: "Error al subir imagen" },
      { status: 500 }
    );
  }
}
