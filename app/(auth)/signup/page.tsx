"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast, useToast } from "@/components/ui/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
    const { toast, showToast, hideToast } = useToast();
    const [firstName, setFirstName] = useState("");
    const [lastName1, setLastName1] = useState("");
    const [lastName2, setLastName2] = useState("");
    const [username, setUsername] = useState("");
    const [idType, setIdType] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [avatarPath, setAvatarPath] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    

    
    async function handleSignUp() {
            if (!termsAccepted) {
                showToast("Debe aceptar los términos y condiciones.", "error");
                return;
            }
        // Basic client-side validation
        if (!firstName || !lastName1 || !email || !password || !confirmPassword) {
            showToast("Por favor complete todos los campos.", "error");
            return;
        }

        if (password.length < 6) {
            showToast("La contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showToast("Las contraseñas no coinciden.", "error");
            return;
        }

            setIsLoading(true);
            try {
                // include avatar public url if uploaded
                const avatarPublicUrl = avatarPath
                    ? supabase.storage.from("profile_pictures").getPublicUrl(avatarPath).data?.publicUrl ?? null
                    : null;

                const metadata: any = {
                    first_name: firstName,
                    last_name_1: lastName1 || undefined,
                    last_name_2: lastName2 || undefined,
                    full_name: `${firstName} ${lastName1} ${lastName2}`.trim(),
                    username: username || undefined,
                    id_type: idType || undefined,
                    id_number: idNumber || undefined,
                    dob: dob || undefined,
                    gender: gender || undefined,
                    phone: phone || undefined,
                    avatar_url: avatarPublicUrl || undefined,
                    role: "user",
                };
                // Create the user using client-side signUp (email confirmation flow)
                const { data: signUpData, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: metadata },
                });

                if (error) {
                    showToast(`Error: ${error.message}`, "error");
                    setIsLoading(false);
                    return;
                }

                // Attempt to get the created user's id. signUp may return it in signUpData.user
                let userId: string | null = signUpData?.user?.id ?? null;

                // If not present (email confirmation flow), try to fetch current user (may not be present)
                if (!userId) {
                    try {
                        const { data: userData } = await supabase.auth.getUser();
                        userId = userData?.user?.id ?? null;
                    } catch {
                        userId = null;
                    }
                }
                showToast(
                    "Registro realizado. Revisa tu correo para verificar la cuenta.",
                    "success"
                );

                // Redirect to login after successful signup
                await sleep(5000); // wait for 5 seconds to let user read the toast
                router.push("/login");
            } catch (err: any) {
                showToast(err?.message ?? "Error al registrarse", "error");
            } finally {
                setIsLoading(false);
            }
    }

        function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
            const file = e.target.files?.[0] ?? null;
            setPhoto(file);
            if (!file) {
                setPhotoPreview(null);
                setAvatarPath(null);
                return;
            }

            // show immediate preview
            const localUrl = URL.createObjectURL(file);
            setPhotoPreview(localUrl);

            // upload to Supabase Storage
            ;(async () => {
                try {
                    const bucket = "profile_pictures";
                    const fileExt = file.name.split('.').pop();
                    const fileName = `avatar_${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from(bucket)
                        .upload(filePath, file, { upsert: true });

                    if (uploadError) {
                        showToast(`No se pudo subir la imagen: ${uploadError.message}`, "error");
                        return;
                    }

                    // get public url
                    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
                    const publicUrl = urlData?.publicUrl ?? null;
                    if (publicUrl) {
                        setPhotoPreview(publicUrl);
                        setAvatarPath(filePath);
                    }
                } catch (err: any) {
                    showToast(err?.message ?? "Error subiendo la imagen", "error");
                }
            })();
        }
        function sleep(ms: number | undefined) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        return (
            <>
                <div className="min-h-screen px-6 py-12">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8">¡Crea una cuenta!</h1>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Left column - avatar and photo upload */}
                            <div className="col-span-1">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-36 h-36 rounded-xl bg-[#EDF7F3] flex items-center justify-center overflow-hidden">
                                        {photoPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={photoPreview} alt="avatar preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5C5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="inline-flex items-center">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handlePhotoChange} 
                                            className="hidden" 
                                            id="avatar-upload"
                                        />
                                        <Button 
                                            variant="default" 
                                            size="sm"
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                        >
                                            Subir foto
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right column - form (spans 2 columns on large screens) */}
                            <div className="col-span-1 lg:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Left column fields */}
                                    <div className="space-y-4">
                                        
                                            <div>
                                                <Label className="mb-1 block">Nombre</Label>
                                                <Input placeholder="Introduzca su nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label className="mb-1 block">Primer apellido</Label>
                                                <Input placeholder="Introduzca su primer apellido" value={lastName1} onChange={(e) => setLastName1(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label className="mb-1 block">Segundo apellido</Label>
                                                <Input placeholder="Introduzca su segundo apellido" value={lastName2} onChange={(e) => setLastName2(e.target.value)} />
                                            </div>
                                        

                                        <div>
                                            <Label className="mb-1 block">Tipo de identificación</Label>
                                            <select className="w-full rounded-md border bg-[#F7FCFA] px-3 py-2" value={idType} onChange={(e) => setIdType(e.target.value)}>
                                                <option value="">Seleccione un tipo</option>
                                                <option value="ID">Cédula</option>
                                                <option value="passport">Pasaporte</option>
                                                <option value="dimex">Dimex</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label className="mb-1 block">Identificación</Label>
                                            <Input placeholder="Introduzca su identificación" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                                        </div>

                                        <div>
                                            <Label className="mb-1 block">Fecha de nacimiento</Label>
                                            <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                                        </div>

                                        <div>
                                            <Label className="mb-1 block">Género</Label>
                                            <select className="w-full rounded-md border bg-[#F7FCFA] px-3 py-2" value={gender} onChange={(e) => setGender(e.target.value)}>
                                                <option value="">Seleccione un género</option>
                                                <option value="female">Femenino</option>
                                                <option value="male">Masculino</option>
                                                <option value="other">Otro</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Right column fields */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="mb-1 block">Usuario</Label>
                                            <Input placeholder="Introduzca su usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
                                        </div>

                                        <div>
                                            <Label className="mb-1 block">Correo electrónico</Label>
                                            <Input type="email" placeholder="Introduzca su correo" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </div>

                                        <div>
                                            <Label className="mb-1 block">Teléfono</Label>
                                            <Input placeholder="Introduzca su teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        </div>

                                        <div>
                                            <Label className="mb-1 block">Contraseña</Label>
                                            <Input type="password" placeholder="Introduzca su contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        </div>
                                        
                                        <div>
                                            <Label className="mb-1 block">Confirmar contraseña</Label>
                                            <Input type="password" placeholder="Confirme su contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and create button */}
                                <div className="mt-6">
                                    <label className="inline-flex items-start gap-2">
                                        <input type="checkbox" className="mt-1" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                                        <span className="text-sm">He leído y acepto los <a href="#" className="text-green-600 underline">términos y condiciones</a> y la política de privacidad</span>
                                    </label>

                                    <div className="mt-6">
                                        <Button variant="default" size="lg" onClick={handleSignUp} className="w-44" disabled={isLoading || !termsAccepted}>
                                            {isLoading ? "Creando..." : "Crear Cuenta"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {toast && (
                    <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} position="top" />
                )}
            </>
        );
}

