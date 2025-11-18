import { createClient } from '@/utils/supabase/server';

// Fetch all units with their info
export async function getAllUnits() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('unit')
		.select('unit_id, unit_name, unit_exchange')
		.order('unit_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single unit by its ID
export async function getUnitById(unitId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('unit')
      .select('unit_id, unit_name, unit_exchange')
      .eq('unit_id', unitId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}