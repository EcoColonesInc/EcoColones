import { createClient } from '@/utils/supabase/server';

// Fetch all collection centers with their info
export async function getAllCollectionCenters() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('collectioncenter')
	.select('collectioncenter_id, person_id(first_name, last_name), district_id(district_name), name, phone, email, latitude, longitude')
	.order('collectioncenter_id', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single collection center by its ID
export async function getCollectionCenterById(collectionCenterId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('collectioncenter')
      .select('collectioncenter_id, person_id(first_name, last_name), district_id(district_name), name, phone, email, latitude, longitude')
      .eq('collectioncenter_id', collectionCenterId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

// Fetch the collection center of the authenticated user
export async function getUserCollectionCenter() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized', data: null };
  }

  const { data, error } = await supabase
    .from('collectioncenter')
    .select('collectioncenter_id, person_id(first_name, last_name), district_id(district_name), name, phone, email, latitude, longitude')
    .eq('person_id', user.id)
    .single();
    
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}