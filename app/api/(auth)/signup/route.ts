import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Extract email and password from JSON body
        const email = body.email as string;
        const password = body.password as string;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
        }

        // Sign up user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error("Signup error:", error);
            return NextResponse.json({ error: `Error al crear la cuenta: ${error.message}` }, { status: 400 });
        }

        // Check if user was actually created or already exists
        // Supabase returns identities as empty array if email already exists
        if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
            return NextResponse.json({ 
                error: "Este correo electrónico ya está registrado." 
            }, { status: 400 });
        }

        console.log("User signed up:", data);
        return NextResponse.json({ 
            message: "Credenciales verificadas. Complete su registro.",
            userId: data.user?.id
        }, { status: 200 });

    } catch (err: unknown) {
        console.error("Signup error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}