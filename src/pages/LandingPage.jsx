import Navbar from '../components/Landing/Navbar';
import Hero from '../components/Landing/Hero';
import Mission from '../components/Landing/Mission';
import HowItWorks from '../components/Landing/HowItWorks';
import Impact from '../components/Landing/Impact';
import Footer from '../components/Landing/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <Mission />
            <HowItWorks />
            <Impact />
            <Footer />
        </div>
    );
}
