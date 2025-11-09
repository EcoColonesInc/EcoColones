import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Listar todos los centros de recolección

// POST - Insertar nuevo centro de recolección
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const userName = body.user_name || body.userName;
        const districtName = body.district_name || body.districtName;
        const name = body.name;
        const phone = body.phone;
        const managerName = body.manager_name || body.managerName;
        const latitude = body.latitude;
        const longitude = body.longitude;

        // Validar campos requeridos
        if (!userName || !districtName || !name || !phone || !managerName) {
            return NextResponse.json({ 
                error: "Los campos user_name, district_name, name, phone y manager_name son requeridos" 
            }, { status: 400 });
        }

        // Validar coordenadas si se proporcionan
        if (latitude !== null && latitude !== undefined) {
            if (isNaN(latitude) || latitude < -90 || latitude > 90) {
                return NextResponse.json({ 
                    error: "La latitud debe estar entre -90 y 90" 
                }, { status: 400 });
            }
        }

        if (longitude !== null && longitude !== undefined) {
            if (isNaN(longitude) || longitude < -180 || longitude > 180) {
                return NextResponse.json({ 
                    error: "La longitud debe estar entre -180 y 180" 
                }, { status: 400 });
            }
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Obtener el person_id (user_id) basado en el user_name
        const { data: personData, error: personError } = await supabase
            .from('person')
            .select('user_id')
            .eq('user_name', userName)
            .single();

        if (personError || !personData) {
            console.error("Person error:", personError);
            return NextResponse.json({ 
                error: `El usuario "${userName}" no existe en la tabla person` 
            }, { status: 404 });
        }

        // Obtener el district_id basado en el district_name
        const { data: districtData, error: districtError } = await supabase
            .from('district')
            .select('district_id')
            .eq('district_name', districtName)
            .single();

        if (districtError || !districtData) {
            console.error("District error:", districtError);
            return NextResponse.json({ 
                error: `El distrito "${districtName}" no existe` 
            }, { status: 404 });
        }

        // Verificar si ya existe un centro de recolección con el mismo nombre
        const { data: existingCenter, error: checkError } = await supabase
            .from('collectioncenter')
            .select('collectioncenter_id')
            .eq('name', name)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar el centro de recolección: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingCenter) {
            return NextResponse.json({ 
                error: "Ya existe un centro de recolección con este nombre" 
            }, { status: 409 });
        }

        // Insertar el centro de recolección
        const { data, error } = await supabase.from('collectioncenter').insert([{
            person_id: personData.user_id,
            district_id: districtData.district_id,
            name: name,
            phone: phone,
            manager_name: managerName,
            latitude: latitude || null,
            longitude: longitude || null,
            created_by: user.id,
            updated_by: user.id
        }]).select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear el centro de recolección: ${error.message}` 
            }, { status: 400 });
        }

        console.log("Collection center created successfully:", data);
        return NextResponse.json({ 
            message: "Centro de recolección creado exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert collection center error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}