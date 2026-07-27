import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  checkIsAdmin, 
  getAdminOverview, 
  getAdminEnrollments, 
  getAdminParticipants, 
  getAdminWorkshops,
  updateWorkshopDetails,
  createNewWorkshopEvent,
  deleteParticipant
} from '../lib/supabase';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Download, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Calendar, 
  IndianRupee, 
  ArrowLeft,
  Eye,
  Sparkles,
  Trash2,
  Rocket,
  Pencil
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'participants' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [workshop, setWorkshop] = useState(null);
  const [workshopHistory, setWorkshopHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters & Search
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'verified' | 'pending'
  const [participantSearch, setParticipantSearch] = useState('');

  // Selected Booking Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    price: 499,
    comboPrice: 799,
    seats_total: 20,
    seats_remaining: 20,
    status: 'open'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [creatingNewWorkshop, setCreatingNewWorkshop] = useState(false);
  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false);

  const [participantToDelete, setParticipantToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Verify Admin Status
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCheckingAdmin(false);
      setIsAdmin(false);
      return;
    }

    setCheckingAdmin(true);
    checkIsAdmin(user.id, user.email).then((adminStatus) => {
      setIsAdmin(adminStatus);
      setCheckingAdmin(false);
    }).catch(() => {
      setIsAdmin(false);
      setCheckingAdmin(false);
    });
  }, [user, authLoading]);

  // Load Tab Data
  useEffect(() => {
    if (!isAdmin) return;

    setLoadingData(true);
    if (activeTab === 'overview') {
      getAdminOverview().then(({ data }) => {
        setOverviewData(data);
        setLoadingData(false);
      });
    } else if (activeTab === 'bookings') {
      getAdminEnrollments().then(({ data }) => {
        setEnrollments(data || []);
        setLoadingData(false);
      });
    } else if (activeTab === 'participants') {
      getAdminParticipants().then(({ data }) => {
        setParticipants(data || []);
        setLoadingData(false);
      });
    } else if (activeTab === 'settings') {
      getAdminWorkshops().then(({ active, history }) => {
        setWorkshop(active || null);
        setWorkshopHistory(history || []);
        if (active) {
          setSettingsForm({
            title: active.title || '',
            description: active.description || '',
            date: active.date || '',
            time: active.time || '',
            price: active.price || 499,
            comboPrice: active.combo_price ?? 799,
            seats_total: active.seats_total ?? 20,
            seats_remaining: active.seats_remaining ?? 20,
            status: active.status || 'open'
          });
        }
        setLoadingData(false);
      });
    }
  }, [isAdmin, activeTab]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (enrollments.length === 0) {
      showToast('No booking records to export.', 'info');
      return;
    }

    const headers = ['Booking ID / Ref', 'Customer Name', 'Email', 'Phone', 'Booking Type', 'Amount (INR)', 'Payment Status', 'Date & Time'];
    const rows = enrollments.map(e => [
      `"${e.booking_ref || e.id}"`,
      `"${e.user_name || ''}"`,
      `"${e.email || ''}"`,
      `"${e.phone || ''}"`,
      `"${e.is_combo ? 'Combo (2 Seats)' : 'Solo Seat'}"`,
      `"${e.amount}"`,
      `"${e.payment_verified ? 'Verified' : 'Pending'}"`,
      `"${new Date(e.enrolled_at).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `musehaus_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Bookings exported to CSV successfully! 📊', 'success');
  };

  const loadWorkshopSettings = async () => {
    const { active, history } = await getAdminWorkshops();
    setWorkshop(active || null);
    setWorkshopHistory(history || []);
    if (active) {
      setSettingsForm({
        title: active.title || '',
        description: active.description || '',
        date: active.date || '',
        time: active.time || '',
        price: active.price || 499,
        comboPrice: active.combo_price ?? 799,
        seats_total: active.seats_total ?? 20,
        seats_remaining: active.seats_remaining ?? 20,
        status: active.status || 'open'
      });
    }
    return active;
  };

  const refreshParticipants = async () => {
    const { data } = await getAdminParticipants();
    setParticipants(data || []);
  };

  const handleDeleteParticipant = async () => {
    if (!participantToDelete) return;

    setDeletingUser(true);
    const { error } = await deleteParticipant(participantToDelete.id);

    if (error) {
      showToast(error.message || 'Failed to delete user.', 'error');
    } else {
      showToast('User deleted successfully', 'success');
      setParticipantToDelete(null);
      await refreshParticipants();
    }
    setDeletingUser(false);
  };

  const handleLaunchNewWorkshop = async () => {
    if (!workshop) return;

    setCreatingNewWorkshop(true);
    const { data, error } = await createNewWorkshopEvent(workshop.id, {
      title: settingsForm.title,
      description: settingsForm.description,
      date: settingsForm.date,
      time: settingsForm.time,
      price: settingsForm.price,
      combo_price: settingsForm.comboPrice,
      seats_total: settingsForm.seats_total,
      seats_remaining: settingsForm.seats_remaining
    });

    if (error) {
      showToast('Failed to create new workshop event.', 'error');
    } else {
      showToast('New workshop created! Previous registrations are archived.', 'success');
      setShowLaunchConfirm(false);
      if (data) {
        setWorkshop(data);
        setSettingsForm({
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          price: data.price || 499,
          comboPrice: data.combo_price ?? 799,
          seats_total: data.seats_total ?? 20,
          seats_remaining: data.seats_remaining ?? 20,
          status: data.status || 'open'
        });
      }
      await loadWorkshopSettings();
    }
    setCreatingNewWorkshop(false);
  };

  const canDeleteParticipant = (participant) => {
    if (!user) return false;
    if (String(participant.id) === String(user.id)) return false;
    if (participant.is_admin) return false;
    return true;
  };

  // Save Workshop Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!workshop) return;

    setSavingSettings(true);
    const { data, error } = await updateWorkshopDetails(workshop.id, {
      title: settingsForm.title,
      description: settingsForm.description,
      date: settingsForm.date,
      time: settingsForm.time,
      price: parseFloat(settingsForm.price),
      combo_price: parseFloat(settingsForm.comboPrice),
      seats_total: parseInt(settingsForm.seats_total, 10),
      seats_remaining: parseInt(settingsForm.seats_remaining, 10),
      status: settingsForm.status
    });

    if (error) {
      showToast('Failed to update workshop settings.', 'error');
    } else {
      showToast('Workshop updated successfully!', 'success');
      if (data) {
        setWorkshop(data);
        setSettingsForm({
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          price: data.price || 499,
          comboPrice: data.combo_price ?? 799,
          seats_total: data.seats_total ?? 20,
          seats_remaining: data.seats_remaining ?? 20,
          status: data.status || 'open'
        });
      } else {
        await loadWorkshopSettings();
      }
    }
    setSavingSettings(false);
  };

  // Filtering Logic
  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = 
      (e.user_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (e.email || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (e.booking_ref || '').toLowerCase().includes(bookingSearch.toLowerCase());
    
    if (bookingFilter === 'verified') return matchesSearch && e.payment_verified;
    if (bookingFilter === 'pending') return matchesSearch && !e.payment_verified;
    return matchesSearch;
  });

  const filteredParticipants = participants.filter(p => 
    (p.full_name || '').toLowerCase().includes(participantSearch.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(participantSearch.toLowerCase()) ||
    (p.phone || '').toLowerCase().includes(participantSearch.toLowerCase())
  );

  // Loading Screen for Auth & Admin Checks
  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen pt-16 bg-cream flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-terra border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-xs font-light tracking-widest uppercase">Verifying Admin Credentials...</p>
      </div>
    );
  }

  // Not Logged In Screen
  if (!user) {
    return (
      <div className="min-h-screen pt-16 bg-cream text-ink flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-ink/10 rounded-xl p-8 shadow-lg text-center flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-terra/10 flex items-center justify-center text-terra">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-medium text-ink">Authentication Required</h2>
            <p className="text-xs text-muted font-light mt-2">
              Please sign in with an authorized admin account to access the Atelier Dashboard.
            </p>
          </div>
          <Link
            to="/login?redirect=/admin"
            className="w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold py-3.5 rounded-sm transition-colors shadow-md"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  // Access Denied Screen (Logged in but not admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-16 bg-cream text-ink flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-terra/20 rounded-xl p-8 shadow-lg text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-terra block mb-1">Restricted Route</span>
            <h2 className="font-serif text-3xl font-medium text-ink">Access Denied</h2>
            <p className="text-xs text-muted font-light mt-3 leading-relaxed">
              Your logged-in account (<span className="font-semibold text-ink">{user.email}</span>) does not have administrator privileges for MuseHaus Atelier.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3 mt-2">
            <Link
              to="/"
              className="w-full bg-ink hover:bg-ink/90 text-cream text-xs uppercase tracking-widest font-bold py-3.5 rounded-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // FULL ADMIN DASHBOARD UI
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col md:flex-row">
      
      {/* Mobile Top Navbar with Hamburger */}
      <div className="md:hidden bg-ink text-cream p-4 flex items-center justify-between sticky top-16 z-40 border-b border-cream/10">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl font-semibold">Muse<span className="text-terra">Haus</span></span>
          <span className="text-[9px] uppercase tracking-widest bg-gold/20 text-gold px-2 py-0.5 rounded font-bold">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-cream hover:text-terra transition-colors focus:outline-none"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-ink text-cream z-50 flex flex-col justify-between p-6 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-8">
          
          {/* Logo & Portal Badge */}
          <div className="flex flex-col gap-1 border-b border-cream/10 pb-6">
            <Link to="/" className="font-serif text-2xl tracking-wide font-semibold text-cream flex items-center gap-1">
              <span>Muse</span>
              <span className="text-terra">Haus</span>
            </Link>
            <div className="flex items-center gap-1 text-gold text-[10px] uppercase tracking-[0.2em] font-semibold mt-1">
              <Sparkles size={12} />
              <span>Atelier Dashboard</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 font-sans">
            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs uppercase tracking-wider font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-terra text-cream shadow-md'
                  : 'text-muted hover:text-cream hover:bg-cream/5'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('bookings'); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs uppercase tracking-wider font-semibold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-terra text-cream shadow-md'
                  : 'text-muted hover:text-cream hover:bg-cream/5'
              }`}
            >
              <Ticket size={16} />
              <span>Bookings</span>
            </button>

            <button
              onClick={() => { setActiveTab('participants'); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs uppercase tracking-wider font-semibold transition-all ${
                activeTab === 'participants'
                  ? 'bg-terra text-cream shadow-md'
                  : 'text-muted hover:text-cream hover:bg-cream/5'
              }`}
            >
              <Users size={16} />
              <span>Participants</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs uppercase tracking-wider font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-terra text-cream shadow-md'
                  : 'text-muted hover:text-cream hover:bg-cream/5'
              }`}
            >
              <Settings size={16} />
              <span>Workshop Settings</span>
            </button>
          </nav>

        </div>

        {/* User Info & Sign Out Footer */}
        <div className="border-t border-cream/10 pt-6 flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-cream truncate">{user.full_name || 'Administrator'}</span>
            <span className="text-[10px] text-muted truncate">{user.email}</span>
          </div>

          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="flex items-center gap-2 text-xs text-muted hover:text-terra transition-colors pt-2 font-medium"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto min-h-screen">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-ink">
                Dashboard <span className="italic text-terra">Overview</span>
              </h1>
              <p className="text-xs text-muted font-light mt-1">Real-time studio enrollment analytics and revenue summary.</p>
            </div>

            {loadingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-28 bg-ink/5 rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Card 1: Total Bookings */}
                  <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted">Total Bookings</span>
                      <div className="p-2 rounded-lg bg-terra/10 text-terra">
                        <Ticket size={18} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-serif text-4xl font-semibold text-ink">{overviewData?.totalBookings || 0}</span>
                      <span className="text-xs text-muted font-light block mt-1">Total enrollments</span>
                    </div>
                  </div>

                  {/* Card 2: Confirmed Payments */}
                  <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted">Confirmed Payments</span>
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={18} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-serif text-4xl font-semibold text-emerald-700">{overviewData?.confirmedPayments || 0}</span>
                      <span className="text-xs text-muted font-light block mt-1">Verified transactions</span>
                    </div>
                  </div>

                  {/* Card 3: Total Revenue */}
                  <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted">Total Revenue</span>
                      <div className="p-2 rounded-lg bg-gold/10 text-gold font-bold">
                        <IndianRupee size={18} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-serif text-4xl font-semibold text-ink">₹{overviewData?.totalRevenue || 0}</span>
                      <span className="text-xs text-muted font-light block mt-1">Gross collected</span>
                    </div>
                  </div>

                  {/* Card 4: Workshop Date */}
                  <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted">Workshop Date</span>
                      <div className="p-2 rounded-lg bg-ink/5 text-ink">
                        <Calendar size={18} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-serif text-xl font-medium text-ink block truncate">{overviewData?.workshopDate || 'July 6, 2026'}</span>
                      <span className="text-xs text-muted font-light block mt-1">Next scheduled event</span>
                    </div>
                  </div>

                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm flex flex-col gap-5 mt-2">
                  <div className="flex justify-between items-center border-b border-ink/5 pb-4">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-ink">Recent Enrollments</h3>
                      <p className="text-xs text-muted font-light">Latest 5 bookings submitted by members</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-semibold text-terra hover:underline uppercase tracking-wider"
                    >
                      View All Bookings &rarr;
                    </button>
                  </div>

                  {overviewData?.recentEnrollments?.length === 0 ? (
                    <p className="text-xs text-muted py-6 text-center font-light">No recent enrollments recorded yet.</p>
                  ) : (
                    <div className="flex flex-col divide-y divide-ink/5">
                      {overviewData?.recentEnrollments?.map((item) => (
                        <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-ink">{item.name}</span>
                            <span className="text-xs text-muted font-light">{item.email}</span>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-muted font-mono">{new Date(item.enrolled_at).toLocaleDateString()}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                              item.payment_verified 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {item.payment_verified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-light text-ink">
                  Workshop <span className="italic text-terra">Bookings</span>
                </h1>
                <p className="text-xs text-muted font-light mt-1">Manage all member enrollments, payment verification, and export data.</p>
              </div>

              <button
                onClick={handleExportCSV}
                className="bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold px-5 py-3 rounded-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <Download size={15} />
                Export to CSV
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search name, email, or booking ref..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="bg-cream/40 border border-ink/10 focus:border-terra rounded-sm pl-9 pr-4 py-2.5 text-xs focus:outline-none w-full transition-colors"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted hidden lg:inline">Status:</span>
                <button
                  onClick={() => setBookingFilter('all')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                    bookingFilter === 'all' ? 'bg-ink text-cream font-semibold' : 'bg-cream/50 text-muted hover:text-ink'
                  }`}
                >
                  All ({enrollments.length})
                </button>
                <button
                  onClick={() => setBookingFilter('verified')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                    bookingFilter === 'verified' ? 'bg-emerald-700 text-white font-semibold' : 'bg-cream/50 text-muted hover:text-ink'
                  }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => setBookingFilter('pending')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                    bookingFilter === 'pending' ? 'bg-amber-600 text-white font-semibold' : 'bg-cream/50 text-muted hover:text-ink'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            {loadingData ? (
              <div className="bg-white border border-ink/10 rounded-xl p-12 text-center">
                <p className="text-muted text-xs font-light">Loading booking entries...</p>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="bg-white border border-ink/10 rounded-xl p-12 text-center">
                <p className="text-muted text-xs font-light">No bookings match your filter criteria.</p>
              </div>
            ) : (
              <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-warm/30 border-b border-ink/10 text-[10px] uppercase tracking-wider text-muted font-bold">
                      <th className="py-3.5 px-4">Booking Ref</th>
                      <th className="py-3.5 px-4">Customer Name</th>
                      <th className="py-3.5 px-4">Email / Phone</th>
                      <th className="py-3.5 px-4">Booking Option</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {filteredEnrollments.map((e, idx) => (
                      <tr key={e.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream/20'}>
                        <td className="py-3 px-4 font-mono font-medium text-ink/80">{e.booking_ref}</td>
                        <td className="py-3 px-4 font-semibold text-ink">{e.user_name}</td>
                        <td className="py-3 px-4 text-muted">
                          <div className="flex flex-col">
                            <span>{e.email}</span>
                            <span className="text-[10px] opacity-75">{e.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-ink">₹{e.amount}</span>
                          <span className="text-muted text-[10px] block">{e.is_combo ? 'Combo (2 seats)' : 'Solo seat'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            e.payment_verified 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {e.payment_verified ? 'Verified ✅' : 'Pending ⏳'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted font-mono">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedBooking(e)}
                            className="p-1.5 rounded text-muted hover:text-terra hover:bg-terra/10 transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-ink">
                Registered <span className="italic text-terra">Participants</span>
              </h1>
              <p className="text-xs text-muted font-light mt-1">Directory of all accounts registered on MuseHaus.</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search participants by name, email, or phone..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="bg-cream/40 border border-ink/10 focus:border-terra rounded-sm pl-9 pr-4 py-2.5 text-xs focus:outline-none w-full transition-colors"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>

            {/* Participants Table */}
            {loadingData ? (
              <div className="bg-white border border-ink/10 rounded-xl p-12 text-center">
                <p className="text-muted text-xs font-light">Loading members directory...</p>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="bg-white border border-ink/10 rounded-xl p-12 text-center">
                <p className="text-muted text-xs font-light">No members match your search criteria.</p>
              </div>
            ) : (
              <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-warm/30 border-b border-ink/10 text-[10px] uppercase tracking-wider text-muted font-bold">
                      <th className="py-3.5 px-4">Member Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4">Has Booked?</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {filteredParticipants.map((p, idx) => (
                      <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream/20'}>
                        <td className="py-3 px-4 font-semibold text-ink">{p.full_name}</td>
                        <td className="py-3 px-4 text-muted">{p.email}</td>
                        <td className="py-3 px-4 text-muted font-mono">{p.phone}</td>
                        <td className="py-3 px-4 text-muted font-mono">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.has_booked ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {p.has_booked ? 'Yes ✦' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.is_admin ? (
                            <span className="bg-gold/20 text-gold px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                              Admin
                            </span>
                          ) : (
                            <span className="text-muted text-[10px] uppercase">Member</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {canDeleteParticipant(p) ? (
                            <button
                              type="button"
                              onClick={() => setParticipantToDelete(p)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors text-[10px] uppercase tracking-wider font-bold"
                              title={`Delete ${p.full_name}`}
                              aria-label={`Delete ${p.full_name}`}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <span className="text-muted text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: WORKSHOP SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-ink">
                Workshop <span className="italic text-terra">Settings</span>
              </h1>
              <p className="text-xs text-muted font-light mt-1">
                Edit the current event for minor changes, or launch a new workshop when starting a completely new event.
              </p>
            </div>

            {loadingData ? (
              <div className="bg-white border border-ink/10 rounded-xl p-12 text-center">
                <p className="text-muted text-xs font-light">Loading workshop settings...</p>
              </div>
            ) : !workshop ? (
              <div className="bg-white border border-ink/10 rounded-xl p-12 text-center">
                <p className="text-muted text-xs font-light">No active workshop found. Launch a new event to get started.</p>
              </div>
            ) : (
              <>
                {/* Current Workshop Card */}
                <div className="bg-white border border-terra/20 rounded-xl p-6 shadow-sm flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-terra">Current Active Workshop</span>
                      <h2 className="font-serif text-xl font-medium text-ink mt-1">{workshop.title}</h2>
                      <p className="text-xs text-muted mt-1">{workshop.date} · {workshop.time}</p>
                    </div>
                    <span className="bg-terra/10 text-terra text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                      ID #{workshop.id}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    <span className="font-semibold text-ink">Edit Details</span> — use for typos, price tweaks, or seat updates on this same event.
                    {' '}<span className="font-semibold text-ink">Launch New Workshop</span> — creates a fresh event with a new ID so past registrations don&apos;t block new bookings.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="bg-white border border-ink/10 rounded-xl p-8 shadow-sm flex flex-col gap-6 font-sans">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Workshop Title</label>
                  <input
                    type="text"
                    value={settingsForm.title}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors font-medium text-ink"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Description / Subtitle</label>
                  <textarea
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Brief workshop description shown on the Workshops page"
                    className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Date Display Text</label>
                    <input
                      type="text"
                      value={settingsForm.date}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. Saturday, July 6"
                      className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Time Range</label>
                    <input
                      type="text"
                      value={settingsForm.time}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="e.g. 10:00 AM – 1:00 PM"
                      className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Price, Combo & Seats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Solo Ticket Price (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.price}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, price: e.target.value }))}
                      className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Combo Price (2 members, ₹)</label>
                    <input
                      type="number"
                      value={settingsForm.comboPrice}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, comboPrice: e.target.value }))}
                      className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Total Seats</label>
                    <input
                      type="number"
                      value={settingsForm.seats_total}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, seats_total: e.target.value }))}
                      className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Seats Remaining</label>
                    <input
                      type="number"
                      value={settingsForm.seats_remaining}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, seats_remaining: e.target.value }))}
                      className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Workshop Status</label>
                    <select
                      value={settingsForm.status}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, status: e.target.value }))}
                      className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors font-medium"
                    >
                      <option value="open">Open for Bookings</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="almost-full">Almost Full</option>
                      <option value="sold-out">Sold Out</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-ink/10 pt-4 flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLaunchConfirm(true)}
                    disabled={creatingNewWorkshop}
                    className="bg-ink hover:bg-ink/90 disabled:opacity-60 text-cream text-xs uppercase tracking-widest font-bold px-6 py-3.5 rounded-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Rocket size={15} />
                    Launch New Workshop
                  </button>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-terra hover:bg-terra/90 disabled:opacity-60 text-cream text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Pencil size={15} />
                    {savingSettings ? 'Saving...' : 'Save Details'}
                  </button>
                </div>

              </form>

              {/* Past Workshops History */}
              {workshopHistory.length > 0 && (
                <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-ink">Past Workshops</h3>
                    <p className="text-xs text-muted font-light mt-1">Archived events — enrollment records are preserved.</p>
                  </div>
                  <div className="flex flex-col divide-y divide-ink/5">
                    {workshopHistory.map((ws) => (
                      <div key={ws.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-ink">{ws.title}</span>
                          <span className="text-xs text-muted block">{ws.date} · ID #{ws.id}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted bg-warm/40 px-2.5 py-1 rounded self-start">
                          {ws.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </>
            )}

          </div>
        )}

      </main>

      {/* DELETE USER CONFIRMATION MODAL */}
      {participantToDelete && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-ink/10 rounded-xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-ink/10 pb-4">
              <h3 className="font-serif text-xl font-medium text-ink">Delete User</h3>
              <button
                onClick={() => setParticipantToDelete(null)}
                className="text-muted hover:text-ink p-1 rounded-sm transition-colors"
                disabled={deletingUser}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-ink">{participantToDelete.full_name}</span>?
              This will remove their account and all associated bookings permanently.
              This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setParticipantToDelete(null)}
                disabled={deletingUser}
                className="flex-1 border border-ink/20 text-ink text-xs uppercase tracking-widest font-bold py-3 rounded-sm hover:bg-ink/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteParticipant}
                disabled={deletingUser}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-cream text-xs uppercase tracking-widest font-bold py-3 rounded-sm transition-colors"
              >
                {deletingUser ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAUNCH NEW WORKSHOP CONFIRMATION MODAL */}
      {showLaunchConfirm && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-ink/10 rounded-xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-ink/10 pb-4">
              <h3 className="font-serif text-xl font-medium text-ink">Launch New Workshop</h3>
              <button
                onClick={() => setShowLaunchConfirm(false)}
                className="text-muted hover:text-ink p-1 rounded-sm transition-colors"
                disabled={creatingNewWorkshop}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              This will archive the current workshop (ID #{workshop?.id}) as <span className="font-semibold text-ink">completed</span> and
              create a brand-new event with a fresh ID using the details in the form above.
              Previous enrollment records will be kept, but users won&apos;t see &quot;already registered&quot; for the new event.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLaunchConfirm(false)}
                disabled={creatingNewWorkshop}
                className="flex-1 border border-ink/20 text-ink text-xs uppercase tracking-widest font-bold py-3 rounded-sm hover:bg-ink/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchNewWorkshop}
                disabled={creatingNewWorkshop}
                className="flex-1 bg-ink hover:bg-ink/90 disabled:opacity-60 text-cream text-xs uppercase tracking-widest font-bold py-3 rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                <Rocket size={14} />
                {creatingNewWorkshop ? 'Creating...' : 'Launch New Workshop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR BOOKING */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-ink/10 rounded-xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-ink/10 pb-4">
              <h3 className="font-serif text-xl font-medium text-ink">Booking Details</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-muted hover:text-ink p-1 rounded-sm transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between py-1 border-b border-ink/5">
                <span className="text-muted font-light">Reference ID / UTR:</span>
                <span className="font-mono font-semibold text-ink select-all">{selectedBooking.booking_ref}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ink/5">
                <span className="text-muted font-light">Customer Name:</span>
                <span className="font-semibold text-ink">{selectedBooking.user_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ink/5">
                <span className="text-muted font-light">Email Address:</span>
                <span className="font-medium text-ink">{selectedBooking.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ink/5">
                <span className="text-muted font-light">Phone Number:</span>
                <span className="font-mono text-ink">{selectedBooking.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ink/5">
                <span className="text-muted font-light">Booking Type:</span>
                <span className="font-semibold text-terra">{selectedBooking.is_combo ? 'Combo (2 seats)' : 'Solo Seat'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ink/5">
                <span className="text-muted font-light">Amount Paid:</span>
                <span className="font-semibold text-ink">₹{selectedBooking.amount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-ink/5">
                <span className="text-muted font-light">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedBooking.payment_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {selectedBooking.payment_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted font-light">Timestamp:</span>
                <span className="font-mono text-muted">{new Date(selectedBooking.enrolled_at).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full bg-ink text-cream text-xs uppercase tracking-widest font-bold py-3 rounded-sm hover:bg-ink/90 transition-colors mt-2"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
