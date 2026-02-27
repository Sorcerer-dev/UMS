import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        setIsLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 shadow-xl rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                    <div className="mx-auto h-12 w-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <Lock className="h-6 w-6 text-primary dark:text-primary-light" strokeWidth={1.5} />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        UMS Login Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                        Authorized Personnel Only
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                                placeholder="Institutional Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary transition-colors">
                                Forgot password or Contact Admin?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-primary-300' : 'bg-primary hover:bg-primary-dark'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in securely'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
