import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar una moneda
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const currencyName = body.currency_name || body.currencyName;
        const currencyExchange = body.currency_exchange || body.currencyExchange;

        // Validar campos requeridos
        if (!currencyName || !currencyExchange) {
            return NextResponse.json({ error: "El nombre de la moneda y el tipo de cambio son requeridos" }, { status: 400 });
        }

        // Validar que el tipo de cambio sea un número positivo
        if (isNaN(currencyExchange) || currencyExchange <= 0) {
            return NextResponse.json({ error: "El tipo de cambio debe ser mayor a 0" }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Verificar si la moneda ya existe
        const { data: existingCurrency, error: checkError } = await supabase
            .from('currency')
            .select('currency_id')
            .eq('currency_name', currencyName)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ error: `Error al verificar la moneda: ${checkError.message}` }, { status: 400 });
        }

        if (existingCurrency) {
            return NextResponse.json({ error: "La moneda con este nombre ya existe" }, { status: 409 });
        }

        // Insertar la moneda
        const { data, error } = await supabase.from('currency').insert([{
            currency_name: currencyName,
            currency_exchange: currencyExchange,
            created_by: user.id,
            updated_by: user.id
        }]).select();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: `Error al crear la moneda: ${error.message}` }, { status: 400 });
        }

        console.log("Currency created successfully:", data);
        return NextResponse.json({ 
            message: "Moneda creada exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert currency error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
