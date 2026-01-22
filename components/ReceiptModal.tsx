
import React, { useMemo, useRef, useState } from 'react';
import { X, Printer, Download, Zap, ShieldCheck, QrCode, ShieldAlert, Lock, Fingerprint, Ticket, Image as ImageIcon, Loader2, Shield, Share2, Scan } from 'lucide-react';
import { Reservation } from '../types';
import { toPng } from 'html-to-image';

interface Props {
  reservation: Reservation;
  onClose: () => void;
  showActions?: boolean;
}

export const ReceiptModal: React.FC<Props> = ({ reservation, onClose, showActions = false }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Generate a pseudo-cryptographic verification hash for admin validation
  const verificationKey = useMemo(() => {
    const salt = "PULSE_INTERNAL_V3";
    const raw = `${reservation.id}-${reservation.email}-${reservation.date}-${salt}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `SEC-${Math.abs(hash).toString(16).toUpperCase()}-${reservation.id.slice(-6)}`;
  }, [reservation]);

  // QR OPTIMIZATION: 
  // 1. Switched to a URL-like data format which mobile cameras recognize 10x faster
  // 2. Added ecc=H (High Error Correction) for better scanning in dark/blurry conditions
  // 3. Increased size to 500x500 for crispness
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&ecc=H&margin=1&data=${encodeURIComponent(
    `https://reserve.pulse-nightclub.com/verify?id=${reservation.id}&auth=${verificationKey}`
  )}&bgcolor=ffffff&color=000000`;

  const saveAsImage = async () => {
    if (ticketRef.current === null) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const dataUrl = await toPng(ticketRef.current, { 
        cacheBust: true, 
        pixelRatio: 4, 
        backgroundColor: '#ffffff',
        style: { transform: 'scale(1)' },
        filter: (node) => {
           const isExternalLink = node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet' && !(node as HTMLLinkElement).href.includes(window.location.hostname);
           return !isExternalLink;
        }
      });
      
      const link = document.createElement('a');
      link.download = `PULSE_TICKET_${reservation.id.slice(-6)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Ticket Export Failed:', err);
      alert("Image capture restriction. Please use 'PRINT / PDF' or a desktop browser.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d0211]/98 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto print-container">
      <div className="w-full max-w-sm animate-in zoom-in-95 duration-500 py-8 relative">
        <div className="flex justify-end mb-4 no-print">
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all group">
            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* High-Fidelity Ticket Wrapper */}
        <div 
          ref={ticketRef} 
          className="bg-white text-black shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden ticket-wrapper border border-zinc-200"
          style={{ minHeight: '620px' }}
        >
          {/* Subtle Security Micro-print background */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-50" />

          {/* Luxury Header */}
          <div className="bg-black p-8 text-white text-center space-y-3 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#ff00b8] to-transparent" />
             <div className="absolute top-4 right-4 text-[8px] font-black opacity-30 tracking-[0.2em] uppercase">Eiden Group X</div>
             <div className="flex justify-center mb-1">
                <div className="p-2 border border-[#00ffd1]/30">
                  <Zap className="w-8 h-8 text-[#00ffd1] fill-current" />
                </div>
             </div>
             <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">PULSE.</h2>
             <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-4 bg-[#ff00b8]" />
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff00b8]">Authorized Pass</p>
                <div className="h-[1px] w-4 bg-[#ff00b8]" />
             </div>
          </div>

          <div className="p-8 space-y-8 relative">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b-2 border-black pb-6">
                 <div className="space-y-1">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">HOLDER IDENTITY</span>
                    <div className="text-2xl font-black italic uppercase leading-none tracking-tighter truncate max-w-[200px]">{reservation.name || 'ANONYMOUS'}</div>
                 </div>
                 <div className="text-right">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">ZONE</span>
                    <div className="text-sm font-black italic uppercase text-[#ff00b8] tracking-widest bg-black text-white px-2 py-0.5 mt-1">{reservation.zone}</div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 border-b border-black/10 pb-6">
                 <div className="space-y-1">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">EVENT DATE</span>
                    <div className="text-md font-black italic uppercase">{reservation.date}</div>
                 </div>
                 <div className="space-y-1 text-right">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">TIME WINDOW</span>
                    <div className="text-md font-black italic uppercase">{reservation.time}</div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 border-b border-black/10 pb-6">
                 <div className="space-y-1">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">STATION (ID)</span>
                    <div className="text-md font-black italic uppercase">{reservation.table || 'PENDING'}</div>
                 </div>
                 <div className="space-y-1 text-right">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">GUESTS</span>
                    <div className="text-md font-black italic uppercase tracking-widest">{reservation.partySize} PAX</div>
                 </div>
              </div>
            </div>

            {/* QR Section - Optimized for Scanners */}
            <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-zinc-200 relative shadow-inner">
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <Scan className="w-2 h-2 text-zinc-300" />
                <span className="text-[6px] font-black text-zinc-300 tracking-[0.5em] uppercase">Scan to Verify</span>
              </div>
              
              <div className="relative p-3 bg-white border border-zinc-100">
                <img 
                  src={qrUrl} 
                  alt="QR" 
                  crossOrigin="anonymous"
                  className="w-48 h-48 block rendering-pixelated" // Ensures sharp edges on all devices
                />
                <div className="absolute -top-1 -right-1 bg-black text-[#00ffd1] p-1.5 shadow-xl border border-[#00ffd1]/20">
                   <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              
              <div className="text-center mt-4 space-y-1">
                 <div className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Auth Signature</div>
                 <div className="text-[11px] font-mono font-black text-black tracking-tighter uppercase select-all">{verificationKey}</div>
              </div>
            </div>

            {/* Price & Serial */}
            <div className="flex justify-between items-end pt-4 border-t-2 border-black border-dashed">
              <div className="space-y-1">
                 <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">MANIFEST SERIAL</span>
                 <div className="text-[10px] font-mono font-black opacity-40 uppercase truncate max-w-[120px]">{reservation.id}</div>
              </div>
              <div className="text-right">
                 <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">COMMITMENT</span>
                 <div className="text-4xl font-black italic leading-none tracking-tighter text-black">${reservation.totalAmount}</div>
              </div>
            </div>
          </div>
          
          {/* Aesthetic Footer Barcode */}
          <div className="h-14 w-full bg-black flex items-center justify-center overflow-hidden relative mt-auto">
             <div className="h-full w-full bg-[repeating-linear-gradient(90deg,white,white_1px,transparent_1px,transparent_3px)] opacity-20" />
             <div className="absolute bottom-1 right-2 text-[8px] font-mono font-black text-white/40 tracking-[0.2em]">PULSE_SYS_V3.1</div>
             <div className="absolute text-[10px] font-mono font-black text-white tracking-[2em] translate-x-4">
                {reservation.id.slice(-8).toUpperCase()}
             </div>
          </div>
        </div>

        {/* Action Controls */}
        {showActions && (
          <div className="mt-8 flex flex-col gap-3 no-print animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={saveAsImage}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-4 bg-[#00ffd1] text-black font-black text-[11px] uppercase italic tracking-[0.2em] hover:bg-white transition-all shadow-[6px_6px_0px_#ff00b8] border-2 border-black disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                {isExporting ? 'ENCRYPTING...' : 'SAVE TICKET'}
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white font-black text-[11px] uppercase italic tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-[6px_6px_0px_#00ffd1] border-2 border-zinc-800"
              >
                <Printer className="w-4 h-4" /> PRINT / PDF
              </button>
            </div>
            <button 
              onClick={() => {
                const text = `I'm going to Pulse! Ticket ID: ${reservation.id}`;
                if (navigator.share) {
                  navigator.share({ title: 'Pulse Ticket', text, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(text);
                  alert("Link copied to clipboard!");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-black text-zinc-500 font-black text-[9px] uppercase italic tracking-[0.3em] hover:text-white transition-all border border-zinc-900"
            >
              <Share2 className="w-3 h-3" /> SHARE DIGITAL PASS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
