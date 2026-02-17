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
    const [activeTab, setActiveTab] = useState('users');

    // Photo review state
    const [completedPins, setCompletedPins] = useState([]);
    const [expandedPhoto, setExpandedPhoto] = useState(null);

    // Penalty modal state
    const [penaltyModal, setPenaltyModal] = useState(null);
    const [penaltyReason, setPenaltyReason] = useState('');
    const [penaltyPoints, setPenaltyPoints] = useState(10);
    const [penaltyLoading, setPenaltyLoading] = useState(false);

    useEffect(() => {
        if (!session) {
            setLoading(false);
            return;
        }
        checkAdminAndFetchData();
    }, [session, user]);

    async function checkAdminAndFetchData() {
        try {
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

            // Fetch all profiles
            const { data: allProfiles, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .order('trust_score', { ascending: false });

            if (fetchError) throw fetchError;
            setProfiles(allProfiles || []);

            // Fetch completed pins with proof photos
            const { data: pinData, error: pinError } = await supabase
                .from('pins')
                .select('*')
                .eq('status', 'completed')
                .not('proof_photo_url', 'is', null)
                .order('created_at', { ascending: false });

            if (pinError) throw pinError;
            setCompletedPins(pinData || []);

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    }

    const handlePenalize = async () => {
        if (!penaltyModal || !penaltyReason.trim()) {
            alert('Please provide a reason for the penalty.');
            return;
        }
        setPenaltyLoading(true);
        try {
            const { error } = await supabase
                .from('admin_penalties')
                .insert([{
                    user_id: penaltyModal.locked_by || penaltyModal.user_id,
                    pin_id: penaltyModal.id,
                    reason: penaltyReason,
                    points_deducted: penaltyPoints,
                    created_by: user.id
                }]);

            if (error) throw error;

            alert(`Penalty issued: -${penaltyPoints} TS. User has been notified.`);
            setPenaltyModal(null);
            setPenaltyReason('');
            setPenaltyPoints(10);
            // Refresh data
            checkAdminAndFetchData();
        } catch (error) {
            alert('Error issuing penalty: ' + error.message);
        } finally {
            setPenaltyLoading(false);
        }
    };

    // Helper to get profile name by ID
    const getProfileName = (userId) => {
        const p = profiles.find(pr => pr.id === userId);
        return p?.full_name || p?.email?.split('@')[0] || 'Unknown';
    };

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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage users and review proof photos</p>
                    </div>
                    <button
                        onClick={() => navigate('/app')}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-orange-600 font-medium"
                    >
                        ← Back to Map
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        👥 Users ({profiles.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('photos')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'photos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📸 Photo Reviews ({completedPins.length})
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
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
                )}

                {/* Photos Tab */}
                {activeTab === 'photos' && (
                    <div className="space-y-4">
                        {completedPins.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <div className="text-4xl mb-3">📷</div>
                                <p className="text-gray-500">No completed pins with proof photos yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {completedPins.map(pin => (
                                    <div key={pin.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Photo */}
                                        <div
                                            className="aspect-square bg-gray-100 cursor-pointer relative group"
                                            onClick={() => setExpandedPhoto(pin.proof_photo_url)}
                                        >
                                            <img
                                                src={pin.proof_photo_url}
                                                alt="Proof"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = ''; e.target.alt = 'Failed to load'; }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-bold bg-black/50 px-3 py-1 rounded-full">
                                                    🔍 Expand
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px] font-bold">
                                                    {getProfileName(pin.locked_by || pin.user_id)?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{getProfileName(pin.locked_by || pin.user_id)}</p>
                                                    <p className="text-[10px] text-gray-400">Donor (Fulfiller)</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                <span className="font-semibold">Spotter:</span> {getProfileName(pin.user_id)}
                                            </p>
                                            <p className="text-xs text-gray-600 mb-1 truncate" title={pin.description}>
                                                📝 {pin.description}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mb-3">
                                                {pin.created_at ? new Date(pin.created_at).toLocaleString() : '-'}
                                            </p>

                                            {/* Penalize Button */}
                                            <button
                                                onClick={() => setPenaltyModal(pin)}
                                                className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                                            >
                                                ⚠️ Penalize Donor
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Expanded Photo Modal */}
            {expandedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setExpandedPhoto(null)}
                >
                    <img
                        src={expandedPhoto}
                        alt="Expanded proof"
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                    <button
                        className="absolute top-6 right-6 text-white/80 hover:text-white bg-black/40 rounded-full p-2"
                        onClick={() => setExpandedPhoto(null)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Penalty Modal */}
            {penaltyModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-lg">⚠️</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Issue Penalty</h3>
                                <p className="text-xs text-gray-500">
                                    To: <strong>{getProfileName(penaltyModal.locked_by || penaltyModal.user_id)}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Proof photo thumbnail */}
                        {penaltyModal.proof_photo_url && (
                            <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                                <img src={penaltyModal.proof_photo_url} alt="Proof" className="w-full h-32 object-cover" />
                            </div>
                        )}

                        {/* Points */}
                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Points to Deduct</label>
                            <div className="flex gap-2">
                                {[5, 10, 25, 50].map(pts => (
                                    <button
                                        key={pts}
                                        onClick={() => setPenaltyPoints(pts)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${penaltyPoints === pts ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        -{pts}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Reason (sent to user)</label>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                rows="3"
                                placeholder="e.g. Uploaded a blurry/irrelevant photo instead of actual food delivery proof"
                                value={penaltyReason}
                                onChange={e => setPenaltyReason(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setPenaltyModal(null); setPenaltyReason(''); setPenaltyPoints(10); }}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePenalize}
                                disabled={penaltyLoading || !penaltyReason.trim()}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {penaltyLoading ? 'Issuing...' : `Penalize -${penaltyPoints} TS`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
