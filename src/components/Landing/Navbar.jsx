import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';

// SVG Logo Component
function HandsLogo() {
    return (
        <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Bottom hand */}
            <path d="M20 65 Q25 70, 35 70 L65 70 Q75 70, 80 65 L75 60 Q70 65, 60 65 L40 65 Q30 65, 25 60 Z" fill="#FB923C" opacity="0.8" />

            {/* Top hand */}
            <path d="M20 35 Q25 30, 35 30 L65 30 Q75 30, 80 35 L75 40 Q70 35, 60 35 L40 35 Q30 35, 25 40 Z" fill="#FB923C" opacity="0.8" />

            {/* Food bowl */}
            <ellipse cx="50" cy="50" rx="15" ry="12" fill="#FDBA74" />
            <ellipse cx="50" cy="48" rx="12" ry="9" fill="#FED7AA" />

            {/* Food highlights */}
            <circle cx="47" cy="47" r="3" fill="#FB923C" />
            <circle cx="53" cy="48" r="2.5" fill="#FB923C" />
            <circle cx="50" cy="51" r="2" fill="#EA580C" />
        </svg>
    );
}

export default function Navbar() {
    const { isInstalled, canInstall, installApp } = usePWAInstall();
    const navigate = useNavigate();

    const handleAppAction = async () => {
        if (canInstall) {
            const installed = await installApp();
            if (installed) {
                setTimeout(() => navigate('/app'), 500);
            }
        } else {
            navigate('/app');
        }
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo with hands holding food */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <HandsLogo />
                        </div>
                        <div>
                            <div className="text-xl font-bold tracking-tight text-gray-900">KindBite</div>
                            <div className="text-[10px] text-orange-600 font-medium -mt-0.5">Share Food, Save Lives</div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => scrollToSection('mission')}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Mission
                        </button>
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            How It Works
                        </button>
                        <button
                            onClick={() => scrollToSection('impact')}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Impact
                        </button>
                    </div>

                    {/* App Button */}
                    <div>
                        <button
                            onClick={handleAppAction}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg"
                        >
                            {canInstall ? 'Launch App' : (isInstalled ? 'Open App' : 'Launch App')}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
