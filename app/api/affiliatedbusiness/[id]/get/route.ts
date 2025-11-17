import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Obtener un comercio afiliado específico por ID con sus relaciones
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id } = await context.params;

        // Selección incluyendo:
        // - email como FK a tabla email
        // - manager_id (persona) para obtener nombre completo
        const { data, error } = await supabase
            .from("affiliatedbusiness")
            .select(
                [
                    "affiliated_business_id",
                    "affiliated_business_name",
                    "description",
                    "phone",
                    // Relación a email -> devuelve objeto { email }
                    "email(email)",
                    // Relación a manager_id -> devuelve objeto con partes del nombre
                    "manager_id(first_name,last_name,second_last_name)",
                    // Tipo de comercio
                    "business_type_id(name)",
                    // Cadena de localización completa
                    "district_id(district_name, city_id(city_name, province_id(province_name, country_id(country_name))))",
                ].join(",")
            )
            .eq("affiliated_business_id", id)
            .single();

        if (error) {
            console.error("Get affiliated business error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data }, { status: 200 });
    } catch (err: unknown) {
        console.error("Get affiliated business unexpected error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
