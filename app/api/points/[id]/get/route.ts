import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET - Obtener puntos de una persona por su person_id
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const params = await context.params;
    const personId = params.id;

    const { data, error } = await supabase
      .from("point")
      .select("*")
      .eq("person_id", personId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found - user has no points yet
        return NextResponse.json({
          person_id: personId,
          point_amount: 0,
          exists: false,
        });
      }
      return NextResponse.json(
        { error: "Error al obtener los puntos: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...data,
      exists: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
