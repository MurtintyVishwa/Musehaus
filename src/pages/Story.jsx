import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Story() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0e8' }}>
      {/* Hero Header */}
      <header className="py-24 px-6 text-center relative overflow-hidden">
        {/* Soft background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,112,74,0.08) 0%, transparent 70%)'
          }}
        />

        <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center gap-5">
          {/* Eyebrow */}
          <span
            className="text-xs uppercase tracking-[0.3em] font-semibold"
            style={{ color: '#c8704a', fontFamily: 'DM Sans, sans-serif' }}
          >
            About Us
          </span>

          {/* Main heading */}
          <h1
            className="text-5xl md:text-7xl font-light leading-tight tracking-wide"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a1a18' }}
          >
            Our Story
          </h1>

          {/* Subheading */}
          <p
            className="text-lg md:text-2xl italic font-light"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#c8704a' }}
          >
            ✨ Six Friends, One Creative Dream ✨
          </p>

          {/* Terracotta divider */}
          <div
            className="w-20 h-[2px] rounded-full mt-2"
            style={{ backgroundColor: '#c8704a' }}
          />
        </div>
      </header>

      {/* Story Body */}
      <section className="max-w-2xl mx-auto px-6 pb-24 flex flex-col gap-8">
        <p
          className="text-lg leading-[1.9] font-light"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#4a4a42' }}
        >
          MuseHaus began with six friends, endless cups of coffee, and a shared love for creating
          beautiful things. What started as simple conversations about art, creativity, and
          meaningful experiences slowly grew into a dream we couldn't stop talking about.
        </p>

        <p
          className="text-lg leading-[1.9] font-light"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#4a4a42' }}
        >
          We wanted to build more than just workshops — we wanted to create a cozy little space
          where people could unwind, explore their creativity, meet new friends, and leave with
          something made by their own hands.
        </p>

        <p
          className="text-lg leading-[1.9] font-light"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#4a4a42' }}
        >
          From tray painting and clay art to fridge magnets and future creative adventures, every
          MuseHaus workshop is designed to be fun, welcoming, and filled with happy memories.
          Whether you're an experienced artist or someone picking up a paintbrush for the first
          time, there's always a place for you here.
        </p>

        <p
          className="text-lg leading-[1.9] font-light"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#4a4a42' }}
        >
          At MuseHaus, we believe art isn't about perfection. It's about creating, connecting,
          laughing, and enjoying the little moments that make life beautiful.
        </p>

        {/* Closing highlight */}
        <div
          className="mt-4 px-8 py-6 rounded-xl border text-center"
          style={{
            background: 'linear-gradient(135deg, #f0e8dc 0%, #e8d5c4 100%)',
            borderColor: 'rgba(200,112,74,0.25)'
          }}
        >
          <p
            className="text-lg md:text-xl font-medium leading-relaxed"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a1a18' }}
          >
            🤍 Welcome to MuseHaus — a home of creativity, friendship, and inspiration.
          </p>
        </div>

        {/* Terracotta divider */}
        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(200,112,74,0.25)' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c8704a' }} />
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(200,112,74,0.25)' }} />
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            to="/workshops"
            className="inline-flex items-center gap-2 text-cream text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-sm transition-all duration-300 shadow-xl group"
            style={{
              backgroundColor: '#c8704a',
              border: '1px solid rgba(200,112,74,0.3)',
              fontFamily: 'DM Sans, sans-serif'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b5623f')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#c8704a')}
          >
            <span>View Upcoming Workshops</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
