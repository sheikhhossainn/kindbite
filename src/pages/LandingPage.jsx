import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Landing/Navbar';
import Hero from '../components/Landing/Hero';
import HowItWorks from '../components/Landing/HowItWorks';
import Impact from '../components/Landing/Impact';
import Footer from '../components/Landing/Footer';

export default function LandingPage() {
    const { user, session } = useAuth();
    const navigate = useNavigate();

    // Removed auto-redirect to allow users to visit landing page
    // Users can click 'Open App' to go to /app explicitly

    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <HowItWorks />
            <Impact />
            <Footer />
        </div>
    );
}
