import { createClient } from '@/utils/supabase/server';

export type BusinessData = {
  affiliated_business_id: string;
  district_id: string | null;
  business_type_id: string | null;
  affiliated_business_name: string;
  phone: string | null;
  email: string | null;
  description: string | null;
  manager_id: string;
} | null;

// Fetch all affiliated businesses with their info
export async function getAllAffiliatedBusiness() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('affiliatedbusiness')
	.select(`
		affiliated_business_id,
		affiliated_business_name,
		description,
		phone,
		email,
		manager_id(first_name,last_name,second_last_name),
		business_type_id(name),
		district_id(district_name)
	`)
	.order('affiliated_business_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single affiliated business by its ID
export async function getAffiliatedBusinessById(affiliatedBusinessId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('affiliatedbusiness')
        .select(`
            affiliated_business_id,
            affiliated_business_name,
            description,
            phone,
            email,
            manager_id(first_name,last_name,second_last_name),
            business_type_id(name),
            district_id(district_name, city_id(city_name, province_id(province_name, country_id(country_name))))
        `)
        .eq('affiliated_business_id', affiliatedBusinessId)
        .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

export async function getBusinessByManagerId(managerId: string) {
  const supabase = await createClient();

  // Utilizamos el SELECT completo que definiste en tu Route Handler
  const { data, error } = await supabase
      .from('affiliatedbusiness')
      .select(`
          affiliated_business_id,
          district_id,
          business_type_id,
          affiliated_business_name,
          phone,
          email,
          description,
          manager_id
      `)
      .eq('manager_id', managerId)
      .maybeSingle();

  if (error) {
      console.error('Error fetching business by manager ID:', error);
      return { error: error.message, data: null };
  }
  
  return { error: null, data: data as BusinessData };
}
// Fetch the collection center of the authenticated user
export async function getUserAffiliatedBusiness() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized', data: null };
  }

  const { data, error } = await supabase
    .from('affiliatedbusiness')
    .select('affiliated_business_id, manager_id(first_name, last_name, second_last_name), district_id(district_name), affiliated_business_name, phone, email, description')
    .eq('manager_id', user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}