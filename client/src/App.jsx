import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import Collaborate from './pages/Collaborate';
import AdminPanel from './pages/AdminPanel';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import './index.css';

const AppRoutes = () => (
  <div className="page-wrapper">
    <Navbar />
    <Routes>
      {/* 1. Welcome & 2. Three Ways to Engage */}
      <Route path="/" element={<Landing />} />
      
      {/* 3. Creator Studio Panel */}
      <Route path="/sell" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create" element={<CreateListing />} />

      {/* 4. Marketplace / Buyer Panel */}
      <Route path="/buy" element={<Marketplace />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/listings/:id" element={<ListingDetail />} />

      {/* 5. Collaborate / Partner Finding Panel */}
      <Route path="/collaborate" element={<Collaborate />} />

      {/* 6. Admin Control Center Panel */}
      <Route path="/admin" element={<AdminPanel />} />

      {/* Auth & Profile */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/profile/:id" element={<Profile />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Footer />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #334155',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.88rem'
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#0F172A' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#0F172A' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
