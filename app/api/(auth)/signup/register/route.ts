import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Role } from "@/types/role";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const formData = await request.formData();

        // Extract form fields
        const firstName = formData.get("firstName") as string;
        const lastName1 = formData.get("lastName1") as string;
        const lastName2 = formData.get("lastName2") as string || "";
        const username = formData.get("username") as string;
        const idType = formData.get("idType") as string;
        const idNumber = formData.get("idNumber") as string;
        const birthDate = formData.get("birthDate") as string;
        const gender = formData.get("gender") as string;
        const phone = formData.get("phone") as string;
        const photo = formData.get("photo") as File;
        const user_id = formData.get("user_id") as string;

        // Validate required fields
        if (!firstName || !lastName1 || !username || 
            !idType || !idNumber || !birthDate || !gender || !phone || !photo) {
            return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
        }



        // Call the RPC function to insert person
        // const { data, error } = await supabase.rpc('insert_person', {
        //     p_birth_date: birthDate,
        //     p_document_type: idType,
        //     p_email: ,
        //     p_first_name: firstName,
        //     p_gender: gender,
        //     p_identification: idNumber,
        //     p_last_name: lastName1,
        //     p_password: ,
        //     p_role: Role.USER,
        //     p_second_last_name: lastName2,
        //     p_telephone_number: phone,
        //     p_user_name: username
        // });
        const { data, error } = await supabase.from('person').insert([{
            user_id: user_id,
            first_name: firstName,
            last_name: lastName1,
            second_last_name: lastName2,
            telephone_number: phone,
            identification: idNumber,
            document_type: idType,
            birth_date: birthDate,
            gender: gender,
            role: Role.USER,
            user_name: username,
            created_by: user_id,
            updated_by: user_id
        }]);

        if (error) {
            console.error("RPC error:", error);

            return NextResponse.json({ error: `Error al crear la cuenta: ${error.message}` }, { status: 400 });
        }

                // Upload photo to Supabase Storage
        const fileExt = photo.name.split('.').pop();
        const fileName = `${username}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from('profile_pictures')
            .upload(filePath, photo, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ error: `Error al subir la foto: ${uploadError.message}` }, { status: 400 });
        }

        console.log("User created successfully:", data);
        return NextResponse.json({ 
            message: "Usuario registrado exitosamente.",
            data 
        }, { status: 200 });

    } catch (err: unknown) {
        console.error("Register error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
