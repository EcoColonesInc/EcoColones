import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; 

// GET - Obtener lista de paises

// POST - Crear un nuevo pais
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const countryName = body.country_name || body.countryName;

        // Validar campos requeridos
        if (!countryName) {
            return NextResponse.json({ error: "El nombre del país es requerido" }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Verificar si el país ya existe
        const { data: existingCountry, error: checkError } = await supabase
            .from('country')
            .select('country_id')
            .eq('country_name', countryName)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ error: `Error al verificar el país: ${checkError.message}` }, { status: 400 });
        }

        if (existingCountry) {
            return NextResponse.json({ error: "El país con este nombre ya existe" }, { status: 409 });
        }

        // Insertar el país
        const { data, error } = await supabase.from('country').insert([{
            country_name: countryName,
            created_by: user.id,
            updated_by: user.id
        }]).select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: `Error al crear el país: ${error.message}` }, { status: 400 });
        }

        console.log("Country created successfully:", data);
        return NextResponse.json({ 
            message: "País creado exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert country error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}