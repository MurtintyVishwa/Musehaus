import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Sparkles } from 'lucide-react';
import { getActiveWorkshops, enrollInWorkshop, getUserEnrollments } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import WorkshopCard from '../components/WorkshopCard';

export default function Home() {
  const [workshops, setWorkshops] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: wsData } = await getActiveWorkshops();
      if (wsData) {
        setWorkshops(wsData.slice(0, 3));
      }

      if (user) {
        const { data: enData } = await getUserEnrollments(user.id);
        if (enData && wsData) {
          const activeIds = new Set(wsData.map((w) => w.id));
          setEnrolledIds(
            enData
              .filter((e) => activeIds.has(e.workshop_id))
              .map((e) => e.workshop_id)
          );
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
      loadData();
    }
  };

  return (
    <div className="bg-cream text-ink transition-all">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-warm/40 to-cream overflow-hidden px-6 py-20 border-b border-ink/5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(26,26,24,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(26,26,24,0.02)_1px,_transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-terra/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto text-center z-10 flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 bg-warm/80 border border-gold/40 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.25em] font-semibold text-terra shadow-sm animate-pulse">
            <Sparkles size={12} />
            <span>A Sanctuary for the Fine Arts</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-wide text-ink font-light max-w-4xl">
            Where creativity, friendship, and beautiful <span className="font-italic text-terra italic">memories come to life.</span>
          </h1>

          <p className="text-base md:text-xl font-sans text-muted max-w-2xl font-light leading-relaxed whitespace-pre-line">
            {`MuseHaus ✨🎨
A home of creativity & inspiration
A cozy corner for art lovers to create, learn & connect 🤍
🖌️ Tray Painting | Clay Art | Fridge Magnets & more
Creating art, memories & beautiful experiences together ✨`}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link
              to="/workshops"
              className="bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 rounded-sm transition-all duration-300 shadow-xl shadow-terra/10 border border-terra/20 flex items-center justify-center gap-2 group"
            >
              <span>Explore Workshops</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED WORKSHOPS GRID */}
      <section id="workshops" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
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
          <div className="max-w-xl mx-auto">
            <div className="h-96 rounded-sm bg-warm/20 animate-pulse border border-ink/5" />
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
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
    </div>
  );
}
