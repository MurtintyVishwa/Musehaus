import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleToggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Workshops', path: '/workshops' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="sticky top-0 z-40 h-16 bg-cream/96 backdrop-blur-sm border-b border-ink/10 flex items-center justify-between px-6 md:px-12 transition-all">
      {/* Left: Logo */}
      <Link 
        to="/" 
        onClick={closeMenu}
        className="font-serif text-2xl tracking-wide font-semibold text-ink select-none flex items-center gap-1"
      >
        <span>Muse</span>
        <span className="text-terra">Haus</span>
      </Link>

      {/* Center: Navigation Links (Desktop) */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-300 relative py-1 hover:text-terra ${
              isActive(link.path) ? 'text-terra' : 'text-muted'
            }`}
          >
            {link.name}
            {isActive(link.path) && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-terra" />
            )}
          </Link>
        ))}
      </div>

      {/* Right: Auth Actions (Desktop) */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* User Avatar Circle */}
              <div 
                className="w-8 h-8 rounded-full bg-warm border border-gold/40 flex items-center justify-center text-xs font-semibold text-ink"
                title={user.full_name}
              >
                {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={14} />}
              </div>
              <span className="text-xs tracking-wider text-muted font-medium max-w-[120px] truncate">
                {user.full_name || user.email}
              </span>
            </div>
            
            <button
              onClick={signOut}
              className="text-xs uppercase tracking-widest text-muted hover:text-terra flex items-center gap-1 transition-colors py-2"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-xs uppercase tracking-[0.15em] text-ink hover:text-terra font-medium transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.15em] font-medium px-5 py-2.5 rounded-sm transition-all duration-300 shadow-md hover:shadow-lg shadow-terra/10 border border-terra/20"
            >
              Join Us
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger Trigger */}
      <button
        onClick={handleToggle}
        className="md:hidden text-ink hover:text-terra transition-colors focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Sliding Menu Drawer */}
      <div
        className={`absolute top-16 left-0 w-full bg-cream border-b border-ink/10 flex flex-col items-center gap-6 py-8 px-6 shadow-xl transition-all duration-300 md:hidden z-30 ${
          isOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-4 invisible pointer-events-none'
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={closeMenu}
            className={`text-xs uppercase tracking-[0.25em] font-medium w-full text-center py-2 transition-colors ${
              isActive(link.path) ? 'text-terra font-semibold' : 'text-muted'
            }`}
          >
            {link.name}
          </Link>
        ))}
        
        <hr className="w-full border-ink/5 my-1" />

        {user ? (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-warm border border-gold/40 flex items-center justify-center text-xs font-semibold text-ink">
                {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={14} />}
              </div>
              <span className="text-xs tracking-wider font-medium text-ink">
                {user.full_name || user.email}
              </span>
            </div>
            
            <button
              onClick={() => {
                signOut();
                closeMenu();
              }}
              className="text-xs uppercase tracking-[0.15em] text-terra font-semibold flex items-center gap-1.5 py-2"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <Link
              to="/login"
              onClick={closeMenu}
              className="text-xs uppercase tracking-[0.15em] text-ink hover:text-terra font-medium text-center border border-ink/20 py-3 rounded-sm transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={closeMenu}
              className="bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.15em] font-medium text-center py-3 rounded-sm transition-colors shadow-md"
            >
              Join Us
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
