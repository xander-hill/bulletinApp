import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

// 1. Update the context type to include the signOut function
const AuthContext = createContext<{
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>; // Add this line
}>({ 
  session: null, 
  user: null, 
  loading: true,
  signOut: async () => {}, // Provide a default empty function
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    init();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Define the signOut function
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    // 3. Add signOut to the provider's value
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);