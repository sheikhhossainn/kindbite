import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import Auth from './components/Auth/Auth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
