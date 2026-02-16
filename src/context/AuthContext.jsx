import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, metadata = {}) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: `${window.location.origin}/app`,
            },
        });
    };

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    };

    const signInWithMagicLink = async (email, redirectTo = window.location.origin) => {
        return await supabase.auth.signInWithOtp({
            email,
            options: {
                // Redirect to current page or specific route after login source
                emailRedirectTo: redirectTo,
            }
        });
    };

    const signOut = async () => {
        return await supabase.auth.signOut();
    };

    const value = {
        signUp,
        signIn,
        signInWithMagicLink,
        signOut,
        user,
        session,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
