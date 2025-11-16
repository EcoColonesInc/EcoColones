import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar un material
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Extraer campos
        const name = body.name;
        const unitName = body.unit_name || body.unitName;
        const equivalentPoints = body.equivalent_points || body.equivalentPoints;

        // Validar campos requeridos
        if (!name || !unitName) {
            return NextResponse.json({ error: "El nombre y la unidad son requeridos" }, { status: 400 });
        }

        // Validar equivalent_points si se proporciona
        if (equivalentPoints !== null && equivalentPoints !== undefined && equivalentPoints < 0) {
            return NextResponse.json({ error: "equivalent_points no puede ser negativo" }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Verificar si el material ya existe
        const { data: existingMaterial, error: checkError } = await supabase
            .from('material')
            .select('material_id')
            .eq('name', name)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error("Check error:", checkError);
            return NextResponse.json({ error: `Error al verificar el material: ${checkError.message}` }, { status: 400 });
        }

        if (existingMaterial) {
            return NextResponse.json({ error: "El material con este nombre ya existe" }, { status: 409 });
        }

        // Obtener el unit_id
        const { data: unitData, error: unitError } = await supabase
            .from('unit')
            .select('unit_id')
            .eq('unit_name', unitName)
            .single();

        if (unitError || !unitData) {
            console.error("Unit error:", unitError);
            return NextResponse.json({ error: `La unidad "${unitName}" no existe` }, { status: 404 });
        }

        // Insertar el material
        const { data, error } = await supabase.from('material').insert([{
            unit_id: unitData.unit_id,
            name: name,
            equivalent_points: equivalentPoints,
            created_by: user.id,
            updated_by: user.id
        }]).select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: `Error al crear el material: ${error.message}` }, { status: 400 });
        }

        console.log("Material created successfully:", data);
        return NextResponse.json({ 
            message: "Material creado exitosamente.",
            data 
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert material error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
