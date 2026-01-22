
import React, { useState, useMemo } from 'react';
import { 
  Users, DollarSign, Search, Calendar, RefreshCw, 
  Loader2, Activity, UserX, FileText, XCircle, MapPin, 
  Plus, Radio, Eye, Fingerprint, Cpu, AlertTriangle, ShieldAlert, Filter
} from 'lucide-react';
import { Reservation, ReservationStatus, TableZone, StaffMember } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  reservations: Reservation[];
  staff: StaffMember[];
  yieldData: { name: string; revenue: number }[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdateReservation: (id: string, updates: Partial<Reservation>) => void;
  onUpdateStaff: (id: string, updates: Partial<StaffMember>) => void;
  onAddStaff?: (member: Omit<StaffMember, 'id'>) => void;
  onDeleteReservation: (id: string) => void;
  onViewReceipt?: (reservation: Reservation) => void;
  socketStatus?: 'connected' | 'reconnecting' | 'error';
  onRefresh?: () => void;
  activeTab: 'grid' | 'clients' | 'yield' | 'staffing';
  setActiveTab: (tab: 'grid' | 'clients' | 'yield' | 'staffing') => void;
}

const MAX_CAPACITY = 200;
const ALERT_THRESHOLD = 0.9;

const TIME_SLOTS = ["10:00 PM", "11:00 PM", "12:00 AM", "01:00 AM"];

const TABLE_CONFIG = [
  { id: "V1", capacity: 12, zone: "VIP" },
  { id: "V2", capacity: 8, zone: "VIP" },
  { id: "M1", capacity: 15, zone: "MAIN" },
  { id: "B1", capacity: 6, zone: "BALCONY" },
];

export const AdminPortal: React.FC<Props> = ({ 
  reservations, staff, yieldData, onUpdateStatus, onUpdateReservation, onUpdateStaff, onAddStaff, onDeleteReservation, onViewReceipt, socketStatus = 'connected', onRefresh, activeTab, setActiveTab 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', sector: '', status: 'ACTIVE' as const });

  const checkedInCount = useMemo(() => 
    reservations.filter(r => r.status === ReservationStatus.CHECKED_IN).length,
  [reservations]);

  const loadPercentage = useMemo(() => 
    Math.floor((checkedInCount / MAX_CAPACITY) * 100),
  [checkedInCount]);

  const isCriticalCapacity = loadPercentage >= (ALERT_THRESHOLD * 100);

  const filteredReservations = reservations.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sectors = useMemo(() => {
    const s = new Set(staff.map(member => member.sector).filter(Boolean));
    return ['ALL', ...Array.from(s)];
  }, [staff]);

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || s.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const handleRefresh = async () => {
    setIsSyncing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setIsSyncing(false), 1200);
  };

  const totalYieldValue = reservations.reduce((a, b) => a + (b.status !== ReservationStatus.VOIDED ? b.totalAmount : 0), 0);

  return (
    <div className="p-0 space-y-0 bg-[#0d0211] min-h-screen pb-24 animate-in fade-in duration-500">
      {/* CRITICAL OCCUPANCY ALERT BAR */}
      {isCriticalCapacity && (
        <div className="bg-red-600 text-white p-3 flex items-center justify-center gap-4 animate-pulse sticky top-0 z-[60] shadow-[0_4px_30px_rgba(220,38,38,0.5)] border-b border-white/20">
          <ShieldAlert className="w-5 h-5 animate-bounce" />
          <div className="text-[11px] font-black uppercase tracking-[0.3em] italic">
            CRITICAL CAPACITY ALERT: VENUE SATURATION AT {loadPercentage}% — INITIATE DOOR RESTRICTION PROTOCOL
          </div>
          <AlertTriangle className="w-5 h-5 animate-bounce" />
        </div>
      )}

      <div className="p-10 space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-6">
            <div className="flex bg-black p-1 border border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
               <button onClick={() => setActiveTab('grid')} className={`px-6 py-3 text-[10px] font-black uppercase italic transition-all ${activeTab === 'grid' ? 'bg-[#00ffd1] text-black shadow-[0_0_15px_rgba(0,255,209,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>Grid Ops</button>
               <button onClick={() => setActiveTab('clients')} className={`px-6 py-3 text-[10px] font-black uppercase italic transition-all ${activeTab === 'clients' ? 'bg-[#00d1ff] text-black shadow-[0_0_15px_rgba(0,209,255,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>Clients</button>
               <button onClick={() => setActiveTab('yield')} className={`px-6 py-3 text-[10px] font-black uppercase italic transition-all ${activeTab === 'yield' ? 'bg-[#ff00b8] text-white shadow-[0_0_15px_rgba(255,0,184,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>Yield</button>
               <button onClick={() => setActiveTab('staffing')} className={`px-6 py-3 text-[10px] font-black uppercase italic transition-all ${activeTab === 'staffing' ? 'bg-[#fde047] text-black shadow-[0_0_15px_rgba(253,224,71,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>Staffing</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">Manifest Integrity</span>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${socketStatus === 'connected' ? 'bg-[#00ffd1] animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-[10px] font-black uppercase italic ${socketStatus === 'connected' ? 'text-white' : 'text-red-500'}`}>{socketStatus === 'connected' ? 'Uplink Established' : 'Sync Error'}</span>
              </div>
            </div>
            <button 
              disabled={isSyncing}
              onClick={handleRefresh} 
              className={`px-8 py-3 font-black text-[10px] uppercase italic tracking-[0.2em] flex items-center gap-3 transition-all relative overflow-hidden ${
                isSyncing ? 'bg-zinc-900 text-zinc-500 border border-zinc-800' : 'bg-white text-black hover:bg-[#00ffd1] shadow-[8px_8px_0px_#ff00b8]'
              }`}
            >
               {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
               {isSyncing ? 'SYNCHRONIZING...' : 'UPLINK SYNC'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryTile icon={<Users className="text-[#ff00b8]" />} label="Live Pulse" value={checkedInCount.toString()} sub="Checked-In Guests" accent="#ff00b8" />
          <SummaryTile icon={<Activity className={isCriticalCapacity ? "text-red-500 animate-pulse" : "text-[#00ffd1]"} />} label="Venue Load" value={`${loadPercentage}%`} sub={isCriticalCapacity ? "CRITICAL SATURATION" : "Instant Saturation"} accent={isCriticalCapacity ? "#ef4444" : "#00ffd1"} />
          <SummaryTile icon={<DollarSign className="text-[#fde047]" />} label="Commitment" value={`$${(totalYieldValue / 1000).toFixed(1)}K`} sub="Gross Revenue Pipeline" accent="#fde047" />
          <SummaryTile icon={<Calendar className="text-zinc-600" />} label="Unconfirmed" value={reservations.filter(r => r.status === ReservationStatus.PENDING).length.toString()} sub="Pending Authorization" accent="#555" />
        </div>

        {activeTab === 'clients' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-black border-4 border-zinc-900 shadow-2xl overflow-hidden">
               <div className="p-8 bg-zinc-950/50 border-b border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                     <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Identity Registry</h3>
                     <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1 italic">Master Client Database • Uplink Ready</p>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="relative flex-grow md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-700" />
                        <input 
                          placeholder="SEARCH IDENTITY / PHONE / ID..." 
                          value={searchTerm} 
                          onChange={e => setSearchTerm(e.target.value)} 
                          className="bg-black border-2 border-zinc-900 py-4 pl-12 pr-6 outline-none focus:border-[#00ffd1] text-[10px] font-black uppercase text-white w-full transition-all" 
                        />
                     </div>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[8px] font-black uppercase text-zinc-700 border-b border-zinc-900/50 bg-black">
                           <th className="p-6">Client Identity</th>
                           <th className="p-6">Manifest ID</th>
                           <th className="p-6">Sector Allocation</th>
                           <th className="p-6">Status</th>
                           <th className="p-6 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredReservations.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-20 text-center text-zinc-700 font-black uppercase italic tracking-widest">Zero Identities Found In Current Node</td>
                          </tr>
                        ) : filteredReservations.map(res => (
                            <tr key={res.id} className="border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all group">
                               <td className="p-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 flex items-center justify-center text-black font-black italic text-xl shadow-[4px_4px_0px_#000]`} style={{ backgroundColor: res.status === 'checked-in' ? '#00ffd1' : '#ff00b8' }}>{res.name[0]}</div>
                                     <div>
                                        <div className="text-[12px] font-black italic text-white uppercase tracking-tight">{res.name}</div>
                                        <div className="text-[8px] font-bold text-zinc-600">{res.phone}</div>
                                     </div>
                                  </div>
                               </td>
                               <td className="p-6">
                                  <div className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-tighter flex items-center gap-1 group-hover:text-white transition-colors">
                                    <Fingerprint className="w-3 h-3 text-[#00d1ff]" /> {res.id}
                                  </div>
                               </td>
                               <td className="p-6">
                                  <div className="text-[9px] font-black text-white uppercase italic">{res.zone.toUpperCase()}</div>
                                  <div className="text-[8px] font-black text-zinc-600 tracking-widest flex items-center gap-1"><MapPin className="w-2 h-2" /> STATION: {res.table}</div>
                               </td>
                               <td className="p-6">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${res.status === 'checked-in' ? 'bg-[#00ffd1] shadow-[0_0_8px_#00ffd1]' : 'bg-zinc-800'}`} />
                                    <span className={`text-[8px] font-black px-2 py-0.5 bg-zinc-950 italic uppercase tracking-widest ${res.status === 'checked-in' ? 'text-[#00ffd1]' : res.status === 'pending' ? 'text-yellow-500' : 'text-zinc-600'}`}>{res.status}</span>
                                  </div>
                               </td>
                               <td className="p-6 text-right">
                                  <div className="flex justify-end gap-2">
                                     <button onClick={() => setSelectedClient(res)} className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-600 hover:text-[#00d1ff] transition-all"><Eye className="w-4 h-4" /></button>
                                     <button onClick={() => onViewReceipt?.(res)} className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-600 hover:text-[#00ffd1] transition-all"><FileText className="w-4 h-4" /></button>
                                     <button onClick={() => onDeleteReservation(res.id)} className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-600 hover:text-red-500 transition-all"><UserX className="w-4 h-4" /></button>
                                  </div>
                               </td>
                            </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {selectedClient && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
             <div className="w-full max-w-2xl bg-black border-4 border-[#00d1ff] shadow-[0_0_80px_rgba(0,209,255,0.2)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="p-10 space-y-10 relative z-10">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 bg-[#00d1ff] flex items-center justify-center text-black font-black italic text-4xl shadow-[8px_8px_0px_#000]">{selectedClient.name[0]}</div>
                         <div>
                            <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">{selectedClient.name}</h3>
                            <div className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Identity ID: {selectedClient.id}</div>
                         </div>
                      </div>
                      <button onClick={() => setSelectedClient(null)} className="p-2 text-zinc-700 hover:text-white"><XCircle className="w-8 h-8" /></button>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-950 border-2 border-zinc-900 p-6 space-y-4">
                         <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2">Uplink Details</div>
                         <div className="space-y-2 text-sm font-black italic text-white uppercase truncate">{selectedClient.email}</div>
                         <div className="space-y-2 text-sm font-black italic text-white uppercase">{selectedClient.phone}</div>
                      </div>
                      <div className="bg-zinc-950 border-2 border-zinc-900 p-6 space-y-4">
                         <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2">Deployment</div>
                         <div className="text-sm font-black italic text-[#00ffd1] uppercase">{selectedClient.zone} • {selectedClient.table}</div>
                         <div className="text-sm font-black italic text-[#ff00b8] uppercase">Value: ${selectedClient.totalAmount}</div>
                      </div>
                   </div>
                   <button onClick={() => setSelectedClient(null)} className="w-full py-5 bg-white text-black font-black text-[10px] uppercase italic tracking-[0.4em] shadow-[8px_8px_0px_#000]">CLOSE IDENTITY SCAN</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-black border-4 border-zinc-900 overflow-x-auto shadow-2xl">
               <table className="w-full border-collapse">
                  <thead>
                     <tr className="border-b border-zinc-900 text-[10px] font-black uppercase text-zinc-500 bg-zinc-950">
                        <th className="p-4 text-left border-r border-zinc-900 w-24 italic">Sector Node</th>
                        {TIME_SLOTS.map(t => <th key={t} className="p-4 border-r border-zinc-900/50">{t}</th>)}
                     </tr>
                  </thead>
                  <tbody>
                     {TABLE_CONFIG.map(table => (
                       <tr key={table.id} className="border-b border-zinc-900">
                          <td className="p-4 bg-zinc-950 border-r border-zinc-900 font-black italic text-white uppercase">{table.id}</td>
                          {TIME_SLOTS.map(time => {
                             const res = reservations.find(r => r.table === table.id && r.time === time && r.status !== ReservationStatus.VOIDED);
                             return (
                               <td key={time} className="p-2 h-28 min-w-[160px] border-r transition-all group hover:bg-zinc-900/20" 
                                 onDragOver={(e) => { e.preventDefault(); }}
                                 onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('reservationId'); if (id) onUpdateReservation(id, { time, table: table.id }); }}
                               >
                                  {res ? (
                                    <div draggable onDragStart={(e) => e.dataTransfer.setData('reservationId', res.id)} className="h-full p-3 bg-zinc-900 border-l-4 border-[#00ffd1] cursor-grab shadow-lg">
                                       <div className="text-[10px] font-black text-white uppercase truncate italic">{res.name}</div>
                                       <div className="text-[8px] text-zinc-600 mt-2 font-black uppercase">{res.partySize} PAX</div>
                                    </div>
                                  ) : <div className="h-full opacity-5 flex items-center justify-center text-[8px] font-black uppercase italic">Available Node</div>}
                               </td>
                             );
                          })}
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="bg-black border-4 border-zinc-900 p-8 shadow-2xl overflow-y-auto max-h-[600px] custom-scrollbar">
               <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                 <h3 className="text-xl font-black italic uppercase text-white">Entry Queue</h3>
                 <Radio className="w-4 h-4 text-[#ff00b8] animate-pulse" />
               </div>
               <div className="space-y-4">
                  {reservations.filter(r => r.status === 'pending').map(res => (
                    <div key={res.id} className="p-4 bg-zinc-950 border-l-4 border-[#ff00b8] flex justify-between items-center group shadow-md hover:border-white transition-all">
                       <div>
                          <div className="text-[10px] font-black text-white uppercase italic tracking-tight">{res.name}</div>
                          <div className="text-[7px] text-zinc-600 uppercase tracking-[0.2em] font-bold mt-1">{res.time} • {res.zone}</div>
                       </div>
                       <button onClick={() => onUpdateStatus(res.id, ReservationStatus.CHECKED_IN)} className="px-4 py-2 bg-zinc-900 text-[#00ffd1] font-black text-[8px] uppercase italic border border-zinc-800 hover:bg-[#00ffd1] hover:text-black transition-all">CHECK-IN</button>
                    </div>
                  ))}
                  {reservations.filter(r => r.status === 'pending').length === 0 && (
                    <div className="text-center py-20 text-[9px] font-black uppercase text-zinc-800 italic">Queue Manifest Empty</div>
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'yield' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-black border-4 border-zinc-900 p-8 shadow-2xl">
                   <h3 className="text-2xl font-black italic uppercase text-white mb-8 border-b border-zinc-900 pb-4">Revenue Pipeline</h3>
                   <div className="h-[400px] w-full min-h-[400px]">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                         <AreaChart data={yieldData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                            <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                            <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', fontSize: '10px'}} />
                            <Area type="monotone" dataKey="revenue" stroke="#ff00b8" fill="#ff00b8" fillOpacity={0.1} strokeWidth={3} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="bg-black border-4 border-zinc-900 p-8 shadow-2xl">
                   <h3 className="text-xl font-black italic uppercase text-white mb-8 border-b border-zinc-900 pb-4">Sector Allocation</h3>
                   <div className="h-[250px] w-full min-h-[250px]">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                         <PieChart>
                            <Pie data={reservations.reduce((acc, r) => {
                                 if (r.status !== ReservationStatus.VOIDED) {
                                   const existing = acc.find((a: any) => a.name === r.zone);
                                   if (existing) existing.value += r.totalAmount;
                                   else acc.push({ name: r.zone, value: r.totalAmount });
                                 }
                                 return acc;
                               }, [] as any[])} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                               {[0, 1, 2, 3].map((_, i) => <Cell key={i} fill={['#ff00b8', '#00ffd1', '#fde047', '#00d1ff'][i]} />)}
                            </Pie>
                            <Tooltip />
                         </PieChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'staffing' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-900 pb-8 gap-6">
                <div>
                  <h3 className="text-5xl font-black italic uppercase text-white leading-none">Personnel Matrix</h3>
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mt-2 italic">Active Operator Deployment</p>
                </div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
                   {/* SECTOR FILTER DROPDOWN */}
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                         <Filter className="w-3 h-3 text-zinc-500" />
                         <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Sector:</span>
                      </div>
                      <select 
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="bg-black border-2 border-zinc-900 pl-24 pr-10 py-4 text-[10px] font-black uppercase text-white italic outline-none focus:border-[#00ffd1] appearance-none cursor-pointer transition-all"
                      >
                         {sectors.map(s => (
                           <option key={s} value={s} className="bg-zinc-950">{s}</option>
                         ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                         <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-zinc-500" />
                      </div>
                   </div>

                   <button onClick={() => setShowAddStaff(true)} className="px-6 py-4 bg-white text-black font-black text-[10px] uppercase italic tracking-widest hover:bg-[#fde047] transition-all flex items-center gap-2 shadow-[4px_4px_0px_#ff00b8]">
                      <Plus className="w-4 h-4" /> RECRUIT OPERATOR
                   </button>
                </div>
             </div>

             {showAddStaff && (
               <div className="bg-black border-4 border-[#fde047] p-8 animate-in zoom-in-95 duration-300 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                   <h4 className="text-sm font-black text-white uppercase italic tracking-widest">Tactical Recruitment Form</h4>
                   <button onClick={() => setShowAddStaff(false)} className="text-zinc-500 hover:text-white transition-colors"><XCircle className="w-6 h-6" /></button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <input placeholder="NAME" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="bg-zinc-950 border-2 border-zinc-900 p-4 text-[10px] font-black uppercase text-white focus:border-[#fde047] outline-none" />
                   <input placeholder="ROLE" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="bg-zinc-950 border-2 border-zinc-900 p-4 text-[10px] font-black uppercase text-white focus:border-[#fde047] outline-none" />
                   <input placeholder="SECTOR" value={newStaff.sector} onChange={e => setNewStaff({...newStaff, sector: e.target.value})} className="bg-zinc-950 border-2 border-zinc-900 p-4 text-[10px] font-black uppercase text-white focus:border-[#fde047] outline-none" />
                   <button onClick={() => { onAddStaff?.(newStaff); setShowAddStaff(false); }} className="bg-[#fde047] text-black font-black uppercase p-4 text-[10px] italic shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none transition-all">DEPLOY TO GRID</button>
                 </div>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStaff.map(member => (
                  <div key={member.id} className="bg-black border-4 border-zinc-900 p-8 space-y-6 group hover:border-white transition-all relative overflow-hidden shadow-xl">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Cpu className="w-16 h-16" />
                     </div>
                     <div className="flex justify-between items-start relative z-10">
                        <div>
                           <h4 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">{member.name}</h4>
                           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-2 italic">{member.role} • {member.sector}</p>
                        </div>
                        <div className={`text-[8px] font-black px-2 py-1 uppercase italic ${member.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{member.status}</div>
                     </div>
                     <div className="grid grid-cols-2 gap-2 pt-2 relative z-10 border-t border-zinc-900 mt-4">
                        <button onClick={() => onUpdateStaff(member.id, { status: member.status === 'ACTIVE' ? 'BREAK' : 'ACTIVE' })} className="py-4 bg-zinc-900 text-white text-[8px] font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all">Toggle Uplink</button>
                        <button className="py-4 bg-zinc-950 border-2 border-zinc-900 text-zinc-700 text-[8px] font-black uppercase italic hover:text-white transition-all">Audit Bio</button>
                     </div>
                  </div>
                ))}
                {filteredStaff.length === 0 && (
                  <div className="col-span-full py-32 text-center text-zinc-800 font-black uppercase italic tracking-widest">Zero Personnel Matched Deployment Filter</div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryTile: React.FC<{icon: any, label: string, value: string, sub: string, accent: string}> = ({icon, label, value, sub, accent}) => (
  <div className="bg-black border-4 border-zinc-900 p-8 space-y-4 hover:border-zinc-700 transition-all relative overflow-hidden group shadow-xl">
    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
       <div className="w-16 h-16 border-t border-r" style={{borderColor: accent}} />
    </div>
    <div className="bg-zinc-950 border border-zinc-900 p-3 w-fit transition-transform group-hover:scale-110">{icon}</div>
    <div>
      <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] italic mb-1">{label}</h4>
      <div className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">{value}</div>
      <p className="text-[9px] font-bold text-zinc-500 uppercase mt-2 tracking-widest leading-none italic">{sub}</p>
    </div>
  </div>
);
