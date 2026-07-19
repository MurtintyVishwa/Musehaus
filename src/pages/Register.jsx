import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enrollInWorkshop, supabase } from '../lib/supabase';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

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
export default function Register() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetWorkshopId = searchParams.get('workshop');

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Validation Errors
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Input Handlers
  // Input Handlers
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s\-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms & conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please correct the errors in the form.", "error");
      return;
    }

    setIsSubmitting(true);
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    
    const result = await signUp(
      formData.email,
      formData.password,
      fullName,
      formData.phone,
      formData.interests
    );
    const { success } = result;

    if (success) {
      // FIX 6: If Supabase requires email confirmation, guide the user explicitly
      if (result?.requiresEmailConfirmation) {
        showToast("Account created! Please check your email to confirm your account before logging in.", "success");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showToast("Account created successfully! Welcome to MuseHaus. ✦", "success");
        
        // If they were redirected from a workshop card, automatically enroll them
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
      }
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      {/* LEFT PANEL (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 bg-ink text-cream p-12 lg:p-20 flex-col justify-between relative overflow-hidden select-none">
        {/* Subtle decorative vector lines and circles */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,240,232,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(245,240,232,0.01)_1px,_transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full border border-terra/10 pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full border border-gold/5 pointer-events-none animate-pulse" />

        {/* Top brand tag */}
        <div className="z-10 flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] font-semibold">
          <Sparkles size={14} />
          <span>MuseHaus Academy</span>
        </div>

        {/* Core Slogan */}
        <div className="z-10 max-w-md flex flex-col gap-6">
          <h2 className="font-serif text-4xl lg:text-6xl font-light leading-tight tracking-wide">
            Begin your creative <span className="italic text-terra">journey</span>
          </h2>
          <p className="text-sm lg:text-base text-muted font-light leading-relaxed">
            By creating an account, you join a dedicated circle of creators, gain access to our custom-curated workspaces, and unlock invitations to members-only gallery exhibitions.
          </p>
        </div>

        {/* Bottom Quote */}
        <div className="z-10 border-l-2 border-gold/30 pl-6">
          <blockquote className="font-serif text-sm lg:text-base text-gold italic leading-relaxed font-light">
            “Art enables us to find ourselves and lose ourselves at the same time.”
          </blockquote>
          <cite className="block text-[10px] uppercase tracking-wider text-muted font-semibold mt-2 not-italic font-sans">
            — Thomas Merton
          </cite>
        </div>
      </div>

      {/* RIGHT PANEL (Register Form) */}
      <div className="w-full md:w-1/2 bg-cream py-16 px-6 sm:px-12 lg:px-20 overflow-y-auto flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full flex flex-col gap-8">
          
          {/* Form Header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-medium tracking-wide text-ink">
              Create Account
            </h1>
            <p className="text-xs text-muted font-light">
              Enter your details below to establish your studio registration.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-ink font-sans">
            
            {/* First & Last Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                />
                {errors.firstName && <span className="text-[10px] text-terra font-medium">{errors.firstName}</span>}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                />
                {errors.lastName && <span className="text-[10px] text-terra font-medium">{errors.lastName}</span>}
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
              />
              {errors.email && <span className="text-[10px] text-terra font-medium">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
              />
              {errors.phone && <span className="text-[10px] text-terra font-medium">{errors.phone}</span>}
            </div>

            {/* Current Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Current Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your city / area of residence"
                className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                required
              />
              {errors.address && <span className="text-[10px] text-terra font-medium">{errors.address}</span>}
            </div>

            {/* Password & Confirm password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm pl-4 pr-10 py-3 text-sm focus:outline-none w-full transition-colors"
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

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm pl-4 pr-10 py-3 text-sm focus:outline-none w-full transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  >
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-[10px] text-terra font-medium">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 accent-terra cursor-pointer border-ink/10 rounded-sm focus:ring-0"
                />
                <span className="text-xs text-muted leading-relaxed font-light">
                  I accept the MuseHaus Terms of Service, liability waivers for workshop studio usage, and privacy guidelines.
                </span>
              </label>
              {errors.acceptTerms && <span className="text-[10px] text-terra font-medium mt-1">{errors.acceptTerms}</span>}
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-300 shadow-md border border-terra/20 mt-2 select-none"
            >
              {isSubmitting ? 'Registering Studio Profile...' : 'Create My Account'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2 select-none">
              <div className="w-full border-t border-ink/10" />
              <span className="absolute bg-cream px-3 text-[10px] uppercase tracking-widest text-muted font-bold font-sans">
                or continue with
              </span>
            </div>

            {/* Third party buttons */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-50 border border-ink/15 hover:border-ink/30 text-sm font-medium py-3 rounded-sm flex items-center justify-center gap-3 transition-colors select-none shadow-sm text-ink"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Link to login */}
            <p className="text-center text-xs text-muted mt-4 select-none">
              Already a member?{' '}
              <Link to="/login" className="text-terra font-bold hover:underline">
                Sign in
              </Link>
            </p>

          </form>

        </div>
      </div>

    </div>
  );
}
