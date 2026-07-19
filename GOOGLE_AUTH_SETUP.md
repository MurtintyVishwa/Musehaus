# Google OAuth Setup Guide for MuseHaus

To enable Google sign-in on the MuseHaus website via Supabase, follow these step-by-step instructions:

---

## Part 1: Create Credentials in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project or create a new one (e.g., `MuseHaus`).
3. Open the left menu, go to **APIs & Services** > **OAuth consent screen**:
   - Choose **External** user type and click **Create**.
   - Fill in the required **App information** (App name: `MuseHaus`, User support email, Developer contact email).
   - Click **Save and Continue** through the scopes and test users sections.
   - Click **Back to Dashboard** and make sure you click **Publish App** to move it out of testing mode.
4. Go to **APIs & Services** > **Credentials**:
   - Click **+ Create Credentials** at the top and select **OAuth client ID**.
   - Set the Application type to **Web application**.
   - Name it (e.g., `MuseHaus Web App`).
   - Under **Authorized JavaScript origins**, add:
     ```
     https://tfewvqhvqesgctpyndqu.supabase.co
     https://musehaus.vercel.app
     http://localhost:5173
     ```
   - Under **Authorized redirect URIs**, add the callback URL from your Supabase project:
     ```
     https://tfewvqhvqesgctpyndqu.supabase.co/auth/v1/callback
     ```
   - Click **Create**.
5. Copy the generated **Client ID** and **Client Secret**.

---

## Part 2: Configure Google Provider in Supabase

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and open your project (`tfewvqhvqesgctpyndqu`).
2. Go to **Authentication** > **Providers** in the sidebar.
3. Click on the **Google** provider to expand its settings:
   - Toggle **Enable Google provider** to ON.
   - Paste the **Client ID** copied from the Google Cloud Console.
   - Paste the **Client Secret** copied from the Google Cloud Console.
   - Click **Save**.

---

## Part 3: Verify the Flow

1. Push your latest code changes to Vercel.
2. Go to `https://musehaus.vercel.app/login` or `https://musehaus.vercel.app/register`.
3. Click **Continue with Google**.
4. The site will open Google's account picker, and after authorization, you will be redirected back to the MuseHaus homepage, logged in automatically.
