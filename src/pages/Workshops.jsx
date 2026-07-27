import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { getWorkshops } from '../lib/supabase';

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #f5f0e8 0%, #e8d5c4 40%, #c8704a 100%)';

function getStatusLabel(status) {
  switch (status) {
    case 'sold-out':
      return 'Sold Out';
    case 'almost-full':
      return 'Almost Full';
    case 'ongoing':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'upcoming':
    case 'open':
    default:
      return 'Upcoming Event';
  }
}

function isBookable(status) {
  return !['sold-out', 'completed', 'cancelled'].includes(status);
}

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadWorkshops = async () => {
      setLoading(true);
      try {
        const { data } = await getWorkshops();
        if (!cancelled && data) {
          setWorkshops(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWorkshops();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-cream min-h-screen text-ink pb-24">
      <header className="bg-ink text-cream py-20 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,240,232,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(245,240,232,0.01)_1px,_transparent_1px)] bg-[size:30px_30px]" />
        <div className="max-w-3xl mx-auto z-10 relative flex flex-col items-center gap-3">
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold">
            Summer 2026
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-light tracking-wide">
            Upcoming <span className="italic text-terra">Workshops</span>
          </h1>
          <p className="text-sm md:text-base text-muted max-w-xl font-light leading-relaxed mt-2">
            Explore our creative workshops. All materials and supplies included.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-12 mt-16 flex flex-col gap-10">
        {loading ? (
          <div className="h-96 rounded-2xl bg-warm/20 animate-pulse border border-ink/5" />
        ) : workshops.length === 0 ? (
          <p className="text-center text-sm text-muted font-light py-12">
            No workshops scheduled yet — check back soon! 🤍
          </p>
        ) : (
          workshops.map((workshop) => {
            const comboPrice = workshop.combo_price ?? 799;
            const description = workshop.description
              || 'Create beautiful art and take home your own handmade keepsakes.';
            const gradientStyle = workshop.gradient_style
              ? { background: `linear-gradient(135deg, #f5f0e8 0%, #e8d5c4 40%, #c8704a 100%)` }
              : { background: DEFAULT_GRADIENT };
            const bookable = isBookable(workshop.status);

            return (
              <div
                key={workshop.id}
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-terra/20"
                style={gradientStyle}
              >
                <div className="absolute top-6 right-6 z-10">
                  <span className="bg-terra text-cream text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-full shadow-lg">
                    {getStatusLabel(workshop.status)}
                  </span>
                </div>

                <div className="p-10 md:p-14 flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h2 className="font-serif text-3xl md:text-5xl font-medium text-ink leading-tight tracking-wide">
                      {workshop.title}
                    </h2>
                    <p className="text-base md:text-lg text-ink/75 font-light leading-relaxed max-w-lg">
                      {description}
                    </p>
                  </div>

                  <div className="w-16 h-[2px] bg-terra rounded-full" />

                  <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cream/60 flex items-center justify-center border border-terra/30 shrink-0">
                        <Calendar size={18} className="text-terra" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-ink/50 font-semibold">Date</p>
                        <p className="text-sm font-semibold text-ink">{workshop.date}</p>
                        {workshop.time && (
                          <p className="text-xs text-ink/60 font-light">{workshop.time}</p>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-terra/40" />

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-ink/50 font-semibold">Pricing</p>
                      <p className="text-sm font-semibold text-ink">₹{workshop.price} per person</p>
                      <p className="text-xs text-ink/60 font-light">Combo (2 members) ₹{comboPrice}</p>
                    </div>

                    {workshop.seats_remaining != null && (
                      <>
                        <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-terra/40" />
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-ink/50 font-semibold">Seats</p>
                          <p className="text-sm font-semibold text-ink">
                            {workshop.seats_remaining} of {workshop.seats_total} remaining
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-base font-serif italic text-terra/90 font-medium">
                    Art • Friends • Memories ✨
                  </p>

                  {bookable && (
                    <div className="mt-2 flex flex-col sm:flex-row gap-3">
                      <Link
                        to={`/checkout?workshop=${workshop.id}`}
                        className="inline-flex items-center gap-2 bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-sm transition-all duration-300 shadow-xl shadow-terra/20 border border-terra/20 group"
                      >
                        <span>Book — ₹{workshop.price}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        to={`/checkout?workshop=${workshop.id}&combo=true`}
                        className="inline-flex items-center gap-2 bg-transparent hover:bg-terra/10 text-terra text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-sm transition-all duration-300 border border-terra/40 group"
                      >
                        <span>Combo (2) — ₹{comboPrice}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {!loading && workshops.length > 0 && (
          <p className="text-center text-xs text-muted font-light">
            More workshops coming soon — stay tuned! 🤍
          </p>
        )}
      </main>
    </div>
  );
}
