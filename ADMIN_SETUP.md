# MuseHaus Admin Dashboard Setup Guide

This guide provides instructions on how to set up and manage the Admin Dashboard for the MuseHaus Atelier web application.

---

## Part 1: Run SQL Setup Script in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **SQL Editor** in the left sidebar.
3. Click **+ New Query**, paste the following SQL script, and click **Run**:

```sql
-- 1. Create PROFILES Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add is_admin column (in case profiles table already existed without it)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Recreate RLS Policies safely
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" 
ON public.profiles FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id);

-- 5. Automatic Profile Creation Trigger on New Signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Part 2: Designate your account as Admin

Run this in the SQL Editor to give your email address administrative access:

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'vishwanathmurtinty@gmail.com';
```

---

## Part 3: Accessing the Admin Dashboard

1. Log in to MuseHaus with your admin account credentials.
2. Navigate to:
   ```
   https://musehaus.vercel.app/admin
   ```

---

## Part 4: Delete User Functionality (Vercel Environment Setup)

Deleting a user account from Supabase Auth requires the **Service Role Key**.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) → **Project Settings** → **API**.
2. Scroll to **Project API Keys** and copy the **`service_role`** key (click "Reveal").
3. Go to [Vercel Dashboard](https://vercel.com) → Select your `musehaus` project → **Settings** → **Environment Variables**.
4. Add a new variable:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: *(paste your service_role key)*
5. Click **Save**.

