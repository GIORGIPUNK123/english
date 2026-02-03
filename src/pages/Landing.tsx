import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import 'ldrs/react/Helix.css';
import { Footer } from '../components/landing/Footoer';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { PricingSection } from '../components/landing/PricingSection';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutSection } from '../components/landing/AboutSection';

export const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<null | User | 'loading'>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe; // clean up listener on unmount
  }, []);

  // Navigate if user is logged in
  useEffect(() => {
    if (user && user !== 'loading') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Show loading spinner while loading user
  if (user === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center w-full min-h-screen bg-background'>
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 border-4 rounded-full border-muted'></div>
          <div className='absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin'></div>
        </div>
        <p className='mt-4 text-muted-foreground'>Loading...</p>
      </div>
    );
  }
  return (
    <div className='flex flex-col min-h-screen bg-background'>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};
