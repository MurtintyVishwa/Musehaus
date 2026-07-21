# MuseHaus Admin Dashboard Setup Guide

This guide provides instructions on how to set up and manage the Admin Dashboard for the MuseHaus Atelier web application.

---

## Part 1: Run SQL Setup Script in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **SQL Editor** in the left sidebar.
3. Click **+ New Query** and paste the following SQL block:

```sql
-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow authenticated users to insert/update their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 4. Automatic Profile Creation Trigger on New Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click **Run** to execute the SQL query.

---

## Part 2: Designate an Admin User

To give an account administrative access to `/admin`:

1. Register an account on the MuseHaus website (or use an existing account).
2. Open the **SQL Editor** in Supabase and run:

```sql
-- Replace with the email address of your admin user:
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'your-admin-email@gmail.com';
```

---

## Part 3: Accessing the Admin Dashboard

1. Log in to MuseHaus with your admin account credentials.
2. Navigate to:
   ```
   https://musehaus.vercel.app/admin
   ```
   *(Or `http://localhost:5173/admin` during local development)*

3. If a non-admin or unauthenticated user tries to open `/admin`:
   - Unauthenticated users are redirected to `/login?redirect=/admin`.
   - Logged-in non-admin users will see an **Access Denied** screen.

---

## Part 4: Admin Features Overview

- **Overview:** View live total booking count, verified payment count, gross revenue, workshop date, and recent activity feed.
- **Bookings:** Full tabular list of enrollments with real-time search, status filtering (Verified vs. Pending), and **Export to CSV** button for Excel reports.
- **Participants:** Complete user directory listing registration details and booking history.
- **Workshop Settings:** Edit workshop title, date, time, pricing, and availability status (`open`, `almost-full`, `sold-out`).
