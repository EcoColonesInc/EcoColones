import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; 

// POST - Insertar una ciudad
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const cityName = body.city_name || body.cityName;
        const provinceName = body.province_name || body.provinceName;

        // Validar campos requeridos
        if (!cityName || !provinceName) {
            return NextResponse.json({ error: "El nombre de la ciudad y la provincia son requeridos" }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Obtener el province_id
        const { data: provinceData, error: provinceError } = await supabase
            .from('province')
            .select('province_id')
            .eq('province_name', provinceName)
            .single();

        if (provinceError || !provinceData) {
            console.error("Province error:", provinceError);
            return NextResponse.json({ error: `La provincia "${provinceName}" no existe` }, { status: 404 });
        }

        // Verificar si la ciudad ya existe en esa provincia
        const { data: existingCity, error: checkError } = await supabase
            .from('city')
            .select('city_id')
            .eq('city_name', cityName)
            .eq('province_id', provinceData.province_id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ error: `Error al verificar la ciudad: ${checkError.message}` }, { status: 400 });
        }

        if (existingCity) {
            return NextResponse.json({ error: "La ciudad con este nombre ya existe en esta provincia" }, { status: 409 });
        }

        // Insertar la ciudad
        const { data, error } = await supabase.from('city').insert([{
            province_id: provinceData.province_id,
            city_name: cityName,
            created_by: user.id,
            updated_by: user.id
        }]).select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: `Error al crear la ciudad: ${error.message}` }, { status: 400 });
        }

        console.log("City created successfully:", data);
        return NextResponse.json({ 
            message: "Ciudad creada exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert city error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
