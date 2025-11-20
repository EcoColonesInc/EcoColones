import { createClient } from '@/utils/supabase/server';

/* 
 * Functions to interact with the 'country' table in the database.
 */

// Fetch all countries with their info
export async function getAllCountries() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('country')
		.select('country_id, country_name')
		.order('country_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single country by its ID
export async function getCountryById(countryId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('country')
      .select('country_id, country_name')
      .eq('country_id', countryId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

/* 
 * Functions to interact with the 'province' table in the database.
 */

// Fetch all provinces with their info
export async function getAllProvinces() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('province')
		.select('province_id, province_name, country(country_id, country_name)')
		.order('province_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch provinces by country ID
export async function getProvincesByCountryId(countryId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('province')
    .select('province_id, province_name, country(country_id, country_name)')
    .eq('country_id', countryId)
    .order('province_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single province by its ID
export async function getProvinceById(provinceId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('province')
      .select('province_id, province_name, country(country_id, country_name)')
      .eq('province_id', provinceId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

/* 
 * Functions to interact with the 'city' table in the database.
 */

// Fetch all cities with their info
export async function getAllCities() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('city')
		.select('city_id, city_name, province_id(province_id, province_name)')
		.order('city_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch cities by province ID
export async function getCitiesByProvinceId(provinceId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('city')
    .select('city_id, city_name, province_id(province_id, province_name)')
    .eq('province_id', provinceId)
    .order('city_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single city by its ID
export async function getCityById(cityId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('city')
      .select('city_id, city_name, province_id(province_id, province_name)')
      .eq('city_id', cityId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

/* 
 * Functions to interact with the 'district' table in the database.
 */

// Fetch all districts with their info
export async function getAllDistricts() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('district')
		.select('district_id, district_name, city_id(city_id, city_name)')
		.order('district_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch districts by city ID
export async function getDistrictsByCityId(cityId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('district')
    .select('district_id, district_name, city_id(city_id, city_name)')
    .eq('city_id', cityId)
    .order('district_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single district by its ID
export async function getDistrictById(districtId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('district')
      .select('district_id, district_name, city_id(city_id, city_name)')
      .eq('district_id', districtId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}