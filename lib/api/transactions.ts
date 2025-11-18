import { createClient } from '@/utils/supabase/server';

// Use the Postgres function `get_user_affiliated_transactions(p_user_id uuid, p_date date)`
// If no date is provided, it fetches all transactions for the user.
export async function getUserBusinessTransactions() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized', data: null };
  }
  
  const { data, error } = await supabase.rpc('get_user_affiliated_transactions', { p_user_id: user.id, p_date: null });
  
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Use the Postgres function `get_user_affiliated_transactions(p_user_id uuid, p_date date)`
// If no date is provided, it fetches all transactions for the user.
export async function getUserCenterTransactions() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized', data: null };
  }
  
  const { data, error } = await supabase.rpc('get_user_collectioncenter_transactions', { p_user_id: user.id, p_date: null });
  
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch all affiliated business with their transactions
export async function getAllAffiliatedBusinessTransactions() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('affiliatedbusinesstransaction')
    .select('person_id(user_name, first_name, last_name), affiliated_business_id(affiliated_business_name), currency(currency_name, currency_exchange), product_id(product_name), total_price, product_amount, transaction_code, state, created_at')
    .order('affiliated_business_id', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch all collection centers with their transactions
export async function getAllCollectionCentersTransactions() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('collectioncentertransaction')
    .select('person_id(user_name, first_name, last_name), collection_center_id(name), material_id(name), total_points, material_amount, created_at')
    .order('collection_center_id', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch the transactions of a specific affiliated business by its ID
export async function getTransactionsByAffiliatedBusinessId(affiliatedBusinessId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('affiliatedbusinesstransaction')
      .select('person_id(user_name, first_name, last_name), affiliated_business_id(affiliated_business_name), currency(currency_name, currency_exchange), product_id(product_name), total_price, product_amount, transaction_code, state, created_at')
      .eq('affiliated_business_id', affiliatedBusinessId)
      .order('created_at', { ascending: true });
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

export type AffiliatedTransactionsFilters = {
  userName?: string;
  date?: string | Date; // 'YYYY-MM-DD' or Date
  productName?: string;
  totalPrice?: number | null;
};

// Fetch the transactions of a collection center by its ID
export async function getTransactionsByCollectionCenterId(collectionCenterId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('collectioncentertransaction')
      .select('person_id(user_name, first_name, last_name), collection_center_id(name), material_id(name), total_points, material_amount, created_at')
      .eq('collection_center_id', collectionCenterId)
      .order('created_at', { ascending: true });
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}

/*
 * Gets the affiliated business transactions by affiliated business ID.
 * It also filters the resultas by user_name, date, product and cost.
 * It will be used in "Todas las transacciones en Comercio Afiliado".
 */
export async function getTransactionsByAffiliatedBusinessIdWithFilters(
  affiliatedBusinessId: string,
  filters?: AffiliatedTransactionsFilters
) {
  const supabase = await createClient();

  const rpcParams = {
    p_affiliated_business_id: affiliatedBusinessId,
    p_user_name: filters?.userName ?? null,
    p_date: filters?.date
      ? filters.date instanceof Date
        ? filters.date.toISOString().slice(0, 10)
        : filters.date
      : null,
    p_product_name: filters?.productName ?? null,
    p_total_price:
      typeof filters?.totalPrice === 'number' ? filters?.totalPrice : null,
  };

  const { data, error } = await supabase.rpc('get_affiliated_business_transactions', rpcParams);

  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}