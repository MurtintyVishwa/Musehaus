import React from 'react';
import { Calendar, Clock, User, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const WorkshopCard = ({ workshop, onEnroll, isEnrolled }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    id,
    title,
    instructor_name,
    instructor_avatar_initials,
    medium,
    level,
    date,
    time,
    duration_hours,
    price,
    seats_total,
    seats_remaining,
    status,
    gradient_style
  } = workshop;

  // Medium formatting
  const displayMedium = medium === 'mixed' ? 'Mixed Media' : medium.charAt(0).toUpperCase() + medium.slice(1);

  // Status badge styling
  const getStatusBadge = () => {
    switch (status) {
      case 'sold-out':
        return <span className="bg-ink text-cream text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm">Sold Out</span>;
      case 'almost-full':
        return <span className="bg-terra text-cream text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm">Almost Full ({seats_remaining} left)</span>;
      default:
        return <span className="bg-[#a8c8a0] text-ink text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm">Open</span>;
    }
  };

  return (
    <div className="group bg-warm/40 border border-ink/5 hover:border-gold/30 transition-all duration-500 rounded-sm overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-1">
      
      {/* Visual Placeholder: Medium Gradient */}
      <div className={`h-48 bg-gradient-to-br ${gradient_style} relative flex items-end p-5 overflow-hidden`}>
        {/* Subtle texture grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(26,26,24,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(26,26,24,0.05)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent pointer-events-none" />
        
        {/* Status and Category tags */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          <span className="bg-cream/90 backdrop-blur-sm text-ink text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-sm shadow-sm">
            {displayMedium}
          </span>
        </div>
        
        <div className="absolute top-4 right-4 z-10">
          {getStatusBadge()}
        </div>

        {/* Level Tag & Title */}
        <div className="z-10 text-cream w-full mb-2">
          <div className="flex items-center gap-1.5 text-cream/80 text-[10px] uppercase tracking-widest font-semibold mb-1">
            <Award size={12} className="text-gold" />
            <span>{level} Level</span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl leading-snug tracking-wide group-hover:text-gold transition-colors duration-300">
            {title}
          </h3>
        </div>

        {/* Seats progress bar at bottom of image area */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-ink/35">
          <div 
            className={`h-full transition-all duration-500 ${
              status === 'sold-out' 
                ? 'bg-muted' 
                : status === 'almost-full' 
                  ? 'bg-terra' 
                  : 'bg-[#a8c8a0]'
            }`}
            style={{ width: `${(seats_remaining / seats_total) * 100}%` }}
          />
        </div>
      </div>

      {/* Workshop Details Content */}
      <div className="p-6 flex flex-col flex-grow justify-between gap-6">
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-terra" />
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-terra" />
            <span>{time.split(' – ')[0]} ({duration_hours}h)</span>
          </div>
          
          <div className="col-span-2 border-t border-ink/5 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Instructor Initials */}
              <div 
                className="w-7 h-7 rounded-full bg-cream border border-ink/15 flex items-center justify-center text-[10px] font-bold text-ink select-none"
                title={`Instructor: ${instructor_name}`}
              >
                {instructor_avatar_initials}
              </div>
              <span className="font-medium text-terra">{instructor_name}</span>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-muted font-light">Tuition</span>
              <p className="text-xl font-serif font-bold text-terra">₹{price}</p>
            </div>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="border-t border-ink/5 pt-4">
          {isEnrolled ? (
            <button
              disabled
              className="w-full bg-[#a8c8a0]/20 text-[#4a7044] border border-[#a8c8a0]/40 text-xs uppercase tracking-widest font-bold py-3 rounded-sm text-center select-none"
            >
              ✓ Registered
            </button>
          ) : status === 'sold-out' ? (
            <button
              onClick={() => showToast ? showToast("You have been added to the waitlist! ✦", "success") : null}
              className="w-full bg-transparent hover:bg-ink text-ink hover:text-cream border border-ink/40 text-xs uppercase tracking-widest font-bold py-3 rounded-sm text-center transition-all duration-300"
            >
              Join Waitlist
            </button>
          ) : (
            <button
              onClick={() => onEnroll ? onEnroll(id) : navigate(`/register?workshop=${id}`)}
              className="w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold py-3 rounded-sm text-center transition-all duration-300 shadow-md border border-terra/20"
            >
              Register Now
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default WorkshopCard;
