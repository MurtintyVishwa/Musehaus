const crypto = require('crypto');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the key secret from environment variables
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('Missing RAZORPAY_KEY_SECRET in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing RAZORPAY_KEY_SECRET',
        details: 'RAZORPAY_KEY_SECRET must be set in Vercel environment variables'
      });
    }

    // Generate HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare generated signature with received signature
    if (generatedSignature === razorpay_signature) {
      // Payment is verified genuine
      res.status(200).json({ verified: true });
    } else {
      // Signature mismatch - payment was tampered with or fake
      res.status(400).json({ verified: false, error: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('verify-payment error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to verify payment. Please try again.',
      details: error.toString()
    });
  }
}
