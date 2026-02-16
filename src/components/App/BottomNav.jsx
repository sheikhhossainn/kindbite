import { MapIcon, TrophyIcon, UserIcon, PlusIcon, CameraIcon } from '@heroicons/react/24/outline';
import { MapIcon as MapIconSolid, TrophyIcon as TrophyIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';

export default function BottomNav({ activeTab, setActiveTab, mode, onFabClick, user }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] z-[1000] pb-safe">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto relative">

                {/* Home (Exit) */}
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex flex-col items-center justify-center w-16 text-gray-400 hover:text-black transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>

                    <span className="text-[10px] font-medium mt-1">Home</span>
                </button>

                {/* Map Tab */}
                <button
                    onClick={() => setActiveTab('map')}
                    className={`flex flex-col items-center justify-center w-16 transition-colors ${activeTab === 'map' ? 'text-black' : 'text-gray-400'}`}
                >
                    {activeTab === 'map' ? <MapIconSolid className="w-6 h-6" /> : <MapIcon className="w-6 h-6" />}
                    <span className="text-[10px] font-medium mt-1">Map</span>
                </button>

                {/* Central Action FAB */}
                <div className="relative -top-6">
                    <button
                        onClick={onFabClick}
                        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 transition-transform border-4 border-gray-50 ${mode === 'spotter' ? 'bg-orange-500' : 'bg-gray-800'}`}
                    >
                        {mode === 'spotter' ? <PlusIcon className="w-7 h-7" /> : <CameraIcon className="w-7 h-7 opacity-50" />}
                    </button>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 whitespace-nowrap">
                        {mode === 'spotter' ? 'Add Spot' : 'Verify'}
                    </span>
                </div>

                {/* Profile Tab */}
                <button
                    onClick={() => user ? setActiveTab('profile') : window.location.href = '/auth'}
                    className={`flex flex-col items-center justify-center w-16 transition-colors ${activeTab === 'profile' ? 'text-black' : 'text-gray-400'}`}
                >
                    {activeTab === 'profile' ? <UserIconSolid className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                    <span className="text-[10px] font-medium mt-1">Profile</span>
                </button>

            </div>
        </div>
    );
}
