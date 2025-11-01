"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast, useToast } from "@/components/ui/toast";
import {useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { toast, showToast, hideToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin() {
    // check if email and password are not empty
    if (!email || !password) {
      showToast("Please enter both email and password.", "error");
      return;
    }
      const { error } = await supabase.auth.signInWithPassword({email, password});
    if (error) {
      showToast(`Error: ${error.message}`, "error");
    } else {
      showToast("Login successful!", "success");
      router.push("/dashboard");
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-30 w-full max-w-6xl">
          <div className="w-full max-w-md">
            <h1 className="mb-8 sm:mb-12 lg:mb-20 text-3xl sm:text-4xl lg:text-5xl font-bold text-center lg:text-left">Iniciar Sesión</h1>
            <div className="w-full">
              
              {/* Email Field */}
              <Label className="mb-1 block">Correo</Label>
              <Input
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4"
              />

              {/* Password Field */}
              <Label className="mb-1 block">Contraseña</Label>
              <Input
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4"
              />

              {/* Login Button and Signup Link */}
              <Button variant="default" size="sm" onClick={handleLogin} className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
              <div className="mt-4 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">
                  ¿No estás registrado?{" "}
                  <Link href="/signup">
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Regístrate aquí
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
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
          position="top"
        />
      )}
    </>
  );
}
