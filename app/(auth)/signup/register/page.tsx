"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast, useToast } from "@/components/ui/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { AUTH_ROUTES, API_ROUTES } from "@/config/routes";
import { useAuth } from "@/contexts/AuthProvider";

export default function RegisterPage() {
    const { user } = useAuth();
    const { toast, showToast, hideToast } = useToast();
    const [firstName, setFirstName] = useState("");
    const [lastName1, setLastName1] = useState("");
    const [lastName2, setLastName2] = useState("");
    const [username, setUsername] = useState("");
    const [idType, setIdType] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState("");
    const [phone, setPhone] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    
    async function handleRegister() {
        // Basic client-side validation
        if (!firstName || !lastName1 ||
            !username || 
            !idType || !idNumber ||
            !birthDate || !gender || !phone ||
            !photo
        ) {
            showToast("Por favor complete todos los campos.", "error");
            return;
        }


        // if all validations pass, proceed to sign up
        setIsLoading(true);
        try {
            // Create FormData to send to API
            // NEED TO CHANGE IN THE FUTURE
            const formData = new FormData();
            formData.append("firstName", firstName);
            formData.append("lastName1", lastName1);
            formData.append("lastName2", lastName2);
            formData.append("username", username);
            formData.append("idType", idType);
            formData.append("idNumber", idNumber);
            formData.append("birthDate", birthDate);
            formData.append("gender", gender);
            formData.append("phone", phone);
            formData.append("user_id", user?.id || "");
            if (photo) {
                formData.append("photo", photo);
            }

            const response = await fetch(API_ROUTES.AUTH.REGISTER, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Error al registrarse");
            }

            showToast(result.message || "Cuenta creada exitosamente!", "success");
            setTimeout(() => {
                router.push(AUTH_ROUTES.LOGIN);
            }, 2000);

        } catch (err: unknown) {
            if (err instanceof Error) {
                showToast(err.message, "error");
            } else {
                showToast("Error al registrarse", "error");
            }
        } finally {
            setIsLoading(false);
        }
    }

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedPhoto = e.target.files?.[0];
        if (!selectedPhoto) return;

        setPhoto(selectedPhoto);

        const url = URL.createObjectURL(selectedPhoto);
        setPhotoPreview(url);
    }
    

    return (
        <>
            <div className="min-h-screen px-6 py-12">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Completa tu registro</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left column - avatar and photo upload */}
                        <div className="col-span-1">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-36 h-36 rounded-xl bg-[#EDF7F3] flex items-center justify-center overflow-hidden">
                                    {photoPreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <Image src={photoPreview} alt="avatar preview" className="w-full h-full object-cover" width={100} height={100}/>
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
                                        className="hidden" 
                                        id="avatar-upload"
                                        onChange={handlePhotoChange}
                                    />
                                    <Button 
                                        variant="default" 
                                        size="sm"
                                        type="button"
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
                                </div>

                                {/* Right column fields */}
                                <div className="space-y-4">
                                    <div>
                                        <Label className="mb-1 block">Usuario</Label>
                                        <Input placeholder="Introduzca su usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
                                    </div>

                                    <div>
                                        <Label className="mb-1 block">Teléfono</Label>
                                        <Input placeholder="Introduzca su teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>

                                    <div>
                                        <Label className="mb-1 block">Fecha de nacimiento</Label>
                                        <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
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
                            </div>

                            {/* Create button */}
                            <div className="mt-6">
                                <Button variant="default" size="lg" onClick={handleRegister} className="w-44" disabled={isLoading}>
                                    {isLoading ? "Creando..." : "Crear Cuenta"}
                                </Button>
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
