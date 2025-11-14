import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Insertar un negocio afiliado
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const districtName = body.district_name || body.districtName;
        const businessTypeName = body.business_type_name || body.businessTypeName;
        const affiliatedBusinessName = body.affiliated_business_name || body.affiliatedBusinessName;
        const phone = body.phone;
        const managerName = body.manager_name || body.managerName;
        const email = body.email;
        const description = body.description || null;

        // Validar campos requeridos
        if (!districtName || !businessTypeName || !affiliatedBusinessName || !phone || !managerName || !email) {
            return NextResponse.json({ 
                error: "Los campos district_name, business_type_name, affiliated_business_name, phone, manager_name y email son requeridos" 
            }, { status: 400 });
        }

        // Validar tipos de datos
        if (typeof affiliatedBusinessName !== 'string' || typeof phone !== 'string' || 
            typeof managerName !== 'string' || typeof email !== 'string') {
            return NextResponse.json({ 
                error: "Los campos deben ser texto válido" 
            }, { status: 400 });
        }

        // Validar longitudes
        if (affiliatedBusinessName.trim().length === 0 || phone.trim().length === 0 || 
            managerName.trim().length === 0 || email.trim().length === 0) {
            return NextResponse.json({ 
                error: "Los campos no pueden estar vacíos" 
            }, { status: 400 });
        }

        if (affiliatedBusinessName.length > 50) {
            return NextResponse.json({ 
                error: "El nombre del negocio no puede exceder 50 caracteres" 
            }, { status: 400 });
        }

        if (phone.length > 50) {
            return NextResponse.json({ 
                error: "El teléfono no puede exceder 50 caracteres" 
            }, { status: 400 });
        }

        if (managerName.length > 50) {
            return NextResponse.json({ 
                error: "El nombre del gerente no puede exceder 50 caracteres" 
            }, { status: 400 });
        }

        if (email.length > 50) {
            return NextResponse.json({ 
                error: "El email no puede exceder 50 caracteres" 
            }, { status: 400 });
        }

        if (description && description.length > 50) {
            return NextResponse.json({ 
                error: "La descripción no puede exceder 50 caracteres" 
            }, { status: 400 });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ 
                error: "El email no tiene un formato válido" 
            }, { status: 400 });
        }

        // Validar formato de teléfono (solo números, espacios, guiones, paréntesis y +)
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(phone)) {
            return NextResponse.json({ 
                error: "El teléfono solo puede contener números, espacios, guiones, paréntesis y el símbolo +" 
            }, { status: 400 });
        }

        // Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
        }

        // Obtener el ID del distrito por su nombre
        const { data: districtData, error: districtError } = await supabase
            .from('district')
            .select('district_id')
            .eq('district_name', districtName)
            .single();

        if (districtError || !districtData) {
            console.error("District error:", districtError);
            return NextResponse.json({ 
                error: `El distrito "${districtName}" no existe` 
            }, { status: 404 });
        }

        // Obtener el ID del tipo de negocio por su nombre
        const { data: businessTypeData, error: businessTypeError } = await supabase
            .from('businesstype')
            .select('business_type_id')
            .eq('name', businessTypeName)
            .single();

        if (businessTypeError || !businessTypeData) {
            console.error("Business type error:", businessTypeError);
            return NextResponse.json({ 
                error: `El tipo de negocio "${businessTypeName}" no existe` 
            }, { status: 404 });
        }

        const districtId = districtData.district_id;
        const businessTypeId = businessTypeData.business_type_id;

        // Verificar si ya existe un negocio afiliado con ese nombre
        const { data: existingBusiness, error: checkError } = await supabase
            .from('affiliatedbusiness')
            .select('affiliated_business_id, affiliated_business_name')
            .eq('affiliated_business_name', affiliatedBusinessName.trim())
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error("Check error:", checkError);
            return NextResponse.json({ 
                error: `Error al verificar el negocio afiliado: ${checkError.message}` 
            }, { status: 400 });
        }

        if (existingBusiness) {
            return NextResponse.json({ 
                error: `Ya existe un negocio afiliado con el nombre "${affiliatedBusinessName.trim()}"` 
            }, { status: 409 });
        }

        // Insertar el negocio afiliado
        const { data, error } = await supabase
            .from('affiliatedbusiness')
            .insert([{
                district_id: districtId,
                business_type_id: businessTypeId,
                affiliated_business_name: affiliatedBusinessName.trim(),
                phone: phone.trim(),
                manager_name: managerName.trim(),
                email: email.trim().toLowerCase(),
                description: description ? description.trim() : null,
                created_by: user.id,
                updated_by: user.id
            }])
            .select(`
                affiliated_business_id,
                district_id,
                business_type_id,
                affiliated_business_name,
                phone,
                manager_name,
                email,
                description,
                created_by,
                created_at,
                updated_by,
                updated_at,
                district:district_id (
                    district_id,
                    district_name,
                    city:city_id (
                        city_id,
                        city_name,
                        province:province_id (
                            province_id,
                            province_name,
                            country:country_id (
                                country_id,
                                country_name
                            )
                        )
                    )
                ),
                businesstype:business_type_id (
                    business_type_id,
                    name
                )
            `);

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ 
                error: `Error al crear el negocio afiliado: ${error.message}` 
            }, { status: 400 });
        }

        console.log("AffiliatedBusiness created successfully:", data);
        return NextResponse.json({ 
            message: "Negocio afiliado creado exitosamente.",
            data
        }, { status: 201 });

    } catch (err: unknown) {
        console.error("Insert affiliatedbusiness error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}