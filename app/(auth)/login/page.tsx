"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toast, useToast } from "@/components/ui/toast";
import {useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login into Qrder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleLogin}>Sign In</Button>
        </CardContent>
      </Card>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
          position="top"
        />
      )}
    </div>
  );
}
