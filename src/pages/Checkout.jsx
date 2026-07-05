import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enrollInWorkshop, getWorkshops, checkExistingEnrollment } from '../lib/supabase';
import { ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';
import { sendBookingEmail } from '../lib/email';

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
  const [existingEnrollment, setExistingEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user) {
      showToast('Please sign in to complete your booking', 'info');
      navigate(`/login?redirect=/checkout?workshop=${workshopId}${isCombo ? '&combo=true' : ''}`);
      return;
    }
    
    setLoading(true);
    console.log("Checking existing enrollment for user:", user?.id, "workshopId:", workshopId, "type of workshopId:", typeof workshopId);
    Promise.all([
      getWorkshops(),
      checkExistingEnrollment(user.id, workshopId)
    ]).then(([{ data: wsData }, { data: enrollData, error: enrollError }]) => {
      console.log("Existing enrollment check returned data:", enrollData, "error:", enrollError);
      const found = wsData?.find((w) => w.id === workshopId);
      setWorkshop(found || null);
      setExistingEnrollment(enrollData || null);
      setLoading(false);
    }).catch(err => {
      console.error("Error during checkout load checks:", err);
      setLoading(false);
    });
  }, [workshopId, user]);

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

    try {
      // Step 1: Create order server-side
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workshopTitle: workshop.title,
          option: isCombo ? 'combo' : 'solo'
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Step 2: Open Razorpay checkout with server-generated order
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MuseHaus',
        description: workshop.title,
        order_id: orderData.order_id, // Server-generated order ID
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
          console.log('Payment successful, Razorpay response:', response);
          
          // Step 3: Verify payment server-side
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();
          console.log('Payment verification result:', verifyData);

          if (!verifyResponse.ok || !verifyData.verified) {
            showToast('Payment verification failed. Please contact us if money was deducted.', 'error');
            setPaying(false);
            return;
          }

          // Step 4: Payment verified - enroll user
          const { error } = await enrollInWorkshop(
            user.id,
            workshopId,
            response.razorpay_payment_id,
            response.razorpay_order_id
          );

          console.log('Enrollment result:', { error });
          if (error) {
            // If already enrolled, still redirect to home with info message
            if (error.message.includes('already enrolled')) {
              showToast('Payment successful! You were already enrolled in this workshop. ✦', 'success');
              console.log('Redirecting to home page...');
              navigate('/');
            } else {
              showToast(error.message || 'Enrollment failed after payment. Contact support.', 'error');
            }
          } else {
            showToast('Payment successful! You are enrolled. ✦', 'success');
            console.log('Redirecting to home page...');

            // Send confirmation email asynchronously (silent logging on failure)
            const emailParams = {
              toName: user.full_name || 'Art Lover',
              toEmail: user.email,
              workshopTitle: workshop.title,
              workshopDate: `${workshop.date} at ${workshop.time}`,
              amountPaid: price.toString(),
              paymentId: response.razorpay_payment_id
            };
            console.log('[Checkout] Sending booking email with params:', emailParams);
            sendBookingEmail(emailParams).catch((err) => {
              console.error('[Checkout] Failed to trigger sendBookingEmail:', err);
            });

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

    } catch (error) {
      console.error('Payment error:', error);
      showToast(error.message || 'Payment failed. Please try again.', 'error');
      setPaying(false);
    }
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

  if (existingEnrollment) {
    return (
      <div className="min-h-screen bg-cream text-ink pb-24">
        {/* Header */}
        <header className="bg-ink text-cream py-14 px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
            <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold">Booking Confirmed</span>
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">
              Already <span className="italic text-terra">Registered</span>
            </h1>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-6 md:px-8 mt-12">
          <div className="bg-white border border-ink/10 rounded-xl shadow-lg p-8 flex flex-col items-center text-center gap-6">
            <div className="text-6xl animate-bounce">🎨</div>
            
            <div className="flex flex-col gap-2">
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink">
                You're already registered!
              </h2>
              <p className="text-sm text-muted font-light leading-relaxed">
                We have your spot saved for the <span className="font-semibold text-ink">{workshop.title}</span> workshop on <span className="font-semibold text-ink">{workshop.date}</span>. We can't wait to see you! 🤍
              </p>
            </div>

            {existingEnrollment.razorpay_payment_id && (
              <div className="w-full bg-cream/60 rounded-lg p-4 text-xs text-muted font-mono select-all">
                <span className="block font-sans font-semibold text-ink/75 mb-1">Booking Reference ID:</span>
                {existingEnrollment.razorpay_payment_id}
              </div>
            )}

            <div className="w-full flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                to="/"
                className="flex-grow sm:flex-grow-0 bg-transparent hover:bg-ink/5 text-ink border border-ink/35 text-xs uppercase tracking-[0.2em] font-bold py-4 rounded-sm transition-all duration-300 text-center flex-1"
              >
                Back to Home
              </Link>
              <Link
                to="/workshops"
                className="flex-grow sm:flex-grow-0 bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.2em] font-bold py-4 rounded-sm transition-all duration-300 text-center flex-1 shadow-md"
              >
                View Workshops
              </Link>
            </div>
          </div>
        </main>
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
