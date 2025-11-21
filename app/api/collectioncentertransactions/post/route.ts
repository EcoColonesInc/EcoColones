import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar una transacción de centro de acopio
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Expected body shape:
    // {
    //   person_id?: string,
    //   person_identification?: string,
    //   collection_center_id?: string,
    //   collection_center_name?: string,
    //   created_by?: string,
    //   items: [{ material_name: string, material_amount: number }]
    // }

    const items: { material_name: string; material_amount: number }[] = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ error: "Missing items array" }, { status: 400 });
    }

    // resolve person_id
    let personId = body?.person_id ?? null;
    if (!personId) {
      const identification = String(body?.person_identification ?? "").trim();
      if (!identification) {
        return NextResponse.json({ error: "Missing person_id or person_identification" }, { status: 400 });
      }

      // Try to find person by identification: prefer exact string match, then numeric fallback
      let personData: { user_id: string } | null = null;

      const { data: pDataStr, error: pErrStr } = await supabase
        .from('person')
        .select('user_id')
        .eq('identification', identification)
        .limit(1)
        .maybeSingle();

      if (pErrStr) {
        return NextResponse.json({ error: pErrStr.message }, { status: 500 });
      }

      if (pDataStr?.user_id) {
        personData = pDataStr;
      } else {
        // numeric fallback: if identification parses to a finite number, try numeric equality
        const numeric = Number(identification.replace(/[^0-9.-]+/g, ''));
        if (Number.isFinite(numeric)) {
          const { data: pDataNum, error: pErrNum } = await supabase
            .from('person')
            .select('user_id')
            .eq('identification', numeric)
            .limit(1)
            .maybeSingle();

          if (pErrNum) {
            return NextResponse.json({ error: pErrNum.message }, { status: 500 });
          }
          if (pDataNum?.user_id) {
            personData = pDataNum;
          }
        }
      }

      if (!personData?.user_id) {
        return NextResponse.json({ error: `No person found with identification ${identification}` }, { status: 404 });
      }
      personId = personData.user_id;
    }

    // resolve collection_center_id
    let collectionCenterId = body?.collection_center_id ?? null;
    if (!collectionCenterId) {
      const centerName = String(body?.collection_center_name ?? "").trim();
      if (!centerName) {
        return NextResponse.json({ error: "Missing collection_center_id or collection_center_name" }, { status: 400 });
      }

      const { data: centerData, error: centerErr } = await supabase
        .from("collectioncenter")
        .select("collectioncenter_id")
        .ilike("name", centerName)
        .limit(1)
        .maybeSingle();

      if (centerErr) {
        return NextResponse.json({ error: centerErr.message }, { status: 500 });
      }
      if (!centerData?.collectioncenter_id) {
        return NextResponse.json({ error: `No collection center found with name ${centerName}` }, { status: 404 });
      }
      collectionCenterId = centerData.collectioncenter_id;
    }

    // Resolve materials and compute total points
    const itemsToInsert: { material_id: string; material_amount: number }[] = [];
    let totalPoints = 0;

    for (const it of items) {
      const materialName = String(it?.material_name ?? "").trim();
      const amountRaw = it?.material_amount;
      const amount = Number(amountRaw);

      if (!materialName) {
        return NextResponse.json({ error: "Each item must have a material_name" }, { status: 400 });
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: `Invalid material_amount for ${materialName}` }, { status: 400 });
      }

      // Lookup material by name (case-insensitive)
      const { data: matData, error: matErr } = await supabase
        .from("material")
        .select("material_id, equivalent_points")
        .ilike("name", materialName)
        .limit(1)
        .maybeSingle();

      if (matErr) {
        return NextResponse.json({ error: matErr.message }, { status: 500 });
      }
      if (!matData?.material_id) {
        return NextResponse.json({ error: `Material not found: ${materialName}` }, { status: 404 });
      }

      const eqPoints = Number(matData.equivalent_points ?? 0);
      if (!Number.isFinite(eqPoints) || eqPoints <= 0) {
        return NextResponse.json({ error: `Material ${materialName} has invalid equivalent_points` }, { status: 400 });
      }

      // assume material_amount is in units compatible with equivalent_points (e.g., kg)
      const itemPoints = Math.round(eqPoints * amount);
      totalPoints += itemPoints;

      itemsToInsert.push({
        material_id: matData.material_id,
        material_amount: Math.round(amount),
      });
    }

    if (totalPoints <= 0) {
      return NextResponse.json({ error: "Computed total_points must be > 0" }, { status: 400 });
    }

    // created_by fallback
    const createdBy = body?.created_by ?? personId;

    // Insert transaction
    const { data: txData, error: txErr } = await supabase
      .from("collectioncentertransaction")
      .insert([
        {
          person_id: personId,
          collection_center_id: collectionCenterId,
          total_points: totalPoints,
          created_by: createdBy,
        },
      ])
      .select("cc_transaction_id, transaction_code")
      .maybeSingle();

    if (txErr) {
      return NextResponse.json({ error: txErr.message }, { status: 500 });
    }
    if (!txData?.cc_transaction_id) {
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }

    // Insert items referencing the created transaction
    const itemsPayload = itemsToInsert.map((it) => ({
      cc_transaction_id: txData.cc_transaction_id,
      material_id: it.material_id,
      material_amount: it.material_amount,
    }));

    const { data: insertedItems, error: itemsErr } = await supabase
      .from("collectioncentertransactionitem")
      .insert(itemsPayload)
      .select("*");

    if (itemsErr) {
      // attempt rollback of transaction (best-effort)
      await supabase
        .from("collectioncentertransaction")
        .delete()
        .eq("cc_transaction_id", txData.cc_transaction_id);
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        transaction: txData,
        items: insertedItems,
        total_points: totalPoints,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}