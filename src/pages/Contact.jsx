import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  
  // Form fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Workshop Enquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Validation and Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      showToast("Message sent! We'll reply within 24 hours ✦", "success");
      setName('');
      setEmail('');
      setSubject('Workshop Enquiry');
      setMessage('');
      setIsSubmitting(false);
    }, 800);
  };

  const contactDetails = [
    {
      icon: <MapPin className="text-terra" size={18} />,
      label: "Address",
      content: "12 Atelier Lane, Banjara Hills, Hyderabad 500034"
    },
    {
      icon: <Phone className="text-terra" size={18} />,
      label: "Phone",
      content: "+91 98765 43210"
    },
    {
      icon: <Mail className="text-terra" size={18} />,
      label: "Email",
      content: "hello@musehaus.in"
    },
    {
      icon: <Clock className="text-terra" size={18} />,
      label: "Hours",
      content: "Tue–Sun 9:00 AM – 7:00 PM, Monday Closed"
    }
  ];

  return (
    <div className="bg-cream min-h-screen text-ink pb-24 font-sans">
      
      {/* SECTION 1 — Page Header */}
      <header className="bg-ink text-cream py-20 px-6 md:px-12 text-center relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,240,232,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(245,240,232,0.01)_1px,_transparent_1px)] bg-[size:30px_30px]" />
        
        <div className="max-w-3xl mx-auto z-10 relative flex flex-col items-center gap-3">
          <span className="text-gold text-xs uppercase tracking-[0.25em] font-semibold">
            Get In Touch
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-light tracking-wide">
            Visit the <span className="italic text-terra">Studio</span>
          </h1>
          <p className="text-sm md:text-base text-muted max-w-xl font-light leading-relaxed mt-2">
            Have questions about registrations, private guild bookings, or corporate retreats? Reach out to our concierge team.
          </p>
        </div>
      </header>

      {/* SECTION 2 — Two-Column Content Grid */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* LEFT COLUMN: Studio Info & Styled Map */}
        <div className="flex flex-col gap-10">
          
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-3xl font-medium tracking-wide">
              Find Us
            </h2>
            <p className="text-xs text-muted font-light leading-relaxed max-w-md">
              Located in the heart of Banjara Hills, our studio offers a tranquil visual garden environment away from the city hubbub. Valet parking is available for all atelier guests.
            </p>
          </div>

          {/* Contact Details Grid */}
          <div className="flex flex-col gap-5">
            {contactDetails.map((detail, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                {/* Icon box (warm bg) */}
                <div className="w-10 h-10 rounded-sm bg-warm border border-gold/10 flex items-center justify-center transition-colors group-hover:bg-gold/20 select-none">
                  {detail.icon}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-semibold">{detail.label}</span>
                  <p className="text-xs md:text-sm font-medium text-ink/80 mt-0.5">{detail.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Styled Vector Map Placeholder */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1 select-none">Studio Location</span>
            
            <div className="bg-ink rounded-sm relative overflow-hidden aspect-[16/10] sm:aspect-[16/9] border border-gold/30 flex flex-col items-center justify-center p-6 shadow-md select-none group">
              {/* Map grid pattern lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(212,168,83,0.06)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(212,168,83,0.06)_1px,_transparent_1px)] bg-[size:25px_25px] opacity-75" />
              
              {/* Simulated abstract geographical roads/rivers */}
              <svg className="absolute inset-0 w-full h-full text-warm/5 opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50 100 C 100 150, 200 50, 600 120" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M100 -50 C 150 200, 50 300, 220 500" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M-20 300 L 600 -10" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>

              {/* Pulsing Pin Marker */}
              <div className="relative flex h-6 w-6 items-center justify-center z-10 cursor-pointer">
                {/* Ping ring animation */}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terra opacity-75" />
                {/* Core dot marker */}
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-terra border border-cream shadow-md" />
              </div>

              {/* Gold Studio Label */}
              <div className="z-10 mt-3 text-center">
                <h4 className="font-serif text-sm tracking-widest uppercase font-semibold text-gold">
                  MuseHaus Studio
                </h4>
                <p className="text-[9px] text-cream/70 uppercase tracking-widest mt-1">
                  Atelier & Exhibition Spaces
                </p>
              </div>

              {/* Decorative Compass indicator */}
              <div className="absolute bottom-4 right-4 text-cream/20 text-xs flex flex-col items-center select-none font-serif italic">
                <span>N</span>
                <span className="h-4 w-px bg-cream/20 my-0.5" />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Contact Enquiry Form */}
        <div className="flex flex-col gap-8 bg-warm/20 border border-ink/5 p-8 sm:p-10 rounded-sm shadow-sm">
          
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl font-medium tracking-wide">
              Send a Message
            </h2>
            <p className="text-xs text-muted font-light leading-relaxed">
              Fill out the enquiry form below, and our studio host will get in touch with you directly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-cream border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-cream border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Subject Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-cream border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none cursor-pointer transition-colors"
              >
                <option value="Workshop Enquiry">Workshop Enquiry</option>
                <option value="Private Classes">Private Classes</option>
                <option value="Group Bookings">Group Bookings</option>
                <option value="Exhibitions & Events">Exhibitions & Events</option>
                <option value="General Question">General Question</option>
              </select>
            </div>

            {/* Message Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist you in your creative journey?"
                rows={5}
                className="bg-cream border border-ink/10 focus:border-terra rounded-sm px-4 py-3 text-sm focus:outline-none w-full min-h-[130px] resize-y transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-terra hover:bg-terra/90 text-cream text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-300 shadow-md border border-terra/20 mt-2 select-none flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Sending Enquiry...' : 'Send Message'}</span>
              <Send size={12} />
            </button>

          </form>

          {/* Social Follow strip */}
          <div className="border-t border-ink/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] uppercase tracking-widest text-muted font-bold select-none">
              Follow Our Journey:
            </span>
            <div className="flex gap-3 w-full sm:w-auto">
              <a
                href="#"
                className="flex-grow sm:flex-grow-0 bg-transparent hover:bg-ink text-ink hover:text-cream border border-ink/15 hover:border-ink px-4 py-2 text-[10px] uppercase tracking-wider font-semibold rounded-sm text-center transition-colors"
              >
                Instagram
              </a>
              <a
                href="#"
                className="flex-grow sm:flex-grow-0 bg-transparent hover:bg-ink text-ink hover:text-cream border border-ink/15 hover:border-ink px-4 py-2 text-[10px] uppercase tracking-wider font-semibold rounded-sm text-center transition-colors"
              >
                Pinterest
              </a>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
