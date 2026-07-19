import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enrollInWorkshop, supabase } from '../lib/supabase';
import { Eye, EyeOff, Sparkles, X } from 'lucide-react';

// Google colored G SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

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

  // --- FIX 4: Forgot password state ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

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
      
      // If they came from a workshop registration flow, automatically enroll them
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

  // --- FIX 4: Forgot password handler ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setForgotLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
          redirectTo: 'https://musehaus.vercel.app/reset-password'
        });
        if (error) {
          showToast("Email not found. Please check and try again.", "error");
        } else {
          setForgotSent(true);
        }
      } else {
        // Mock mode fallback
        setForgotSent(true);
      }
    } catch (err) {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      showToast("Google sign-in is disabled in mock mode.", "info");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://musehaus.vercel.app'
      }
    });
    if (error) {
      showToast('Google sign-in failed. Please try again.', 'error');
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
            "Every artist dips his brush in his own soul and paints his own nature into his pictures."
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
              
              {/* FIX 4: Open forgot password modal instead of simulated toast */}
              <button
                type="button"
                onClick={() => { setShowForgotModal(true); setForgotSent(false); setForgotEmail(''); }}
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
                or
              </span>
            </div>

            {/* FIX 3: Single Google button, no Apple button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-50 border border-ink/15 hover:border-ink/30 text-sm font-medium py-3 rounded-sm flex items-center justify-center gap-3 transition-colors select-none shadow-sm text-ink"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Link to Register */}
            <p className="text-center text-xs text-muted mt-2 select-none">
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

      {/* FIX 4: Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-cream w-full max-w-md rounded-xl shadow-2xl p-8 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>

            {forgotSent ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="text-4xl">📬</div>
                <h2 className="font-serif text-2xl font-medium text-ink">Check your inbox</h2>
                <p className="text-sm text-muted font-light leading-relaxed">
                  Password reset email sent! Please check your inbox and follow the link to reset your password.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold py-3 rounded-sm transition-all duration-300"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-2xl font-medium text-ink mb-1">Reset Password</h2>
                <p className="text-xs text-muted font-light mb-6">
                  Enter your account email and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-terra hover:bg-terra/90 disabled:opacity-60 text-cream text-xs uppercase tracking-widest font-bold py-3 rounded-sm transition-all duration-300 shadow-md"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
