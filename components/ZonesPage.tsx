
import React, { useState, useMemo } from 'react';
import { Music, Shield, Layers, Volume2, Eye, Zap, ChevronRight, Activity, Radio, Cpu, Network, Signal } from 'lucide-react';
import { ReservationWizard } from './ReservationWizard';
import { TableZone, Reservation, ReservationStatus } from '../types';

interface Props {
  onReserve: (res: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  reservations?: Reservation[];
}

export const ZonesPage: React.FC<Props> = ({ onReserve, reservations = [] }) => {
  const [activeZone, setActiveZone] = useState<TableZone>(TableZone.MAIN_FLOOR);
  const [showWizard, setShowWizard] = useState(false);

  const zones = useMemo(() => [
    {
      id: TableZone.MAIN_FLOOR,
      title: 'CENTRAL VOID',
      subtitle: 'Kinetic Epicenter',
      desc: 'The architectural heart of Pulse. Engineered for high-velocity movement and direct sonic impact from the primary array.',
      specs: [
        { icon: Volume2, label: 'Acoustic Load', value: '140dB Peak' },
        { icon: Activity, label: 'Frequency', value: '25Hz - 18kHz' },
        { icon: Eye, label: 'Visual Link', value: 'Direct Line-of-Sight' },
      ],
      features: ['Funktion-One Evo 7 Stack', 'Reactive Floor Matrix', 'Liquid Nitrogen Cooling'],
      price: 500,
      color: '#00ffd1',
      img: 'https://images.unsplash.com/photo-1598387946218-c69b302c0b66?auto=format&fit=crop&q=80&w=1200',
      nodes: 12
    },
    {
      id: TableZone.VIP_LOUNGE,
      title: 'INNER SANCTUM',
      subtitle: 'Exclusive Command',
      desc: 'Elevated luxury behind sound-dampening obsidian glass. Dedicated service node and private visual uplink to the DJ altar.',
      specs: [
        { icon: Shield, label: 'Privacy', value: 'Level 4 Encrypted' },
        { icon: Radio, label: 'Comms', value: 'Dedicated Service Uplink' },
        { icon: Eye, label: 'Visuals', value: 'Panoramic Balcony' },
      ],
      features: ['Private Bar Access', 'Ultra-Low Frequency Isolation', 'VIP Entry Protocol'],
      price: 1200,
      color: '#ff00b8',
      img: 'https://images.unsplash.com/photo-1541339907198-e08756defeec?auto=format&fit=crop&q=80&w=1200',
      nodes: 4
    },
    {
      id: TableZone.BALCONY,
      title: 'OBSERVATION DECK',
      subtitle: 'Strategic Vantage',
      desc: '360-degree tactical overview of the central void. Perfect for orchestrating group movements and witnessing the chaos from above.',
      specs: [
        { icon: Layers, label: 'Altitude', value: '+12.5m Grid' },
        { icon: Activity, label: 'Sonic Profile', value: 'Reflective/Ambient' },
        { icon: Eye, label: 'Sightlines', value: 'Global Overview' },
      ],
      features: ['Peripheral Seating', 'Quick Access to Vault', 'Ambient Light Control'],
      price: 300,
      color: '#fde047',
      img: 'https://images.unsplash.com/photo-1566737236580-68a168037047?auto=format&fit=crop&q=80&w=1200',
      nodes: 8
    }
  ], []);

  const currentZoneData = zones.find(z => z.id === activeZone)!;
  
  const zoneOccupancy = useMemo(() => {
    const checkedIn = reservations.filter(r => r.zone === activeZone && r.status === ReservationStatus.CHECKED_IN).length;
    // Mocking a capacity for visual load percentage
    const capacity = activeZone === TableZone.VIP_LOUNGE ? 50 : 200;
    return Math.min(100, Math.floor((checkedIn / capacity) * 100));
  }, [reservations, activeZone]);

  return (
    <div className="bg-[#0d0211] min-h-screen pt-12 animate-in fade-in duration-700 pb-24">
      <div className="container mx-auto px-8 py-12">
        <header className="mb-20">
          <h1 className="text-7xl font-black italic tracking-tighter uppercase text-white mb-4">Sector <span className="text-[#00ffd1]">Architecture</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs max-w-xl">Each zone is a unique sonic environment engineered for total immersion. Select your frequency.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Zone Selector Column */}
          <div className="lg:col-span-4 space-y-4">
            {zones.map((zone) => (
              <button 
                key={zone.id}
                onClick={() => setActiveZone(zone.id)}
                className={`w-full p-8 text-left border-4 transition-all duration-300 relative group overflow-hidden ${
                  activeZone === zone.id ? 'bg-white border-white' : 'bg-black border-zinc-900 hover:border-zinc-700'
                }`}
              >
                {activeZone === zone.id && (
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-20 pointer-events-none" style={{ backgroundColor: zone.color, clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                )}
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeZone === zone.id ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {zone.subtitle}
                </div>
                <h3 className={`text-3xl font-black italic uppercase tracking-tighter ${activeZone === zone.id ? 'text-black' : 'text-white'}`}>
                  {zone.title}
                </h3>
              </button>
            ))}
          </div>

          {/* Interactive Detail Column */}
          <div className="lg:col-span-8 space-y-12">
            <div className="relative aspect-video bg-zinc-900 border-4 border-zinc-800 overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
               <img 
                 src={currentZoneData.img} 
                 className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                 alt={currentZoneData.title}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
               
               {/* Fixed: Populated Live Signal Telemetry Area */}
               <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full animate-pulse shadow-[0_0_15px_currentcolor]" style={{ backgroundColor: currentZoneData.color, color: currentZoneData.color }} />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Live Signal Active</span>
                     </div>
                     <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
                     <div className="space-y-1">
                        <div className="text-[7px] font-black text-white/40 uppercase tracking-[0.4em]">Sector Load</div>
                        <div className="text-[10px] font-black text-white uppercase italic tracking-widest">{zoneOccupancy}% Capacity</div>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="px-4 py-2 bg-black/80 border border-white/10 backdrop-blur-md flex items-center gap-3">
                        <Network className="w-3 h-3 text-white/40" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">{currentZoneData.nodes} Nodes Synchronized</span>
                     </div>
                     <div className="px-4 py-2 bg-black/80 border border-white/10 backdrop-blur-md flex items-center gap-3">
                        <Signal className="w-3 h-3 text-[#00ffd1]" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Uplink Stable</span>
                     </div>
                  </div>
               </div>
               
               {/* Scanning Overlay Effect */}
               <div className="absolute inset-0 pointer-events-none border-t border-white/5 animate-scan" style={{ height: '2px', background: `linear-gradient(to right, transparent, ${currentZoneData.color}, transparent)` }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <h4 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Environmental Data</h4>
                     <p className="text-white font-bold italic text-lg leading-relaxed">{currentZoneData.desc}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     {currentZoneData.specs.map((spec, i) => (
                       <div key={i} className="flex items-center gap-4 bg-black border-2 border-zinc-900 p-4 hover:border-zinc-700 transition-colors">
                          <spec.icon className="w-5 h-5" style={{ color: currentZoneData.color }} />
                          <div>
                             <div className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{spec.label}</div>
                             <div className="text-sm font-black italic uppercase text-white">{spec.value}</div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <h4 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Sector Protocols</h4>
                     <ul className="space-y-3">
                        {currentZoneData.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-3 text-xs font-black uppercase text-white italic group cursor-default">
                             <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: currentZoneData.color }} /> {feat}
                          </li>
                        ))}
                     </ul>
                  </div>

                  <div className="p-8 bg-zinc-950 border-4 border-zinc-900 space-y-6 shadow-2xl">
                     <div className="flex justify-between items-end">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Min Deployment</div>
                        <div className="text-4xl font-black italic text-white">${currentZoneData.price}<span className="text-sm text-zinc-500 ml-1">+</span></div>
                     </div>
                     <button 
                       onClick={() => setShowWizard(true)}
                       className="w-full py-5 bg-white text-black font-black text-xs uppercase italic tracking-[0.4em] hover:bg-[#00ffd1] transition-all shadow-[10px_10px_0px_#ff00b8] active:translate-x-1 active:translate-y-1 active:shadow-none"
                     >
                       INITIALIZE RESERVATION
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {showWizard && (
        <div className="fixed inset-0 z-[60] bg-[#0d0211]/98 backdrop-blur-sm flex items-center justify-center p-0 md:p-8">
          <div className="w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-zinc-950 border-4 border-[#ff00b8] shadow-[20px_20px_0px_#00ffd1] overflow-hidden animate-in zoom-in-95 duration-300">
            <ReservationWizard 
              initialZone={activeZone}
              onClose={() => setShowWizard(false)} 
              onComplete={(data) => {
                onReserve(data);
                setShowWizard(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
