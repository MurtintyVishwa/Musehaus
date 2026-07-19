import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user to this page with a token in the URL fragment (#access_token=...)
  // onAuthStateChange picks this up automatically and establishes a session
  useEffect(() => {
    if (!supabase) {
      setError('Password reset is not available in demo mode.');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The user arrived via the reset link — session is ready for updateUser
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'Failed to update password. Please try again.');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-cream text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold block mb-3">Account Security</span>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink">
            Reset Your <span className="italic text-terra">Password</span>
          </h1>
          <p className="text-xs text-muted font-light mt-3">
            Choose a new secure password for your MuseHaus account.
          </p>
        </div>

        <div className="bg-white border border-ink/10 rounded-xl shadow-lg p-8">

          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-terra/10 flex items-center justify-center">
                <ShieldCheck size={28} className="text-terra" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-ink">Password Updated!</h2>
              <p className="text-sm text-muted font-light leading-relaxed">
                Your password has been updated successfully. Redirecting you to the login page…
              </p>
              <div className="w-full bg-ink/5 rounded-full h-1 mt-2 overflow-hidden">
                <div className="h-full bg-terra animate-[shrink_2.5s_linear_forwards]" style={{ width: '100%' }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">New Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
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
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm pl-4 pr-10 py-3 text-sm focus:outline-none w-full transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  >
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-xs text-terra font-medium bg-terra/5 border border-terra/20 rounded-sm px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-terra hover:bg-terra/90 disabled:opacity-60 text-cream text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-300 shadow-md mt-2 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={15} />
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>

            </form>
          )}
        </div>

        <p className="text-center text-[10px] text-muted mt-6 font-light">
          Remembered your password?{' '}
          <a href="/login" className="text-terra hover:underline font-medium">Sign in</a>
        </p>

      </div>
    </div>
  );
}
