import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import Auth from './components/Auth/Auth';

import AdminDashboard from './pages/AdminDashboard'; // Import Dashboard
import AdminAuth from './components/Auth/AdminAuth'; // Admin Login

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<AdminAuth />} /> {/* Admin Login */}
          <Route path="/app" element={<AppPage />} />
          <Route path="/admin-portal-secure" element={<AdminDashboard />} /> {/* Secret Route */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
