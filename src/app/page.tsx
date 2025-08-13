'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Dashboard from "@/components/dashboard/dashboard";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/login');
    }
  }, [authStatus, router]);

  if (authStatus === 'authenticated') {
    return (
      <main>
        <Dashboard />
      </main>
    );
  }

  return <LoadingSpinner />;
}
