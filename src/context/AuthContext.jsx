import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user) => {
    if (!user) {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    setCurrentUser(user);
    const { data } = await supabase
      .from("officers")
      .select("*")
      .eq("uid", user.id)
      .maybeSingle();
    if (data) {
      setUserProfile(data);
    } else {
      setUserProfile({ role: "member", uid: user.id });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user ?? null).then(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user ?? null).then(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
