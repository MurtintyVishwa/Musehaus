import Razorpay from 'razorpay';

// Workshop pricing configuration (server-side only, never trust frontend amounts)
const WORKSHOP_PRICES = {
  'Paint & Create: Moulds + Mini Easels': {
    solo: 49900, // ₹499 in paise
    combo: 79900 // ₹799 in paise
  }
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate environment variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials:', { hasKeyId: !!keyId, hasKeySecret: !!keySecret });
      return res.status(500).json({
        error: 'Server configuration error: Missing Razorpay credentials',
        details: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in Vercel environment variables'
      });
    }

    // Initialize Razorpay client (inside handler to catch initialization errors)
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { workshopTitle, option } = req.body;

    // Validate required fields
    if (!workshopTitle || !option) {
      return res.status(400).json({ error: 'Missing required fields: workshopTitle and option' });
    }

    // Validate workshop title
    if (!WORKSHOP_PRICES[workshopTitle]) {
      return res.status(400).json({ error: 'Invalid workshop title' });
    }

    // Validate option (solo or combo)
    if (option !== 'solo' && option !== 'combo') {
      return res.status(400).json({ error: 'Invalid option. Must be "solo" or "combo"' });
    }

    // Get amount from server-side configuration (NEVER trust frontend amount)
    const amount = WORKSHOP_PRICES[workshopTitle][option];

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `musehaus_${Date.now()}`,
      notes: {
        workshopTitle,
        option
      }
    };

    const order = await razorpay.orders.create(options);

    // Return order details to frontend
    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });

  } catch (error) {
    console.error('create-order error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create order. Please try again.',
      details: error.toString()
    });
  }
}
