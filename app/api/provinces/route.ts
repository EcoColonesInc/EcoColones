import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; 

// GET - Obtener lista de provincias

// POST - Insertar nueva provincia
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const provinceName = body.province_name || body.provinceName;
        const countryName = body.country_name || body.countryName;

        // Validar campos requeridos
        if (!provinceName || !countryName) {
            return NextResponse.json({ error: "El nombre de la provincia y el país son requeridos" }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Obtener el country_id
        const { data: countryData, error: countryError } = await supabase
            .from('country')
            .select('country_id')
            .eq('country_name', countryName)
            .single();

        if (countryError || !countryData) {
            console.error("Country error:", countryError);
            return NextResponse.json({ error: `El país "${countryName}" no existe` }, { status: 404 });
        }

        // Verificar si la provincia ya existe en ese país
        const { data: existingProvince, error: checkError } = await supabase
            .from('province')
            .select('province_id')
            .eq('province_name', provinceName)
            .eq('country_id', countryData.country_id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ error: `Error al verificar la provincia: ${checkError.message}` }, { status: 400 });
        }

        if (existingProvince) {
            return NextResponse.json({ error: "La provincia con este nombre ya existe en este país" }, { status: 409 });
        }

        // Insertar la provincia
        const { data, error } = await supabase.from('province').insert([{
            country_id: countryData.country_id,
            province_name: provinceName,
            created_by: user.id,
            updated_by: user.id
        }]).select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: `Error al crear la provincia: ${error.message}` }, { status: 400 });
        }

        console.log("Province created successfully:", data);
        return NextResponse.json({ 
            message: "Provincia creada exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert province error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}