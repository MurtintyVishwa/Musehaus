import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Workshops() {
  return (
    <div className="bg-cream min-h-screen text-ink pb-24">

      {/* SECTION 1 — Page Header */}
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

      {/* SECTION 2 — Single Workshop Card */}
      <main className="max-w-3xl mx-auto px-6 md:px-12 mt-16">
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-terra/20"
          style={{
            background: 'linear-gradient(135deg, #f5f0e8 0%, #e8d5c4 40%, #c8704a 100%)'
          }}
        >
          {/* Upcoming Event Badge */}
          <div className="absolute top-6 right-6 z-10">
            <span className="bg-terra text-cream text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-full shadow-lg">
              Upcoming Event
            </span>
          </div>

          {/* Card Body */}
          <div className="p-10 md:p-14 flex flex-col gap-6">

            {/* Title & Subtitle */}
            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-3xl md:text-5xl font-medium text-ink leading-tight tracking-wide">
                🎨 MuseHaus: Tray Painting Workshop
              </h2>
              <p className="text-base md:text-lg text-ink/75 font-light leading-relaxed max-w-lg">
                Paint your own beautiful decorative tray and take home a handmade keepsake.
              </p>
            </div>

            {/* Divider */}
            <div className="w-16 h-[2px] bg-terra rounded-full" />

            {/* Details Row */}
            <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cream/60 flex items-center justify-center border border-terra/30 shrink-0">
                  <Calendar size={18} className="text-terra" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink/50 font-semibold">Date</p>
                  <p className="text-sm font-semibold text-ink">Saturday, July 6</p>
                </div>
              </div>

              {/* Divider dot */}
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-terra/40" />

              {/* Price */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink/50 font-semibold">Pricing</p>
                <p className="text-sm font-semibold text-ink">₹399 per person</p>
                <p className="text-xs text-ink/60 font-light">Combo (2 people) ₹599</p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-base font-serif italic text-terra/90 font-medium">
              Art • Friends • Memories ✨
            </p>

            {/* CTA Button */}
            <div className="mt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-sm transition-all duration-300 shadow-xl shadow-terra/20 border border-terra/20 group"
              >
                <span>Register Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-muted mt-10 font-light">
          More workshops coming soon — stay tuned! 🤍
        </p>
      </main>

    </div>
  );
}
