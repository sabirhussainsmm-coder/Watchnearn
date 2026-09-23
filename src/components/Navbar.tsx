import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/video';
import { AppTheme } from '../types';
import {
  Wallet,
  Coins,
  Video,
  Gift,
  Menu,
  X,
  User,
  History,
  ChevronRight,
  RefreshCw,
  Palette,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    logoutUser,
    switchUserRole,
    openWithdrawModal,
    openReferralModal,
    openAuthModal,
    openProfileModal,
    resetDemoData,
    isAdminUnlocked,
    openPinModal,
    currentTheme,
    switchTheme,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminClick = () => {
    setMobileMenuOpen(false);
    if (!isAdminUnlocked) {
      openPinModal();
    } else {
      switchUserRole('admin');
    }
  };

  const themes: { id: AppTheme; label: string; color: string }[] = [
    { id: 'deep_navy', label: 'Navy', color: 'bg-[#080f26]' },
    { id: 'midnight_blue', label: 'Midnight', color: 'bg-[#020617]' },
    { id: 'charcoal', label: 'Charcoal', color: 'bg-[#121316]' },
    { id: 'light', label: 'Light', color: 'bg-slate-100' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  switchUserRole('worker');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group"
              >
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 border-2 border-slate-950 flex items-center justify-center text-[8px] sm:text-[9px] font-black text-slate-950">
                    ₨
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base sm:text-xl tracking-tight text-white">
                      Watch<span className="text-emerald-400">N</span>Earn
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      PK
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block -mt-0.5">
                    Watch & Earn Real PKR
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Center: Segmented Role Control */}
            <nav className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => switchUserRole('worker')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentUser.role === 'worker'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Worker Board</span>
              </button>
              <button
                onClick={() => switchUserRole('advertiser')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentUser.role === 'advertiser'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Advertiser Studio</span>
              </button>
            </nav>

            {/* Desktop Right Controls */}
            <div className="hidden md:flex items-center gap-2.5">
              
              {/* Wallet Chip for Worker */}
              {currentUser.role === 'worker' && (
                <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
                  <div className="px-2.5 py-1">
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Wallet</div>
                    <div className="text-xs font-black text-emerald-400">
                      {formatPKR(currentUser.walletBalancePKR)}
                    </div>
                  </div>
                  <button
                    onClick={openWithdrawModal}
                    className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Wallet className="w-3 h-3" />
                    <span>Withdraw</span>
                  </button>
                </div>
              )}

              {/* Ad Budget for Advertiser */}
              {currentUser.role === 'advertiser' && (
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Ad Budget</div>
                    <div className="text-xs font-bold text-amber-400">
                      {formatPKR(currentUser.depositBalancePKR)}
                    </div>
                  </div>
                </div>
              )}

              {/* Refer & Earn */}
              <button
                onClick={openReferralModal}
                className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Refer & Earn</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                  +₨50
                </span>
              </button>

              {/* User Profile Chip or Sign In / Login Button */}
              {!isLoggedIn ? (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Login</span>
                </button>
              ) : (
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-white max-w-[100px] truncate">{currentUser.name}</span>
                  {currentUser.approvalStatus === 'approved' ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Account Approved" />
                  ) : (
                    <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">Pending</span>
                  )}
                </button>
              )}
            </div>

            {/* Mobile Header Controls */}
            <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
              {!isLoggedIn ? (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs shadow-sm cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              ) : (
                <>
                  {/* Role Indicator / Quick Toggle */}
                  <button
                    onClick={() => switchUserRole(currentUser.role === 'worker' ? 'advertiser' : 'worker')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      currentUser.role === 'worker'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                    title="Tap to switch mode"
                  >
                    {currentUser.role === 'worker' ? (
                      <>
                        <Coins className="w-3 h-3" />
                        <span>Worker</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-3 h-3" />
                        <span>Advertiser</span>
                      </>
                    )}
                  </button>

                  {/* Mobile Wallet Button (Tapping opens cashout) */}
                  <button
                    onClick={openWithdrawModal}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs shadow-sm cursor-pointer active:scale-95 transition"
                    title="Withdraw"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{formatPKR(currentUser.walletBalancePKR)}</span>
                  </button>
                </>
              )}

              {/* Mobile Drawer Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer & Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-slate-950 border-l border-slate-800 h-full overflow-y-auto flex flex-col justify-between p-4 shadow-2xl z-10 animate-slide-left">
            
            <div className="space-y-4">
              
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
                    <Video className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-extrabold text-sm text-white">
                    Watch<span className="text-emerald-400">N</span>Earn
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card or Sign In Prompt */}
              {!isLoggedIn ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 space-y-2.5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Sign In / Register</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Log in to view your wallet balance and watch videos to earn PKR.</p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{currentUser.phone || currentUser.email}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      currentUser.approvalStatus === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {currentUser.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Quick actions for profile */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openProfileModal();
                      }}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition text-center cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logoutUser();
                      }}
                      className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-bold rounded-lg transition text-center cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}

              {/* Role Switcher in Drawer */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Portal Mode
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      switchUserRole('worker');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      currentUser.role === 'worker'
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Worker Mode</span>
                  </button>
                  <button
                    onClick={() => {
                      switchUserRole('advertiser');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      currentUser.role === 'advertiser'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Advertiser</span>
                  </button>
                </div>
              </div>

              {/* Wallet Summary Card in Drawer */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Available Balance</span>
                  <span className="text-base font-black text-emerald-400">
                    {formatPKR(currentUser.walletBalancePKR)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openWithdrawModal();
                    }}
                    className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition text-center cursor-pointer"
                  >
                    Cashout Now
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openProfileModal();
                    }}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition text-center cursor-pointer"
                  >
                    History
                  </button>
                </div>
              </div>

              {/* Navigation Options List */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openReferralModal();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-xs font-bold text-amber-300 border border-amber-500/20 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Refer Friends & Earn</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                    +₨50 Bonus
                  </span>
                </button>

                <button
                  onClick={handleAdminClick}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-xs font-bold text-purple-300 border border-purple-500/20 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Admin Portal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Theme switcher */}
              <div className="space-y-1.5 pt-2 border-t border-slate-850">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Theme
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => switchTheme(t.id)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition cursor-pointer ${
                        currentTheme === t.id
                          ? 'border-emerald-500 text-white bg-slate-800'
                          : 'border-slate-800 text-slate-400 hover:text-white bg-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
