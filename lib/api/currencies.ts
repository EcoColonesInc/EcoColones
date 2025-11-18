import { createClient } from '@/utils/supabase/server';

// Fetch the default currency using the Postgres function `get_default_currency()`
export async function getDefaultCurrency() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_default_currency');

  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch all currencies with their info
export async function getAllCurrencies() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('currency')
		.select('currency_id, currency_name, currency_exchange')
		.order('currency_name', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch a single currency by its ID
export async function getCurrencyById(currencyId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('currency')
      .select('currency_id, currency_name, currency_exchange')
      .eq('currency_id', currencyId)
      .single();
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}