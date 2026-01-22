
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Layout } from './components/Layout';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal } from './components/AdminPortal';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { LoginOverlay } from './components/LoginOverlay';
import { ZonesPage } from './components/ZonesPage';
import { AccessPage } from './components/AccessPage';
import { Reservation, ViewRole, ReservationStatus, AuditEntry, AuthUser, TableZone, Tenant, StaffMember } from './types';
import { supabase } from './lib/supabase';
import { AlertCircle, Database, Copy, Check, ShieldAlert, X } from 'lucide-react';
import { ReceiptModal } from './components/ReceiptModal';

export const SOCKET_EVENT = 'PULSE_SOCKET_UPDATE';

const isTempId = (id: string) => typeof id === 'string' && id.startsWith('PULSE-');

const mapFromDb = (row: any): Reservation => ({
  id: row.id?.toString() || '',
  name: row.name || '',
  email: row.email || '',
  phone: row.phone || '',
  date: row.booking_date || row.date || '',
  time: row.booking_time || row.time || '',
  partySize: Number(row.party_size || row.partySize || 0),
  table: row.table_id || row.table || '',
  zone: (row.zone || TableZone.MAIN_FLOOR) as TableZone,
  status: (row.status || ReservationStatus.PENDING) as ReservationStatus,
  totalAmount: Number(row.total_amount || row.totalAmount || 0),
  vip: !!(row.is_vip ?? row.vip ?? false),
  createdAt: row.created_at || row.createdAt || new Date().toISOString()
});

const mapToDb = (res: Partial<Reservation>) => {
  const dbRow: any = {
    name: res.name,
    email: res.email,
    phone: res.phone,
    booking_date: res.date,
    booking_time: res.time,
    party_size: res.partySize,
    table_id: res.table,
    zone: res.zone,
    status: res.status,
    total_amount: res.totalAmount,
    is_vip: res.vip,
    created_at: res.createdAt
  };
  if (res.id && !isTempId(res.id)) dbRow.id = res.id;
  
  Object.keys(dbRow).forEach(key => {
    if (dbRow[key] === undefined || dbRow[key] === null) delete dbRow[key];
  });
  return dbRow;
};

const DatabaseSetupBanner: React.FC<{onRetry: () => void}> = ({ onRetry }) => {
  const [copied, setCopied] = useState(false);
  const sql = `-- PULSE & EIDEN-GROUP INFRASTRUCTURE REPAIR

-- 1. Identity Manifest Table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  booking_date text,
  booking_time text,
  party_size integer,
  table_id text,
  zone text,
  status text DEFAULT 'pending',
  total_amount numeric,
  is_vip boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Network Node Table
CREATE TABLE IF NOT EXISTS tenants (
  id text PRIMARY KEY,
  location text NOT NULL,
  status text DEFAULT 'SYNCING',
  load text DEFAULT '0%',
  yield numeric DEFAULT 0,
  health integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- 3. Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  status text DEFAULT 'ACTIVE',
  sector text,
  created_at timestamptz DEFAULT now()
);

-- 4. Security Audit Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  "user" text,
  details text,
  timestamp timestamptz DEFAULT now()
);

-- 5. Realtime Purge
ALTER TABLE reservations REPLICA IDENTITY FULL;
ALTER TABLE audit_logs REPLICA IDENTITY FULL;
ALTER TABLE tenants REPLICA IDENTITY FULL;
ALTER TABLE staff REPLICA IDENTITY FULL;

-- 6. Access Policies
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Full Access" ON reservations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public Tenant Access" ON tenants FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public Audit Access" ON audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public Staff Access" ON staff FOR ALL TO anon USING (true) WITH CHECK (true);`;

  return (
    <div className="bg-[#fde047] p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b-4 border-black">
      <div className="flex items-center gap-3 text-black">
        <ShieldAlert className="w-6 h-6 animate-pulse" />
        <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
          <p>Database Expansion Required</p>
          <p className="opacity-60">Staff and advanced yield data tables missing. Run the Setup SQL.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase italic flex items-center gap-2 hover:bg-zinc-800 transition-colors">
          {copied ? <Check className="w-3 h-3 text-[#00ffd1]" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied Repair SQL' : 'Copy Setup SQL'}
        </button>
        <button onClick={onRetry} className="bg-white text-black px-4 py-2 text-[10px] font-black uppercase italic border-2 border-black hover:bg-[#ff00b8] hover:text-white transition-colors">
          Retry Sync
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewRole>('customer');
  const [superAdminTab, setSuperAdminTab] = useState<'dashboard' | 'tenants' | 'security'>('dashboard');
  const [adminTab, setAdminTab] = useState<'grid' | 'clients' | 'yield' | 'staffing'>('grid');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'missing' | 'checking'>('checking');
  const [selectedReceipt, setSelectedReceipt] = useState<Reservation | null>(null);
  
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [pendingView, setPendingView] = useState<ViewRole | null>(null);

  const yieldData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const aggregation: Record<string, number> = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
    reservations.forEach(r => {
      if (r.status !== ReservationStatus.VOIDED) {
        const dayName = days[new Date(r.date).getDay()];
        if (dayName) aggregation[dayName] += r.totalAmount;
      }
    });
    return days.map(d => ({ name: d, revenue: aggregation[d] }));
  }, [reservations]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: resData, error: resError } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
      if (resError && resError.message.includes('public.reservations')) {
        setDbStatus('missing');
        setLoading(false);
        return;
      }
      if (resData) setReservations(resData.map(mapFromDb));

      const { data: tenantData } = await supabase.from('tenants').select('*').order('created_at', { ascending: true });
      if (tenantData) setTenants(tenantData as Tenant[]);

      const { data: staffData, error: staffError } = await supabase.from('staff').select('*').order('name', { ascending: true });
      if (staffError && staffError.message.includes('public.staff')) {
        setDbStatus('missing');
        setLoading(false);
        return;
      }
      if (staffData) setStaff(staffData as StaffMember[]);

      const { data: auditData } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
      if (auditData) setAuditLog(auditData as unknown as AuditEntry[]);
      
      setDbStatus('connected');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    if (dbStatus === 'connected') {
      const mainSub = supabase.channel('realtime-pulse-v4')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, (p) => {
           if (p.eventType === 'INSERT') setReservations(prev => [mapFromDb(p.new), ...prev]);
           if (p.eventType === 'UPDATE') setReservations(prev => prev.map(r => r.id === p.new.id ? mapFromDb(p.new) : r));
           if (p.eventType === 'DELETE') setReservations(prev => prev.filter(r => r.id !== p.old.id?.toString()));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, (p) => {
           if (p.eventType === 'INSERT') setStaff(prev => [...prev, p.new as StaffMember]);
           if (p.eventType === 'UPDATE') setStaff(prev => prev.map(s => s.id === p.new.id ? (p.new as StaffMember) : s));
           if (p.eventType === 'DELETE') setStaff(prev => prev.filter(s => s.id !== p.old.id));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, (p) => {
           if (p.eventType === 'INSERT') setAuditLog(prev => [p.new as unknown as AuditEntry, ...prev].slice(0, 100));
           if (p.eventType === 'DELETE') setAuditLog(prev => prev.filter(a => a.id !== p.old.id));
        })
        .subscribe();
      return () => { supabase.removeChannel(mainSub); };
    }
  }, [dbStatus, fetchData]);

  const handleUpdateStaff = async (id: string, updates: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    await supabase.from('staff').update(updates).eq('id', id);
  };

  const handleAddStaff = async (member: Omit<StaffMember, 'id'>) => {
    const { data, error } = await supabase.from('staff').insert([member]).select();
    if (!error && data) setStaff(prev => [...prev, data[0] as StaffMember]);
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from('reservations').update({ status }).eq('id', id);
  };

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    if (pendingView) {
      setView(pendingView);
      setPendingView(null);
    }
    // Log successful command login
    supabase.from('audit_logs').insert([{
      action: 'CORE_AUTH_UPLINK',
      user: user.username,
      details: `Identity verified for ${user.role} portal access.`
    }]).then(() => {});
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('customer');
  };

  const requestViewChange = (newView: ViewRole) => {
    if (['admin', 'super-admin'].includes(newView)) {
       if (!currentUser || currentUser.role !== newView) {
          setPendingView(newView);
          return;
       }
    }
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleDeleteNode = async (id: string) => {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (!error) {
      setTenants(prev => prev.filter(t => t.id !== id));
      await supabase.from('audit_logs').insert([{
        action: 'NODE_DECOMMISSIONED',
        user: currentUser?.username || 'SYSTEM',
        details: `Network Node ${id} has been permanently purged.`
      }]);
    }
  };

  const handleClearAuditLogs = async () => {
    const { error } = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (!error) {
      setAuditLog([]);
      // Log the purge event immediately after clearing
      await supabase.from('audit_logs').insert([{
        action: 'AUDIT_TRAIL_WIPED',
        user: currentUser?.username || 'ROOT',
        details: 'Audit database has been manually refreshed by administrative command.'
      }]);
    }
  };

  return (
    <Layout 
      currentView={view} 
      onViewChange={requestViewChange} 
      currentUser={currentUser} 
      onLogout={handleLogout}
      onTabChange={(tab) => {
        if (view === 'super-admin') setSuperAdminTab(tab as any);
        if (view === 'admin') setAdminTab(tab as any);
      }}
      activeTab={view === 'super-admin' ? superAdminTab : (view === 'admin' ? adminTab : undefined)}
    >
      {(view === 'admin' || view === 'super-admin') && dbStatus === 'missing' && (
        <DatabaseSetupBanner onRetry={fetchData} />
      )}
      
      {view === 'customer' && <CustomerPortal onViewChange={requestViewChange} onReserve={async (d) => {
        const { data } = await supabase.from('reservations').insert([mapToDb({...d, status: ReservationStatus.PENDING})]).select();
        if (data) setReservations(prev => [mapFromDb(data[0]), ...prev]);
      }} />}
      {view === 'zones' && <ZonesPage onReserve={async (d) => {
        const { data } = await supabase.from('reservations').insert([mapToDb({...d, status: ReservationStatus.PENDING})]).select();
        if (data) setReservations(prev => [mapFromDb(data[0]), ...prev]);
      }} reservations={reservations} />}
      {view === 'access' && <AccessPage onReserve={async (d) => {
        const { data } = await supabase.from('reservations').insert([mapToDb({...d, status: ReservationStatus.PENDING})]).select();
        if (data) setReservations(prev => [mapFromDb(data[0]), ...prev]);
      }} />}
      {view === 'admin' && (
        <AdminPortal 
          reservations={reservations} 
          staff={staff}
          yieldData={yieldData}
          onUpdateStatus={handleUpdateStatus}
          onUpdateReservation={async (id, updates) => {
            setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
            await supabase.from('reservations').update(mapToDb(updates)).eq('id', id);
          }}
          onUpdateStaff={handleUpdateStaff}
          onAddStaff={handleAddStaff}
          onDeleteReservation={async (id) => {
            setReservations(prev => prev.filter(r => r.id !== id));
            await supabase.from('reservations').delete().eq('id', id);
          }}
          onViewReceipt={setSelectedReceipt}
          socketStatus={dbStatus === 'connected' ? 'connected' : 'error'}
          onRefresh={fetchData}
          activeTab={adminTab}
          setActiveTab={setAdminTab}
        />
      )}
      {view === 'super-admin' && (
        <SuperAdminPortal 
          reservations={reservations} 
          auditLog={auditLog} 
          tenants={tenants} 
          activeTab={superAdminTab} 
          setActiveTab={setSuperAdminTab} 
          onDeleteReservation={async (id) => { 
            setReservations(prev => prev.filter(r => r.id !== id));
            await supabase.from('reservations').delete().eq('id', id); 
          }}
          onDeleteAuditLog={async (id) => { 
            setAuditLog(prev => prev.filter(a => a.id !== id));
            await supabase.from('audit_logs').delete().eq('id', id); 
          }}
          onClearAuditLogs={handleClearAuditLogs} 
          onDeployNode={() => {}} 
          onUpdateNode={async (id, updates) => {
            setTenants(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            await supabase.from('tenants').update(updates).eq('id', id);
          }} 
          onDeleteNode={handleDeleteNode}
        />
      )}
      
      {pendingView && <LoginOverlay targetRole={pendingView} onSuccess={handleLogin} onCancel={() => setPendingView(null)} />}
      {selectedReceipt && <ReceiptModal reservation={selectedReceipt} onClose={() => setSelectedReceipt(null)} showActions={true} />}
    </Layout>
  );
};

export default App;
