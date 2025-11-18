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