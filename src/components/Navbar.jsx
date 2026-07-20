import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleToggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleAdminHomeClick = () => {
    if (isAdminRoute) {
      sessionStorage.removeItem('musehaus_admin_logged_in');
    }
    closeMenu();
  };

  const isActive = (path) => location.pathname === path;
  const isAdminRoute = location.pathname === '/admin';
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    () => sessionStorage.getItem('musehaus_admin_logged_in') === 'true'
  );

  useEffect(() => {
    setIsAdminLoggedIn(sessionStorage.getItem('musehaus_admin_logged_in') === 'true');
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Story', path: '/story' },
    { name: 'Workshops', path: '/workshops' },
    { name: 'Contact', path: '/contact' }
  ];

  const displayedLinks = isAdminRoute 
    ? navLinks.filter(link => link.name !== 'Home')
    : navLinks;

  return (
    <nav 
      className="sticky top-0 z-50 h-16 backdrop-blur-sm border-b border-ink/10 flex items-center justify-between px-6 md:px-12 transition-all"
      style={{ backgroundColor: 'rgba(245, 240, 232, 0.96)' }}
    >
      {/* Left: Logo */}
      <Link 
        to={isAdminRoute ? "/admin" : "/"} 
        onClick={handleAdminHomeClick}
        className="font-serif text-2xl tracking-wide font-semibold select-none flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
      >
        <span className="text-ink" style={{ color: '#1a1a18' }}>Muse</span>
        <span className="text-terra" style={{ color: '#c0623a' }}>Haus</span>
      </Link>

      {/* Center: Navigation Links (Desktop) */}
      <div className="hidden md:flex items-center gap-8">
        {displayedLinks.map((link) => (
          <Link
            key={link.name}
            to={link.name === 'Home' && isAdminRoute ? '/admin' : link.path}
            onClick={link.name === 'Home' ? handleAdminHomeClick : closeMenu}
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
        ) : isAdminLoggedIn ? (
          !isAdminRoute ? (
            <Link
              to="/admin"
              className="bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.15em] font-medium px-5 py-2.5 rounded-sm transition-all duration-300 shadow-md border border-terra/20"
            >
              Back to Dashboard
            </Link>
          ) : null
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
        {displayedLinks.map((link) => (
          <Link
            key={link.name}
            to={link.name === 'Home' && isAdminRoute ? '/admin' : link.path}
            onClick={link.name === 'Home' ? handleAdminHomeClick : closeMenu}
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
        ) : isAdminLoggedIn ? (
          !isAdminRoute ? (
            <Link
              to="/admin"
              onClick={closeMenu}
              className="w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.15em] font-medium text-center py-3 rounded-sm transition-colors shadow-md border border-terra/20"
            >
              Back to Dashboard
            </Link>
          ) : null
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
