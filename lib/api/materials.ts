import { createClient } from '@/utils/supabase/server';

// Fetch material conversion rates from the 'material' table
export async function getMaterialConversionRates() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('material')
		.select('name, equivalent_points, unit_id(unit_name)')
		.order('name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch all materials with their info
export async function getAllMaterials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('material')
		.select('material_id, name, equivalent_points, unit_id(unit_id, unit_name), updated_by')
		.order('name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single material by its ID
export async function getMaterialById(materialId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('material')
      .select('material_id, name, equivalent_points, unit_id(unit_id, unit_name)')
      .eq('material_id', materialId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

// Fetch all collection centers and its materials with their info
export async function getAllColletionCentersXMaterials() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_collectioncenterxmaterial');
  
  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

// Fetch a single collection center and its materials by center ID
export async function getMaterialsByCollectionCenterId(collectionCenterId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_collectioncenterxmaterial', { p_collection_center_id: collectionCenterId });
  
  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

// Fetch the top 5 most recycled materials across all collection centers
export async function getMostRecycledMaterials() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('collectioncentertransaction')
    .select('material_id(name), material_amount')
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error: error.message, data: null };
  }

  // Aggregate by material name
  const materialMap = new Map<string, { material_name: string; total_amount: number; times_recycled: number }>();
  
  if (data) {
    for (const transaction of data) {
      const materialId = transaction.material_id as unknown;
      const materialName = (materialId as { name: string })?.name;
      const amount = transaction.material_amount || 0;
      
      if (materialName) {
        const existing = materialMap.get(materialName);
        if (existing) {
          existing.total_amount += amount;
          existing.times_recycled += 1;
        } else {
          materialMap.set(materialName, {
            material_name: materialName,
            total_amount: amount,
            times_recycled: 1
          });
        }
      }
    }
  }

  // Convert to array and sort by total amount
  const topMaterials = Array.from(materialMap.values())
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 5);

  return { error: null, data: topMaterials };
}