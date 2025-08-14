'use client';

import { useState, FormEvent, FC, memo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { signInUser, signUpUser } from '@/utils/authService';
import { Toaster, toast } from 'react-hot-toast';
import Image from 'next/image';
import "@/components/dashboard/dashboard.css";
import apiHelper from '@/utils/apiHelper';

const BlobBackground: FC = memo(() => (
    <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
    </div>
));
BlobBackground.displayName = 'BlobBackground';

const CustomSelect: FC<{ name: string; value: string; onChange: (e: { target: { name: string; value: string } }) => void; options: { value: string; label: string }[]; placeholder: string; disabled?: boolean; }> = ({ name, value, onChange, options, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="relative w-1/2" ref={selectRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} disabled={disabled} className="w-full px-4 py-3 text-left bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white transition-all flex justify-between items-center cursor-pointer">
                <span className={selectedOption ? 'text-white' : 'text-gray-300'}>{selectedOption ? selectedOption.label : placeholder}</span>
                <svg className={`w-5 h-5 text-gray-300 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 w-full mt-1 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                        {options.map(option => <li key={option.value} onClick={() => handleSelect(option.value)} className="px-4 py-2 text-white hover:bg-white/10 cursor-pointer">{option.label}</li>)}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "India", "Japan", "Brazil", "South Africa", "Nigeria", "Mexico", "Argentina", "China", "Russia", "South Korea", "Spain", "Italy", "Netherlands", "Sweden"];
const formVariants: Variants = { hidden: { x: '100%', opacity: 0 }, visible: { x: 0, opacity: 1 }, exit: { x: '-100%', opacity: 0 } };

const AuthForm: FC<{ authType: 'login' | 'signup'; setAuthType: (type: 'login' | 'signup') => void }> = ({ authType, setAuthType }) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', gender: '', country: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const isLogin = authType === 'login';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignupDataStorage = async (user: User) => {
        try {
            const idToken = await user.getIdToken();
            await apiHelper('/api/userData', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
                body: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    gender: formData.gender,
                    country: formData.country,
                },
            });
            toast.success('User data saved successfully!');
        } catch (error) {
            console.error('Error saving user data:', error);
            toast.error(`Error saving user data: ${(error as Error).message}`);
            throw error; // Re-throw to propagate error to handleSubmit catch block
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const { email, password, firstName, lastName, gender, country } = formData;

        if (!email || !password || (!isLogin && (!firstName || !lastName || !gender || !country))) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = isLogin
                ? await signInUser(email, password) // Login user for sign-in
                : await signUpUser(email, password); // Sign up user for registration

            if (!isLogin && userCredential?.user) {
                // For signup, ensure additional data is stored AFTER initial Firebase registration
                // This will throw an error if data storage fails, preventing redirection
                await handleSignupDataStorage(userCredential.user);
            }

            // Show success toast only after all backend operations are successful
            toast.success(isLogin ? 'Login Successful!' : 'Registration Successful.');

            // Redirect after a short delay to allow toast to be visible
            setTimeout(() => {
                router.push('/'); // Redirect for both successful login AND successful signup with data storage
            }, 2000);

        } catch (error) {
            // Catch any errors from authentication or data storage
            toast.error((error as Error).message);
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" exit="exit" variants={formVariants} transition={{ duration: 0.4, ease: 'easeInOut' }} className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white tracking-wider">{isLogin ? "Login" : "Create Account"}</h1>
                <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-fuchsia-500 mx-auto mt-3 rounded-full"></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                    <>
                        <div className="flex space-x-4">
                            <input name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleChange} required disabled={isLoading} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300 transition-all" />
                            <input name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required disabled={isLoading} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300 transition-all" />
                        </div>
                        <div className="flex space-x-4">
                            <CustomSelect name="gender" value={formData.gender} onChange={handleChange} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} placeholder="Gender" disabled={isLoading} />
                            <CustomSelect name="country" value={formData.country} onChange={handleChange} options={countries.map(c => ({ value: c, label: c }))} placeholder="Country" disabled={isLoading} />
                        </div>
                    </>
                )}
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={isLoading} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300 transition-all" />
                <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required disabled={isLoading} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300 transition-all" />
                <button type="submit" disabled={isLoading} className="w-full py-3 font-bold text-gray-900 bg-white rounded-xl hover:bg-gray-200 focus:outline-none ring-offset-gray-900 ring-white transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer">
                    {isLoading && <Image src="/loader.svg" alt="Loading..." width={24} height={24} className="animate-spin mr-2" />}
                    {isLogin ? (isLoading ? 'Logging In...' : 'Login') : (isLoading ? 'Signing Up...' : 'Sign Up')}
                </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-300">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button onClick={() => setAuthType(isLogin ? 'signup' : 'login')} className="font-medium text-blue-400 hover:text-blue-300 focus:outline-none focus:underline cursor-pointer">
                    {isLogin ? 'Sign up' : 'Login'}
                </button>
            </p>
        </motion.div>
    );
};

export default function AuthPage() {
    const [authType, setAuthType] = useState<'login' | 'signup'>('login');
    const router = useRouter();
    const [isAuthCheckComplete, setAuthCheckComplete] = useState(false);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace('/');
            } else {
                setAuthCheckComplete(true);
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (!isAuthCheckComplete) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <Image src="/loader.svg" alt="Loading..." width={60} height={60} className="animate-spin" />
            </div>
        );
    }

    return (
        <main className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
            <Toaster position="bottom-center" toastOptions={{
                duration: 2000,
                style: { background: 'rgba(51, 51, 51, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' },
                success: { style: { background: 'rgba(44, 153, 122, 0.8)' } },
                error: { style: { background: 'rgba(239, 68, 68, 0.8)' } },
            }} />
            <BlobBackground />
            <motion.div layout transition={{ duration: 0.5, ease: 'easeInOut' }} className="relative w-full max-w-md glass !bg-[#79797937] !rounded-[30px] shadow-2xl overflow-hidden !p-8">
                <AnimatePresence mode="wait" initial={false}>
                    <AuthForm key={authType} authType={authType} setAuthType={setAuthType} />
                </AnimatePresence>
            </motion.div>
        </main>
    );
}
