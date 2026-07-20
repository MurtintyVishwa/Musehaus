import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getWorkshops, getAdminEnrollments, MOCK_MODE } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, BookOpen, Users, Calendar, Mail, Phone, Clock, LogOut, Lock } from 'lucide-react';

export default function Admin() {
  const { showToast } = useToast();
  
  // Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('musehaus_admin_logged_in') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const location = useLocation();

  // Sync state with sessionStorage on route navigation
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('musehaus_admin_logged_in') === 'true';
    setIsAdminLoggedIn(isLoggedIn);
  }, [location]);
  
  // Dashboard data
  const [workshops, setWorkshops] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workshops'); // 'workshops' or 'registrations'

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginEmail.trim() === 'musehaus14@gmail.com' && loginPassword === 'musehaus14') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('musehaus_admin_logged_in', 'true');
      showToast('Welcome to the Admin Panel, MuseHaus Manager! ✦', 'success');
    } else {
      showToast('Invalid admin credentials. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('musehaus_admin_logged_in');
    showToast('Signed out of Admin Panel.', 'info');
  };

  useEffect(() => {
    if (!isAdminLoggedIn) return;

    setLoading(true);
    Promise.all([
      getWorkshops(),
      getAdminEnrollments()
    ]).then(([{ data: wsData }, { data: enrollData }]) => {
      setWorkshops(wsData || []);
      setEnrollments(enrollData || []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load admin dashboard details:", err);
      showToast("Error loading panel data.", "error");
      setLoading(false);
    });
  }, [isAdminLoggedIn]);

  // Clean date formatting
  const formatDate = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen pt-16 bg-cream text-ink flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold block mb-2">Internal Panel</span>
            <h1 className="font-serif text-4xl font-light tracking-wide text-ink">
              Studio <span className="italic text-terra">Management</span>
            </h1>
            <p className="text-xs text-muted font-light mt-3">
              Only authorized administrators are allowed to access this portal.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-ink/10 rounded-xl shadow-lg p-8">
            <form onSubmit={handleLoginSubmit} autoComplete="off" className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Admin Email</label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@musehaus.com"
                  autoComplete="off"
                  className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Password</label>
                <input
                  type="text"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  style={{ WebkitTextSecurity: 'disc', mozTextSecurity: 'disc' }}
                  className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors w-full"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-300 shadow-md mt-2 flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                Access Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-cream text-ink pb-24">
      {/* Header */}
      <header className="bg-ink text-cream py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold">Management Console</span>
            <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide">
              MuseHaus <span className="italic text-terra">Dashboard</span>
            </h1>
            {MOCK_MODE && (
              <span className="text-[10px] bg-gold/15 text-gold border border-gold/30 rounded px-2.5 py-0.5 w-max uppercase tracking-wider font-semibold">
                Demo Sandbox Mode
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-cream/10 hover:bg-cream/20 text-cream text-xs uppercase tracking-widest font-bold px-4 py-2.5 rounded-sm transition-colors border border-cream/10"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-ink/10 mb-8 gap-4">
          <button
            onClick={() => setActiveTab('workshops')}
            className={`pb-4 px-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all relative ${
              activeTab === 'workshops' ? 'text-terra' : 'text-muted hover:text-ink'
            }`}
          >
            <BookOpen size={14} />
            Ongoing Workshops ({workshops.length})
            {activeTab === 'workshops' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-terra" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('registrations')}
            className={`pb-4 px-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all relative ${
              activeTab === 'registrations' ? 'text-terra' : 'text-muted hover:text-ink'
            }`}
          >
            <Users size={14} />
            Registered Users ({enrollments.length})
            {activeTab === 'registrations' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-terra" />
            )}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-muted text-sm font-light">Retrieving database information...</p>
          </div>
        ) : activeTab === 'workshops' ? (
          /* Tab 1: Workshops Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((w) => (
              <div key={w.id} className="bg-white border border-ink/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-terra uppercase font-bold tracking-widest block">{w.medium} &middot; {w.level}</span>
                  <h3 className="font-serif text-xl font-medium text-ink leading-snug">{w.title}</h3>
                  <p className="text-xs text-muted font-light mt-1">Instructor: <span className="font-semibold text-ink">{w.instructor_name}</span></p>
                </div>

                <div className="border-t border-ink/5 pt-4 flex flex-col gap-2.5 text-xs text-muted font-light">
                  <div className="flex items-center gap-2 text-ink/75">
                    <Calendar size={13} className="text-terra" />
                    <span>{w.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} />
                    <span>{w.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 border-t border-ink/5 pt-3">
                    <span className="text-ink font-semibold">₹{w.price}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      w.status === 'sold-out' 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : w.status === 'almost-full' 
                        ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {w.seats_remaining} / {w.seats_total} Seats Left
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tab 2: Registrations Table */
          <div className="bg-white border border-ink/10 rounded-xl shadow-md overflow-hidden">
            
            {/* Auto Delete Warning Banner */}
            <div className="bg-amber-50 border-b border-amber-200/60 p-4 flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed font-light">
                <strong>Data Retention Notice:</strong> To ensure privacy compliance, enrollment registrations are only kept in the database and visible for <strong>60 days</strong>. Entries older than 60 days are automatically deleted.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink/5 text-ink text-[10px] uppercase tracking-wider font-bold border-b border-ink/10">
                    <th className="py-4 px-6 w-16">S.No</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Phone Number</th>
                    <th className="py-4 px-6 text-center">Registered Package</th>
                    <th className="py-4 px-6">Date of Registration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 text-sm text-ink/80 font-light">
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-muted italic">
                        No registrations found within the last 60 days.
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((e, index) => (
                      <tr key={e.id} className="hover:bg-cream/15 transition-colors">
                        <td className="py-4 px-6 font-semibold text-xs text-muted w-16">{index + 1}</td>
                        <td className="py-4 px-6 font-medium text-ink">
                          {e.customer_name || `Artisan (${e.user_id ? e.user_id.slice(0, 8) : 'Legacy'})`}
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-1.5">
                            <Mail size={12} className="text-muted" />
                            {e.customer_email || 'check-auth@musehaus.com'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs">
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} className="text-muted" />
                            {e.customer_phone || 'No Contact'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-xs font-semibold text-terra">
                          {e.registered_packages || '—'}
                        </td>
                        <td className="py-4 px-6 text-xs text-muted font-sans">{formatDate(e.enrolled_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
