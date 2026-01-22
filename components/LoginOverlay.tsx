
import React, { useState } from 'react';
import { Shield, X, Lock, ChevronRight, AlertCircle, Cpu, Fingerprint, Database, Radio, Terminal, Binary, ShieldCheck } from 'lucide-react';
import { ViewRole, AuthUser } from '../types';

interface Props {
  targetRole: ViewRole;
  onSuccess: (user: AuthUser) => void;
  onCancel: () => void;
}

const MASTER_REGISTRY = {
  'admin': { 
    user: 'admin', 
    pass: 'admin',
    label: 'Pulse Operations Center',
    clearance: 'Level 04 - Tactical'
  },
  'super-admin': { 
    user: 'super admin', 
    pass: 'super admin',
    label: 'EIDEN-GROUP GLOBAL COMMAND',
    clearance: 'Level 07 - CORE ROOT'
  }
};

export const LoginOverlay: React.FC<Props> = ({ targetRole, onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const roleConfig = MASTER_REGISTRY[targetRole as keyof typeof MASTER_REGISTRY] || MASTER_REGISTRY['admin'];
  const isSuper = targetRole === 'super-admin';
  const roleColor = isSuper ? '#00d1ff' : '#00ffd1';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError(null);

    setTimeout(() => {
      if (username.toLowerCase() === roleConfig.user.toLowerCase() && password === roleConfig.pass) {
        onSuccess({
          username,
          role: targetRole,
          token: `PULSE_SEC_UPLINK_${Math.random().toString(36).substr(2, 12).toUpperCase()}`
        });
      } else {
        setError('UPLINK REJECTED. INVALID IDENTIFIER OR SECURITY KEY.');
        setIsAuthenticating(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d0211]/98 backdrop-blur-3xl flex items-center justify-center p-4">
      {/* Outer Cyan Border Wrapper for Super Admin */}
      <div className={`w-full max-w-lg p-1 transition-all duration-700 ${isSuper ? 'bg-[#00d1ff]' : 'bg-transparent'}`}>
        <div className={`w-full bg-black relative overflow-hidden animate-in zoom-in-95 duration-500 ${!isSuper ? 'border-4 border-zinc-900 shadow-[0_0_120px_rgba(0,0,0,0.8)]' : ''}`}>
          
          {/* Scanline Background Grid for Super Admin */}
          {isSuper && (
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00d1ff_3px)] bg-[length:100%_4px]" />
            </div>
          )}
          
          {/* Shard Decoration */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 opacity-[0.05] pointer-events-none transition-all duration-700" 
            style={{ background: roleColor, clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} 
          />
          
          <div className="p-10 space-y-10 relative z-10">
            {/* Header with Security Logo Box */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {isSuper ? (
                  <div className="w-16 h-16 border-2 border-[#00d1ff] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,209,255,0.3)] bg-[#00d1ff]/5">
                    <ShieldCheck className="w-10 h-10 text-[#00d1ff] drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]" />
                  </div>
                ) : (
                  <div className="p-3 bg-zinc-950 border border-zinc-800 shadow-[4px_4px_0px_#000]">
                    <Terminal className="w-8 h-8 text-[#00ffd1]" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <h3 className="text-4xl font-black italic uppercase tracking-[-0.05em] text-white leading-none">AUTH UPLINK</h3>
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${isSuper ? 'animate-pulse' : ''}`} style={{ backgroundColor: roleColor }} />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] italic" style={{ color: roleColor }}>
                        {roleConfig.label}
                     </p>
                  </div>
                </div>
              </div>
              <button onClick={onCancel} className="p-1 text-zinc-700 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Protocol Bar */}
            <div className="bg-[#111] border-y border-zinc-800 py-3 flex justify-between px-4">
               <div className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em]">Auth Protocol</div>
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">{roleConfig.clearance}</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] ml-1">Identity Vector</label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-white transition-colors" />
                    <input 
                      autoFocus
                      type="text"
                      placeholder="IDENTIFIER..."
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-zinc-950 border-2 border-zinc-900 p-6 pl-14 text-xs font-black italic text-white outline-none focus:border-zinc-700 transition-all uppercase tracking-[0.3em] placeholder:text-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] ml-1">Secure Bitstream</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-white transition-colors" />
                    <input 
                      type="password"
                      placeholder="PASSKEY..."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-zinc-950 border-2 border-zinc-900 p-6 pl-14 text-xs font-black italic text-white outline-none focus:border-zinc-700 transition-all tracking-[0.3em] placeholder:text-zinc-800"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-950/20 border-l-4 border-red-500 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-tight">{error}</p>
                </div>
              )}

              <button 
                disabled={isAuthenticating}
                className={`w-full py-7 flex items-center justify-center gap-4 text-black font-black text-sm uppercase italic tracking-[0.5em] transition-all relative overflow-hidden group ${
                  isAuthenticating ? 'bg-zinc-900 cursor-wait' : 'bg-white hover:bg-zinc-100 active:translate-y-1'
                }`}
                style={!isAuthenticating ? { boxShadow: `12px 12px 0px ${roleColor}` } : {}}
              >
                {isAuthenticating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    VERIFYING...
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 animate-pulse" />
                    INITIALIZE {isSuper ? 'ROOT' : 'NODE'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 justify-center">
                 <div className="h-[1px] flex-grow bg-zinc-900" />
                 <div className="flex items-center gap-2 text-zinc-700">
                   <Database className="w-3 h-3" />
                   <span className="text-[8px] font-black uppercase tracking-[0.4em]">Audit Node Active</span>
                 </div>
                 <div className="h-[1px] flex-grow bg-zinc-900" />
              </div>
              <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] text-center leading-relaxed italic max-w-sm mx-auto">
                Manifest persistence is recorded. System level access requires valid cryptographic signatures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
