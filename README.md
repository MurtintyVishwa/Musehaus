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
   - Open `.env` and fill in your credentials (see the full placeholder guide below):
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
     ```
   - *Note*: If Supabase variables are missing the site activates its local mock fallback. Razorpay payments also work in test mode without a backend.

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

---

## 💳 Razorpay Payment Gateway

MuseHaus uses Razorpay for workshop payments. The checkout flow is fully client-side (Razorpay Checkout.js) — no backend server required for basic operation.

### How it works

1. User clicks "Book" on the Workshops page → redirected to `/checkout`
2. Checkout page loads Razorpay's hosted payment modal
3. On success, `razorpay_payment_id` is stored in the enrollment record
4. User is enrolled and redirected to home

### What you need to fill in

| Placeholder | Where | What to put |
|---|---|---|
| `VITE_RAZORPAY_KEY_ID` | `.env` | Your Razorpay Key ID — get from [dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys) |
| `YOUR_RAZORPAY_KEY_ID` | Vercel environment variables | Same key, set in Vercel dashboard for production |

**Test vs Live keys:**
- Development: use `rzp_test_...` key — no real money charged
- Production: use `rzp_live_...` key — real payments processed

### Adding server-side order creation (recommended for production)

The current setup skips Razorpay order creation and sets the amount client-side, which is fine for testing. For production you should:

1. Create a backend endpoint (Node/Python/etc.) that calls Razorpay's Orders API:
   ```
   POST https://api.razorpay.com/v1/orders
   { amount, currency, receipt }
   ```
   This requires your **Razorpay Key Secret** (never expose this in frontend code).
2. Pass the returned `order_id` to the `options.order_id` field in [src/pages/Checkout.jsx](src/pages/Checkout.jsx) (line with the `// order_id:` comment).
3. Add webhook verification using your **Webhook Secret** to confirm payments server-side.

| Secret | Used where | Where to get |
|---|---|---|
| Razorpay Key Secret | Backend only — never in `.env` on frontend | Razorpay Dashboard → API Keys |
| Razorpay Webhook Secret | Backend webhook handler | Razorpay Dashboard → Webhooks |

### Database column for payment ID

The `enrollments` table needs a `razorpay_payment_id` column. Add it in Supabase SQL Editor:

```sql
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
```

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
   - `VITE_RAZORPAY_KEY_ID` (use `rzp_live_...` key for production)
5. Click **Deploy**.
