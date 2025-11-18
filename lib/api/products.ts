import { createClient } from '@/utils/supabase/server';

// Use the Postgres RPC which returns the most popular products table
export async function getMostPopularProducts() {
  const supabase = await createClient();
    
  const { data, error } = await supabase.rpc('get_most_popular_products');

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

// Fetch all products with their info
export async function getAllProducts() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('product')
    .select('product_id, product_name, description, state')
    .order('product_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single product by its ID
export async function getProductById(productId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('product')
      .select('product_id, product_name, description, state')
      .eq('product_id', productId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

// Fetch all affiliatedbusines and its products with their info
export async function getAllAffiliatedBusinessesXProducts() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('affiliatedbusinessxproduct')
    .select('affiliated_business_x_prod, product_id(product_id, product_name, description, state), affiliated_business_id(affiliated_business_id, affiliated_business_name, description), product_price')
    .order('affiliated_business_id', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single affiliatedbusiness and its products by business ID
export async function getProductsByAffiliatedBusinessId(affiliatedBusinessId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('affiliatedbusinessxproduct')
      .select('affiliated_business_x_prod, product_id(product_id, product_name, description, state), affiliated_business_id(affiliated_business_id, affiliated_business_name, description), product_price')
      .order('affiliated_business_id', { ascending: true })
      .eq('affiliated_business_id', affiliatedBusinessId);
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}