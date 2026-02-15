import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, BellIcon, CameraIcon } from '@heroicons/react/24/outline';

export default function Hero() {
    const { canInstall, installApp } = usePWAInstall();
    const navigate = useNavigate();

    const handleVolunteer = async () => {
        if (canInstall) {
            const installed = await installApp();
            if (installed) {
                setTimeout(() => navigate('/app'), 500);
            }
        } else {
            navigate('/app');
        }
    };

    return (
        <>
            {/* Hero with Photo Background */}
            <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Image - Food Rescue Theme */}
                <div className="absolute inset-0 bg-gray-800">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: 'url(https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&q=80)',
                            opacity: 0.65
                        }}
                    ></div>
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/40"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        Share a Meal.<br />
                        Share Kindness.
                    </h1>

                    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-100">
                        Connect with neighbors to reduce waste and end local hunger. Simple, secure, and immediate.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={handleVolunteer}
                            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-lg"
                        >
                            Volunteer to Spot
                        </button>
                        <button
                            onClick={handleVolunteer}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-3 rounded-full border border-white/30 transition-all duration-200"
                        >
                            Donate Food
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section with Professional Icons */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 text-primary-500 flex items-center justify-center">
                                <MapPinIcon className="w-16 h-16" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 text-lg">Spot & Pin</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-normal">
                                See someone hungry? Drop a pin on the map instantly and set urgency level.
                            </p>
                        </div>

                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 text-primary-500 flex items-center justify-center">
                                <BellIcon className="w-16 h-16" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 text-lg">Instant Alerts</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-normal">
                                Nearby donors get push notifications and can respond in seconds.
                            </p>
                        </div>

                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 text-primary-500 flex items-center justify-center">
                                <CameraIcon className="w-16 h-16" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 text-lg">Privacy-First Proof</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-normal">
                                AI verifies food delivery while protecting everyone's privacy—no faces captured.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
