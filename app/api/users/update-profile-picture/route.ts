import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const photo = formData.get("photo") as File;
    const username = formData.get("username") as string;

    if (!photo || !username) {
      return NextResponse.json(
        { error: "Foto y nombre de usuario son requeridos" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo inválido. Solo se permiten JPG y PNG" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no debe superar los 5MB" },
        { status: 400 }
      );
    }


    // Convert image to JPG using Sharp
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const jpgBuffer = await sharp(buffer)
      .jpeg({
        quality: 85,
        mozjpeg: true
      })
      .toBuffer();

    // Upload new photo to Supabase Storage (always as .jpg)
    const fileName = `${username}.jpg`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('profile_pictures')
      .upload(filePath, jpgBuffer, {
        cacheControl: '60',
        upsert: true,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: `Error al subir la foto: ${uploadError.message}` },
        { status: 400 }
      );
    }

    // Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
      .from('profile_pictures')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: "Error al obtener la URL de la foto" },
        { status: 500 }
      );
    }

    return NextResponse.json({
        message: "Foto de perfil actualizada exitosamente",
        photoUrl: urlData.publicUrl
    }, { status: 200 });

  } catch (err: unknown) {
    console.error("Update profile picture error:", err);
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
