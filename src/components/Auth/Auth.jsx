import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isMagicLink, setIsMagicLink] = useState(false); // New state for Magic Link
    const { signIn, signUp, signInWithMagicLink, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // specific redirect or default to app
    const from = location.state?.from?.pathname || '/app';

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
            if (isMagicLink) {
                const { error } = await signInWithMagicLink(email);
                if (error) throw error;
                alert('✨ Magic Link sent! Check your email to log in.');
            } else if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate(from, { replace: true });
            } else {
                const { error } = await signUp(email, password, { full_name: fullName });
                if (error) throw error;
                alert('Check your email to confirm your account!');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (error) {
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-orange-100">
                <h2 className="mb-2 text-center text-3xl font-bold text-gray-900">
                    {isMagicLink ? 'Passwordless Login' : (isLogin ? 'Welcome Back' : 'Join KindBite')}
                </h2>
                <p className="mb-6 text-center text-gray-500 text-sm">
                    {isMagicLink ? 'We’ll email you a magic link to sign in instantly.' : (isLogin ? 'Sign in to continue your journey' : 'Start helping your community today')}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && !isMagicLink && (
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                                placeholder="Mr. Rahim"
                                required={!isLogin && !isMagicLink}
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

                    {!isMagicLink && (
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                                placeholder="••••••••"
                                required={!isMagicLink}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-5 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                    >
                        {loading ? 'Processing...' : (isMagicLink ? '✨ Send Link to Email' : (isLogin ? 'Sign In' : 'Sign Up'))}
                    </button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </button>
                </form>

                {/* Magic Link Toggle */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsMagicLink(!isMagicLink)}
                        type="button"
                        className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors"
                    >
                        {isMagicLink ? '← Back to Password Login' : 'Or sign in with without password'}
                    </button>
                </div>

                <div className="mt-6 text-center border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setIsMagicLink(false); }}
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
