import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminDashboard() {
    const { user, session } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!session) {
            // If not logged in, we can either redirect to auth or just show a login prompt here.
            // For a hidden route, often it's better to show nothing or a generic 404/Login to avoid leaking existence.
            // But user asked for login.
            setLoading(false);
            return;
        }

        async function checkAdminAndFetchData() {
            try {
                // 1. Check if user is admin
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile?.is_admin) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                setIsAdmin(true);

                // 2. Fetch all data
                const { data: allProfiles, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('trust_score', { ascending: false });

                if (fetchError) throw fetchError;
                setProfiles(allProfiles || []);

            } catch (error) {
                console.error('Error fetching admin data:', error);
                alert('Error loading admin dashboard.');
            } finally {
                setLoading(false);
            }
        }

        checkAdminAndFetchData();
    }, [session, user]);

    if (!session) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
                <p className="text-gray-600">Please log in to access this area.</p>
                <button
                    onClick={() => navigate('/admin-login')}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                    Go to Admin Login
                </button>
            </div>
        );
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading Admin Data...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="flex h-screen items-center justify-center bg-red-50 flex-col gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-red-800">Access Denied</h1>
                <p className="text-red-600">You do not have administrative privileges.</p>
                <button
                    onClick={() => navigate('/app')}
                    className="px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition"
                >
                    Back to App
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Overview of all active KindBite users</p>
                    </div>
                    <button
                        onClick={() => navigate('/app')}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-orange-600 font-medium"
                    >
                        ← Back to Map
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 font-semibold text-gray-600 text-sm">User</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Email</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Trust Score</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {profiles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                                    {profile.full_name ? profile.full_name[0].toUpperCase() : '?'}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {profile.full_name || 'Anonymous'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 font-mono text-xs">
                                            {profile.email || <span className="text-gray-300 italic">Hidden/Missing</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${profile.trust_score > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {profile.trust_score}
                                                </span>
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${profile.trust_score > 50 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                        style={{ width: `${Math.min(profile.trust_score, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {profile.is_admin ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500 text-xs">
                                            {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
