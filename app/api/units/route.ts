import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Listar todas las unidades

// POST - Insertar nueva unidad
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Extraer campos
        const unitName = body.unit_name || body.unitName;
        const unitExchange = body.unit_exchange || body.unitExchange;

        // Validar campos requeridos
        if (!unitName || !unitExchange) {
            return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
        }

        // Validar unit_exchange > 0
        if (unitExchange <= 0) {
            return NextResponse.json({ error: "El valor de intercambio debe ser mayor a 0" }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Insertar directamente en la tabla usando el API de Supabase
        const { data, error } = await supabase.from('unit').insert([{
            unit_name: unitName,
            unit_exchange: unitExchange,
            created_by: user.id,
            updated_by: user.id
        }]).select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: `Error al crear la unidad: ${error.message}` }, { status: 400 });
        }

        console.log("Unit created successfully:", data);
        return NextResponse.json({ 
            message: "Unidad creada exitosamente.",
            data 
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert unit error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}