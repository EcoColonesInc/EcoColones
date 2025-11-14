import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar un parámetro
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const name = body.name;
        const value = body.value;

        // Validar campos requeridos
        if (!name || !value) {
            return NextResponse.json({ 
                error: "Los campos name y value son requeridos" 
            }, { status: 400 });
        }

        // Validar longitud del nombre
        if (name.length > 50) {
            return NextResponse.json({ 
                error: "El nombre no puede exceder 50 caracteres" 
            }, { status: 400 });
        }

        // Validar que value sea un UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            return NextResponse.json({ 
                error: "El valor debe ser un UUID válido" 
            }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Verificar si ya existe un parámetro con ese nombre
        const { data: existingParameter, error: checkError } = await supabase
            .from('parameter')
            .select('parameter_id, name')
            .eq('name', name)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar el parámetro: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingParameter) {
            return NextResponse.json({ 
                error: `Ya existe un parámetro con el nombre "${name}"` 
            }, { status: 409 });
        }

        // Insertar el parámetro
        const { data, error } = await supabase
            .from('parameter')
            .insert([{
                name: name,
                value: value,
                created_by: user.id,
                updated_by: user.id
            }])
            .select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear el parámetro: ${error.message}` 
            }, { status: 400 });
        }

        console.log("Parameter created successfully:", data);
        return NextResponse.json({ 
            message: "Parámetro creado exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert parameter error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}