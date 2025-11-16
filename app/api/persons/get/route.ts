import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient, SupabaseClient } from "@supabase/supabase-js";

// Lista explícita de columnas permitidas (evita exponer hashes u otros campos sensibles si existieran)
const PERSON_COLUMNS = [
    "user_id",
    "first_name",
    "last_name",
    "second_last_name",
    "telephone_number",
    "birth_date",
    "user_name",
    "identification",
    "role",
    "gender",
    "document_type"
].join(", ");

// GET - Obtiene todas las personas.
// Usa la service role key (si está disponible en el entorno) para ignorar RLS y traer todas las filas.
// IMPORTANTE: La service role key JAMÁS debe enviarse al cliente ni incluirse con NEXT_PUBLIC_. Solo en variables de servidor.
export async function GET() {
    try {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // definir en .env.local (no exponer)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL; // pública está bien porque es el endpoint

        // Si contamos con la service role, construimos un cliente directo (sin persistir sesión)
        // Tipamos mínimamente el cliente para acceder a from/select; evitamos 'any'
        // Usamos el tipo oficial SupabaseClient para evitar 'any'
        let supabase: SupabaseClient;
        if (url && serviceKey) {
            supabase = createServiceClient(url, serviceKey, {
                auth: { persistSession: false, autoRefreshToken: false },
            });
        } else {
            // Fallback: cliente con sesión actual (RLS puede limitar resultados si no eres admin)
            supabase = await createClient();
        }

        const { data, error, count } = await supabase
            .from("person")
            .select(PERSON_COLUMNS, { count: "exact" })
            .order("first_name", { ascending: true });

        if (error) {
            console.error("Get persons error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ count: count ?? data?.length ?? 0, data: data ?? [] }, { status: 200 });
    } catch (err: unknown) {
        console.error("Get persons unexpected error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
