import { useState, useEffect, useRef, useCallback } from 'react';
import Map from '../components/App/Map';
import BottomNav from '../components/App/BottomNav';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/App/NotificationBell';
import CameraCapture from '../components/App/CameraCapture';
import { calculateDistance } from '../utils/location';
import notifSoundSrc from '../assets/new_pins_near_me.mp3';

export default function AppPage() {
    const [activeTab, setActiveTab] = useState('map');
    const [mode, setMode] = useState('donor'); // 'donor' or 'spotter'
    const [pins, setPins] = useState([]); // Start with Empty Map
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const [showCamera, setShowCamera] = useState(false);
    const [activePinForPhoto, setActivePinForPhoto] = useState(null);
    const [userPosition, setUserPosition] = useState(null);
    const userPositionRef = useRef(null);
    const audioBlobUrl = useRef(null);
    const audioUnlocked = useRef(false);

    // Audio setup: Vite imports the mp3 as a hashed asset URL (IDM-proof)
    useEffect(() => {
        // Unlock audio on first user interaction (browser autoplay policy)
        const unlock = () => {
            audioUnlocked.current = true;
            const a = new Audio(notifSoundSrc);
            a.volume = 0;
            a.play().then(() => { a.pause(); }).catch(() => { });
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);
        return () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
        };
    }, []);

    // Helper: play notification sound
    const playNotifSound = useCallback(() => {
        try {
            const sound = new Audio(notifSoundSrc);
            sound.volume = 0.7;
            sound.play().catch(() => { });
        } catch { }
    }, []);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Track user position for distance checks
    useEffect(() => {
        if (!('geolocation' in navigator)) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const p = [pos.coords.latitude, pos.coords.longitude];
                setUserPosition(p);
                userPositionRef.current = p;
            },
            () => { },
            { enableHighAccuracy: true, maximumAge: 10000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        if (user) {
            getProfile();
            loadPins();
        } else {
            loadPins();
        }
    }, [user]);

    // ====== SUPABASE REALTIME — instant pin updates ======
    useEffect(() => {
        let isMounted = true;
        const channelName = `pins-realtime-${Date.now()}`;
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pins' }, (payload) => {
                if (!isMounted) return;
                const newPin = payload.new;
                setPins(prev => [newPin, ...prev]);

                // Play sound
                playNotifSound();

                // Browser push notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    let body = `New food spot: ${newPin.description?.slice(0, 60) || 'Someone needs help!'}`;
                    const pos = userPositionRef.current;
                    if (pos) {
                        const dist = calculateDistance(pos[0], pos[1], newPin.lat, newPin.lng);
                        body = `📍 ${Math.round(dist)}m away — ${newPin.description?.slice(0, 50) || 'Someone needs help!'}`;
                    }
                    new Notification('🔔 New Food Spot on KindBite!', {
                        body,
                        icon: '/logo.svg',
                        badge: '/logo.svg',
                        tag: `pin-${newPin.id}`,
                        vibrate: [200, 100, 200]
                    });
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pins' }, (payload) => {
                if (!isMounted) return;
                setPins(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pins' }, (payload) => {
                if (!isMounted) return;
                setPins(prev => prev.filter(p => p.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, []); // Empty deps — subscribe ONCE

    // Load pins from database
    const loadPins = async () => {
        try {
            const { data, error } = await supabase
                .from('pins')
                .select('*')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPins(data || []);
        } catch (error) {
            console.error('Error loading pins:', error.message);
        }
    };

    // Update user location in database for notifications
    useEffect(() => {
        if (!user) return;

        const updateLocation = async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                await supabase
                    .from('profiles')
                    .update({
                        location: `POINT(${longitude} ${latitude})`
                    })
                    .eq('id', user.id);
            } catch (error) {
                console.error('Error updating location:', error);
            }
        };

        // Watch position and update periodically
        if ('geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                updateLocation,
                (err) => console.warn('Location tracking error:', err),
                { enableHighAccuracy: true, maximumAge: 30000 }
            );
            return () => navigator.geolocation.clearWatch(watchId);
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
        setProfile(null); // Clear profile data immediately
        await signOut();
        setActiveTab('map');
        // Stay on the app page as guest
    };

    const handlePinAdd = async (newPin) => {
        if (!user) {
            if (window.confirm("You must be logged in to add a spot. Go to login?")) {
                navigate('/auth');
            }
            return;
        }

        try {
            // Calculate expires_at based on TTL
            const ttlHours = parseInt(newPin.ttl) || 2;
            const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('pins')
                .insert([{
                    user_id: user.id,
                    lat: newPin.lat,
                    lng: newPin.lng,
                    location: `POINT(${newPin.lng} ${newPin.lat})`,
                    description: newPin.desc,
                    ttl: newPin.ttl,
                    people_count: newPin.people_count,
                    expires_at: expiresAt
                }])
                .select()
                .single();

            if (error) throw error;

            // Add to local state
            setPins([data, ...pins]);
        } catch (error) {
            alert('Error creating pin: ' + error.message);
        }
    };

    const handlePinDelete = async (pinId) => {
        try {
            const { error } = await supabase
                .from('pins')
                .delete()
                .eq('id', pinId)
                .eq('user_id', user.id); // Only allow deletion of own pins

            if (error) throw error;

            setPins(pins.filter(p => p.id !== pinId));
        } catch (error) {
            alert('Error deleting pin: ' + error.message);
        }
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

    // --- LOCKING & COMPLETION LOGIC ---

    const handlePinLock = async (pinId) => {
        if (!user) {
            if (window.confirm("Login required to help. Go to login?")) navigate('/auth');
            return;
        }

        try {
            const { error } = await supabase
                .from('pins')
                .update({
                    status: 'locked',
                    locked_by: user.id,
                    locked_at: new Date().toISOString()
                })
                .eq('id', pinId)
                .eq('status', 'open'); // Ensure it's still open

            if (error) throw error;

            // UI Update — await so state updates before any blocking message
            await loadPins();
            // Delay the message so the route renders FIRST
            setTimeout(() => {
                alert("Lock successful! 🛡️\n\nFollow the blue route to the spot.\n\nNote: If you cancel after 30 minutes, you will receive a Trust Score penalty (-5).");
            }, 500);
        } catch (error) {
            alert("Could not lock pin. It might be taken or you are the creator (Anti-Fraud). " + error.message);
        }
    };

    const handlePinCancel = async (pinId) => {
        if (!confirm("Are you sure? If verified late (>30m), you lose 5 Trust Score.")) return;

        try {
            const { error } = await supabase
                .from('pins')
                .update({
                    status: 'open',
                    locked_by: null,
                    locked_at: null
                })
                .eq('id', pinId)
                .eq('locked_by', user.id);

            if (error) throw error;
            loadPins();
        } catch (error) {
            alert('Error cancelling: ' + error.message);
        }
    };

    // Step 1: Open camera
    const handlePinComplete = (pinId) => {
        setActivePinForPhoto(pinId);
        setShowCamera(true);
    };

    // Step 2: Upload photo & complete pin
    const handlePhotoConfirm = async (blob) => {
        setShowCamera(false);
        const pinId = activePinForPhoto;
        if (!pinId || !blob) return;

        try {
            // Upload to Supabase Storage
            const fileName = `${user.id}/${pinId}_${Date.now()}.jpg`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('proof-photos')
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('proof-photos')
                .getPublicUrl(fileName);

            const photoUrl = urlData?.publicUrl;

            // Update pin: mark completed + save photo URL
            const { error } = await supabase
                .from('pins')
                .update({
                    status: 'completed',
                    proof_photo_url: photoUrl
                })
                .eq('id', pinId)
                .eq('locked_by', user.id);

            if (error) throw error;

            await loadPins();
            setTimeout(() => {
                alert("Success! +50 Trust Score awarded to both you and the spotter! 🎉\n\nYour proof photo has been uploaded for review.");
            }, 300);
        } catch (error) {
            alert('Error completing: ' + error.message);
        } finally {
            setActivePinForPhoto(null);
        }
    };

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden app-mode">
            {/* Camera Overlay */}
            {showCamera && (
                <CameraCapture
                    onCapture={handlePhotoConfirm}
                    onClose={() => { setShowCamera(false); setActivePinForPhoto(null); }}
                />
            )}
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

                    {/* Notification Bell */}
                    {user && <NotificationBell user={user} />}

                    {/* Auth Status / Login Button */}
                    {user ? (
                        <button
                            onClick={() => setActiveTab('profile')}
                            className="bg-white p-1 rounded-full shadow-lg border border-gray-100 flex items-center justify-center w-10 h-10 hover:bg-gray-50 transition-colors"
                        >
                            {/* Initials or Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
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
                {/* Map is ALWAYS rendered to preserve state/tiles, just hidden via z-index if not active */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <Map
                        mode={mode}
                        pins={pins}
                        user={user}
                        onPinAdd={handlePinAdd}
                        onPinDelete={handlePinDelete}
                        onPinEdit={handlePinEdit}
                        onPinLock={handlePinLock}
                        onPinCancel={handlePinCancel}
                        onPinComplete={handlePinComplete}
                    />
                </div>
                {activeTab === 'profile' && (
                    <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 z-20 relative">
                        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            {/* Header Background - Warm Orange Gradient */}
                            <div className="bg-gradient-to-r from-orange-400 to-red-500 h-32 relative">
                                <button
                                    onClick={() => setActiveTab('map')}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
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
                                <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
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
                user={user}
            />
        </div>
    );
}
