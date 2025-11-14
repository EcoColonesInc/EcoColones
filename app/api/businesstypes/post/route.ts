import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar un tipo de negocio
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const name = body.name;

        // Validar campos requeridos
        if (!name) {
            return NextResponse.json({ 
                error: "El campo name es requerido" 
            }, { status: 400 });
        }

        // Validar que name sea string
        if (typeof name !== 'string') {
            return NextResponse.json({ 
                error: "El campo name debe ser un texto" 
            }, { status: 400 });
        }

        // Validar longitud del nombre
        if (name.trim().length === 0) {
            return NextResponse.json({ 
                error: "El nombre no puede estar vacío" 
            }, { status: 400 });
        }

        if (name.length > 50) {
            return NextResponse.json({ 
                error: "El nombre no puede exceder 50 caracteres" 
            }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Verificar si ya existe un tipo de negocio con ese nombre
        const { data: existingBusinessType, error: checkError } = await supabase
            .from('businesstype')
            .select('business_type_id, name')
            .eq('name', name.trim())
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar el tipo de negocio: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingBusinessType) {
            return NextResponse.json({ 
                error: `Ya existe un tipo de negocio con el nombre "${name.trim()}"` 
            }, { status: 409 });
        }

        // Insertar el tipo de negocio
        const { data, error } = await supabase
            .from('businesstype')
            .insert([{
                name: name.trim(),
                created_by: user.id,
                updated_by: user.id
            }])
            .select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear el tipo de negocio: ${error.message}` 
            }, { status: 400 });
        }

        console.log("BusinessType created successfully:", data);
        return NextResponse.json({ 
            message: "Tipo de negocio creado exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert businesstype error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}