
import React, { useState } from 'react';
import { 
  Shield, Globe, Activity, Database, 
  Server, RefreshCw, Power, 
  ShieldCheck, Cpu, Network, Lock, Loader2, Plus, Trash2, XCircle, Trash, Terminal, Zap, Fingerprint, Search, Radio, Crosshair, Binary,
  ShieldAlert
} from 'lucide-react';
import { Reservation, AuditEntry, Tenant, ReservationStatus } from '../types';

interface Props {
  reservations: Reservation[];
  auditLog: AuditEntry[];
  tenants: Tenant[];
  activeTab: 'dashboard' | 'tenants' | 'security';
  setActiveTab: (tab: 'dashboard' | 'tenants' | 'security') => void;
  onDeleteReservation: (id: string) => void;
  onDeleteAuditLog: (id: string) => void;
  onClearAuditLogs: () => void;
  onDeployNode: () => void;
  onUpdateNode: (id: string, updates: Partial<Tenant>) => void;
  onDeleteNode?: (id: string) => void;
}

export const SuperAdminPortal: React.FC<Props> = ({ 
  reservations, 
  auditLog, 
  tenants, 
  activeTab,
  setActiveTab,
  onDeleteReservation, 
  onDeleteAuditLog,
  onClearAuditLogs,
  onDeployNode, 
  onUpdateNode,
  onDeleteNode
}) => {
  const [purgingIds, setPurgingIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  const globalRevenue = reservations.reduce((a, b) => a + (b.status !== ReservationStatus.VOIDED ? b.totalAmount : 0), 0);

  const handleHardPurge = async (id: string) => {
    setPurgingIds(prev => new Set(prev).add(id));
    try {
      await onDeleteReservation(id);
    } finally {
      setPurgingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleGlobalPurge = () => {
    if (!confirmPurge) {
      setConfirmPurge(true);
      setTimeout(() => setConfirmPurge(false), 3000);
      return;
    }
    onClearAuditLogs();
    setConfirmPurge(false);
  };

  return (
    <div className="p-10 space-y-12 bg-[#0d0211] min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-[#00d1ff]/30 pb-8 gap-6">
        <div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">ROOT <span className="text-[#00d1ff]">COMMAND</span></h2>
          <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00d1ff] animate-pulse" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em]">AUTH_LEVEL_07_SECURED</p>
             </div>
             <div className="h-3 w-[1px] bg-zinc-800" />
             <p className="text-[10px] font-black text-[#00ffd1] uppercase tracking-[0.2em] italic underline decoration-dotted">Eiden-Group Nexus</p>
          </div>
        </div>
        
        <div className="flex bg-black p-1 border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {[
            { id: 'dashboard', label: 'Network', icon: Globe },
            { id: 'tenants', label: 'Nodes', icon: Server },
            { id: 'security', label: 'Shield', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-8 py-3 text-[10px] font-black uppercase italic transition-all ${
                activeTab === tab.id ? 'bg-[#00d1ff] text-black shadow-[0_0_25px_rgba(0,209,255,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <tab.icon className="w-3 h-3" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatusTile icon={<Globe className="text-[#00d1ff]" />} label="Global Yield" value={`$${(globalRevenue / 1000).toFixed(1)}K`} sub="Aggregated Assets" accent="#00d1ff" />
              <StatusTile icon={<Database className="text-[#00ffd1]" />} label="Registry" value={reservations.length.toString()} sub="Database Objects" accent="#00ffd1" />
              <StatusTile icon={<Activity className="text-[#ff00b8]" />} label="Uptime" value="100.0%" sub="Latency: 14ms" accent="#ff00b8" />
            </div>

            <div className="bg-black border-4 border-zinc-900 overflow-hidden shadow-2xl relative">
              <div className="p-6 bg-zinc-950 border-b border-zinc-900 flex justify-between items-center">
                <h3 className="text-xl font-black italic uppercase text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-[#00d1ff]" /> Master Identity Manifest
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                     <tr className="text-[10px] font-black uppercase text-zinc-600 border-b border-zinc-900 bg-zinc-950">
                        <th className="p-6">Origin</th>
                        <th className="p-6">Identity</th>
                        <th className="p-6">Status</th>
                        <th className="p-6 text-right">Root Purge</th>
                     </tr>
                  </thead>
                  <tbody>
                    {reservations.map(res => (
                      <tr key={res.id} className={`border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors ${purgingIds.has(res.id) ? 'opacity-30' : ''}`}>
                         <td className="p-6 text-[10px] font-black italic text-[#00ffd1]">NODE_PULSE_01</td>
                         <td className="p-6">
                            <div className="font-black italic text-white uppercase tracking-tight">{res.name}</div>
                            <div className="text-[8px] font-mono text-zinc-700">{res.id}</div>
                         </td>
                         <td className="p-6">
                            <span className={`text-[9px] font-black px-2 py-1 bg-zinc-900 italic uppercase ${
                              res.status === 'checked-in' ? 'text-[#00ffd1]' : 'text-zinc-500'
                            }`}>
                              {res.status}
                            </span>
                         </td>
                         <td className="p-6 text-right">
                            <button 
                              onClick={() => handleHardPurge(res.id)}
                              disabled={purgingIds.has(res.id)}
                              className="p-3 bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_#000] border border-red-900/50"
                            >
                               {purgingIds.has(res.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border-4 border-zinc-900 flex flex-col shadow-2xl overflow-hidden min-h-[600px]">
             <div className="p-6 border-b border-zinc-900 bg-black flex justify-between items-center">
                <h4 className="text-xs font-black uppercase italic text-[#00d1ff] flex items-center gap-2 tracking-widest">
                   <ShieldCheck className="w-4 h-4" /> Audit Sessions
                </h4>
                <button 
                   onClick={handleGlobalPurge}
                   className={`p-2 transition-all ${confirmPurge ? 'text-red-500 animate-pulse' : 'text-zinc-600 hover:text-red-500'}`}
                >
                   {confirmPurge ? <ShieldAlert className="w-5 h-5" /> : <Trash className="w-3 h-3" />}
                </button>
             </div>
             <div className="flex-grow overflow-y-auto p-6 space-y-4 font-mono text-[8px] uppercase custom-scrollbar bg-[rgba(0,0,0,0.2)]">
                {auditLog.map(entry => (
                  <div key={entry.id} className="group bg-black/40 border border-zinc-900 p-4 hover:border-[#00d1ff] transition-all relative">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-1 bg-[#00d1ff]/5 border border-[#00d1ff]/20">
                           <Zap className="w-3 h-3 text-[#00d1ff]" />
                        </div>
                        <div className="flex-grow">
                           <div className="text-white font-black italic tracking-widest leading-none">{entry.action}</div>
                           <div className="text-zinc-700 text-[6px] mt-1">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                        </div>
                        <button 
                          onClick={() => onDeleteAuditLog(entry.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-zinc-700 transition-all"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                     </div>
                     <div className="text-zinc-500 leading-relaxed font-bold border-t border-zinc-900 pt-2">{entry.details}</div>
                     <div className="mt-2 text-[6px] text-zinc-800">AUTH: {entry.user}</div>
                  </div>
                ))}
                {auditLog.length === 0 && (
                  <div className="text-center py-20 text-zinc-800 italic border-2 border-dashed border-zinc-900">Zero Audit Packets Detected</div>
                )}
             </div>
             <div className="p-4 bg-black border-t border-zinc-900">
                <button 
                  onClick={onDeployNode}
                  className="w-full py-4 bg-[#00d1ff] text-black font-black text-[10px] uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[8px_8px_0px_#000]"
                >
                   <Plus className="w-3 h-3" /> INITIALIZE NODE
                </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'tenants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {tenants.map(node => (
             <div key={node.id} className="bg-black border-4 border-zinc-900 p-8 space-y-6 relative group transition-all hover:border-[#00d1ff]">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                   <Server className="w-20 h-20 text-[#00d1ff]" />
                </div>
                <div className="flex justify-between items-start">
                   <div>
                      <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">{node.id}</h4>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{node.location}</p>
                   </div>
                   <div className={`px-2 py-1 text-[8px] font-black uppercase italic ${node.status === 'ACTIVE' ? 'bg-[#00ffd1]/10 text-[#00ffd1]' : 'bg-red-500/10 text-red-500'}`}>{node.status}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-zinc-950 border border-zinc-900 p-4">
                      <div className="text-[7px] font-black text-zinc-600 mb-1">LOAD</div>
                      <div className="text-xl font-black italic text-white tracking-tighter">{node.load}</div>
                   </div>
                   <div className="bg-zinc-950 border border-zinc-900 p-4">
                      <div className="text-[7px] font-black text-zinc-600 mb-1">HEALTH</div>
                      <div className="text-xl font-black italic text-[#00ffd1]">{node.health}%</div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => onUpdateNode(node.id, { status: 'ACTIVE' })} className="flex-grow py-3 bg-zinc-900 text-white font-black text-[8px] uppercase italic hover:bg-white hover:text-black transition-all">Reboot Node</button>
                   <button onClick={() => onDeleteNode?.(node.id)} className="p-3 bg-red-950/30 text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-8">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-black border-4 border-zinc-900 p-10 space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d1ff] opacity-[0.02] pointer-events-none translate-x-1/3 -translate-y-1/3">
                  <Crosshair className="w-full h-full animate-spin-slow" />
               </div>
               <div className="border-b border-zinc-900 pb-8 flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">Shield God-Mode</h3>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mt-1">Eiden-Group Kernel V.07</p>
                  </div>
                  <Lock className="w-8 h-8 text-[#00d1ff]" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button className="flex flex-col items-center justify-center p-8 bg-zinc-950 border-2 border-zinc-900 hover:border-red-600 transition-all group">
                     <Power className="w-10 h-10 text-red-600 group-hover:animate-pulse mb-4" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Global Shutdown</span>
                  </button>
                  <button onClick={handleGlobalPurge} className="flex flex-col items-center justify-center p-8 bg-zinc-950 border-2 border-zinc-900 hover:border-[#00ffd1] transition-all group">
                     <Binary className="w-10 h-10 text-[#00ffd1] mb-4" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Flush Registry</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-8 bg-zinc-950 border-2 border-zinc-900 hover:border-[#ff00b8] transition-all group">
                     <Terminal className="w-10 h-10 text-[#ff00b8] mb-4" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Node Sync Scan</span>
                  </button>
               </div>
            </div>
          </div>
          <div className="bg-zinc-950 border-4 border-zinc-900 p-8 space-y-8">
             <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
                <Cpu className="w-6 h-6 text-[#00ffd1]" />
                <h4 className="text-xl font-black italic uppercase text-white">Kernel Logs</h4>
             </div>
             <div className="space-y-4 font-mono text-[7px] text-zinc-600 uppercase">
                <p>&gt; SHIELD_CORE_BOOTING... [OK]</p>
                <p>&gt; NEURAL_LINK_ESTABLISHED... [OK]</p>
                <p>&gt; SCANNING_NODES_01-04... [OK]</p>
                <p>&gt; ROOT_ID_VERIFIED: EIDEN_MASTER</p>
                <p>&gt; FIREWALL_LEVEL_MAX... [OK]</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusTile: React.FC<{ icon: React.ReactNode; label: string; value: string; sub: string; accent: string }> = ({ icon, label, value, sub, accent }) => (
  <div className="bg-black border-4 border-zinc-900 p-8 space-y-4 hover:border-zinc-700 transition-all relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
       <div className="w-full h-full shard-triangle-right" style={{ backgroundColor: accent }} />
    </div>
    <div className="bg-zinc-950 border border-zinc-900 p-3 w-fit">{icon}</div>
    <div>
      <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] italic mb-1">{label}</h4>
      <div className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">{value}</div>
      <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2 tracking-widest leading-none">{sub}</p>
    </div>
  </div>
);
