const Razorpay = require('razorpay');

// Initialize Razorpay with server-side credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order. Please try again.' });
  }
}
