import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// DELETE - Eliminar relación centro-material
// Body esperado: { collection_center_id?: string, collection_center_name?: string, material_id?: string, material_name?: string }
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));
    const { collection_center_id, collection_center_name, material_id, material_name } = body;

    if (!collection_center_id && !collection_center_name) {
      return NextResponse.json({ error: "Se requiere collection_center_id o collection_center_name" }, { status: 400 });
    }
    if (!material_id && !material_name) {
      return NextResponse.json({ error: "Se requiere material_id o material_name" }, { status: 400 });
    }

    // Resolver IDs si faltan
    let resolvedCenterId = collection_center_id as string | undefined;
    if (!resolvedCenterId && collection_center_name) {
      const { data: centerData, error: centerErr } = await supabase
        .from("collectioncenter")
        .select("collectioncenter_id")
        .eq("name", collection_center_name)
        .single();
      if (centerErr || !centerData) {
        return NextResponse.json({ error: `Centro no encontrado: ${collection_center_name}` }, { status: 404 });
      }
      resolvedCenterId = centerData.collectioncenter_id;
    }

    let resolvedMaterialId = material_id as string | undefined;
    if (!resolvedMaterialId && material_name) {
      const { data: matData, error: matErr } = await supabase
        .from("material")
        .select("material_id")
        .eq("name", material_name)
        .single();
      if (matErr || !matData) {
        return NextResponse.json({ error: `Material no encontrado: ${material_name}` }, { status: 404 });
      }
      resolvedMaterialId = matData.material_id;
    }

    if (!resolvedCenterId || !resolvedMaterialId) {
      return NextResponse.json({ error: "No se pudieron resolver los IDs" }, { status: 400 });
    }

    // Buscar relación
    const { data: relData, error: relErr } = await supabase
      .from("collectioncenterxmaterial")
      .select("collection_center_x_product_id")
      .eq("collection_center_id", resolvedCenterId)
      .eq("material_id", resolvedMaterialId)
      .single();

    if (relErr) {
      return NextResponse.json({ error: relErr.message }, { status: 400 });
    }
    if (!relData) {
      return NextResponse.json({ error: "Relación no encontrada" }, { status: 404 });
    }

    const relationId = relData.collection_center_x_product_id;
    const { error: delErr } = await supabase
      .from("collectioncenterxmaterial")
      .delete()
      .eq("collection_center_x_product_id", relationId);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Relación eliminada", id: relationId });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
