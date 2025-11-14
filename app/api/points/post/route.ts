import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar puntos de un usuario
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const personId = body.person_id || body.personId;
        const pointAmount = body.point_amount || body.pointAmount;

        // Validar campos requeridos
        if (!personId || pointAmount === undefined || pointAmount === null) {
            return NextResponse.json({ 
                error: "Los campos person_id y point_amount son requeridos" 
            }, { status: 400 });
        }

        // Validar que point_amount sea un número válido
        if (isNaN(pointAmount) || pointAmount < 0) {
            return NextResponse.json({ 
                error: "El punto debe ser un número mayor o igual a 0" 
            }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Verificar que la persona existe
        const { data: personData, error: personError } = await supabase
            .from('person')
            .select('user_id')
            .eq('user_id', personId)
            .single();

        if (personError || !personData) {
            console.error("Person error:", personError);
            return NextResponse.json({ 
                error: `La persona con ID "${personId}" no existe` 
            }, { status: 404 });
        }

        // Verificar si ya existen puntos para esta persona
        const { data: existingPoints, error: checkError } = await supabase
            .from('point')
            .select('person_id')
            .eq('person_id', personId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar los puntos: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingPoints) {
            return NextResponse.json({ 
                error: "Ya existen puntos registrados para esta persona" 
            }, { status: 409 });
        }

        // Insertar los puntos
        const { data, error } = await supabase
            .from('point')
            .insert([{
                person_id: personId,
                point_amount: pointAmount,
                created_by: user.id,
                updated_by: user.id
            }])
            .select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear los puntos: ${error.message}` 
            }, { status: 400 });
        }

        console.log("Points created successfully:", data);
        return NextResponse.json({ 
            message: "Puntos creados exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert points error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}