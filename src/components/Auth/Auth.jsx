import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    // List of known disposable email domains - this can be expanded
    const DISPOSABLE_DOMAINS = [
        'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'sharklasers.com',
        'yopmail.com', 'mailinator.com', 'throwawaymail.com'
    ];

    const isDisposableEmail = (email) => {
        const domain = email.split('@')[1];
        return DISPOSABLE_DOMAINS.includes(domain);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (isDisposableEmail(email)) {
            alert("Please use a permanent email address (Gmail, Outlook, etc). Temp mails are not allowed.");
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate('/app');
            } else {
                const { error } = await signUp(email, password, { full_name: fullName });
                if (error) throw error;
                alert('Check your email for the login link!');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-orange-100">
                <h2 className="mb-2 text-center text-3xl font-bold text-gray-900">
                    {isLogin ? 'Welcome Back' : 'Join KindBite'}
                </h2>
                <p className="mb-6 text-center text-gray-500 text-sm">
                    {isLogin ? 'Sign in to continue your journey' : 'Start helping your community today'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                                placeholder="Mr. Rahim"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-5 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-1 font-bold text-orange-600 hover:text-orange-700 hover:underline focus:outline-none transition-colors"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
