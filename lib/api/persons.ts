import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient, SupabaseClient } from '@supabase/supabase-js';

const PERSON_COLUMNS = [
  'user_id',
  'first_name',
  'last_name',
  'second_last_name',
  'telephone_number',
  'birth_date',
  'user_name',
  'identification',
  'role',
  'gender',
  'document_type',
  'district_id'
].join(', ');

export async function getAllPersons() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabase: SupabaseClient;
  if (url && serviceKey) {
    supabase = createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  } else {
    supabase = await createClient();
  }
  const { data, error } = await supabase
    .from('person')
    .select(PERSON_COLUMNS)
    .order('first_name', { ascending: true });
  if (error) return { error: error.message, data: null };
  return { error: null, data };
}

// Personas que no han cambiado su contraseña: password_updated_at == created_at o es NULL
export async function getPersonsWithoutPasswordChange() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabase: SupabaseClient;
  if (url && serviceKey) {
    supabase = createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  } else {
    supabase = await createClient();
  }

  const columns = [
    'user_id',
    'first_name',
    'last_name',
    'second_last_name',
    'telephone_number',
    'user_name',
    'identification',
    'created_at',
    'password_updated_at'
  ].join(', ');

  const { data, error } = await supabase
    .from('person')
    .select(columns)
    .order('first_name', { ascending: true });
  if (error) return { error: error.message, data: null };

  type PRow = { created_at?: string | null; password_updated_at?: string | null };
  const rows = (data ?? []) as PRow[];
  const filtered = rows.filter((row) => {
    const cu = row.created_at ? new Date(row.created_at).getTime() : null;
    const pu = row.password_updated_at ? new Date(row.password_updated_at).getTime() : null;
    if (!cu && !pu) return true; // sin fechas claras
    if (cu && !pu) return true; // nunca actualizó
    if (!cu && pu) return false; // sin created_at
    // considera "sin cambio" si son iguales al segundo
    return Math.abs((pu as number) - (cu as number)) < 1000;
  });

  return { error: null, data: filtered };
}

export async function getProfileInfoByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_profile_info', { p_user_id: userId });
  if (error) return { error: error.message, data: null };
  return { error: null, data };
}

export async function getEmailByUserId(userId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return { error: null, data: { email: null } };
  const admin = createServiceClient(url, serviceKey);
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) return { error: error.message, data: { email: null } };
  return { error: null, data: { email: data.user?.email ?? null } };
}