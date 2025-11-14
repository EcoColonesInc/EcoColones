import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar un producto
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const productName = body.product_name || body.productName;
        const description = body.description || null;

        // Validar campos requeridos
        if (!productName) {
            return NextResponse.json({ 
                error: "El campo product_name es requerido" 
            }, { status: 400 });
        }

        // Validar que product_name sea string
        if (typeof productName !== 'string') {
            return NextResponse.json({ 
                error: "El campo product_name debe ser un texto" 
            }, { status: 400 });
        }

        // Validar longitud del nombre del producto
        if (productName.trim().length === 0) {
            return NextResponse.json({ 
                error: "El nombre del producto no puede estar vacío" 
            }, { status: 400 });
        }

        if (productName.length > 50) {
            return NextResponse.json({ 
                error: "El nombre del producto no puede exceder 50 caracteres" 
            }, { status: 400 });
        }

        // Validar descripción si existe
        if (description !== null) {
            if (typeof description !== 'string') {
                return NextResponse.json({ 
                    error: "La descripción debe ser un texto" 
                }, { status: 400 });
            }

            if (description.trim().length === 0) {
                return NextResponse.json({ 
                    error: "La descripción no puede estar vacía. Si no deseas agregar descripción, omite el campo." 
                }, { status: 400 });
            }

            if (description.length > 100) {
                return NextResponse.json({ 
                    error: "La descripción no puede exceder 100 caracteres" 
                }, { status: 400 });
            }
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Verificar si ya existe un producto con ese nombre
        const { data: existingProduct, error: checkError } = await supabase
            .from('product')
            .select('product_id, product_name')
            .ilike('product_name', productName.trim())
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar el producto: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingProduct) {
            return NextResponse.json({ 
                error: `Ya existe un producto con el nombre "${productName.trim()}"` 
            }, { status: 409 });
        }

        // Insertar el producto con estado 'active' por defecto
        const { data, error } = await supabase
            .from('product')
            .insert([{
                product_name: productName.trim(),
                description: description ? description.trim() : null,
                state: 'active',
                created_by: user.id,
                updated_by: user.id
            }])
            .select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear el producto: ${error.message}` 
            }, { status: 400 });
        }

        console.log("Product created successfully:", data);
        return NextResponse.json({ 
            message: "Producto creado exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert product error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}