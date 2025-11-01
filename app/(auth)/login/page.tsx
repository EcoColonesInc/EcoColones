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
      <div className="h-screen flex items-center justify-center gap-30">
        <div className="">
          <h1 className="mb-20 text-5xl text-bold">Iniciar Sesión</h1>
          <div className="w-80">
            <Label className="mb-1">Correo</Label>
            <Input
              type="email"
              placeholder="Ingrese su correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <Label className="mb-1">Contraseña</Label>
            <Input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
            />
            <Button variant="default" size="sm" onClick={handleLogin}>
              Iniciar Sesión
            </Button>
            <div className="mt-4 text-center">
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

        <Image src="/logo.png" alt="EcoColones Logo" width={400} height={400} />

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
