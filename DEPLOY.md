# MuseHaus Deployment Checklist

Follow these exact steps to push MuseHaus live.

---

## Step 1 — Push to GitHub

1. Go to [github.com](https://github.com) and click **New Repository**.
2. Name the repository: `musehaus`
3. Set the visibility to **Public** (or Private if you prefer).
4. Do **NOT** check any boxes to initialize with a README, `.gitignore`, or license (we already have these configured locally).
5. Click **Create repository**.
6. Copy the remote URL (e.g. `https://github.com/yourusername/musehaus.git`).
7. Open your terminal in the `musehaus` project folder and run:
   ```bash
   git remote add origin <your-copied-repo-url>
   git branch -M main
   git push -u origin main
   ```

---

## Step 2 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in with your GitHub account.
2. In the Vercel dashboard, click **Add New** → **Project**.
3. Import the `musehaus` repository from your list.
4. Configure the following project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click on **Environment Variables** and add the following keys (you can use temporary mock values if you haven't set up Supabase yet):
   - `VITE_SUPABASE_URL` = (your Supabase project URL)
   - `VITE_SUPABASE_ANON_KEY` = (your Supabase anon public key)
6. Click **Deploy**. Vercel will build the React bundle and deploy your site to a public `.vercel.app` URL.

---

## Step 3 — Connect Supabase (when ready)

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase project dashboard, navigate to the **SQL Editor** on the left menu.
3. Click **New query**, paste the entire contents of the `schema.sql` file located in the root of your project, and click **Run**.
4. Go to **Project Settings** → **API**.
5. Copy the **Project URL** and **anon public key**.
6. Open Vercel, go to your `musehaus` project settings, choose **Environment Variables**, and update the values of `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the keys copied from Supabase.
7. Redeploy the latest commit from your Vercel project dashboard to apply the changes.
8. Make sure `MOCK_MODE_SETTING = false` is active in `src/lib/supabase.js` to start using your live DB.

---

## Step 4 — Test Live Site

Once deployed, visit your Vercel URL and check the following paths and operations:

- [ ] **Home Page (`/`)**: Verify the Hero, Intro details, Testimonial buttons, and newsletter strip subscription form behave properly.
- [ ] **Workshops Page (`/workshops`)**: Confirm the sticky medium/difficulty filters execute correctly and update cards dynamically.
- [ ] **Register Page (`/register`)**: Register a test account and verify validation limits (email regex, password match, etc.).
- [ ] **Login Page (`/login`)**: Log into the newly created account.
- [ ] **Contact Page (`/contact`)**: Verify contact row entries, sending a test enquiry, and make sure the pulsing vector marker maps correctly.
- [ ] **Mobile Responsiveness**: Collapse the browser screen and verify that the Navbar hamburger drawer opens, and that grid elements layout correctly under narrow widths.
- [ ] **SPA Reloads**: Refresh your page on subroutes (e.g. `/workshops` or `/contact`) to verify `vercel.json` rewrites prevent 404 errors.
- [ ] **Zero Console Errors**: Open the DevTools console (F12) to verify there are no active runtime warnings.
