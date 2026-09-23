/**
 * ==============================================================================
 * WATCHNEARN (PAKISTAN) - PAY-PER-VIEW VIDEO WATCHING MICRO-TASK PLATFORM
 * ==============================================================================
 * 
 * ARCHITECTURE & DEPLOYMENT GUIDE:
 * ------------------------------------------------------------------------------
 * 1. HOSTING THIS PLATFORM:
 *    - Frontend SPA: Host on Vercel, Netlify, Cloudflare Pages, or Google Cloud Run.
 *      Build Command: 'npm run build'
 *      Output Directory: 'dist'
 *    - Full-Stack / Node.js Backend:
 *      Can be deployed as an Express/Node.js server ('server.ts' using tsx).
 *      Environment Variables needed in production:
 *      PORT=3000
 *      APP_URL=https://your-domain.pk
 * 
 * 2. 100% RESPONSIVE WEB BROWSER PLATFORM:
 *    - Fully optimized for mobile browsers (Chrome, Safari, Firefox, Opera, Samsung Internet)
 *      and desktop computers without requiring any external APK installation.
 *    - Instant live streaming, tasks, and payouts directly accessible in any browser tab.
 * ==============================================================================
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppTheme } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TaskBoard } from './components/TaskBoard';
import { AdvertiserDashboard } from './components/AdvertiserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AdminLockModal } from './components/AdminLockModal';
import { ReferralModal } from './components/ReferralModal';
import { UserAuthModal } from './components/UserAuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldCheck,
  Coins
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentUser,
    toastMessage,
    currentTheme,
    activeVideoModal,
    isWithdrawModalOpen,
    isPinModalOpen,
    isReferralModalOpen,
  } = useApp();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const themeBgClasses: Record<AppTheme, string> = {
    light: 'bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white',
    deep_navy: 'bg-[#080f26] text-slate-100 selection:bg-sky-500 selection:text-slate-950',
    midnight_blue: 'bg-[#020617] text-slate-100 selection:bg-blue-500 selection:text-white',
    charcoal: 'bg-[#121316] text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950',
    violet: 'bg-[#0d0722] text-purple-100 selection:bg-purple-500 selection:text-white',
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeBgClasses[currentTheme] || themeBgClasses.light}`}>
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-slide-down">
          <div
            className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600/90 border-emerald-500/50 text-white'
                : toastMessage.type === 'error'
                ? 'bg-rose-600/90 border-rose-500/50 text-white'
                : 'bg-slate-900/95 border-slate-700 text-white'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-200 shrink-0 mt-0.5" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />}
            <div className="text-xs font-semibold leading-relaxed">
              {toastMessage.text}
            </div>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar />

      {/* Main View Area based on Active Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {currentUser.role === 'worker' && <TaskBoard />}
        {currentUser.role === 'advertiser' && <AdvertiserDashboard />}
        {currentUser.role === 'admin' && <AdminDashboard />}
      </main>

      {/* Modals & Overlays */}
      {activeVideoModal && <VideoPlayerModal />}
      {isWithdrawModalOpen && <WithdrawModal />}
      {isPinModalOpen && <AdminLockModal />}
      {isReferralModalOpen && <ReferralModal />}
      <UserAuthModal />
      <UserProfileModal />
      <OfflineIndicator />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white">Application Notice</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We encountered a temporary issue while loading the interface. You can refresh or clear local cache to continue.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
