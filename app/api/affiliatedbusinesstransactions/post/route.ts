import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from '@supabase/supabase-js';

// POST - Insertar una transacción de negocio afiliado
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const personName = body.person_name || body.personName;
        const affiliatedBusinessName = body.affiliated_business_name || body.affiliatedBusinessName;
        const currencyName = body.currency_name || body.currencyName;
        // Support either a single product or an array of items
        const productName = body.product_name || body.productName;
        const productAmount = body.product_amount || body.productAmount;
        const items = Array.isArray(body.items) ? body.items : undefined;
        const transactionCode = body.transaction_code || body.transactionCode;

        // Validar campos requeridos
        // Accept either a single product (productName + productAmount) or `items: [{ product_name, product_amount }, ...]`
        const hasSingle = !!(productName && (productAmount !== undefined && productAmount !== null));
        const hasItems = Array.isArray(items) && items.length > 0;

        if (!personName || !affiliatedBusinessName || !currencyName || !(hasSingle || hasItems) || !transactionCode) {
            return NextResponse.json({ 
                error: "Los campos person_name, affiliated_business_name, currency_name, product_name, product_amount y transaction_code son requeridos" 
            }, { status: 400 });
        }

        // Normalize items array
        const normalizedItems: Array<{ product_name: string; product_amount: number }> = [];
        if (hasItems) {
            for (const it of items as any[]) {
                const name = it.product_name ?? it.productName ?? '';
                const amt = Number(it.product_amount ?? it.productAmount ?? 0) || 0;
                if (!name || amt <= 0) {
                    return NextResponse.json({ error: 'Cada ítem debe tener product_name y product_amount > 0' }, { status: 400 });
                }
                normalizedItems.push({ product_name: String(name), product_amount: amt });
            }
        } else {
            const amt = Number(productAmount) || 0;
            if (amt <= 0) {
                return NextResponse.json({ 
                    error: "El product_amount debe ser un número mayor a 0" 
                }, { status: 400 });
            }
            normalizedItems.push({ product_name: String(productName), product_amount: amt });
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

        // Resolve person/business/currency IDs and compute total price by summing item prices
        const personId = personData.user_id;
        const affiliatedBusinessId = businessData.affiliated_business_id;
        const currencyId = currencyData.currency_id;

        let totalPrice = 0;
        // We'll collect resolved product IDs and validate availability
        const resolvedItems: Array<{ product_id: string; product_name: string; product_amount: number; product_price: number }> = [];

        for (const it of normalizedItems) {
            const { product_name: pName, product_amount: pAmt } = it;
            const { data: productData, error: productError } = await supabase
                .from('product')
                .select('product_id, product_name, state')
                .ilike('product_name', pName.trim())
                .single();

            if (productError || !productData) {
                console.error('Product error:', productError);
                return NextResponse.json({ error: `El producto "${pName.trim()}" no existe` }, { status: 404 });
            }
            if (productData.state === 'inactive') {
                return NextResponse.json({ error: `El producto "${pName}" no está disponible (inactivo)` }, { status: 400 });
            }

            const productId = productData.product_id;
            const { data: productPriceData, error: productPriceError } = await supabase
                .from('affiliatedbusinessxproduct')
                .select('product_price')
                .eq('affiliated_business_id', affiliatedBusinessId)
                .eq('product_id', productId)
                .single();

            if (productPriceError || !productPriceData) {
                console.error('Product price error:', productPriceError);
                return NextResponse.json({ error: `El producto "${pName}" no está disponible en el negocio "${affiliatedBusinessName}"` }, { status: 404 });
            }

            const productPrice = Number(productPriceData.product_price) || 0;
            if (productPrice <= 0) {
                return NextResponse.json({ error: `Precio inválido para el producto "${pName}"` }, { status: 400 });
            }

            totalPrice += Math.floor(pAmt * productPrice);
            resolvedItems.push({ product_id: productId, product_name: pName, product_amount: pAmt, product_price: productPrice });
        }

        if (totalPrice <= 0) {
            return NextResponse.json({ error: 'El total_price debe ser mayor a 0. Verifica los productos y las cantidades.' }, { status: 400 });
        }

        // Use service role client for privileged writes/uniqueness checks to avoid RLS
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        let adminSupabase = supabase;
        if (url && serviceKey) {
            adminSupabase = createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
        }

        // Verificar si el código de transacción ya existe (using adminSupabase to bypass RLS if available)
        const { data: existingTransaction, error: checkError } = await adminSupabase
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

        // Insert main transaction (without product fields)
        const { data: txData, error: txError } = await supabase
            .from('affiliatedbusinesstransaction')
            .insert([{
                person_id: personId,
                affiliated_business_id: affiliatedBusinessId,
                currency_id: currencyId,
                total_price: totalPrice,
                transaction_code: transactionCode.trim(),
                state: 'active',
                created_by: user.id,
                updated_by: user.id
            }])
            .select('ab_transaction_id, person_id, affiliated_business_id, currency_id, total_price, transaction_code, state, created_by, created_at, updated_by, updated_at')
            .single();

        if (txError || !txData) {
            console.error('Insert transaction error:', txError);
            return NextResponse.json({ error: `Error al crear la transacción: ${txError?.message ?? 'unknown'}` }, { status: 400 });
        }

        // Insert items into affiliatedbusinesstransactionitem
        const itemsToInsert = resolvedItems.map((ri) => ({
            ab_transaction_id: txData.ab_transaction_id,
            product_id: ri.product_id,
            product_amount: ri.product_amount
        }));

        const { data: insertedItems, error: itemsError } = await supabase
            .from('affiliatedbusinesstransactionitem')
            .insert(itemsToInsert)
            .select('item_id, ab_transaction_id, product_id, product_amount');

        if (itemsError) {
            console.error('Insert items error:', itemsError);
            // Non-fatal: attempt to delete the created transaction to avoid orphan
            try {
                await supabase.from('affiliatedbusinesstransaction').delete().eq('ab_transaction_id', txData.ab_transaction_id);
            } catch (delErr) {
                console.error('Failed to rollback transaction after items insert error:', delErr);
            }
            return NextResponse.json({ error: `Error al crear los ítems de la transacción: ${itemsError.message}` }, { status: 400 });
        }

        return NextResponse.json({ message: 'Transacción creada exitosamente.', data: { transaction: txData, items: insertedItems } }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert affiliatedbusinesstransaction error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}