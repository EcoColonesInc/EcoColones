import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtained all the data from binnacle
export async function GET() {
    try {
        const supabase = await createClient();

        // Call the stored function `get_binnacle` which returns the joined binnacle rows
    // Intento 1: usar RPC existente
    const { data, error } = await supabase.rpc('get_binnacle');

        if (error) {
            console.error('Get binnacle error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

    // Obtener conjunto único de user_id para enriquecer con nombre completo desde tabla person
        const userIds: string[] = Array.from(
            new Set<string>(
                (data ?? [])
                    .map((r: unknown) => String((r as { user_id?: unknown }).user_id ?? ''))
                    .filter((v: string) => typeof v === 'string' && v.length > 0)
            )
        );

        let personsMap: Record<string, { full_name: string; user_name?: string }> = {};
        if (userIds.length > 0) {
            const { data: persons, error: personsError } = await supabase
                .from('person')
                .select('user_id, user_name, first_name, last_name, second_last_name')
                .in('user_id', userIds);
            if (personsError) {
                console.error('Error obteniendo personas para bitácora:', personsError);
            } else {
                personsMap = (persons ?? []).reduce(
                    (
                        acc: Record<string, { full_name: string; user_name?: string }>,
                        p: { first_name?: string; last_name?: string; second_last_name?: string; user_id?: string; user_name?: string }
                    ) => {
                        const fullName = [p.first_name, p.last_name, p.second_last_name]
                            .filter((v): v is string => Boolean(v))
                            .join(' ')
                            .trim();
                        if (p.user_id) {
                            acc[p.user_id] = { full_name: fullName, user_name: p.user_name };
                        }
                        return acc;
                    },
                    {}
                );
            }
        }

        // Fallback: si no hay FK y no encontramos algunos ids, intentar búsqueda por similitud usando ILIKE %id%
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const missingIds = userIds.filter((id) => !personsMap[id]);
        if (missingIds.length > 0) {
            const chunk = (arr: string[], size: number) => arr.reduce((acc: string[][], _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [] as string[][]);
            for (const batch of chunk(missingIds, 10)) {
                const expr = batch.map((id) => `user_id.ilike.%${id}%`).join(',');
                const { data: likePersons, error: likeErr } = await supabase
                    .from('person')
                    .select('user_id, user_name, first_name, last_name, second_last_name')
                    .or(expr);
                if (likeErr) {
                    console.warn('Fallback ILIKE personas error:', likeErr.message);
                    continue;
                }
                const candidates = likePersons ?? [];
                for (const id of batch) {
                    const nid = normalize(id);
                    const match = candidates.find((p: { user_id?: string }) => normalize(p.user_id || '')
                        .includes(nid));
                    if (match) {
                        const fullName = [
                            (match as { first_name?: string }).first_name,
                            (match as { last_name?: string }).last_name,
                            (match as { second_last_name?: string }).second_last_name,
                        ]
                            .filter((v): v is string => Boolean(v))
                            .join(' ')
                            .trim();
                        personsMap[id] = { full_name: fullName, user_name: (match as { user_name?: string }).user_name };
                    }
                }
            }
        }

        // Normalizar y asignar nombre completo
    let rows: Array<Record<string, unknown>> = (data as Array<Record<string, unknown>>) ?? [];

        // Si el RPC no trae todo, preferimos un SELECT con relación a person vía FK user_id
        const needsSelect = rows.length === 0 || !('object_name' in rows[0]) || !('change_type' in rows[0]) || !('user_id' in rows[0]);
        if (needsSelect) {
            const { data: direct, error: directError } = await supabase
                .from('binnacle')
                .select(`
                    binnacle_id,
                    user_id,
                    object_name,
                    change_type,
                    old_value,
                    new_value,
                    created_at,
                    updated_at,
                    person:user_id(first_name, last_name, second_last_name)
                `)
                .order('updated_at', { ascending: false });
            if (!directError && direct) {
                rows = direct as Array<Record<string, unknown>>;
                // Completar mapa de personas a partir de la relación
                for (const r of rows) {
                    const id = (r as { user_id?: string }).user_id;
                    const p = (r as { person?: { first_name?: string; last_name?: string; second_last_name?: string } | null }).person;
                    if (id && p && !personsMap[id]) {
                        const fullName = [p.first_name, p.last_name, p.second_last_name]
                            .filter((v): v is string => Boolean(v))
                            .join(' ')
                            .trim();
                        personsMap[id] = { full_name: fullName };
                    }
                }
            } else if (directError) {
                console.warn('Fallo SELECT directo de binnacle con relación person:', directError.message);
            }
        }

        const normalized = rows.map((row) => {
            const person = (row as { person?: { first_name?: string; last_name?: string; second_last_name?: string; user_name?: string } | null }).person;
            const userId = (row as { user_id?: string }).user_id;
            const relName = person
                ? [person.first_name, person.last_name, person.second_last_name]
                    .filter((v): v is string => Boolean(v))
                    .join(' ')
                    .trim()
                : null;
            const fullName = relName || (userId ? personsMap[userId]?.full_name : undefined) || (row as { user_full_name?: string }).user_full_name || (row as { user_name?: string }).user_name || null;
            const userName = (userId ? personsMap[userId]?.user_name : undefined) || (person ? person.user_name : null) || (row as { user_name?: string }).user_name || null;
            return {
                ...row,
                person_full_name: fullName,
                user_full_name: fullName,
                person_user_name: userName,
                created_by_display: fullName,
                updated_by_display: fullName,
            };
        });


    return NextResponse.json({ data: normalized }, { status: 200 });

    } catch (err: unknown) {
        console.error('Get binnacle unexpected error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
