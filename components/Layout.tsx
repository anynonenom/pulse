
import React from 'react';
import { Zap, ShieldAlert, User, LogOut, Lock, Home, LayoutPanelTop, Award, Terminal } from 'lucide-react';
import { ViewRole, AuthUser } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewRole;
  onViewChange: (view: ViewRole) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, currentUser, onLogout, onTabChange, activeTab }) => {
  const isOperator = currentUser !== null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0211]">
      <header className="fixed top-0 w-full z-50 bg-[#0d0211]/95 backdrop-blur-xl border-b border-[#ff00b8]/30 px-8 py-5 flex items-center justify-between shadow-2xl transition-all duration-500">
        <div 
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={() => isOperator ? (currentUser.role === 'super-admin' ? onViewChange('super-admin') : onViewChange('admin')) : onViewChange('customer')}
        >
          <div className={`p-1 rotate-45 group-hover:rotate-90 transition-transform duration-500 ${currentUser?.role === 'super-admin' ? 'bg-[#00d1ff]' : 'bg-[#ff00b8]'}`}>
             <Zap className={`w-6 h-6 text-[#0d0211] fill-current -rotate-45`} />
          </div>
          <span className="text-3xl font-black tracking-[-0.1em] uppercase italic text-white">
            PULSE<span className={currentUser?.role === 'super-admin' ? 'text-[#00d1ff]' : 'text-[#00ffd1]'}>.</span>
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black tracking-[0.2em] uppercase">
          <button 
            onClick={() => onViewChange('customer')}
            className={`flex items-center gap-2 transition-colors ${currentView === 'customer' ? 'text-[#ff00b8]' : 'text-white hover:text-[#ff00b8]'}`}
          >
            <Home className="w-3 h-3" /> Home
          </button>
          <button 
            onClick={() => onViewChange('zones')}
            className={`flex items-center gap-2 transition-colors ${currentView === 'zones' ? 'text-[#00ffd1]' : 'text-white hover:text-[#00ffd1]'}`}
          >
            <LayoutPanelTop className="w-3 h-3" /> Sectors
          </button>
          <button 
            onClick={() => onViewChange('access')}
            className={`flex items-center gap-2 transition-colors ${currentView === 'access' ? 'text-[#fde047]' : 'text-white hover:text-[#fde047]'}`}
          >
            <Award className="w-3 h-3" /> Membership
          </button>

          {isOperator && (
            <div className="flex items-center gap-6 ml-8 pl-8 border-l border-zinc-800">
              {(currentUser.role === 'admin' || currentUser.role === 'super-admin') && (
                <button 
                  onClick={() => onViewChange('admin')}
                  className={`transition-colors flex items-center gap-2 ${currentView === 'admin' ? 'text-[#00ffd1]' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Terminal className="w-3 h-3" /> Grid Ops
                </button>
              )}
              {currentUser.role === 'super-admin' && (
                <button 
                  onClick={() => onViewChange('super-admin')}
                  className={`transition-colors flex items-center gap-2 ${currentView === 'super-admin' ? 'text-[#00d1ff]' : 'text-zinc-500 hover:text-white'}`}
                >
                  <ShieldAlert className="w-3 h-3" /> eiden-group
                </button>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-6">
          {currentUser ? (
            <div className="flex items-center gap-4 pl-4 border-l border-zinc-800 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-right">
                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">OPERATOR</div>
                <div className="text-[11px] font-black text-white italic uppercase tracking-tighter">{currentUser.username}</div>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 bg-zinc-900 text-zinc-500 hover:text-red-500 transition-colors rounded-lg border border-zinc-800"
                title="Terminate Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] italic">
              Network Secure
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow pt-20">
        {children}
      </main>

      <footer className="bg-black border-t border-zinc-900 px-8 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-2 h-2 bg-[#ff00b8] rounded-full animate-pulse" />
              <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">PULSE. Underground</h4>
            </div>
            {/* HIDDEN SUPER ADMIN TRIGGER: Clicking "eiden-group X" */}
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
              The architecture of the night. Managed by <span 
                className="text-white cursor-default select-none" 
                onClick={() => !isOperator && onViewChange('super-admin')}
              >eiden-group X</span>.
            </p>
          </div>
          
          <div className="flex gap-12 text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase italic">
              <button onClick={() => onViewChange('zones')} className="hover:text-[#00ffd1]">Zones</button>
              <button onClick={() => onViewChange('access')} className="hover:text-[#fde047]">Access</button>
              <a href="#" className="hover:text-[#ff00b8]">Press</a>
          </div>

          <div className="flex items-center gap-6">
            {!currentUser && (
              <button 
                onClick={() => onViewChange('admin')}
                className="group flex items-center gap-2 text-[8px] font-black text-zinc-800 hover:text-zinc-400 transition-all uppercase tracking-[0.4em] border border-zinc-900 px-4 py-2 hover:border-zinc-700"
              >
                <Terminal className="w-3 h-3 opacity-20 group-hover:opacity-100" /> OPERATOR LOGIN
              </button>
            )}
            <button onClick={() => onViewChange('customer')} className="group flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase">
              Exit Portal <LogOut className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
