import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Award, Compass, Sparkles } from 'lucide-react';
import { getWorkshops, enrollInWorkshop, getUserEnrollments } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import WorkshopCard from '../components/WorkshopCard';

// Testimonials hardcoded data
const TESTIMONIALS = [
  {
    id: 1,
    quote: "MuseHaus redefined how I view clay. The workshop environment is peaceful, refined, and Kenji's guidance is masterly. It's a genuine luxury escape in the middle of the city.",
    author: "Elena Rostova",
    role: "Collector & Ceramicist",
    initials: "ER"
  },
  {
    id: 2,
    quote: "The Stone Carving workshop was spectacular. Working with high-grade marble in a space that feels like a temple to craftsmanship is an experience I will never forget.",
    author: "Marcus Thorne",
    role: "Architectural Designer",
    initials: "MT"
  },
  {
    id: 3,
    quote: "Marina Voss taught us to search for light. My painting technique transformed in just one weekend. Every details — from the organic linen aprons to the organic teas — was curated.",
    author: "Sophia Sterling",
    role: "Visual Artist",
    initials: "SS"
  }
];

export default function Home() {
  const [workshops, setWorkshops] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: wsData } = await getWorkshops();
      if (wsData) {
        // Take the top 3 workshops for the Home page
        setWorkshops(wsData.slice(0, 3));
      }
      
      if (user) {
        const { data: enData } = await getUserEnrollments(user.id);
        if (enData) {
          setEnrolledIds(enData.map(e => e.workshop_id));
        }
      } else {
        setEnrolledIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleEnroll = async (workshopId) => {
    if (!user) {
      showToast("Please register or log in to reserve a seat.", "info");
      navigate(`/register?workshop=${workshopId}`);
      return;
    }

    const { error } = await enrollInWorkshop(user.id, workshopId);
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Seat reserved successfully!", "success");
      loadData(); // reload to refresh seats remaining and enrollment state
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    showToast("Thank you for subscribing to the MuseHaus Journal.", "success");
    setEmailInput('');
  };

  const nextTestimonial = () => {
    setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="bg-cream text-ink transition-all">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-warm/40 to-cream overflow-hidden px-6 py-20 border-b border-ink/5">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(26,26,24,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(26,26,24,0.02)_1px,_transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* Soft abstract brand-tint glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-terra/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto text-center z-10 flex flex-col items-center gap-8">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-warm/80 border border-gold/40 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.25em] font-semibold text-terra shadow-sm animate-pulse">
            <Sparkles size={12} />
            <span>A Sanctuary for the Fine Arts</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-wide text-ink font-light max-w-4xl">
            Where luxury meets the beauty of <span className="font-italic text-terra italic">slow craft</span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-xl font-sans text-muted max-w-2xl font-light leading-relaxed whitespace-pre-line">
            {`MuseHaus ✨🎨
A home of creativity & inspiration
A cozy corner for art lovers to create, learn & connect 🤍
🖌️ Tray Painting | Clay Art | Fridge Magnets & more
Creating art, memories & beautiful experiences together ✨`}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link
              to="/workshops"
              className="bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-sm transition-all duration-300 shadow-xl shadow-terra/10 border border-terra/20 flex items-center justify-center gap-2 group"
            >
              <span>Explore Workshops</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#workshops"
              className="bg-transparent hover:bg-ink/5 text-ink border border-ink/35 text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-sm transition-all duration-300 flex items-center justify-center"
            >
              Workshop Story
            </a>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-8 md:gap-16 mt-12 border-t border-ink/10 pt-8 w-full max-w-xl">
            <div>
              <p className="font-serif text-3xl font-bold text-terra">20 to 30</p>
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mt-1">Max Class Capacity</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-ink">100%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mt-1">Tactile Materials</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED WORKSHOPS GRID */}
      <section id="workshops" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-ink/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-terra text-xs uppercase tracking-widest font-semibold mb-2">
              <Award size={14} className="text-terra" />
              <span>Atelier Sessions</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-ink font-medium tracking-wide">
              Upcoming Workshops
            </h2>
          </div>
          <Link
            to="/workshops"
            className="text-xs uppercase tracking-[0.2em] font-bold text-ink hover:text-terra border-b border-ink/20 hover:border-terra pb-1 flex items-center gap-1.5 transition-all self-start md:self-auto"
          >
            <span>Browse All Workshops</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-sm bg-warm/20 animate-pulse border border-ink/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                onEnroll={handleEnroll}
                isEnrolled={enrolledIds.includes(workshop.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. TESTIMONIALS SECTION */}
      <section className="py-24 bg-warm/20 border-b border-ink/5 px-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={14} className="fill-gold text-gold" />
            ))}
          </div>

          <h2 className="font-serif text-xs uppercase tracking-[0.25em] text-muted font-semibold">
            Atelier Experiences
          </h2>

          {/* Carousel Body */}
          <div className="relative min-h-[160px] flex items-center justify-center px-4 w-full">
            <blockquote className="font-serif text-xl md:text-3xl text-ink leading-relaxed font-light italic transition-all duration-500">
              “{TESTIMONIALS[testimonialIdx].quote}”
            </blockquote>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {/* Initials Circle */}
            <div className="w-10 h-10 rounded-full bg-cream border border-gold/40 flex items-center justify-center text-xs font-semibold text-ink shadow-sm">
              {TESTIMONIALS[testimonialIdx].initials}
            </div>
            
            <div className="text-left">
              <cite className="block text-sm font-semibold text-ink not-italic">
                {TESTIMONIALS[testimonialIdx].author}
              </cite>
              <span className="text-xs text-muted font-light">
                {TESTIMONIALS[testimonialIdx].role}
              </span>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-cream hover:bg-ink hover:text-cream border border-ink/10 flex items-center justify-center transition-all duration-300 shadow-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-cream hover:bg-ink hover:text-cream border border-ink/10 flex items-center justify-center transition-all duration-300 shadow-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER STRIP */}
      <section className="py-20 px-6 md:px-12 bg-ink text-cream relative overflow-hidden">
        {/* Soft geometric details */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-terra/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,240,232,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(245,240,232,0.01)_1px,_transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 z-10 relative">
          
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h2 className="font-serif text-3xl md:text-4xl leading-tight font-medium tracking-wide">
              Subscribe to the Journal
            </h2>
            <p className="text-sm text-muted max-w-md font-light leading-relaxed">
              Receive notifications of new seasonal workshops, masterclass calendars, and workshop exhibitions.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              className="bg-warm/10 border border-cream/20 hover:border-cream/40 text-cream px-5 py-3.5 rounded-sm text-xs uppercase tracking-widest placeholder:text-muted placeholder:font-light focus:outline-none focus:border-gold/60 w-full sm:w-72 transition-colors"
              required
            />
            
            <button
              type="submit"
              className="bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold px-6 py-3.5 rounded-sm transition-all duration-300 shadow-md border border-terra/20 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>

        </div>
      </section>
    </div>
  );
}
