import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Workshops from './pages/Workshops';
import Register from './pages/Register';
import Login from './pages/Login';
import Contact from './pages/Contact';

// Context Providers
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-cream text-ink select-none font-sans">
            {/* Sticky Navigation Header */}
            <Navbar />
            
            {/* Main Page Content Area */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/workshops" element={<Workshops />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
