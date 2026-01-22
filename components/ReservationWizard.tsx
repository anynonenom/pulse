
import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, MapPin, Check, ChevronRight, ChevronLeft, Zap, Download, Printer, ShieldCheck, FileText, AlertCircle, Info, Lock, Send, CheckCircle2, Ticket, QrCode } from 'lucide-react';
import { TableZone, Reservation, ReservationStatus } from '../types';
import { ReceiptModal } from './ReceiptModal';

interface WizardProps {
  initialZone?: TableZone;
  onClose: () => void;
  onComplete: (data: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
}

export const ReservationWizard: React.FC<WizardProps> = ({ initialZone = TableZone.MAIN_FLOOR, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    partySize: 4,
    time: '10:00 PM',
    zone: initialZone,
    name: '',
    email: '',
    phone: '',
    table: '',
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, zone: initialZone }));
  }, [initialZone]);

  const steps = [
    { number: 1, title: 'Session' },
    { number: 2, title: 'Sector' },
    { number: 3, title: 'Identity' },
    { number: 4, title: 'Confirm' },
  ];

  const isGmail = (email: string) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  const isNumeric = (phone: string) => /^\d+$/.test(phone) && phone.length >= 8;
  const isStep3Valid = formData.name.length > 2 && isGmail(formData.email) && isNumeric(formData.phone);

  const handleNext = () => {
    if (step === 4) {
      const minSpend = formData.zone === TableZone.VIP_LOUNGE ? 1200 : 500;
      const tableId = formData.zone === TableZone.VIP_LOUNGE ? 'V' + Math.floor(Math.random() * 10 + 1) : 'M' + Math.floor(Math.random() * 20 + 1);
      const resId = `PULSE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      setGeneratedId(resId);
      setFormData(prev => ({ ...prev, table: tableId }));
      
      const reservationData = {
        ...formData,
        table: tableId,
        vip: formData.zone === TableZone.VIP_LOUNGE,
        totalAmount: minSpend
      };
      
      localStorage.setItem('pulse_last_res', JSON.stringify({
        ...reservationData,
        id: resId,
        createdAt: new Date().toISOString(),
        status: ReservationStatus.PENDING
      }));

      onComplete(reservationData);
      setIsCompleted(true);
      setStep(5);
    } else {
      setStep(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white">
      <div className="flex items-center justify-between p-8 border-b-2 border-zinc-800 bg-black">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <Zap className="text-[#ff00b8] fill-current" />
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">
              {isCompleted ? 'Access Granted' : 'Initiate Protocol'}
            </h2>
          </div>
          {!isCompleted && (
            <div className="hidden md:flex items-center gap-1">
              {steps.map((s) => (
                <div 
                  key={s.number}
                  className={`px-4 py-2 skew-x-[-12deg] transition-all ${
                    step === s.number ? 'bg-[#ff00b8] text-white' : 
                    step > s.number ? 'bg-[#00ffd1] text-black' : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest skew-x-[12deg]">
                    {s.number}. {s.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose} className="p-3 bg-zinc-900 hover:bg-[#ff00b8] transition-colors group">
          <X className="w-6 h-6 group-hover:text-white" />
        </button>
      </div>

      <div className="flex-grow p-10 overflow-y-auto custom-scrollbar flex items-center justify-center">
        {!isCompleted ? (
          <div className="w-full h-full">
            {step === 1 && (
              <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-5xl font-black italic uppercase tracking-tighter">Temporal Choice</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Party Strength</label>
                    <div className="flex items-center bg-black border-2 border-zinc-800 p-2">
                      <button onClick={() => setFormData(d => ({ ...d, partySize: Math.max(1, d.partySize - 1) }))} className="w-14 h-14 bg-zinc-900 flex items-center justify-center font-black hover:bg-[#ff00b8]">-</button>
                      <div className="flex-grow text-center text-3xl font-black italic">{formData.partySize}</div>
                      <button onClick={() => setFormData(d => ({ ...d, partySize: d.partySize + 1 }))} className="w-14 h-14 bg-zinc-900 flex items-center justify-center font-black hover:bg-[#ff00b8]">+</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Time Arrival</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM'].map(t => (
                        <button key={t} onClick={() => setFormData(d => ({ ...d, time: t }))} className={`py-4 font-black text-xs italic tracking-widest transition-all ${formData.time === t ? 'bg-[#00ffd1] text-black' : 'bg-black border-2 border-zinc-900 text-zinc-500 hover:border-zinc-700'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-5xl font-black italic uppercase tracking-tighter">Sector Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[TableZone.MAIN_FLOOR, TableZone.VIP_LOUNGE, TableZone.BALCONY].map((z) => (
                    <button key={z} onClick={() => setFormData(d => ({ ...d, zone: z }))} className={`p-8 border-b-4 transition-all text-left ${formData.zone === z ? 'bg-[#ff00b8] border-white' : 'bg-zinc-900 border-zinc-800 opacity-60'}`}>
                      <div className="text-2xl font-black italic uppercase">{z}</div>
                      <div className="text-[10px] font-bold text-black/50 uppercase mt-2">{z === TableZone.VIP_LOUNGE ? 'ULTRA EXCLUSIVE' : 'STANDARD ACCESS'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4">
                <div className="text-center space-y-4">
                  <h3 className="text-5xl font-black italic uppercase tracking-tighter">Authentication</h3>
                  <div className="flex items-center justify-center gap-2 text-[#ff00b8] text-[9px] font-black uppercase tracking-[0.3em]">
                    <Lock className="w-3 h-3" /> Secure Verification Protocol
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Identity Tag</label>
                    <input 
                      placeholder="Full Name / Alias" 
                      className="w-full bg-black border-2 border-zinc-900 p-6 text-xl font-black italic outline-none focus:border-[#ff00b8] transition-all" 
                      value={formData.name} 
                      onChange={e => setFormData(d => ({...d, name: e.target.value}))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Secure Uplink (Gmail Required)</label>
                      {formData.email && !isGmail(formData.email) && <span className="text-[8px] text-red-500 font-black animate-pulse uppercase">INVALID GMAIL FORMAT</span>}
                    </div>
                    <input 
                      type="email"
                      placeholder="user@gmail.com" 
                      className={`w-full bg-black border-2 p-6 text-xl font-black italic outline-none transition-all ${formData.email ? (isGmail(formData.email) ? 'border-green-500/50' : 'border-red-500/50') : 'border-zinc-900'} focus:border-[#ff00b8]`}
                      value={formData.email} 
                      onChange={e => setFormData(d => ({...d, email: e.target.value.toLowerCase()}))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Secure Line (Numeric Only)</label>
                      {formData.phone && !isNumeric(formData.phone) && <span className="text-[8px] text-red-500 font-black animate-pulse uppercase">NUMBERS ONLY</span>}
                    </div>
                    <input 
                      type="tel"
                      placeholder="+12345678" 
                      className={`w-full bg-black border-2 p-6 text-xl font-black italic outline-none transition-all ${formData.phone ? (isNumeric(formData.phone) ? 'border-green-500/50' : 'border-red-500/50') : 'border-zinc-900'} focus:border-[#ff00b8]`}
                      value={formData.phone} 
                      onChange={e => setFormData(d => ({...d, phone: e.target.value.replace(/\D/g, '')}))} 
                    />
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-[#ff00b8] mt-0.5" />
                  <p className="text-[8px] font-bold text-zinc-500 uppercase leading-relaxed tracking-wider">
                    To maintain the integrity of our sectors, we only accept @gmail.com accounts. 
                    Phone numbers must be entered without special characters.
                  </p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4">
                <div className="text-center space-y-4">
                  <h3 className="text-5xl font-black italic uppercase tracking-tighter text-[#fde047]">Manifest Review</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Final Validation Required</p>
                </div>

                <div className="bg-[#fde047] p-8 text-center text-[#0d0211] shadow-[0_0_30px_rgba(253,224,71,0.2)] relative">
                   <div className="text-[10px] font-black uppercase tracking-widest">Estimated Minimum Commitment</div>
                   <div className="text-5xl font-black italic tracking-tighter">${formData.zone === TableZone.VIP_LOUNGE ? '1,200.00' : '500.00'}</div>
                   <button 
                      onClick={() => setShowReceiptModal(true)}
                      className="mt-6 flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-black text-[#fde047] font-black text-[10px] uppercase italic tracking-[0.2em] hover:bg-zinc-800 transition-all border border-black"
                   >
                      <FileText className="w-4 h-4" /> GENERATE RECEIPT PREVIEW
                   </button>
                </div>

                <div className="bg-zinc-900/50 border-2 border-zinc-800 p-6 space-y-4">
                  <div className="flex items-center gap-3 text-[#ff00b8]">
                    <AlertCircle className="w-5 h-5" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest italic">Cancellation Policy & Terms</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    <div className="bg-black/40 p-3 border border-zinc-800/50">
                      <span className="text-white block mb-1 underline decoration-[#ff00b8]">Notice: 48H+</span>
                      Full refund of commitment deposit. 3-5 business days processing.
                    </div>
                    <div className="bg-black/40 p-3 border border-zinc-800/50">
                      <span className="text-white block mb-1 underline decoration-[#ff00b8]">Notice: 24H - 48H</span>
                      50% refund of commitment deposit. Credit issued to account.
                    </div>
                    <div className="bg-black/40 p-3 border border-zinc-800/50">
                      <span className="text-white block mb-1 underline decoration-[#ff00b8]">Notice: &lt; 24H</span>
                      Non-refundable. Commitment deposit forfeited.
                    </div>
                    <div className="bg-black/40 p-3 border border-zinc-800/50">
                      <span className="text-white block mb-1 underline decoration-[#ff00b8]">No-Show Protocol</span>
                      Non-refundable. Reservation voided after 30 mins delay.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-10 animate-in zoom-in-95 duration-700 text-center space-y-12">
             <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#00ffd1] opacity-20 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="relative z-10 p-10 bg-black border-4 border-[#00ffd1] rounded-full shadow-[0_0_50px_rgba(0,255,209,0.3)]">
                   <QrCode className="w-16 h-16 text-[#00ffd1]" />
                </div>
                <div className="absolute -top-4 -right-4 p-3 bg-[#ff00b8] rounded-full shadow-lg">
                   <ShieldCheck className="w-6 h-6 text-white" />
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
                  Ticket <span className="text-[#00ffd1]">Generated</span>
                </h3>
                <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-[#ff00b8] to-transparent mx-auto" />
                <p className="text-xl md:text-2xl font-black italic text-[#00ffd1] uppercase tracking-[0.2em] max-w-lg mx-auto leading-tight">
                  YOUR ACCESS PASS IS READY FOR DOWNLOAD.
                </p>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] italic">
                   Please claim your ticket immediately. It is required for sector entry.
                </p>
             </div>

             <div className="pt-6">
                <button 
                   onClick={() => setShowReceiptModal(true)}
                   className="w-full max-w-md py-6 bg-white text-black font-black text-sm uppercase italic tracking-[0.5em] shadow-[12px_12px_0px_#ff00b8] hover:bg-[#00ffd1] transition-all flex items-center justify-center gap-4 mx-auto border-2 border-black active:translate-y-1 active:shadow-none"
                >
                   <Ticket className="w-6 h-6" /> CLAIM ACCESS TICKET
                </button>
                <button 
                  onClick={onClose}
                  className="mt-8 text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Return to Main Lobby
                </button>
             </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t-2 border-zinc-800 bg-black flex justify-between items-center">
        {!isCompleted ? (
          <>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="px-8 py-4 bg-zinc-900 font-black text-[10px] uppercase italic disabled:opacity-0">REVERSE</button>
            <button 
              onClick={handleNext} 
              disabled={(step === 3 && !isStep3Valid)} 
              className={`px-12 py-5 font-black text-xs italic tracking-[0.4em] uppercase transition-all shadow-[10px_10px_0px_#ff00b8] active:translate-x-1 active:translate-y-1 active:shadow-none ${
                (step === 3 && !isStep3Valid) ? 'bg-zinc-800 text-zinc-600 shadow-none cursor-not-allowed' : 'bg-[#00ffd1] text-black hover:bg-white'
              }`}
            >
              {step === 4 ? 'AUTHORIZE TRANSFER' : 'PROCEED'}
            </button>
          </>
        ) : (
          <div className="w-full text-center text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] italic">
             Pulse Manifest Node Alpha-07 Secured
          </div>
        )}
      </div>

      {showReceiptModal && (
        <ReceiptModal 
          reservation={{
            ...formData,
            id: generatedId,
            createdAt: new Date().toISOString(),
            status: ReservationStatus.PENDING,
            vip: formData.zone === TableZone.VIP_LOUNGE,
            totalAmount: formData.zone === TableZone.VIP_LOUNGE ? 1200 : 500
          }} 
          onClose={() => setShowReceiptModal(false)}
          showActions={true}
        />
      )}
    </div>
  );
};
