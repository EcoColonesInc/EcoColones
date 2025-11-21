import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// PATCH - Incrementar puntos de una persona
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

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Error al obtener los puntos actuales: " + fetchError.message },
        { status: 500 }
      );
    }

    const currentPoints = currentData?.point_amount || 0;
    const newTotal = currentPoints + points;

    // Update or insert points
    if (currentData) {
      // Update existing record
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
        message: "Puntos actualizados exitosamente",
        previous_points: currentPoints,
        added_points: points,
        new_total: newTotal,
        data,
      });
    } else {
      // Insert new record
      const { data, error: insertError } = await supabase
        .from("point")
        .insert({
          person_id: personId,
          point_amount: points,
          created_by: personId,
        })
        .select();

      if (insertError) {
        return NextResponse.json(
          { error: "Error al crear el registro de puntos: " + insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Puntos creados exitosamente",
        previous_points: 0,
        added_points: points,
        new_total: points,
        data,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
