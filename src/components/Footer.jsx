import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const InstagramIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream font-sans mt-auto">
      {/* Top 4-Column Grid Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-cream/10">
        
        {/* Column 1: Brand & Intro */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="font-serif text-2xl tracking-wide font-semibold text-cream">
            <span>Muse</span>
            <span className="text-terra">Haus</span>
          </Link>
          <p className="text-sm text-muted leading-relaxed max-w-xs font-light">
            A sanctuary for the modern maker. We offer curated fine art workshops, masterclass courses, and a refined space to explore craft, color, and medium.
          </p>
        </div>

        {/* Column 2: About */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold font-sans">
            The Studio
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-muted">
            <li>
              <a href="#story" className="hover:text-terra transition-colors duration-200 font-light">Our Story</a>
            </li>
            <li>
              <a href="#instructors" className="hover:text-terra transition-colors duration-200 font-light">Instructors</a>
            </li>
            <li>
              <a href="#space" className="hover:text-terra transition-colors duration-200 font-light">The Space</a>
            </li>
            <li>
              <a href="#exhibitions" className="hover:text-terra transition-colors duration-200 font-light">Exhibitions</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold font-sans">
            Reserve
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-muted">
            <li>
              <Link to="/workshops" className="hover:text-terra transition-colors duration-200 font-light">Workshops</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-terra transition-colors duration-200 font-light">Join MuseHaus</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-terra transition-colors duration-200 font-light">Contact</Link>
            </li>
            <li>
              <a href="#giftcards" className="hover:text-terra transition-colors duration-200 font-light">Gift Cards</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Studio Contact Details */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold font-sans">
            Location & Hours
          </h4>
          <address className="not-italic text-sm text-muted flex flex-col gap-2 font-light">
            <p>Visakhapatnam</p>
            <p className="mt-2 text-cream font-medium">Tue – Sun: 9 AM – 7:30 PM</p>
            <p className="mt-1 hover:text-terra transition-colors duration-200">
              <a href="mailto:musehaus997866@gmail.com">musehaus997866@gmail.com</a>
            </p>
            <p><a href="tel:+918309978539" className="hover:text-terra transition-colors duration-200">+91 83099 78539</a></p>
          </address>
        </div>

      </div>

      {/* Bottom Bar Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <p className="font-light">
          &copy; {currentYear} MuseHaus. All rights reserved.
        </p>
        
        {/* Social & Badges */}
        <div className="flex items-center gap-6">
          <a href="https://www.instagram.com/muse__haus?igsh=MWVxOWwyMWFpZmprNA==" target="_blank" rel="noopener noreferrer" className="hover:text-terra transition-colors duration-200" aria-label="Instagram">
            <InstagramIcon size={16} />
          </a>
          <span className="h-4 w-px bg-cream/10" />
          <div className="flex items-center gap-1 select-none text-[10px] uppercase tracking-wider font-semibold text-gold">
            <ShieldCheck size={12} className="text-gold" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
