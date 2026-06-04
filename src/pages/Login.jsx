import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enrollInWorkshop } from '../lib/supabase';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetWorkshopId = searchParams.get('workshop');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Error states
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please enter valid credentials.", "error");
      return;
    }

    setIsSubmitting(true);
    const { success, error } = await signIn(email, password);

    if (success) {
      showToast("Welcome back to MuseHaus ✦", "success");
      
      // If they came from a workshop registration flow, automatically enroll them!
      if (targetWorkshopId) {
        try {
          const session = JSON.parse(localStorage.getItem('musehaus_session'));
          if (session?.id) {
            await enrollInWorkshop(session.id, parseInt(targetWorkshopId));
            showToast("Successfully enrolled in your selected workshop! ✦", "success");
          }
        } catch (err) {
          console.error("Auto enrollment failed", err);
        }
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      {/* LEFT PANEL (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 bg-ink text-cream p-12 lg:p-20 flex-col justify-between relative overflow-hidden select-none">
        {/* Subtle background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,240,232,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(245,240,232,0.01)_1px,_transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full border border-terra/10 pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full border border-gold/5 pointer-events-none animate-pulse" />

        {/* Brand Label */}
        <div className="z-10 flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] font-semibold">
          <Sparkles size={14} />
          <span>MuseHaus Atelier</span>
        </div>

        {/* Headline */}
        <div className="z-10 max-w-md flex flex-col gap-6">
          <h2 className="font-serif text-4xl lg:text-6xl font-light leading-tight tracking-wide">
            Welcome back to <span className="italic text-terra">MuseHaus</span>
          </h2>
          <p className="text-sm lg:text-base text-muted font-light leading-relaxed">
            Log in to manage your workshop schedules, view materials requirements, and access your studio enrollment certificates.
          </p>
        </div>

        {/* Quote */}
        <div className="z-10 border-l-2 border-gold/30 pl-6">
          <blockquote className="font-serif text-sm lg:text-base text-gold italic leading-relaxed font-light">
            “Every artist dips his brush in his own soul and paints his own nature into his pictures.”
          </blockquote>
          <cite className="block text-[10px] uppercase tracking-wider text-muted font-semibold mt-2 not-italic font-sans">
            — Henry Ward Beecher
          </cite>
        </div>
      </div>

      {/* RIGHT PANEL (Login Form) */}
      <div className="w-full md:w-1/2 bg-cream py-16 px-6 sm:px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-medium tracking-wide text-ink">
              Sign In
            </h1>
            <p className="text-xs text-muted font-light">
              Enter your credentials to access your member account.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-ink font-sans">
            
            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                required
              />
              {errors.email && <span className="text-[10px] text-terra font-medium">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm pl-4 pr-10 py-3 text-sm focus:outline-none w-full transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] text-terra font-medium">{errors.password}</span>}
            </div>

            {/* Remember me & Forgot password link */}
            <div className="flex items-center justify-between text-xs my-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-ink transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-terra cursor-pointer border-ink/10 rounded-sm focus:ring-0"
                />
                <span>Remember Me</span>
              </label>
              
              <button
                type="button"
                onClick={() => showToast("Password recovery email sent (simulated). ✦", "success")}
                className="text-terra hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-300 shadow-md border border-terra/20 mt-2 select-none"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In to MuseHaus'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2 select-none">
              <div className="w-full border-t border-ink/10" />
              <span className="absolute bg-cream px-3 text-[10px] uppercase tracking-widest text-muted font-bold font-sans">
                or continue with
              </span>
            </div>

            {/* Third party buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => showToast("Google authentication is disabled in mock mode.", "info")}
                className="bg-transparent hover:bg-ink/5 border border-ink/15 hover:border-ink/30 text-xs font-semibold py-3 rounded-sm flex items-center justify-center gap-2 transition-colors select-none"
              >
                <span className="font-bold">G</span>oogle
              </button>
              <button
                type="button"
                onClick={() => showToast("Apple authentication is disabled in mock mode.", "info")}
                className="bg-transparent hover:bg-ink/5 border border-ink/15 hover:border-ink/30 text-xs font-semibold py-3 rounded-sm flex items-center justify-center gap-2 transition-colors select-none"
              >
                <span className="font-bold">A</span>pple
              </button>
            </div>

            {/* Link to Register */}
            <p className="text-center text-xs text-muted mt-4 select-none">
              New to MuseHaus?{' '}
              <Link 
                to={targetWorkshopId ? `/register?workshop=${targetWorkshopId}` : "/register"} 
                className="text-terra font-bold hover:underline"
              >
                Create an account
              </Link>
            </p>

          </form>

        </div>
      </div>

    </div>
  );
}
