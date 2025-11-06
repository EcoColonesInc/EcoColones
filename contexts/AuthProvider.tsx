"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, useContext, createContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";

import { Role } from "@/types/role";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    role?: Role | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<Role | null>(null);

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Fetch user role
            if (session?.user.id) {
            supabase.rpc("get_user_role", {
                p_user_id: session.user.id,
            }).then(({ data }) => {
                setRole(data as Role ?? null);
            });
        } else {
            setRole(null);
        }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    async function signOut() {
        await supabase.auth.signOut();
    }

    const value = { user, session, loading, signOut, role };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};

// Hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}