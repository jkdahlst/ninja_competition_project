"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient, Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserContextType {
  isAdmin: boolean;
  loading: boolean;
  session: Session | null;
}

const UserContext = createContext<UserContextType>({
  isAdmin: false,
  loading: true,
  session: null,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const { data: user, error } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", userId)
        .single();

      setIsAdmin(user?.is_admin ?? false);
      setLoading(false);
    }

    loadUser();

    // Optional: subscribe to auth state changes (like login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          const userId = session.user.id;
          const { data: user, error } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", userId)
            .single();
          setIsAdmin(user?.is_admin ?? false);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ isAdmin, loading, session }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
