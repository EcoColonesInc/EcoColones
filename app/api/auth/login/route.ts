import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email y password son requeridos" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        return NextResponse.json({
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            user: data.user,
            expires_at: data.session?.expires_at
        });
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json(
            { error: "Error en login" },
            { status: 500 }
        );
    }
}