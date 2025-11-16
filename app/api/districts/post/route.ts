import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; 

// POST - Insertar un distrito
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const districtName = body.district_name || body.districtName;
        const cityName = body.city_name || body.cityName;

        // Validar campos requeridos
        if (!districtName || !cityName) {
            return NextResponse.json({ error: "El nombre del distrito y la ciudad son requeridos" }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Obtener el city_id
        const { data: cityData, error: cityError } = await supabase
            .from('city')
            .select('city_id')
            .eq('city_name', cityName)
            .single();

        if (cityError || !cityData) {
            console.error("City error:", cityError);
            return NextResponse.json({ error: `La ciudad "${cityName}" no existe` }, { status: 404 });
        }

        // Verificar si el distrito ya existe en esa ciudad
        const { data: existingDistrict, error: checkError } = await supabase
            .from('district')
            .select('district_id')
            .eq('district_name', districtName)
            .eq('city_id', cityData.city_id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ error: `Error al verificar el distrito: ${checkError.message}` }, { status: 400 });
        }

        if (existingDistrict) {
            return NextResponse.json({ error: "El distrito con este nombre ya existe en esta ciudad" }, { status: 409 });
        }

        // Insertar el distrito
        const { data, error } = await supabase.from('district').insert([{
            city_id: cityData.city_id,
            district_name: districtName,
            created_by: user.id,
            updated_by: user.id
        }]).select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: `Error al crear el distrito: ${error.message}` }, { status: 400 });
        }

        console.log("District created successfully:", data);
        return NextResponse.json({ 
            message: "Distrito creado exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert district error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
