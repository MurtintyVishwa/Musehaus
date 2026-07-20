import emailjs from '@emailjs/browser';

/**
 * Sends a booking confirmation email using EmailJS.
 * Handles fallback logs if credentials are missing to ensure no crashes during local development/demo.
 *
 * @param {Object} params
 * @param {string} params.toName - Name of the user booking the slot
 * @param {string} params.toEmail - Email address of the user
 * @param {string} params.workshopTitle - Title of the workshop
 * @param {string} params.workshopDate - Human-readable date of the workshop
 * @param {string} params.amountPaid - Total amount paid (e.g. "499" or "799")
 * @param {string} params.paymentId - Booking reference ID (e.g. MSH-XXXXXXXX)
 * @returns {Promise<boolean>} True if sent successfully or fallback was used, false on active error.
 */
export async function sendBookingEmail({
  toName,
  toEmail,
  workshopTitle,
  workshopDate,
  amountPaid,
  paymentId
}) {
  // Read env vars at call time (not at module load) to ensure Vite has injected them
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

  const templateParams = {
    to_name: toName,
    to_email: toEmail,           // recipient email — passed to {{to_email}} in template
    workshop_title: workshopTitle,
    workshop_date: workshopDate,
    amount_paid: `₹${amountPaid}`,
    payment_id: paymentId,
    reply_to: toEmail            // customer's email so any reply goes back to them
  };

  // Debug log — always logged so you can verify params in the browser console
  console.log('[MuseHaus Email] Attempting to send booking confirmation:', {
    SERVICE_ID: SERVICE_ID ? `${SERVICE_ID.slice(0, 8)}...` : '(missing)',
    TEMPLATE_ID: TEMPLATE_ID ? `${TEMPLATE_ID.slice(0, 10)}...` : '(missing)',
    PUBLIC_KEY: PUBLIC_KEY ? `${PUBLIC_KEY.slice(0, 8)}...` : '(missing)',
    templateParams
  });

  // Check if we are missing any credentials
  const hasCredentials = SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY;

  if (!hasCredentials) {
    console.warn(
      '[MuseHaus Email] Missing VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY in environment variables. Skipping email send.'
    );
    return true; // Non-blocking in demo/development mode
  }

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    console.log('[MuseHaus Email] ✅ Email sent successfully!', response.status, response.text);
    return true;
  } catch (error) {
    console.error('[MuseHaus Email] ❌ Failed to send email confirmation:', error);
    return false; // Non-blocking — payment already succeeded
  }
}
