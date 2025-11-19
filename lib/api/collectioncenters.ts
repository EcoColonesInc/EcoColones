import { createClient } from '@/utils/supabase/server';

// Obtiene correos por id (id_email) y devuelve un mapa id->string
async function fetchEmailsByIds(supabase: any, ids: (string | number)[]) {
  if (!ids.length) return {} as Record<string, string | null>;
  const { data, error } = await supabase
    .from('email')
    .select('id_email, email')
    .in('id_email', ids);
  if (error || !data) return {} as Record<string, string | null>;
  return data.reduce((acc: Record<string, string | null>, row: any) => {
    if (row?.id_email) acc[String(row.id_email)] = typeof row.email === 'string' ? row.email : null;
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
  const rawCenters = data ?? [];
  const possibleIds: (string | number)[] = [];
  for (const c of rawCenters) {
    const raw = (c as any).email;
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
  const normalized = rawCenters.map((c: any) => {
    const raw = c.email;
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
      district_id(district_name),
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
  const raw = (data as any).email;
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
  return { error: null, data: { ...data, email: resolved } };
}