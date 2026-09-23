import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Video,
  Globe,
  Lock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { switchUserRole, isAdminUnlocked, openPinModal } = useApp();

  const handleAdminClick = () => {
    if (!isAdminUnlocked) {
      openPinModal();
    } else {
      switchUserRole('admin');
    }
  };

  return (
    <footer className="mt-8 sm:mt-12 bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-slate-850">
          
          {/* Col 1: Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                <Video className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-extrabold text-base text-white">
                Watch<span className="text-emerald-400">N</span>Earn
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pakistan's video micro-task exchange. Watch & earn daily real PKR directly in any browser.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SSL Secured & Verified Payouts</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => {
                    switchUserRole('worker');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  Worker Task Board
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchUserRole('advertiser');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  Creator & Advertiser Studio
                </button>
              </li>
              <li>
                <button
                  onClick={handleAdminClick}
                  className="text-purple-400 hover:text-purple-300 font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Payment Methods */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Payment Partners
            </h4>
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-rose-600 text-white font-black text-[8px] flex items-center justify-center">JC</span>
                <span className="text-xs font-bold text-white">JazzCash</span>
              </div>
              <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white font-black text-[8px] flex items-center justify-center">EP</span>
                <span className="text-xs font-bold text-white">EasyPaisa</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">Official SMS alerts from 8558 & 3737.</p>
          </div>

          {/* Col 4: Platform Guarantee */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Platform Features
            </h4>
            <ul className="space-y-1 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Web Browser · No App Install</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant Wallet Credit & Anti-Bot</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Min 500 PKR Cashout (0% Fee)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} WatchNEarn Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400/90 font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" /> Browser Ready
            </span>
            <span>•</span>
            <button onClick={handleAdminClick} className="hover:text-purple-400 cursor-pointer">
              Admin
            </button>
            <span>•</span>
            <span>Terms</span>
            <span>•</span>
            <span>Privacy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
