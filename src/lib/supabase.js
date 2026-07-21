import { createClient } from '@supabase/supabase-js';

// Toggle this flag to switch between mock/demo mode and live Supabase database.
// By default, set to false so it uses the real database once .env is loaded.
// It will dynamically fall back to Mock mode if environment credentials are not present.
const MOCK_MODE_SETTING = false; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are valid (not placeholder values)
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your_supabase');
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('your_supabase');

const MOCK_MODE = MOCK_MODE_SETTING || !isValidUrl || !isValidKey;

if (MOCK_MODE && !MOCK_MODE_SETTING) {
  console.warn(
    "[MuseHaus] Supabase credentials (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing in environment variables. Falling back to local Mock Mode."
  );
}

// Initialize client if not in mock mode
export const supabase = !MOCK_MODE 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Simulated delay helper
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// --- Hardcoded Workshop Data ---
const DEFAULT_WORKSHOPS = [
  {
    id: 1,
    title: "Paint & Create: Moulds + Mini Easels",
    instructor_name: "MuseHaus Team",
    instructor_avatar_initials: "MH",
    medium: "painting",
    level: "beginner",
    date: "Saturday, July 6",
    time: "10:00 AM – 1:00 PM",
    duration_hours: 3,
    price: 499,
    seats_total: 20,
    seats_remaining: 15,
    status: "open",
    gradient_style: "from-[#e8a87c] to-[#c0623a]",
    created_at: new Date('2026-06-01').toISOString()
  }
];

// In mock mode, we use LocalStorage to store state for workshops, users, and enrollments
const getMockData = (key, fallback) => {
  const data = localStorage.getItem(`musehaus_${key}`);
  if (data) return JSON.parse(data);
  localStorage.setItem(`musehaus_${key}`, JSON.stringify(fallback));
  return fallback;
};

const setMockData = (key, data) => {
  localStorage.setItem(`musehaus_${key}`, JSON.stringify(data));
};

// Initialize mock database stores
if (MOCK_MODE) {
  // Version key: bump this string whenever DEFAULT_WORKSHOPS changes to clear stale cache
  const DATA_VERSION = 'v3_paint_create';
  const storedVersion = localStorage.getItem('musehaus_data_version');
  if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem('musehaus_workshops');
    localStorage.setItem('musehaus_data_version', DATA_VERSION);
  }
  getMockData('workshops', DEFAULT_WORKSHOPS);
  getMockData('enrollments', []);
  getMockData('users', []);
  // Initialize dynamic session
  const session = localStorage.getItem('musehaus_session');
  if (!session) {
    localStorage.setItem('musehaus_session', JSON.stringify(null));
  }
}

// --- USER OBJECT NORMALIZATION (BRIDGING LIVE & MOCK DATA) ---
const normalizeUser = (supabaseUser) => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: supabaseUser.user_metadata?.full_name || '',
    phone: supabaseUser.user_metadata?.phone || '',
    interests: supabaseUser.user_metadata?.interests || [],
    avatar_url: supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${supabaseUser.id}`,
    created_at: supabaseUser.created_at
  };
};

// --- DATABASE FUNCTIONS ---

export async function getWorkshops() {
  if (MOCK_MODE) {
    await delay(300);
    return { data: getMockData('workshops', DEFAULT_WORKSHOPS), error: null };
  } else {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: true });
    return { data, error };
  }
}

// --- AUTHENTICATION FUNCTIONS ---

export async function signUp(email, password, fullName, phone, interests = []) {
  if (MOCK_MODE) {
    await delay(500);
    const users = getMockData('users', []);
    
    if (users.find(u => u.email === email)) {
      return { data: null, error: { message: "User with this email already exists." } };
    }

    const newUser = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      email,
      full_name: fullName,
      phone,
      interests,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName}`,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setMockData('users', users);

    // Auto-login after registration
    localStorage.setItem('musehaus_session', JSON.stringify(newUser));
    return { data: { user: newUser, session: { user: newUser } }, error: null };
  } else {
    // Live Supabase signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://musehaus.vercel.app/login',
        data: {
          full_name: fullName,
          phone,
          interests,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName}`
        }
      }
    });

    if (error) return { data: null, error };
    return { 
      data: { 
        user: normalizeUser(data.user), 
        session: data.session 
      }, 
      error: null 
    };
  }
}

export async function signIn(email, password) {
  if (MOCK_MODE) {
    await delay(400);
    const users = getMockData('users', []);
    const matchedUser = users.find(u => u.email === email);
    
    if (!matchedUser) {
      return { data: null, error: { message: "Invalid login credentials." } };
    }

    // In a mock layer, we accept any password
    localStorage.setItem('musehaus_session', JSON.stringify(matchedUser));
    return { data: { user: matchedUser, session: { user: matchedUser } }, error: null };
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) return { data: null, error };
    return { 
      data: { 
        user: normalizeUser(data.user), 
        session: data.session 
      }, 
      error: null 
    };
  }
}

export async function signOut() {
  if (MOCK_MODE) {
    await delay(200);
    localStorage.setItem('musehaus_session', JSON.stringify(null));
    return { error: null };
  } else {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
}

export async function getUser() {
  if (MOCK_MODE) {
    const session = localStorage.getItem('musehaus_session');
    const user = session ? JSON.parse(session) : null;
    return { data: { user }, error: null };
  } else {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { data: null, error };
    return { 
      data: { 
        user: normalizeUser(data.user) 
      }, 
      error: null 
    };
  }
}

// --- ENROLLMENT FUNCTIONS (MOCK/LIVE HELPER) ---

export async function enrollInWorkshop(userId, workshopId, paymentId = null, orderId = null, isCombo = false) {
  if (MOCK_MODE) {
    await delay(450);
    const enrollments = getMockData('enrollments', []);
    const workshops = getMockData('workshops', DEFAULT_WORKSHOPS);

    // Check if already enrolled with the same option (solo vs combo are treated separately)
    const exists = enrollments.find(e => e.user_id === userId && e.workshop_id === workshopId && !!e.is_combo === !!isCombo);
    if (exists) {
      return { data: null, error: { message: "You are already enrolled in this workshop." } };
    }

    // Find workshop
    const workshopIdx = workshops.findIndex(w => w.id === workshopId);
    if (workshopIdx === -1) {
      return { data: null, error: { message: "Workshop not found." } };
    }

    const workshop = workshops[workshopIdx];
    if (workshop.seats_remaining <= 0) {
      return { data: null, error: { message: "Workshop is fully booked." } };
    }

    // Update seats
    workshop.seats_remaining -= 1;
    if (workshop.seats_remaining === 0) {
      workshop.status = 'sold-out';
    } else if (workshop.seats_remaining <= 3) {
      workshop.status = 'almost-full';
    }

    // Create enrollment
    const newEnrollment = {
      id: `enr_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      workshop_id: workshopId,
      is_combo: isCombo,
      enrolled_at: new Date().toISOString(),
      payment_status: paymentId ? "paid" : "pending",
      razorpay_payment_id: paymentId || null,
      razorpay_order_id: orderId || null,
      payment_verified: !!paymentId
    };

    enrollments.push(newEnrollment);

    // Save both
    setMockData('workshops', workshops);
    setMockData('enrollments', enrollments);

    return { data: newEnrollment, error: null };
  } else {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([
        {
          user_id: userId,
          workshop_id: workshopId,
          is_combo: isCombo,
          payment_status: paymentId ? 'paid' : 'pending',
          razorpay_payment_id: paymentId || null,
          razorpay_order_id: orderId || null,
          payment_verified: !!paymentId
        }
      ])
      .select();

    // Note: Live version should handle seat subtraction in a trigger or database transaction!
    return { data, error };
  }
}

export async function getUserEnrollments(userId) {
  if (MOCK_MODE) {
    await delay(200);
    const enrollments = getMockData('enrollments', []);
    const userEnrollments = enrollments.filter(e => e.user_id === userId);
    return { data: userEnrollments, error: null };
  } else {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  }
}

export async function checkExistingEnrollment(userId, workshopId, isCombo = false) {
  if (MOCK_MODE) {
    const enrollments = getMockData('enrollments', []);
    // Match on workshop AND option type (solo vs combo are separate)
    const found = enrollments.find(e => e.user_id === userId && e.workshop_id === workshopId && !!e.is_combo === !!isCombo);
    return { data: found || null, error: null };
  } else {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id, razorpay_payment_id, enrolled_at, is_combo')
      .eq('user_id', userId)
      .eq('workshop_id', workshopId)
      .eq('is_combo', isCombo)
      .maybeSingle();
    return { data, error };
  }
}

// --- ADMIN FUNCTIONS ---

export async function syncUserProfile(user) {
  if (MOCK_MODE || !supabase || !user) return;
  try {
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  } catch (e) {
    console.warn("Could not sync user profile:", e);
  }
}

export async function checkIsAdmin(userId, userEmail = '') {
  if (MOCK_MODE) {
    const sessionStr = localStorage.getItem('musehaus_session');
    const sessionUser = sessionStr ? JSON.parse(sessionStr) : null;
    if (sessionUser?.is_admin) return true;
    if (userEmail && (userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase().includes('musehaus'))) return true;
    return true; // Enable admin view in mock mode for testing/demo
  }
  
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return !!data.is_admin;
    }
  } catch (e) {
    console.warn("Failed checking profiles table for admin status:", e);
  }

  return false;
}

export async function getAdminOverview() {
  if (MOCK_MODE) {
    await delay(300);
    const enrollments = getMockData('enrollments', []);
    const workshops = getMockData('workshops', DEFAULT_WORKSHOPS);
    const users = getMockData('users', []);

    const totalBookings = enrollments.length;
    const confirmedPayments = enrollments.filter(e => e.payment_verified || e.payment_status === 'paid').length;
    const totalRevenue = enrollments.reduce((sum, e) => {
      const amount = e.is_combo ? 799 : 499;
      return sum + amount;
    }, 0);

    const workshopDate = workshops[0]?.date || 'Saturday, July 6, 2026';

    const recentEnrollments = enrollments.slice(-5).reverse().map(e => {
      const u = users.find(usr => usr.id === e.user_id) || {};
      return {
        id: e.id,
        name: u.full_name || 'Anonymous User',
        email: u.email || 'user@example.com',
        enrolled_at: e.enrolled_at || new Date().toISOString(),
        payment_verified: !!e.payment_verified || e.payment_status === 'paid',
        payment_status: e.payment_status || 'paid',
        is_combo: !!e.is_combo
      };
    });

    return {
      data: {
        totalBookings,
        confirmedPayments,
        totalRevenue,
        workshopDate,
        recentEnrollments
      },
      error: null
    };
  }

  try {
    const { data: enrollments, error: enrollErr } = await supabase
      .from('enrollments')
      .select('*')
      .order('enrolled_at', { ascending: false });

    if (enrollErr) throw enrollErr;

    const { data: profiles } = await supabase.from('profiles').select('*');
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const { data: workshops } = await supabase.from('workshops').select('*');
    const mainWorkshop = workshops?.[0];

    const totalBookings = enrollments?.length || 0;
    const confirmedPayments = enrollments?.filter(e => e.payment_verified || e.payment_status === 'paid').length || 0;
    const totalRevenue = (enrollments || []).reduce((sum, e) => {
      if (e.payment_verified || e.payment_status === 'paid') {
        return sum + (e.is_combo ? 799 : 499);
      }
      return sum;
    }, 0);

    const workshopDate = mainWorkshop?.date ? `${mainWorkshop.date}` : 'Saturday, July 6, 2026';

    const recentEnrollments = (enrollments || []).slice(0, 5).map(e => {
      const profile = profileMap.get(e.user_id) || {};
      return {
        id: e.id,
        name: profile.full_name || profile.email || 'Registered User',
        email: profile.email || '—',
        enrolled_at: e.enrolled_at,
        payment_verified: !!e.payment_verified || e.payment_status === 'paid',
        payment_status: e.payment_status || 'paid',
        is_combo: !!e.is_combo
      };
    });

    return {
      data: {
        totalBookings,
        confirmedPayments,
        totalRevenue,
        workshopDate,
        recentEnrollments
      },
      error: null
    };
  } catch (err) {
    console.error("Error fetching admin overview:", err);
    return { data: null, error: err };
  }
}

export async function getAdminEnrollments() {
  if (MOCK_MODE) {
    await delay(300);
    const enrollments = getMockData('enrollments', []);
    const users = getMockData('users', []);

    const data = enrollments.map(e => {
      const u = users.find(usr => usr.id === e.user_id) || {};
      return {
        id: e.id,
        booking_ref: e.razorpay_payment_id || e.id,
        user_name: u.full_name || 'Guest User',
        email: u.email || 'guest@example.com',
        phone: u.phone || '—',
        is_combo: !!e.is_combo,
        amount: e.is_combo ? 799 : 499,
        payment_verified: !!e.payment_verified || e.payment_status === 'paid',
        payment_status: e.payment_status || 'paid',
        enrolled_at: e.enrolled_at || new Date().toISOString()
      };
    });

    return { data, error: null };
  }

  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('*')
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    const { data: profiles } = await supabase.from('profiles').select('*');
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const data = (enrollments || []).map(e => {
      const p = profileMap.get(e.user_id) || {};
      return {
        id: e.id,
        booking_ref: e.razorpay_payment_id || e.id.substring(0, 8),
        user_name: p.full_name || p.email || 'Registered User',
        email: p.email || '—',
        phone: p.phone || '—',
        is_combo: !!e.is_combo,
        amount: e.is_combo ? 799 : 499,
        payment_verified: !!e.payment_verified || e.payment_status === 'paid',
        payment_status: e.payment_status || 'paid',
        enrolled_at: e.enrolled_at
      };
    });

    return { data, error: null };
  } catch (err) {
    console.error("Error fetching admin enrollments:", err);
    return { data: [], error: err };
  }
}

export async function getAdminParticipants() {
  if (MOCK_MODE) {
    await delay(300);
    const users = getMockData('users', []);
    const enrollments = getMockData('enrollments', []);

    const data = users.map(u => {
      const hasBooked = enrollments.some(e => e.user_id === u.id);
      return {
        id: u.id,
        full_name: u.full_name || 'Member',
        email: u.email,
        phone: u.phone || '—',
        created_at: u.created_at || new Date().toISOString(),
        has_booked: hasBooked,
        is_admin: !!u.is_admin
      };
    });

    return { data, error: null };
  }

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: enrollments } = await supabase.from('enrollments').select('user_id');
    const bookedSet = new Set((enrollments || []).map(e => e.user_id));

    const data = (profiles || []).map(p => ({
      id: p.id,
      full_name: p.full_name || 'Member',
      email: p.email,
      phone: p.phone || '—',
      created_at: p.created_at,
      has_booked: bookedSet.has(p.id),
      is_admin: !!p.is_admin
    }));

    return { data, error: null };
  } catch (err) {
    console.error("Error fetching admin participants:", err);
    return { data: [], error: err };
  }
}

export async function updateWorkshopDetails(workshopId, updatedFields) {
  if (MOCK_MODE) {
    await delay(300);
    const workshops = getMockData('workshops', DEFAULT_WORKSHOPS);
    const idx = workshops.findIndex(w => w.id === workshopId);
    if (idx !== -1) {
      workshops[idx] = { ...workshops[idx], ...updatedFields };
      setMockData('workshops', workshops);
    }
    return { data: workshops ? workshops[idx] : null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('workshops')
      .update(updatedFields)
      .eq('id', workshopId)
      .select();

    return { data: data ? data[0] : null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}
