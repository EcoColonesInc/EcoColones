import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

type EmailRow = { id_email: string | number; email: string | null };
type PersonRef = { first_name?: string | null; last_name?: string | null } | null;
type DistrictRef = { district_name?: string | null } | null;
// Extendido para detalle: distrito -> ciudad -> provincia -> país
type DistrictDeepRef = {
  district_name?: string | null;
  city_id?: {
    city_name?: string | null;
    province_id?: {
      province_name?: string | null;
      country_id?: { country_name?: string | null } | null;
    } | null;
  } | null;
} | null;
type EmailLike = string | number | { id_email?: string | number; email?: string | null } | null;
type CollectionCenterRaw = {
  collectioncenter_id: string | number;
  person_id?: PersonRef;
  district_id?: DistrictRef;
  name: string;
  phone?: string | null;
  email: EmailLike;
  latitude?: number | null;
  longitude?: number | null;
};

// Obtiene correos por id (id_email) y devuelve un mapa id->string
async function fetchEmailsByIds(supabase: SupabaseClient, ids: (string | number)[]) {
  if (!ids.length) return {} as Record<string, string | null>;
  const { data, error } = await supabase
    .from('email')
    .select('id_email, email')
    .in('id_email', ids);
  if (error || !data) return {} as Record<string, string | null>;
  return (data as EmailRow[]).reduce((acc: Record<string, string | null>, row: EmailRow) => {
    if (row?.id_email != null) acc[String(row.id_email)] = typeof row.email === 'string' ? row.email : null;
    return acc;
  }, {});
}

// Fetch all collection centers with their info
export async function getAllCollectionCenters() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collectioncenter')
    .select(`
      collectioncenter_id,
      person_id(first_name,last_name),
      district_id(district_name),
      name,
      phone,
      email,
      latitude,
      longitude
    `)
    .order('collectioncenter_id', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  // Recolecta posibles IDs (número/string) para resolver a texto.
  const rawCenters = (data ?? []) as CollectionCenterRaw[];
  const possibleIds: (string | number)[] = [];
  for (const c of rawCenters) {
    const raw = c.email as EmailLike;
    if (raw == null) continue;
    if (typeof raw === 'number' || typeof raw === 'string') {
      // Si es string con '@' ya es correo, no agregamos como id.
      if (typeof raw === 'number' || !raw.includes('@')) possibleIds.push(raw);
    } else if (typeof raw === 'object') {
      // Formatos posibles: { id_email: X, email: 'texto' } o { email: 'texto' }
      if (typeof raw.id_email === 'number' || typeof raw.id_email === 'string') {
        possibleIds.push(raw.id_email);
      }
    }
  }
  const uniqueIds = Array.from(new Set(possibleIds));
  const emailMap = await fetchEmailsByIds(supabase, uniqueIds);
  const normalized = rawCenters.map((c: CollectionCenterRaw) => {
    const raw = c.email as EmailLike;
    let resolved: string | null = null;
    if (raw == null) {
      resolved = null;
    } else if (typeof raw === 'string') {
      resolved = raw.includes('@') ? raw : emailMap[String(raw)] || null;
    } else if (typeof raw === 'number') {
      resolved = emailMap[String(raw)] || null;
    } else if (typeof raw === 'object') {
      if (typeof raw.email === 'string' && raw.email.includes('@')) {
        resolved = raw.email;
      } else if (raw.id_email != null) {
        resolved = emailMap[String(raw.id_email)] || null;
      }
    }
    return { ...c, email: resolved };
  });
  return { error: null, data: normalized };
}

// Fetch a single collection center by its ID
export async function getCollectionCenterById(collectionCenterId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collectioncenter')
    .select(`
      collectioncenter_id,
      person_id(first_name,last_name),
      district_id(district_name, city_id(city_name, province_id(province_name, country_id(country_name)))),
      name,
      phone,
      email,
      latitude,
      longitude
    `)
    .eq('collectioncenter_id', collectionCenterId)
    .single();
  if (error) {
    return { error: error.message, data: null };
  }
  if (!data) return { error: null, data: null };
  // Para detalle usamos DistrictDeepRef en sustitución
  const row = data as CollectionCenterRaw & { district_id?: DistrictDeepRef };
  const raw = row.email as EmailLike;
  let resolved: string | null = null;
  if (raw == null) {
    resolved = null;
  } else if (typeof raw === 'string') {
    if (raw.includes('@')) {
      resolved = raw;
    } else {
      const map = await fetchEmailsByIds(supabase, [raw]);
      resolved = map[String(raw)] || null;
    }
  } else if (typeof raw === 'number') {
    const map = await fetchEmailsByIds(supabase, [raw]);
    resolved = map[String(raw)] || null;
  } else if (typeof raw === 'object') {
    if (typeof raw.email === 'string' && raw.email.includes('@')) {
      resolved = raw.email;
    } else if (raw.id_email != null) {
      const map = await fetchEmailsByIds(supabase, [raw.id_email]);
      resolved = map[String(raw.id_email)] || null;
    }
  }
  return { error: null, data: { ...row, email: resolved } };
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