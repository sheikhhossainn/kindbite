import { useState } from 'react';
import Map from '../components/App/Map';
import BottomNav from '../components/App/BottomNav';

export default function AppPage() {
    const [activeTab, setActiveTab] = useState('map');
    const [mode, setMode] = useState('donor'); // 'donor' or 'spotter'
    const [pins, setPins] = useState([]); // Start with Empty Map

    const handlePinAdd = (newPin) => {
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
            {/* Mode Switcher (Floating Top Right) */}
            <div className="absolute top-4 right-4 z-[500]">
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
            </div>

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
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">👤</div>
                            <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                            <p className="text-gray-500 font-normal mt-2">Karma Points: 120</p>
                            <p className="text-gray-400 text-sm mt-4">Trust Score: 100</p>
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
