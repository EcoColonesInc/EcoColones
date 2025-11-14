import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar relación entre centro de acopio y material
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const materialName = body.material_name || body.materialName;
        const collectionCenterName = body.collection_center_name || body.collectionCenterName;

        // Validar campos requeridos
        if (!materialName || !collectionCenterName) {
            return NextResponse.json({ 
                error: "Los campos material_name y collection_center_name son requeridos" 
            }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Obtener el ID del material por su nombre
        const { data: materialData, error: materialError } = await supabase
            .from('material')
            .select('material_id')
            .eq('name', materialName)
            .single();

        if (materialError || !materialData) {
            console.error("Material error:", materialError);
            return NextResponse.json({ 
                error: `El material "${materialName}" no existe` 
            }, { status: 404 });
        }

        // Obtener el ID del centro de acopio por su nombre
        const { data: centerData, error: centerError } = await supabase
            .from('collectioncenter')
            .select('collectioncenter_id')
            .eq('name', collectionCenterName)
            .single();

        if (centerError || !centerData) {
            console.error("Collection center error:", centerError);
            return NextResponse.json({ 
                error: `El centro de acopio "${collectionCenterName}" no existe` 
            }, { status: 404 });
        }

        const materialId = materialData.material_id;
        const collectionCenterId = centerData.collectioncenter_id;

        // Verificar si ya existe la relación
        const { data: existingRelation, error: checkError } = await supabase
            .from('collectioncenterxmaterial')
            .select('collection_center_x_product_id')
            .eq('material_id', materialId)
            .eq('collection_center_id', collectionCenterId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar la relación: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingRelation) {
            return NextResponse.json({ 
                error: `Ya existe una relación entre el centro de acopio "${collectionCenterName}" y el material "${materialName}"` 
            }, { status: 409 });
        }

        // Insertar la relación
        const { data, error } = await supabase
            .from('collectioncenterxmaterial')
            .insert([{
                material_id: materialId,
                collection_center_id: collectionCenterId,
                created_by: user.id,
                updated_by: user.id
            }])
            .select(`
                collection_center_x_product_id,
                material_id,
                collection_center_id,
                created_by,
                created_at,
                updated_by,
                updated_at,
                material:material_id (
                    material_id,
                    name
                ),
                collectioncenter:collection_center_id (
                    collectioncenter_id,
                    name
                )
            `);

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear la relación: ${error.message}` 
            }, { status: 400 });
        }

        console.log("CollectionCenterXMaterial created successfully:", data);
        return NextResponse.json({ 
            message: "Relación creada exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert collectioncenterxmaterial error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}