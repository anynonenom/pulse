
import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, Zap, Music, Layers, Award, Radio, FileText, CheckCircle, Send, Ticket } from 'lucide-react';
import { ReservationWizard } from './ReservationWizard';
import { Reservation, TableZone, ViewRole } from '../types';
import { ReceiptModal } from './ReceiptModal';

interface Props {
  onReserve: (res: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  onViewChange?: (view: ViewRole) => void;
}

export const CustomerPortal: React.FC<Props> = ({ onReserve, onViewChange }) => {
  const [showWizard, setShowWizard] = useState(false);
  const [lastRes, setLastRes] = useState<Reservation | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pulse_last_res');
    if (saved) {
      setLastRes(JSON.parse(saved));
    }
  }, [showWizard]);

  return (
    <div className="relative scroll-smooth bg-[#0d0211]">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] bg-[#ff00b8] opacity-20 rotate-12 shard-mask" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] bg-[#00ffd1] opacity-10 -rotate-12 shard-mask" />
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen" 
               style={{backgroundImage: 'url("https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center'}} />
        </div>

        <div className="container mx-auto px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-3 px-4 py-1 bg-[#00ffd1] text-[#0d0211] font-black italic uppercase tracking-tighter text-xs">
              <Star className="w-3 h-3 fill-current" /> TONIGHT 23:00 - LATE
            </div>
            
            <div className="relative">
                <h2 className="text-4xl font-black italic tracking-tight text-[#ff00b8] leading-none mb-2">DJ SET</h2>
                <h1 className="text-[100px] md:text-[150px] font-black italic tracking-[-0.08em] leading-[0.8] text-[#fde047] uppercase drop-shadow-[10px_10px_0px_#ff00b8]">
                  TEDESCHI
                </h1>
            </div>

            <p className="text-xl md:text-2xl font-bold tracking-tight text-white/80 max-w-lg italic">
               Where the concrete meets the chaos. Experience the sonic architecture of <span className="text-[#00ffd1]">Morocco' finest</span>.
            </p>

            <div className="flex flex-col gap-6 pt-4">
              {lastRes ? (
                <div className="bg-black/90 backdrop-blur-xl border-l-8 border-[#00ffd1] p-10 space-y-6 max-w-md animate-in slide-in-from-bottom-4 duration-500 shadow-[30px_30px_0px_rgba(0,0,0,0.8)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Ticket className="w-20 h-20 text-[#00ffd1] -rotate-12" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[#00ffd1]">
                      <CheckCircle className="w-7 h-7" />
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Access Secured</h3>
                    </div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] italic">Manifest ID: {lastRes.id.slice(0, 12)}</p>
                  </div>
                  
                  <p className="text-sm font-black uppercase text-white leading-relaxed italic tracking-widest border-t border-zinc-800 pt-4">
                    Your digital pass has been generated. Ensure you save it locally for sector entry.
                  </p>
                  
                  <div className="flex flex-col gap-4 pt-2">
                    <button 
                      onClick={() => setShowReceipt(true)}
                      className="w-full py-4 bg-[#00ffd1] text-black font-black text-[11px] uppercase italic tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[6px_6px_0px_#ff00b8]"
                    >
                      <Ticket className="w-4 h-4" /> VIEW DIGITAL TICKET
                    </button>
                    <button 
                      onClick={() => setShowWizard(true)}
                      className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] hover:text-[#ff00b8] transition-all underline decoration-dotted text-center"
                    >
                      New Reservation Protocol
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setShowWizard(true)}
                    className="px-10 py-5 bg-[#ff00b8] text-white font-black text-lg uppercase italic tracking-tighter hover:bg-white hover:text-[#ff00b8] transition-all flex items-center gap-3 drop-shadow-[5px_5px_0px_#00ffd1] active:translate-x-1 active:translate-y-1 active:drop-shadow-none"
                  >
                    SECURE ACCESS <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
                        <Radio className="w-5 h-5 text-[#00ffd1] animate-pulse" />
                    </div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex flex-col justify-center">
                        <span>LIVE STATUS</span>
                        <span className="text-white">SECTORS ACTIVE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block relative h-[600px] animate-in fade-in zoom-in duration-1000">
             <div className="absolute inset-0 bg-[#00ffd1] rotate-3 shard-mask opacity-20" />
             <div className="absolute inset-4 overflow-hidden -rotate-2 bg-[#0d0211] border-4 border-[#ff00b8] p-2 shadow-[0_0_50px_rgba(255,0,184,0.3)]">
                <img 
                  src="https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover grayscale contrast-125 brightness-75"
                  alt="DJ Atmosphere"
                />
             </div>
             <div className="absolute top-0 right-0 w-24 h-24 bg-[#fde047] shard-triangle-right -rotate-12" />
             <div className="absolute bottom-10 -left-10 w-32 h-32 bg-[#00ffd1] shard-triangle-left rotate-45" />
          </div>
        </div>
      </section>

      {/* Feature Summaries leading to Pages */}
      <section className="bg-black py-32 px-8">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700">
               <div className="p-4 bg-zinc-900 w-fit">
                  <Music className="w-10 h-10 text-[#00ffd1]" />
               </div>
               <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white">Advanced <span className="text-[#00ffd1]">Sectors</span></h2>
               <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs leading-relaxed max-w-sm">
                  From the kinetic energy of the Central Void to the isolated luxury of the Inner Sanctum. Explore our acoustic architectures.
               </p>
               <button onClick={() => onViewChange?.('zones')} className="group flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest border-b-2 border-[#00ffd1] pb-2 hover:text-[#00ffd1] transition-all">
                  EXPLORE ZONES <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
               <div className="p-4 bg-zinc-900 w-fit">
                  <Award className="w-10 h-10 text-[#ff00b8]" />
               </div>
               <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white">Access <span className="text-[#ff00b8]">Tiers</span></h2>
               <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs leading-relaxed max-w-sm">
                  Elevate your status. Our membership tiers provide priority encryption, exclusive entry points, and loyalty pulse tokens.
               </p>
               <button onClick={() => onViewChange?.('access')} className="group flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest border-b-2 border-[#ff00b8] pb-2 hover:text-[#ff00b8] transition-all">
                  VIEW MEMBERSHIP <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </section>

      {/* Lineup Section */}
      <section id="lineup" className="bg-[#0d0211] py-32 px-8 relative border-t-4 border-[#ff00b8] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-6xl font-black italic tracking-tighter uppercase text-white mb-2">The <span className="text-[#ff00b8]">Lineup</span></h2>
            <p className="text-[#00ffd1] font-bold uppercase tracking-[0.4em] text-xs">Curated Sound Systems Only</p>
          </div>

          <div className="space-y-12">
            {[
              { time: '23:00', artist: 'PHASE 1: NOIR', genre: 'Industrial Techno', color: '#00ffd1' },
              { time: '01:00', artist: 'TEDESCHI', genre: 'Global Residency', color: '#fde047', featured: true },
              { time: '03:00', artist: 'X-CELL', genre: 'Acid/Core', color: '#ff00b8' },
            ].map((set, i) => (
              <div key={i} className={`flex items-center gap-8 group ${set.featured ? 'scale-105' : ''}`}>
                <div className="text-4xl font-black italic text-zinc-800 group-hover:text-white transition-colors">{set.time}</div>
                <div className={`flex-grow h-[2px]`} style={{ backgroundColor: `${set.color}44` }} />
                <div className={`p-8 border-l-8 transition-all w-full md:w-[60%] ${set.featured ? 'bg-zinc-900 border-[#fde047]' : 'bg-black border-zinc-800 hover:border-[#ff00b8]'}`}>
                  <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-1`} style={{ color: set.color }}>{set.artist}</h3>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{set.genre}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showWizard && (
        <div className="fixed inset-0 z-[60] bg-[#0d0211]/98 backdrop-blur-sm flex items-center justify-center p-0 md:p-8">
          <div className="w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-zinc-950 border-4 border-[#ff00b8] shadow-[20px_20px_0px_#00ffd1] overflow-hidden animate-in zoom-in-95 duration-300">
            <ReservationWizard 
              onClose={() => setShowWizard(false)} 
              onComplete={(data) => {
                onReserve(data);
                setShowWizard(false);
              }}
            />
          </div>
        </div>
      )}

      {showReceipt && lastRes && (
        <ReceiptModal reservation={lastRes} onClose={() => setShowReceipt(false)} showActions={true} />
      )}
    </div>
  );
};
