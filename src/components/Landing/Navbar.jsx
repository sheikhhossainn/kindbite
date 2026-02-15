import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';

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
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Logo className="w-10 h-10" />
                        <div>
                            <div className="text-xl font-bold tracking-tight text-gray-900 leading-none">KindBite</div>
                            <div className="text-[10px] font-medium text-primary-600 mt-1 tracking-wide uppercase">Share Food, Save Lives</div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => scrollToSection('mission')}
                            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            Mission
                        </button>
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            How It Works
                        </button>
                        <button
                            onClick={() => scrollToSection('impact')}
                            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            Impact
                        </button>
                    </div>

                    {/* App Button */}
                    <div>
                        <button
                            onClick={handleAppAction}
                            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                        >
                            {canInstall ? 'Launch App' : (isInstalled ? 'Open App' : 'Launch App')}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
