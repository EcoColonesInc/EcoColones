import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar relación entre negocio afiliado y producto
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const productName = body.product_name || body.productName;
        const affiliatedBusinessName = body.affiliated_business_name || body.affiliatedBusinessName;
        const productPrice = body.product_price || body.productPrice;

        // Validar campos requeridos
        if (!productName || !affiliatedBusinessName || productPrice === undefined || productPrice === null) {
            return NextResponse.json({ 
                error: "Los campos product_name, affiliated_business_name y product_price son requeridos" 
            }, { status: 400 });
        }

        // Validar que productPrice sea un número válido
        if (isNaN(productPrice) || productPrice <= 0) {
            return NextResponse.json({ 
                error: "El product_price debe ser un número mayor a 0" 
            }, { status: 400 });
        }

        // Validar que productPrice sea un entero
        if (!Number.isInteger(Number(productPrice))) {
            return NextResponse.json({ 
                error: "El product_price debe ser un número entero" 
            }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Obtener el ID del producto por su nombre
        const { data: productData, error: productError } = await supabase
            .from('product')
            .select('product_id, product_name, state')
            .ilike('product_name', productName.trim())
            .single();

        if (productError || !productData) {
            console.error("Product error:", productError);
            return NextResponse.json({ 
                error: `El producto "${productName}" no existe` 
            }, { status: 404 });
        }

        // Validar que el producto esté activo
        if (productData.state && productData.state !== 'active') {
            return NextResponse.json({ 
                error: `El producto "${productName}" no está disponible (estado: ${productData.state})` 
            }, { status: 400 });
        }

        // Obtener el ID del negocio afiliado por su nombre
        const { data: businessData, error: businessError } = await supabase
            .from('affiliatedbusiness')
            .select('affiliated_business_id, affiliated_business_name')
            .ilike('affiliated_business_name', affiliatedBusinessName.trim())
            .single();

        if (businessError || !businessData) {
            console.error("Affiliated business error:", businessError);
            return NextResponse.json({ 
                error: `El negocio afiliado "${affiliatedBusinessName}" no existe` 
            }, { status: 404 });
        }

        const productId = productData.product_id;
        const affiliatedBusinessId = businessData.affiliated_business_id;

        // Verificar si ya existe la relación
        const { data: existingRelation, error: checkError } = await supabase
            .from('affiliatedbusinessxproduct')
            .select('affiliated_business_x_prod')
            .eq('product_id', productId)
            .eq('affiliated_business_id', affiliatedBusinessId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar la relación: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingRelation) {
            return NextResponse.json({ 
                error: `Ya existe una relación entre el negocio "${affiliatedBusinessName}" y el producto "${productName}"` 
            }, { status: 409 });
        }

        // Insertar la relación
        const { data, error } = await supabase
            .from('affiliatedbusinessxproduct')
            .insert([{
                product_id: productId,
                affiliated_business_id: affiliatedBusinessId,
                product_price: Number(productPrice),
                created_by: user.id,
                updated_by: user.id
            }])
            .select(`
                affiliated_business_x_prod,
                product_id,
                affiliated_business_id,
                product_price,
                created_by,
                created_at,
                updated_by,
                updated_at,
                product:product_id (
                    product_id,
                    product_name,
                    description,
                    state
                ),
                affiliatedbusiness:affiliated_business_id (
                    affiliated_business_id,
                    affiliated_business_name,
                    phone,
                    email
                )
            `);

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear la relación: ${error.message}` 
            }, { status: 400 });
        }

        console.log("AffiliatedBusinessXProduct created successfully:", data);
        return NextResponse.json({ 
            message: "Relación creada exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert affiliatedbusinessxproduct error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}