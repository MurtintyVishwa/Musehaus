import emailjs from '@emailjs/browser';

// Retrieve environment variables
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

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
 * @param {string} params.paymentId - Razorpay payment ID (acting as booking ID)
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
  const templateParams = {
    to_name: toName,
    to_email: toEmail,
    workshop_title: workshopTitle,
    workshop_date: workshopDate,
    amount_paid: amountPaid,
    payment_id: paymentId,
    reply_to: 'musehaus14@gmail.com'
  };

  // Check if we are missing any credentials
  const hasCredentials = SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY;

  if (!hasCredentials) {
    console.warn(
      "[MuseHaus Email] Missing VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY in environment variables."
    );
    console.log("[MuseHaus Email] Fallback Mock Send Log:", templateParams);
    return true; // Return true so checkout logic behaves successfully in mock/development mode
  }

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    console.log('[MuseHaus Email] Email successfully sent!', response.status, response.text);
    return true;
  } catch (error) {
    console.error('[MuseHaus Email] Failed to send email confirmation:', error);
    return false; // Return false to indicate failure, but calling page should not block UI flow
  }
}
