import { useState, useEffect } from 'react';
import Map from '../components/App/Map';
import BottomNav from '../components/App/BottomNav';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AppPage() {
    const [activeTab, setActiveTab] = useState('map');
    const [mode, setMode] = useState('donor'); // 'donor' or 'spotter'
    const [pins, setPins] = useState([]); // Start with Empty Map
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    const getProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) console.warn('Error fetching profile:', error.message);
            if (data) setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error.message);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handlePinAdd = (newPin) => {
        if (!user) {
            if (window.confirm("You must be logged in to add a spot. Go to login?")) {
                navigate('/auth');
            }
            return;
        }
        setPins([...pins, newPin]);
    };

    const handlePinDelete = (pinId) => {
        setPins(pins.filter(p => p.id !== pinId));
    };

    const handlePinEdit = (pinId, newDesc) => {
        setPins(pins.map(p => p.id === pinId ? { ...p, desc: newDesc } : p));
    };

    // Handler for BottomNav FAB click
    const handleFabClick = () => {
        if (!user) {
            if (window.confirm("You must be logged in to perform this action. Go to login?")) {
                navigate('/auth');
            }
            return;
        }

        if (mode === 'spotter') {
            // In a real app, this might trigger the map click mode or open a general modal
            // For now, we rely on the map click interaction for pinning, 
            // but this could toggle a "Ready to Pin" state if we wanted.
            alert("Tap on the map to place a pin!");
        } else {
            // Donor Verification Logic (Camera)
            alert("Walk to a claimed spot to verify delivery!");
        }
    };

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden app-mode">
            {/* Top Bar: Mode Switcher + Auth Widget */}
            {activeTab === 'map' && (
                <div className="absolute top-4 right-4 z-[500] flex items-center gap-3">
                    {/* Mode Switcher */}
                    <div className="bg-white rounded-full p-1 shadow-lg border border-gray-100 flex">
                        <button
                            onClick={() => setMode('donor')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'donor' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Donor
                        </button>
                        <button
                            onClick={() => setMode('spotter')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'spotter' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Spotter
                        </button>
                    </div>

                    {/* Auth Status / Login Button */}
                    {user ? (
                        <button
                            onClick={() => setActiveTab('profile')}
                            className="bg-white p-1 rounded-full shadow-lg border border-gray-100 flex items-center justify-center w-10 h-10 hover:bg-gray-50 transition-colors"
                        >
                            {/* Initials or Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : '👤'}
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold hover:from-orange-600 hover:to-orange-700 transition-all hover:scale-105"
                        >
                            Login
                        </button>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 relative h-full w-full">
                {activeTab === 'map' && (
                    <div className="absolute inset-0">
                        <Map
                            mode={mode}
                            pins={pins}
                            onPinAdd={handlePinAdd}
                            onPinDelete={handlePinDelete}
                            onPinEdit={handlePinEdit}
                        />
                    </div>
                )}
                {activeTab === 'profile' && (
                    <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
                        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            {/* Header Background - Warm Orange Gradient */}
                            <div className="bg-gradient-to-r from-orange-400 to-red-500 h-32 relative">
                                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                                        <div className="w-full h-full bg-orange-50 rounded-full flex items-center justify-center text-3xl overflow-hidden border-2 border-orange-100">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-orange-300">👤</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 pb-8 px-6 text-center mt-2">
                                <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'Anonymous User'}</h2>
                                <p className="text-sm text-gray-500 mb-6 font-medium">{user?.email}</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 hover:shadow-sm transition-shadow">
                                        <div className="text-3xl font-bold text-orange-600">{profile?.trust_score || 0}</div>
                                        <div className="text-xs font-bold text-orange-400 uppercase tracking-wide mt-1">Trust Score</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 hover:shadow-sm transition-shadow">
                                        <div className="text-3xl font-bold text-green-600">0</div>
                                        <div className="text-xs font-bold text-green-500 uppercase tracking-wide mt-1">Helps</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSignOut}
                                    className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                mode={mode}
                onFabClick={handleFabClick}
            />
        </div>
    );
}
