import { createClient } from '@supabase/supabase-js';

// Toggle this flag to switch between mock/demo mode and live Supabase database.
// By default, set to false so it uses the real database once .env is loaded.
// It will dynamically fall back to Mock mode if environment credentials are not present.
const MOCK_MODE_SETTING = false; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const MOCK_MODE = MOCK_MODE_SETTING || !supabaseUrl || !supabaseAnonKey;

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

export async function enrollInWorkshop(userId, workshopId) {
  if (MOCK_MODE) {
    await delay(450);
    const enrollments = getMockData('enrollments', []);
    const workshops = getMockData('workshops', DEFAULT_WORKSHOPS);
    
    // Check if already enrolled
    const exists = enrollments.find(e => e.user_id === userId && e.workshop_id === workshopId);
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
      enrolled_at: new Date().toISOString(),
      payment_status: "paid"
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
        { user_id: userId, workshop_id: workshopId, payment_status: 'paid' }
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
