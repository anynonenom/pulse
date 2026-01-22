
import React, { useState } from 'react';
import { Award, CheckCircle2, Star, Zap, Shield, Crown, Gift, Calculator, TrendingUp } from 'lucide-react';
import { ReservationWizard } from './ReservationWizard';
import { Reservation, TableZone } from '../types';

interface Props {
  onReserve: (res: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
}

export const AccessPage: React.FC<Props> = ({ onReserve }) => {
  const [showWizard, setShowWizard] = useState(false);
  const [pulseTokens, setPulseTokens] = useState(2500);

  const tiers = [
    {
      name: 'STANDARD',
      price: '45',
      color: '#00ffd1',
      icon: Zap,
      perks: [
        'Central Void Access',
        'Sonic Array Uplink',
        'Digital Token ID',
        'Standard Queuing'
      ]
    },
    {
      name: 'VIP MEMBER',
      price: '120',
      color: '#ff00b8',
      icon: Star,
      perks: [
        'Priority Encryption (Skip Line)',
        'Elevated Sector Access',
        'Sanctum Bar Link',
        '1 Guest Pass Per Event',
        'Reserved Locker Unit'
      ]
    },
    {
      name: 'PULSE BLACK',
      price: '500',
      color: '#fde047',
      icon: Crown,
      perks: [
        'Vault Entrance Access',
        'Full-Sector Mobility',
        'Personal Concierge Node',
        'Unlimited Guest Uplinks',
        'Artist Lounge Sync',
        '24/7 Priority Support'
      ]
    }
  ];

  return (
    <div className="bg-[#0d0211] min-h-screen pt-12 animate-in fade-in duration-700">
      <div className="container mx-auto px-8 py-12">
        <header className="mb-20">
          <h1 className="text-7xl font-black italic tracking-tighter uppercase text-white mb-4">Identity <span className="text-[#ff00b8]">Protocols</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs max-w-xl">The level of your clearance determines the depth of your experience. Elevate your presence.</p>
        </header>

        {/* Membership Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
           {tiers.map((tier, i) => (
             <div key={i} className="bg-black border-4 border-zinc-900 p-10 group hover:border-white transition-all relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                   <tier.icon className="w-24 h-24" style={{ color: tier.color }} />
                </div>

                <div className="mb-8">
                   <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">{tier.name}</h4>
                   <div className="text-[10px] font-black uppercase mt-2 italic" style={{ color: tier.color }}>Tier 0{i+1} Authorization</div>
                </div>

                <div className="flex items-end gap-1 mb-10">
                   <span className="text-4xl font-black italic text-white">${tier.price}</span>
                   <span className="text-[10px] font-black text-zinc-600 uppercase mb-2">/ per cycle</span>
                </div>

                <ul className="space-y-4 mb-12 flex-grow">
                   {tier.perks.map((perk, j) => (
                     <li key={j} className="flex items-start gap-3 text-[10px] font-black uppercase text-zinc-500 group-hover:text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: tier.color }} /> {perk}
                     </li>
                   ))}
                </ul>

                <button 
                  onClick={() => setShowWizard(true)}
                  className="w-full py-5 bg-zinc-900 text-white font-black text-xs uppercase italic tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                >
                   UPGRADE CLEARANCE
                </button>
             </div>
           ))}
        </div>

        {/* Loyalty Program Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
           <div className="space-y-10">
              <div className="inline-flex items-center gap-3 px-4 py-1 bg-[#00ffd1] text-[#0d0211] font-black italic uppercase tracking-tighter text-xs">
                <TrendingUp className="w-3 h-3" /> ACTIVE REWARDS NETWORK
              </div>
              <h2 className="text-6xl font-black italic tracking-tighter uppercase text-white leading-[0.9]">PULSE <span className="text-[#00ffd1]">TOKEN</span> ECONOMY</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-sm leading-relaxed max-w-lg">
                 Your residency at Pulse generates yield. Tokens are accrued through sector occupancy, beverage decryption, and guest referrals. High-yield accounts gain access to the "Black-Out" events.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-8 bg-zinc-950 border-4 border-zinc-900">
                    <div className="text-[8px] font-black uppercase text-zinc-600 mb-2">Your Current Balance</div>
                    <div className="text-4xl font-black italic text-[#00ffd1]">{pulseTokens.toLocaleString()} <span className="text-xs">PLSE</span></div>
                 </div>
                 <div className="p-8 bg-zinc-950 border-4 border-zinc-900">
                    <div className="text-[8px] font-black uppercase text-zinc-600 mb-2">Next Milestone</div>
                    <div className="text-4xl font-black italic text-[#ff00b8]">5,000 <span className="text-xs">PLSE</span></div>
                 </div>
              </div>
           </div>

           <div className="bg-black border-4 border-zinc-800 p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffd1] opacity-5 shard-mask rotate-45" />
              <div className="space-y-8 relative z-10">
                 <h3 className="text-2xl font-black italic uppercase text-white flex items-center gap-3">
                    <Gift className="text-[#00ffd1]" /> Redemption Nodes
                 </h3>
                 <div className="space-y-4">
                    {[
                      { item: 'Complimentary Table Uplink', cost: '1,500 PLSE', avail: true },
                      { item: 'Artist Lounge Authorization', cost: '3,000 PLSE', avail: false },
                      { item: 'Black-Out Priority Invite', cost: '5,000 PLSE', avail: false },
                      { item: 'Custom Visual Projection', cost: '10,000 PLSE', avail: false },
                    ].map((node, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800">
                         <div>
                            <div className="text-[10px] font-black text-white uppercase italic">{node.item}</div>
                            <div className="text-[8px] font-bold text-zinc-500 uppercase mt-1">{node.cost}</div>
                         </div>
                         <button 
                           disabled={!node.avail}
                           className={`px-4 py-2 text-[8px] font-black uppercase italic transition-all ${
                             node.avail ? 'bg-[#00ffd1] text-black hover:bg-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                           }`}
                         >
                            {node.avail ? 'REDEEM' : 'LOCKED'}
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

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
    </div>
  );
};
