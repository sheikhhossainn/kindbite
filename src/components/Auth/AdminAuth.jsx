import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function AdminAuth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, signOut } = useAuth();
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Password Login Only
            const { error, data } = await signIn(email, password);
            if (error) throw error;

            const user = data?.user;

            // If we have a user (from password login), check role
            if (user) {
                console.log('Login successful. User ID:', user.id);
                console.log('Checking admin role in profiles table...');

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                console.log('Profile Query Result:', { profile, profileError });

                if (profileError || !profile?.is_admin) {
                    // Not an admin? Kick them out!
                    console.error('Not an admin or error verifying role:', profileError);
                    await signOut();
                    alert(`⛔ Access Denied: You do not have administrative privileges.\nDebug Info: ${profileError?.message || 'Profile is_admin is false'}`);
                } else {
                    // Is Admin? Success!
                    console.log('Admin verified. Redirecting...');
                    navigate('/admin-portal-secure');
                }
            }

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-2xl border border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Admin Console</h2>
                    <p className="mt-2 text-sm text-gray-400">Restricted Access Area</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded bg-gray-700 border border-gray-600 p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                            placeholder="admin@kindbite.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded bg-gray-700 border border-gray-600 p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                            placeholder="••••••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded bg-orange-600 hover:bg-orange-700 py-3 text-sm font-bold text-white uppercase tracking-wide transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying Credentials...' : 'Authenticate'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-700 pt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        ← Return to Public Site
                    </button>
                </div>
            </div>
        </div>
    );
}
