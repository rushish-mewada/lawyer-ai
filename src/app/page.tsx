'use client';

import { useEffect, useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Image from 'next/image';

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <Image src="/loader.svg" alt="Loading..." width={60} height={60} className="animate-spin" />
  </div>
);

export default function Home() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('loading');

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/chat');
    }
    if (authStatus === 'unauthenticated') {
      router.replace('/login');
    }
  }, [authStatus, router]);

  return <LoadingScreen />;
}