-- schema.sql
-- Run this in your Supabase SQL Editor to set up the database tables for MuseHaus.

-- 1. Create WORKSHOPS Table
CREATE TABLE IF NOT EXISTS public.workshops (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    instructor_avatar_initials VARCHAR(10) NOT NULL,
    medium VARCHAR(50) NOT NULL CHECK (medium IN ('painting', 'ceramics', 'sculpture', 'mixed')),
    level VARCHAR(50) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    date VARCHAR(100) NOT NULL,
    time VARCHAR(100) NOT NULL,
    duration_hours INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    seats_total INTEGER NOT NULL,
    seats_remaining INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'almost-full', 'sold-out')),
    gradient_style VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) on Workshops
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

-- Allow read-only access to workshops for everyone (anonymous & logged in users)
CREATE POLICY "Allow public read access to workshops" 
ON public.workshops FOR SELECT 
TO public 
USING (true);


-- 2. Create ENROLLMENTS Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workshop_id INTEGER NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    payment_verified BOOLEAN DEFAULT false,
    
    -- Ensure user cannot enroll in the same workshop multiple times
    CONSTRAINT unique_user_workshop UNIQUE (user_id, workshop_id)
);

-- Enable Row Level Security (RLS) on Enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own enrollments only
CREATE POLICY "Allow users to select their own enrollments" 
ON public.enrollments FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own enrollments
CREATE POLICY "Allow users to enroll in workshops" 
ON public.enrollments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);


-- 3. Seed WORKSHOPS Data
INSERT INTO public.workshops 
  (title, instructor_name, instructor_avatar_initials, medium, level, date, time, duration_hours, price, seats_total, seats_remaining, status, gradient_style) 
VALUES
  ('Light & Shadow in Oils', 'Marina Voss', 'MV', 'painting', 'intermediate', 'June 14, 2026', '10:00 AM – 2:00 PM', 4, 3200.00, 12, 2, 'almost-full', 'from-[#e8a87c] to-[#c0623a]'),
  ('Wheel Throwing Intensive', 'Kenji Lam', 'KL', 'ceramics', 'beginner', 'June 21, 2026', '9:00 AM – 3:00 PM', 6, 4500.00, 12, 7, 'open', 'from-[#9ab8cc] to-[#4a7a9b]'),
  ('Collage & Texture Exploration', 'Sofia Alves', 'SA', 'mixed', 'beginner', 'July 5, 2026', '2:00 PM – 5:00 PM', 3, 2800.00, 12, 9, 'open', 'from-[#d4a8c4] to-[#8a5282]'),
  ('Stone Carving: Form & Void', 'Ravi Krishnamurthy', 'RK', 'sculpture', 'advanced', 'July 12, 2026', '9:00 AM – 5:00 PM', 8, 6000.00, 12, 0, 'sold-out', 'from-[#a8c8a0] to-[#5a8a52]'),
  ('Watercolour for Beginners', 'Anika Rao', 'AR', 'painting', 'beginner', 'July 19, 2026', '11:00 AM – 2:00 PM', 3, 2200.00, 12, 6, 'open', 'from-[#e8a87c] to-[#c0623a]'),
  ('Glaze Chemistry & Firing', 'Kenji Lam', 'KL', 'ceramics', 'intermediate', 'August 2, 2026', '10:00 AM – 4:00 PM', 6, 5000.00, 12, 2, 'almost-full', 'from-[#9ab8cc] to-[#4a7a9b]')
ON CONFLICT DO NOTHING;
