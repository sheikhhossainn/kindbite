import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';

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
                            backgroundImage: 'url(https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80)',
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
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-8 py-3 rounded-full transition-all duration-200 shadow-lg"
                        >
                            Volunteer to Spot
                        </button>
                        <button
                            onClick={handleVolunteer}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium px-8 py-3 rounded-full border border-white/30 transition-all duration-200"
                        >
                            Donate Food
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section - 3 icons */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 text-orange-500">
                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Spot & Pin</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                See someone hungry? Drop a pin on the map instantly and set urgency level.
                            </p>
                        </div>

                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 text-orange-500">
                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Instant Alerts</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Nearby donors get push notifications and can respond in seconds.
                            </p>
                        </div>

                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 text-orange-500">
                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Privacy-First Proof</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                AI verifies food delivery while protecting everyone's privacy—no faces captured.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
