import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insert a collection center transaction
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const personName = body.person_name || body.personName;
        const collectionCenterName = body.collection_center_name || body.collectionCenterName;
        const materialName = body.material_name || body.materialName;
        const materialAmount = Number(body.material_amount ?? body.materialAmount);

        if (!personName || !collectionCenterName || !materialName || materialAmount <= 0) {
            return NextResponse.json({
                error: "Los campos person_name, collection_center_name, material_name y material_amount (>0) son requeridos"
            }, { status: 400 });
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });

        // FETCH IDS
        const parts = personName.trim().split(/\s+/);
        const firstName = parts[0];
        const lastName = parts[1];
        const secondLastName = parts[2] ?? null;

        let personQuery = supabase
            .from("person")
            .select("user_id")
            .eq("first_name", firstName)
            .eq("last_name", lastName);

        if (secondLastName)
            personQuery = personQuery.eq("second_last_name", secondLastName);
        else
            personQuery = personQuery.is("second_last_name", null);

        const { data: personData, error: personError } = await personQuery.single();
        if (personError || !personData)
            return NextResponse.json({ error: `La persona "${personName}" no existe` }, { status: 404 });

        const { data: centerData, error: centerError } = await supabase
            .from("collectioncenter")
            .select("collectioncenter_id")
            .eq("name", collectionCenterName)
            .single();

        if (centerError || !centerData)
            return NextResponse.json({ error: `El centro de acopio "${collectionCenterName}" no existe` }, { status: 404 });

        const { data: materialData, error: materialError } = await supabase
            .from("material")
            .select("material_id, equivalent_points")
            .eq("name", materialName)
            .single();

        if (materialError || !materialData)
            return NextResponse.json({ error: `El material "${materialName}" no existe` }, { status: 404 });

        const totalPoints = materialAmount * (materialData.equivalent_points ?? 0);
        if (totalPoints <= 0)
            return NextResponse.json({ error: "Los puntos deben ser > 0" }, { status: 400 });

        // INSERT TRANSACTION
        const { data: tx, error: txError } = await supabase
            .from("collectioncentertransaction")
            .insert({
                person_id: personData.user_id,
                collection_center_id: centerData.collectioncenter_id,
                total_points: totalPoints,
                created_by: user.id,
                updated_by: user.id
            })
            .select("cc_transaction_id")
            .single();

        if (txError)
            return NextResponse.json({ error: `Error creando transacción: ${txError.message}` }, { status: 400 });

        // INSERT ITEMS
        const { error: itemsError } = await supabase
            .from("collectioncentertransactionitem")
            .insert({
                cc_transaction_id: tx.cc_transaction_id,
                material_id: materialData.material_id,
                material_amount: materialAmount
            });

        if (itemsError)
            return NextResponse.json({ error: `Error creando ítems: ${itemsError.message}` }, { status: 400 });

        // Update points
        await supabase.rpc("increment_user_points", {
            p_user_id: personData.user_id,
            p_points: totalPoints
        });

        return NextResponse.json({
            message: "Transacción creada exitosamente.",
            data: { transaction: tx }
        }, { status: 201 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
