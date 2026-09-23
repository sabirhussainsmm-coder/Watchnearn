import React from 'react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/video';
import {
  Play,
  Wallet,
  Gift,
  Video,
  User,
  History
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    openWithdrawModal,
    openReferralModal,
    openProfileModal,
  } = useApp();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] shadow-2xl"
    >
      <div className="grid grid-cols-5 h-15 max-w-lg mx-auto items-center px-1">
        
        {/* Tab 1: Tasks */}
        <button
          onClick={() => {
            switchUserRole('worker');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full py-1 transition cursor-pointer ${
            currentUser.role === 'worker'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Play className={`w-5 h-5 ${currentUser.role === 'worker' ? 'fill-current' : ''}`} />
            {currentUser.role === 'worker' && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Tasks</span>
        </button>

        {/* Tab 2: Wallet / Withdraw */}
        <button
          onClick={openWithdrawModal}
          className="flex flex-col items-center justify-center h-full py-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <div className="relative">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold text-emerald-400">
            {formatPKR(currentUser.walletBalancePKR)}
          </span>
        </button>

        {/* Tab 3: Refer & Earn (+50 PKR) */}
        <button
          onClick={openReferralModal}
          className="flex flex-col items-center justify-center h-full py-1 text-slate-400 hover:text-amber-300 transition cursor-pointer"
        >
          <div className="relative">
            <Gift className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-amber-400 text-slate-950 text-[8px] font-black rounded-full">
              ₨50
            </span>
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight text-amber-400 font-bold">Refer</span>
        </button>

        {/* Tab 4: Creator / Advertiser */}
        <button
          onClick={() => {
            switchUserRole('advertiser');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full py-1 transition cursor-pointer ${
            currentUser.role === 'advertiser'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Video className={`w-5 h-5 ${currentUser.role === 'advertiser' ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Advertise</span>
        </button>

        {/* Tab 5: Profile / Account */}
        <button
          onClick={openProfileModal}
          className="flex flex-col items-center justify-center h-full py-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Account</span>
        </button>

      </div>
    </nav>
  );
};
