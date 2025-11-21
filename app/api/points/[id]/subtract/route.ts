import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// PATCH - Decrementar puntos de una persona
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { points } = await request.json();
    const params = await context.params;

    if (typeof points !== "number" || points < 0) {
      return NextResponse.json(
        { error: "El valor de 'points' debe ser un número positivo" },
        { status: 400 }
      );
    }

    const personId = params.id;

    if (!personId || personId === "undefined") {
      return NextResponse.json(
        { error: "ID de persona inválido o no proporcionado" },
        { status: 400 }
      );
    }

    // Get current points
    const { data: currentData, error: fetchError } = await supabase
      .from("point")
      .select("point_amount")
      .eq("person_id", personId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Error al obtener los puntos actuales: " + fetchError.message },
        { status: 500 }
      );
    }

    const currentPoints = currentData?.point_amount || 0;

    // Check if user has enough points
    if (currentPoints < points) {
      return NextResponse.json(
        { 
          error: "Puntos insuficientes",
          current_points: currentPoints,
          requested_points: points
        },
        { status: 400 }
      );
    }

    const newTotal = currentPoints - points;

    // Update points
    const { data, error: updateError } = await supabase
      .from("point")
      .update({ point_amount: newTotal })
      .eq("person_id", personId)
      .select();

    if (updateError) {
      return NextResponse.json(
        { error: "Error al actualizar los puntos: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Puntos descontados exitosamente",
      previous_points: currentPoints,
      subtracted_points: points,
      new_total: newTotal,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
