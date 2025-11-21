import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar una transacción de centro de acopio
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const personName = body.person_name || body.personName;
        const collectionCenterName = body.collection_center_name || body.collectionCenterName;
        const materialName = body.material_name || body.materialName;
        const materialAmount = body.material_amount || body.materialAmount;

        // Validar campos requeridos
        if (!personName || !collectionCenterName || !materialName || materialAmount === undefined || materialAmount === null) {
            return NextResponse.json({ 
                error: "Los campos person_name, collection_center_name, material_name y material_amount son requeridos" 
            }, { status: 400 });
        }

        // Validar material_amount
        if (isNaN(materialAmount) || materialAmount <= 0) {
            return NextResponse.json({ 
                error: "El material_amount debe ser un número mayor a 0" 
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

        // Obtener el ID del material y sus puntos equivalentes
        const { data: materialData, error: materialError } = await supabase
            .from('material')
            .select('material_id, equivalent_points')
            .eq('name', materialName)
            .single();

        if (materialError || !materialData) {
            console.error("Material error:", materialError);
            return NextResponse.json({ 
                error: `El material "${materialName}" no existe` 
            }, { status: 404 });
        }

        const personId = personData.user_id;
        const collectionCenterId = centerData.collectioncenter_id;
        const materialId = materialData.material_id;
        const equivalentPoints = materialData.equivalent_points || 0;

        // Calcular total de puntos
        const totalPoints = Math.floor(materialAmount * equivalentPoints);

        if (totalPoints <= 0) {
            return NextResponse.json({ 
                error: "El total de puntos debe ser mayor a 0. Verifica el material y la cantidad." 
            }, { status: 400 });
        }

        // Insertar la transacción
        const { data, error } = await supabase
            .from('collectioncentertransaction')
            .insert([{
                person_id: personId,
                collection_center_id: collectionCenterId,
                material_id: materialId,
                material_amount: materialAmount,
                total_points: totalPoints,
                created_by: user.id,
                updated_by: user.id
            }])
            .select(`
                cc_transaction_id,
                person_id,
                collection_center_id,
                material_id,
                total_points,
                material_amount,
                transaction_code,
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
                collectioncenter:collection_center_id (
                    collectioncenter_id,
                    name
                ),
                material:material_id (
                    material_id,
                    name,
                    equivalent_points
                )
            `);

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear la transacción: ${error.message}` 
            }, { status: 400 });
        }

        // Actualizar los puntos de la persona
        const { error: updatePointsError } = await supabase.rpc('increment_user_points', {
            p_user_id: personId,
            p_points: totalPoints
        });

        if (updatePointsError) {
            console.error("Update points error:", updatePointsError);
            // No retornamos error aquí para no bloquear la transacción
            // pero lo registramos
        }

        console.log("CollectionCenterTransaction created successfully:", data);
        return NextResponse.json({ 
            message: "Transacción creada exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert collectioncentertransaction error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}