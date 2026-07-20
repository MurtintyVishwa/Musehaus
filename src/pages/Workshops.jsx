import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { getWorkshops } from '../lib/supabase';

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkshops().then(({ data }) => {
      setWorkshops(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-cream min-h-screen text-ink pb-24">

      {/* Page Header */}
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

      {/* Workshops Grid */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-14">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-muted text-sm font-light">Loading workshops...</p>
          </div>
        ) : workshops.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen size={40} className="text-terra/40 mx-auto mb-4" />
            <p className="text-muted text-sm font-light">No workshops scheduled yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((w) => (
              <div
                key={w.id}
                className="bg-white border border-ink/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between gap-5"
              >
                {/* Card Top */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-terra uppercase font-bold tracking-widest block">
                    {w.medium} &middot; {w.level}
                  </span>
                  <h3 className="font-serif text-xl font-medium text-ink leading-snug">{w.title}</h3>
                  <p className="text-xs text-muted font-light mt-1">
                    Instructor: <span className="font-semibold text-ink">{w.instructor_name}</span>
                  </p>
                </div>

                {/* Card Bottom */}
                <div className="border-t border-ink/5 pt-4 flex flex-col gap-2.5 text-xs text-muted font-light">
                  <div className="flex items-center gap-2 text-ink/75">
                    <Calendar size={13} className="text-terra" />
                    <span>{w.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} />
                    <span>{w.time}</span>
                  </div>

                  {/* Price + Seats Row */}
                  <div className="flex justify-between items-center mt-3 border-t border-ink/5 pt-3">
                    <span className="text-ink font-semibold">₹{w.price}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        w.status === 'sold-out'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : w.status === 'almost-full'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      {w.seats_remaining} / {w.seats_total} Seats Left
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted mt-12 font-light">
          More workshops coming soon — stay tuned! 🤍
        </p>
      </main>
    </div>
  );
}
