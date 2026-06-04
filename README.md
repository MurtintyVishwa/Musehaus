# MuseHaus — Luxury Art Workshop Studio

**MuseHaus** is a refined web application for a luxury art workshop studio in the Arts District. It provides an elegant sanctuary for makers to browse upcoming masterclass sessions, select skill levels, manage their registrations, and contact studio hosts.

---

## 🛠 Tech Stack

- **Frontend Core**: React 19 + Vite 6
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS (v3) + PostCSS
- **Database & Auth**: Supabase (`@supabase/supabase-js`)
- **Icons**: Lucide React
- **Hosting**: Prepared for Vercel deployment

---

## 🎨 Design System & Reference

### Brand Typography (Google Fonts)
- **Headings**: `Cormorant Garamond` (classic, luxury serif font family)
- **Body Text**: `DM Sans` (clean, geometric sans-serif font family)

### Harmonious Color Palette
- **Ink**: `#1a1a18` (`bg-ink`, `text-ink` — deep luxury charcoal color)
- **Cream**: `#f5f0e8` (`bg-cream`, `text-cream` — primary canvas color)
- **Terra**: `#c0623a` (`bg-terra`, `text-terra` — terracotta focus/button accent)
- **Gold**: `#d4a853` (`bg-gold`, `text-gold` — warm luxury details/symbols)
- **Muted**: `#8a7f72` (`text-muted` — soft description typography)
- **Warm**: `#e8e0d0` (`bg-warm` — highlights and content backgrounds)

---

## 🚀 Local Setup & Installation

Follow these steps to set up MuseHaus locally:

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd musehaus
   ```

2. **Install Package Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Copy the environment example to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your Supabase connection credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - *Note*: If these variables are not present, the site automatically activates its local mock fallback layer.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the app in your browser.

---

## 📡 Database & Supabase Configuration

To switch the project from Mock Mode to Live Mode:

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project.
2. **Execute Database Tables Initialization**
   - Open the SQL Editor in your Supabase Dashboard.
   - Paste and execute the contents of the root `schema.sql` file. This establishes the tables (`workshops`, `enrollments`), foreign relations, Row Level Security (RLS) policies, and pre-seeds the workshops.
3. **Switch to Live mode**
   - Place your Supabase URL and Anon Key inside your `.env` variables or Vercel settings.
   - Set `MOCK_MODE_SETTING = false` in `src/lib/supabase.js`.

---

## ⚡ Deployment to Vercel

The application is equipped with a `vercel.json` rewrite file to ensure React Router paths render smoothly under direct navigation and page reloads.

1. Install the Vercel CLI or link your repository to the dashboard at [vercel.com](https://vercel.com).
2. Use Vercel's **Vite Preset**.
3. Point your build settings to:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add your `.env` variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.
