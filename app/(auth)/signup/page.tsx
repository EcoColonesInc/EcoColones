"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast, useToast } from "@/components/ui/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { API_ROUTES, AUTH_ROUTES } from "@/config/routes";

export default function SignUpPage() {
    const { toast, showToast, hideToast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    async function handleSignUp() {
        // If terms not accepted, show error
        if (!termsAccepted) {
            showToast("Debe aceptar los términos y condiciones.", "error");
            return;
        }

        // Basic client-side validation
        if (!email || !password || !confirmPassword) {
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
            const body = { email, password };
            const response = await fetch(API_ROUTES.AUTH.SIGNUP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Error al registrarse");
            }

            showToast("Registro exitoso. Por favor, verifica tu correo electrónico.", "success");
            await new Promise(r => setTimeout(r, 2000));
        } catch (error: unknown) {
            showToast((error as Error).message, "error");
        } finally {
            setIsLoading(false);
            router.push(AUTH_ROUTES.LOGIN);
        }
    }

    return (
        <>
            <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-30 w-full max-w-6xl">
                    <div className="w-full max-w-md">
                        <h1 className="mb-8 sm:mb-12 lg:mb-20 text-3xl sm:text-4xl lg:text-5xl font-bold text-center lg:text-left">¡Crea una cuenta!</h1>
                        <div className="w-full space-y-4">
                            <div>
                                <Label className="mb-1 block">Correo electrónico</Label>
                                <Input 
                                    type="email" 
                                    placeholder="Introduzca su correo" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>

                            <div>
                                <Label className="mb-1 block">Contraseña</Label>
                                <Input 
                                    type="password" 
                                    placeholder="Introduzca su contraseña" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                            </div>
                            
                            <div>
                                <Label className="mb-1 block">Confirmar contraseña</Label>
                                <Input 
                                    type="password" 
                                    placeholder="Confirme su contraseña" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                />
                            </div>

                            <div className="mt-6">
                                <label className="inline-flex items-start gap-2">
                                    <input 
                                        type="checkbox" 
                                        className="mt-1" 
                                        checked={termsAccepted} 
                                        onChange={(e) => setTermsAccepted(e.target.checked)} 
                                    />
                                    <span className="text-sm">He leído y acepto los <Link href="#" className="text-green-600 underline">términos y condiciones</Link> y la <Link href="#" className="text-green-600 underline">política de privacidad</Link></span>
                                </label>
                            </div>

                            <div className="mt-6">
                                <Button 
                                    variant="default" 
                                    size="lg" 
                                    onClick={handleSignUp} 
                                    className="w-full sm:w-auto" 
                                    disabled={isLoading || !termsAccepted}
                                >
                                    {isLoading ? "Verificando..." : "Continuar"}
                                </Button>
                            </div>

                            <div className="mt-4 text-center sm:text-left">
                                <p className="text-sm text-muted-foreground">
                                    ¿Ya tienes cuenta?{" "}
                                    <Link href="/login">
                                        <Button variant="link" size="sm" className="p-0 h-auto">
                                            Inicia sesión aquí
                                        </Button>
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <Image src="/logo.png" alt="EcoColones Logo" width={400} height={400} className="w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96" />
                    </div>
                </div>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} position="top" />
            )}
        </>
    );
}