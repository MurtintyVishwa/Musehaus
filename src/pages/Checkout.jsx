import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enrollInWorkshop, getWorkshops, checkExistingEnrollment } from '../lib/supabase';
import { ArrowLeft, ShieldCheck, CheckCircle2, QrCode, Smartphone, Info } from 'lucide-react';
import { sendBookingEmail } from '../lib/email';

// Configurable UPI details for the business
const MERCHANT_UPI_ID = '7093666568@ibl'; // Replace with your real UPI ID (GPay/PhonePe/Paytm business ID)
const MERCHANT_NAME = 'Vishwanath Murtinty';

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

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'qr'
  const [transactionId, setTransactionId] = useState(''); // Generated unique reference for tracking
  const [utrNumber, setUtrNumber] = useState(''); // User entered 12-digit UPI UTR number
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device for UPI deep linking
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android|ipad|iphone|ipod/i.test(userAgent.toLowerCase())) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      showToast('Please sign in to complete your booking', 'info');
      navigate(`/login?redirect=/checkout?workshop=${workshopId}${isCombo ? '&combo=true' : ''}`);
      return;
    }

    setLoading(true);

    // Generate a unique transaction ID for this checkout session
    const uniqueTxnId = `MSH${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setTransactionId(uniqueTxnId);

    Promise.all([
      getWorkshops(),
      checkExistingEnrollment(user.id, workshopId, isCombo)
    ]).then(([{ data: wsData }, { data: enrollData, error: enrollError }]) => {
      const found = wsData?.find((w) => w.id === workshopId);
      setWorkshop(found || null);
      setExistingEnrollment(enrollData || null);
      setLoading(false);
    }).catch(err => {
      console.error("Error during checkout load checks:", err);
      setLoading(false);
    });
  }, [workshopId, isCombo, user]);

  const price = isCombo ? 799 : (workshop?.price || 499);
  const displayPrice = isCombo ? '₹799' : `₹${workshop?.price || 499}`;
  const label = isCombo ? 'Combo (2 members)' : 'Single seat';

  // Construct UPI deep-link URL scheme
  const upiNote = `MuseHaus - ${workshop?.title ? workshop.title.substring(0, 20) : 'Workshop'}`;
  const upiUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&tr=${transactionId}&am=${price}&cu=INR&tn=${encodeURIComponent(upiNote)}`;

  // Dynamic QR Code using public qrserver API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiUrl)}`;

  const handleOpenUpiApp = () => {
    // Open UPI link - on mobile this triggers OS to list payment apps
    window.location.href = upiUrl;
    setShowVerificationForm(true);
    showToast('Redirecting to UPI apps...', 'success');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!workshop) return;

    if (!utrNumber.trim()) {
      showToast('Please enter the 12-digit UPI Ref / UTR No. to confirm.', 'error');
      return;
    }

    if (utrNumber.trim().length < 8) {
      showToast('Please enter a valid Transaction Ref / UTR number.', 'error');
      return;
    }

    setPaying(true);

    try {
      // Enroll user directly in Supabase/mock layer with the entered UTR and generated transaction reference
      const { error } = await enrollInWorkshop(
        user.id,
        workshopId,
        utrNumber,      // repurposed: stores user entered UTR as booking payment reference
        transactionId,  // repurposed: stores unique tracking reference
        isCombo
      );

      if (error) {
        if (error.message.includes('already enrolled')) {
          showToast('You are already registered for this workshop option. ✦', 'info');
          navigate('/');
        } else {
          showToast(error.message || 'Booking verification failed. Please check UTR.', 'error');
        }
      } else {
        showToast('Spot reserved successfully! We are verifying your payment. ✦', 'success');

        // Send confirmation email asynchronously (silent logging on failure)
        const emailParams = {
          toName: user.full_name || 'Art Lover',
          toEmail: user.email,
          workshopTitle: workshop.title,
          workshopDate: `${workshop.date} at ${workshop.time}`,
          amountPaid: price.toString(),
          paymentId: utrNumber
        };

        sendBookingEmail(emailParams).catch((err) => {
          console.error('[Checkout] Failed to trigger sendBookingEmail:', err);
        });

        navigate('/');
      }
    } catch (error) {
      console.error('Booking confirmation error:', error);
      showToast(error.message || 'Verification failed. Please try again.', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-cream flex items-center justify-center">
        <p className="text-muted font-light text-sm">Loading...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen pt-16 bg-cream flex items-center justify-center">
        <p className="text-muted font-light text-sm">Workshop not found.</p>
      </div>
    );
  }

  if (existingEnrollment) {
    return (
      <div className="min-h-screen pt-16 bg-cream text-ink pb-24">
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
                <span className="block font-sans font-semibold text-ink/75 mb-1">Booking Reference ID / UTR:</span>
                {existingEnrollment.razorpay_payment_id}
              </div>
            )}

            <div className="w-full flex flex-col sm:flex-row gap-4 mt-4 justify-center">
              <Link
                to="/"
                className="w-full sm:w-1/2 bg-transparent hover:bg-ink/5 text-ink border border-ink/30 text-xs uppercase tracking-[0.15em] font-bold py-4 rounded-sm transition-all duration-300 text-center select-none"
              >
                Back to Home
              </Link>
              <Link
                to="/workshops"
                className="w-full sm:w-1/2 bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.15em] font-bold py-4 rounded-sm transition-all duration-300 text-center select-none shadow-md shadow-terra/10 border border-terra/20"
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
    <div className="min-h-screen pt-16 bg-cream text-ink pb-24">
      {/* Header */}
      <header className="bg-ink text-cream py-14 px-6 md:px-12 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold">Secure Checkout</span>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">
            Select <span className="italic text-terra">Payment Method</span>
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

          <div className="border-t border-ink/10 pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted font-light">{label}</span>
              <span className="font-semibold">{displayPrice}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-ink/10 pt-3">
              <span>Total Amount</span>
              <span className="text-terra">{displayPrice}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="border-t border-ink/10 pt-6">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted block mb-3">Pay via UPI</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setPaymentMethod('upi'); if (!isMobile) setShowVerificationForm(true); }}
                className={`py-3.5 px-4 rounded-sm border flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold transition-all ${paymentMethod === 'upi'
                  ? 'border-terra bg-terra/5 text-terra shadow-sm'
                  : 'border-ink/15 hover:border-ink/30 text-muted'
                  }`}
              >
                <Smartphone size={15} />
                UPI App Link
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMethod('qr'); setShowVerificationForm(true); }}
                className={`py-3.5 px-4 rounded-sm border flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold transition-all ${paymentMethod === 'qr'
                  ? 'border-terra bg-terra/5 text-terra shadow-sm'
                  : 'border-ink/15 hover:border-ink/30 text-muted'
                  }`}
              >
                <QrCode size={15} />
                Scan QR Code
              </button>
            </div>
          </div>

          {/* Payment Options View */}
          <div className="bg-cream/45 rounded-lg p-6 border border-ink/5 flex flex-col items-center">
            {paymentMethod === 'upi' ? (
              <div className="w-full flex flex-col items-center gap-4 text-center">
                {isMobile ? (
                  <>
                    <p className="text-xs text-muted font-light leading-relaxed">
                      Click the button below to initiate payment directly using your phone's installed UPI apps (GPay, PhonePe, Paytm, BHIM, etc.).
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenUpiApp}
                      className="w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-300 shadow-md"
                    >
                      Open UPI Apps (₹{price})
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2 bg-terra/5 border border-terra/20 rounded-md p-3 text-left">
                      <Info size={16} className="text-terra shrink-0 mt-0.5" />
                      <p className="text-[11px] text-ink font-light leading-relaxed">
                        <strong>Desktop detected:</strong> Direct UPI App launching is supported on mobile devices. Please switch to the <strong>Scan QR Code</strong> tab to pay with your mobile.
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4 text-center">
                <p className="text-xs text-muted font-light leading-relaxed">
                  Scan this dynamic QR code using Google Pay, PhonePe, Paytm, or any banking UPI app on your phone.
                </p>

                {/* Dynamic QR Code */}
                <div className="bg-white p-3 rounded-lg border border-ink/10 shadow-sm animate-fade-in">
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 block object-contain"
                  />
                </div>

                <div className="text-[10px] text-muted font-light flex flex-col gap-0.5">
                  <span>Payee: <span className="font-semibold text-ink">{MERCHANT_NAME}</span></span>
                  <span>UPI ID: <span className="font-semibold text-ink">{MERCHANT_UPI_ID}</span></span>
                  <span>Amount: <span className="font-semibold text-ink">₹{price}</span></span>
                  <span>Txn Ref: <span className="font-mono text-ink/80 text-[9px]">{transactionId}</span></span>
                </div>
              </div>
            )}
          </div>

          {/* Verification UTR Form */}
          {showVerificationForm && (
            <form onSubmit={handleBookingSubmit} className="border-t border-ink/10 pt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted flex justify-between">
                  <span>UPI Transaction Ref / UTR No.</span>
                  <span className="text-[9px] lowercase font-normal italic">12-digit number from payment receipt</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="e.g. 618392019485"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="bg-warm/25 border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors w-full tracking-wider font-mono text-center"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full bg-ink hover:bg-ink/90 disabled:opacity-60 text-cream text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} />
                {paying ? 'Verifying...' : 'Verify & Complete Booking'}
              </button>
            </form>
          )}

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted border-t border-ink/5 pt-4">
            <ShieldCheck size={13} className="text-terra" />
            <span>Registration is verified and secured by MuseHaus</span>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted mt-6 font-light">
          All materials and supplies are included. No hidden charges.
        </p>
      </main>
    </div>
  );
}
