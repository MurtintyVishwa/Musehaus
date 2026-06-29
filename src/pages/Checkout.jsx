import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enrollInWorkshop, getWorkshops } from '../lib/supabase';
import { ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const workshopId = parseInt(searchParams.get('workshop')) || 1;
  const isCombo = searchParams.get('combo') === 'true';

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/checkout?workshop=${workshopId}${isCombo ? '&combo=true' : ''}`);
      return;
    }
    getWorkshops().then(({ data }) => {
      const found = data?.find((w) => w.id === workshopId);
      setWorkshop(found || null);
      setLoading(false);
    });
  }, [workshopId]);

  const price = isCombo ? 799 : (workshop?.price || 499);
  const displayPrice = isCombo ? '₹799' : `₹${workshop?.price || 499}`;
  const label = isCombo ? 'Combo (2 members)' : 'Single seat';

  const handlePayment = async () => {
    if (!workshop) return;

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      showToast('Failed to load payment gateway. Check your internet connection.', 'error');
      return;
    }

    setPaying(true);

    // ponytail: no backend order creation — amount set client-side.
    // For production, create a Razorpay order server-side and pass order_id here.
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: price * 100, // paise
      currency: 'INR',
      name: 'MuseHaus',
      description: workshop.title,
      image: '',
      // order_id: '<SERVER_GENERATED_ORDER_ID>', // add when you have a backend
      prefill: {
        name: user?.full_name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      config: {
        display: {
          blocks: {
            upi: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] },
            other: { name: 'Other Methods', instruments: [{ method: 'card' }, { method: 'netbanking' }, { method: 'wallet' }] },
          },
          sequence: ['block.upi', 'block.other'],
          preferences: { show_default_blocks: false },
        },
      },
      theme: {
        color: '#c0623a',
      },
      handler: async (response) => {
        // Payment successful — enroll user
        const { error } = await enrollInWorkshop(
          user.id,
          workshopId,
          response.razorpay_payment_id
        );

        if (error) {
          showToast(error.message || 'Enrollment failed after payment. Contact support.', 'error');
        } else {
          showToast('Payment successful! You are enrolled. ✦', 'success');
          navigate('/');
        }
        setPaying(false);
      },
      modal: {
        ondismiss: () => {
          setPaying(false);
          showToast('Payment cancelled.', 'info');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      showToast(`Payment failed: ${response.error.description}`, 'error');
      setPaying(false);
    });
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted font-light text-sm">Loading...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted font-light text-sm">Workshop not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-ink pb-24">
      {/* Header */}
      <header className="bg-ink text-cream py-14 px-6 md:px-12 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold">Secure Checkout</span>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">
            Complete Your <span className="italic text-terra">Booking</span>
          </h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 md:px-8 mt-12">
        {/* Back link */}
        <Link
          to="/workshops"
          className="inline-flex items-center gap-2 text-xs text-muted hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Workshops
        </Link>

        {/* Order summary card */}
        <div className="bg-white border border-ink/10 rounded-xl shadow-lg p-8 flex flex-col gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-1">Workshop</p>
            <h2 className="font-serif text-xl font-medium text-ink">{workshop.title}</h2>
            <p className="text-xs text-muted mt-1">{workshop.date} &middot; {workshop.time}</p>
          </div>

          <div className="border-t border-ink/10 pt-4 flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted font-light">{label}</span>
              <span className="font-semibold">{displayPrice}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-ink/10 pt-3">
              <span>Total</span>
              <span className="text-terra">{displayPrice}</span>
            </div>
          </div>

          {/* Booking info */}
          {user && (
            <div className="bg-cream/60 rounded-lg p-4 text-xs text-muted font-light flex flex-col gap-1">
              <span className="font-semibold text-ink/70">Booking for:</span>
              <span>{user.full_name}</span>
              <span>{user.email}</span>
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full bg-terra hover:bg-terra/90 disabled:opacity-60 text-cream text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2"
          >
            <CreditCard size={15} />
            {paying ? 'Processing...' : `Pay ${displayPrice} via Razorpay`}
          </button>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted">
            <ShieldCheck size={13} className="text-terra" />
            <span>Payments secured by Razorpay</span>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted mt-6 font-light">
          All materials and supplies are included. No hidden charges.
        </p>
      </main>
    </div>
  );
}
