"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="font-bold text-xl text-primary">Company</div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/menu"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Item2
          </Link>
          <Link
            href="/orders"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Item3
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Item4
          </Link>
          
          {/* Auth Buttons */}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          )}
            
        </div>
      </div>
    </nav>
  );
}
