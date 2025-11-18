import { createClient } from '@/utils/supabase/server';

// Fetch all units with their info
export async function getAllBusinessTypes() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('businesstype')
    .select('business_type_id, name')
    .order('name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}