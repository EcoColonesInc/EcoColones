import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar una transacción de negocio afiliado
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const personName = body.person_name || body.personName;
        const affiliatedBusinessName = body.affiliated_business_name || body.affiliatedBusinessName;
        const currencyName = body.currency_name || body.currencyName;
        const productName = body.product_name || body.productName;
        const productAmount = body.product_amount || body.productAmount;
        const transactionCode = body.transaction_code || body.transactionCode;

        // Validar campos requeridos
        if (!personName || !affiliatedBusinessName || !currencyName || !productName || 
            productAmount === undefined || productAmount === null || !transactionCode) {
            return NextResponse.json({ 
                error: "Los campos person_name, affiliated_business_name, currency_name, product_name, product_amount y transaction_code son requeridos" 
            }, { status: 400 });
        }

        // Validar product_amount
        if (isNaN(productAmount) || productAmount <= 0) {
            return NextResponse.json({ 
                error: "El product_amount debe ser un número mayor a 0" 
            }, { status: 400 });
        }

        // Validar transaction_code
        if (typeof transactionCode !== 'string' || transactionCode.trim().length === 0) {
            return NextResponse.json({ 
                error: "El transaction_code no puede estar vacío" 
            }, { status: 400 });
        }

        if (transactionCode.length > 100) {
            return NextResponse.json({ 
                error: "El transaction_code no puede exceder 100 caracteres" 
            }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Separar el nombre completo de la persona
        const nameParts = personName.trim().split(/\s+/);
        
        if (nameParts.length < 2) {
            return NextResponse.json({ 
                error: "El person_name debe contener al menos nombre y primer apellido (separados por espacios)" 
            }, { status: 400 });
        }

        const firstName = nameParts[0];
        const lastName = nameParts[1];
        const secondLastName = nameParts.length > 2 ? nameParts.slice(2).join(' ') : null;

        // Obtener el ID de la persona por su nombre completo
        let personQuery = supabase
            .from('person')
            .select('user_id')
            .eq('first_name', firstName)
            .eq('last_name', lastName);

        if (secondLastName) {
            personQuery = personQuery.eq('second_last_name', secondLastName);
        } else {
            personQuery = personQuery.is('second_last_name', null);
        }

        const { data: personData, error: personError } = await personQuery.single();

        if (personError || !personData) {
            console.error("Person error:", personError);
            return NextResponse.json({ 
                error: `La persona "${personName}" no existe` 
            }, { status: 404 });
        }

        // Obtener el ID del negocio afiliado por su nombre
        const { data: businessData, error: businessError } = await supabase
            .from('affiliatedbusiness')
            .select('affiliated_business_id')
            .ilike('affiliated_business_name', affiliatedBusinessName.trim())
            .single();

        if (businessError || !businessData) {
            console.error("Affiliated business error:", businessError);
            return NextResponse.json({ 
                error: `El negocio afiliado "${affiliatedBusinessName}" no existe` 
            }, { status: 404 });
        }

        // Obtener el ID de la moneda por su nombre
        const { data: currencyData, error: currencyError } = await supabase
            .from('currency')
            .select('currency_id, currency_exchange')
            .ilike('currency_name', currencyName.trim())
            .single();

        if (currencyError || !currencyData) {
            console.error("Currency error:", currencyError);
            return NextResponse.json({ 
                error: `La moneda "${currencyName}" no existe` 
            }, { status: 404 });
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
                error: `El producto "${productName.trim()}" no existe` 
            }, { status: 404 });
        }

        // Validar que el producto esté activo
        if (productData.state === 'inactive') {
            return NextResponse.json({ 
                error: `El producto "${productName}" no está disponible (inactivo)` 
            }, { status: 400 });
        }

        const personId = personData.user_id;
        const affiliatedBusinessId = businessData.affiliated_business_id;
        const currencyId = currencyData.currency_id;
        const productId = productData.product_id;

        // Obtener el precio del producto en el negocio afiliado
        const { data: productPriceData, error: productPriceError } = await supabase
            .from('affiliatedbusinessxproduct')
            .select('product_price')
            .eq('affiliated_business_id', affiliatedBusinessId)
            .eq('product_id', productId)
            .single();

        if (productPriceError || !productPriceData) {
            console.error("Product price error:", productPriceError);
            return NextResponse.json({ 
                error: `El producto "${productName}" no está disponible en el negocio "${affiliatedBusinessName}"` 
            }, { status: 404 });
        }

        const productPrice = productPriceData.product_price;

        // Calcular total_price
        const totalPrice = Math.floor(productAmount * productPrice);

        if (totalPrice <= 0) {
            return NextResponse.json({ 
                error: "El total_price debe ser mayor a 0. Verifica el producto y la cantidad." 
            }, { status: 400 });
        }

        // Verificar si el código de transacción ya existe
        const { data: existingTransaction, error: checkError } = await supabase
            .from('affiliatedbusinesstransaction')
            .select('ab_transaction_id')
            .eq('transaction_code', transactionCode.trim())
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar el código de transacción: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingTransaction) {
            return NextResponse.json({ 
                error: `Ya existe una transacción con el código "${transactionCode.trim()}"` 
            }, { status: 409 });
        }

        // Insertar la transacción con estado 'active'
        const { data, error } = await supabase
            .from('affiliatedbusinesstransaction')
            .insert([{
                person_id: personId,
                affiliated_business_id: affiliatedBusinessId,
                currency_id: currencyId,
                product_id: productId,
                total_price: totalPrice,
                product_amount: productAmount,
                transaction_code: transactionCode.trim(),
                state: 'active',
                created_by: user.id,
                updated_by: user.id
            }])
            .select(`
                ab_transaction_id,
                person_id,
                affiliated_business_id,
                currency_id,
                product_id,
                total_price,
                product_amount,
                transaction_code,
                state,
                created_by,
                created_at,
                updated_by,
                updated_at,
                person:person_id (
                    user_id,
                    first_name,
                    last_name,
                    second_last_name
                ),
                affiliatedbusiness:affiliated_business_id (
                    affiliated_business_id,
                    affiliated_business_name
                ),
                currency:currency_id (
                    currency_id,
                    currency_name,
                    currency_exchange
                ),
                product:product_id (
                    product_id,
                    product_name,
                    state
                )
            `);

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear la transacción: ${error.message}` 
            }, { status: 400 });
        }

        console.log("AffiliatedBusinessTransaction created successfully:", data);
        return NextResponse.json({ 
            message: "Transacción creada exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert affiliatedbusinesstransaction error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}