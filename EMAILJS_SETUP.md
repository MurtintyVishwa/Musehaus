# EmailJS Setup Guide for MuseHaus

This guide explains how to set up a free EmailJS account to send automated booking confirmation emails to users once they book a workshop.

---

## 📋 Step 1: Create an EmailJS Account
1. Go to [https://dashboard.emailjs.com/sign-up](https://dashboard.emailjs.com/sign-up).
2. Sign up for a free account.
3. Verify your email address and log in to the dashboard.

---

## 📧 Step 2: Add Email Service (Gmail)
1. In the EmailJS dashboard, click on **Email Services** in the left sidebar.
2. Click the **Add New Service** button.
3. Select **Gmail** from the list of services.
4. Customize the service name if desired (or leave it as `default_service`).
5. Click **Connect Account** and sign in with your workshop email address: `musehaus14@gmail.com`.
6. Grant the necessary permissions for EmailJS to send emails on your behalf.
7. Click **Create Service**.
8. Copy the **Service ID** (e.g., `service_xxxxxxx`). This is your `VITE_EMAILJS_SERVICE_ID`.

---

## 🎨 Step 3: Create the Booking Confirmation Template
1. In the left sidebar, click on **Email Templates**.
2. Click the **Create New Template** button.
3. Configure the **Settings** tab (on the right-hand panel of the editor):
   - **Name**: `MuseHaus Booking Confirmation`
   - **Subject**: `🎨 MuseHaus — Booking Confirmed!`
   - **To Email**: `{{to_email}}` (this dynamically routes to the customer's email)
   - **From Name**: `The MuseHaus Team`
   - **From Email**: `musehaus14@gmail.com` (or leave it blank to let your connected Gmail service override it)
   - **Reply To**: `{{reply_to}}` (set to `musehaus14@gmail.com` for direct customer replies)

4. Configure the **Content** body in the editor:
   Paste the following exact template text:
   
   ```text
   Hi {{to_name}},

   Your spot is confirmed! 🎉

   🎨 Workshop: {{workshop_title}}
   📅 Date: {{workshop_date}}
   📍 Location: To be announced soon
   💰 Amount Paid: {{amount_paid}}
   🎫 Booking ID: {{payment_id}}

   What to bring:
   - Just yourself and your creativity!
   - All materials are provided
   - Wear comfortable clothes

   We can't wait to create with you! 🤍

   With love,
   The MuseHaus Team ✨
   musehaus14@gmail.com
   +91 83099 78539
   ```

5. Click **Save** in the top-right corner.
6. Copy the **Template ID** (e.g., `template_xxxxxxx`) shown at the top of the editor. This is your `VITE_EMAILJS_TEMPLATE_ID`.

---

## 🔑 Step 4: Get Your Public Key
1. In the left sidebar, click on **Account** (or the **Integration** / **API Keys** section depending on your dashboard version).
2. Under the **API Keys** tab, find and copy the **Public Key** (starts with a long alphanumeric string, e.g. `user_xxxxxxxxxxxxxxxx` or similar string).
3. This is your `VITE_EMAILJS_PUBLIC_KEY`.

---

## ⚙️ Step 5: Configure Environment Variables

### A. Local Development
Add the keys to your local `.env` file:
```bash
VITE_EMAILJS_SERVICE_ID=your_copied_service_id
VITE_EMAILJS_TEMPLATE_ID=your_copied_template_id
VITE_EMAILJS_PUBLIC_KEY=your_copied_public_key
```

### B. Vercel Production Dashboard
1. Go to your [Vercel Dashboard](https://vercel.com).
2. Navigate to your `MuseHaus` project settings ➜ **Environment Variables**.
3. Add the three keys:
   - Name: `VITE_EMAILJS_SERVICE_ID`
   - Name: `VITE_EMAILJS_TEMPLATE_ID`
   - Name: `VITE_EMAILJS_PUBLIC_KEY`
4. Set the value for each environment (Production, Preview, and Development).
5. Click Save.

Once deployed on Vercel, the site will automatically fetch these credentials and start sending confirmation emails immediately upon successful registrations!
