import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkshops, enrollInWorkshop, getUserEnrollments } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import WorkshopCard from '../components/WorkshopCard';
import { Calendar, SlidersHorizontal, BookOpen, AlertCircle } from 'lucide-react';

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedMedium, setSelectedMedium] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: wsData } = await getWorkshops();
      if (wsData) setWorkshops(wsData);

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
      showToast("Seat reserved successfully! ✦", "success");
      loadData(); // reload
    }
  };

  // Filter Logic (AND logic)
  const filteredWorkshops = workshops.filter((ws) => {
    const matchesMedium = selectedMedium === 'all' || ws.medium === selectedMedium;
    const matchesLevel = selectedLevel === 'all' || ws.level === selectedLevel;
    return matchesMedium && matchesLevel;
  });

  const mediumsList = [
    { label: 'All Mediums', value: 'all' },
    { label: 'Painting', value: 'painting' },
    { label: 'Ceramics', value: 'ceramics' },
    { label: 'Sculpture', value: 'sculpture' },
    { label: 'Mixed Media', value: 'mixed' }
  ];

  const levelsList = [
    { label: 'All Levels', value: 'all' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' }
  ];

  return (
    <div className="bg-cream min-h-screen text-ink pb-24">
      
      {/* SECTION 1 — Page Header */}
      <header className="bg-ink text-cream py-20 px-6 md:px-12 text-center relative overflow-hidden">
        {/* Abstract pattern details */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,240,232,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(245,240,232,0.01)_1px,_transparent_1px)] bg-[size:30px_30px]" />
        
        <div className="max-w-3xl mx-auto z-10 relative flex flex-col items-center gap-3">
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold">
            Summer 2026
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-light tracking-wide">
            Upcoming <span className="italic text-terra">Workshops</span>
          </h1>
          <p className="text-sm md:text-base text-muted max-w-xl font-light leading-relaxed mt-2">
            Explore our full roster of creative workshops across every medium and skill level. All materials, toolkits, and organic teas included.
          </p>
        </div>
      </header>

      {/* SECTION 2 — Filter Bar */}
      <div className="sticky top-16 z-30 bg-cream/96 backdrop-blur-md border-b border-ink/10 py-4 px-6 md:px-12 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Medium Group */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted font-bold mr-2 flex items-center gap-1.5 select-none">
              <SlidersHorizontal size={12} />
              <span>Medium:</span>
            </span>
            {mediumsList.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMedium(m.value)}
                className={`text-[10px] uppercase tracking-widest font-semibold px-4 py-2 rounded-sm transition-all duration-300 border ${
                  selectedMedium === m.value
                    ? 'bg-terra border-terra text-cream shadow-sm'
                    : 'border-ink/15 text-ink hover:bg-ink/5 hover:border-ink/35'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Level Group */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted font-bold mr-2 flex items-center gap-1.5 select-none">
              <BookOpen size={12} />
              <span>Level:</span>
            </span>
            {levelsList.map((l) => (
              <button
                key={l.value}
                onClick={() => setSelectedLevel(l.value)}
                className={`text-[10px] uppercase tracking-widest font-semibold px-4 py-2 rounded-sm transition-all duration-300 border ${
                  selectedLevel === l.value
                    ? 'bg-terra border-terra text-cream shadow-sm'
                    : 'border-ink/15 text-ink hover:bg-ink/5 hover:border-ink/35'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* SECTION 3 — Workshop Cards Grid */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-sm bg-warm/25 animate-pulse border border-ink/5" />
            ))}
          </div>
        ) : filteredWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300">
            {filteredWorkshops.map((workshop) => (
              <div key={workshop.id} className="animate-fade-in transition-all duration-300">
                <WorkshopCard
                  workshop={workshop}
                  onEnroll={handleEnroll}
                  isEnrolled={enrolledIds.includes(workshop.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-6 border border-dashed border-ink/10 rounded-sm bg-warm/10 max-w-xl mx-auto flex flex-col items-center gap-4">
            <AlertCircle size={32} className="text-terra" />
            <h3 className="font-serif text-2xl font-medium text-ink">No Workshops Found</h3>
            <p className="text-sm text-muted font-light leading-relaxed max-w-md">
              No workshops match your active filters. Try a different combination of mediums and levels or clear your active filters.
            </p>
            <button
              onClick={() => {
                setSelectedMedium('all');
                setSelectedLevel('all');
              }}
              className="mt-2 bg-ink hover:bg-terra text-cream text-[10px] uppercase tracking-widest font-bold px-6 py-3 rounded-sm transition-colors shadow-md"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

    </div>
  );
}
