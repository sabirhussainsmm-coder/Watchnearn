import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VideoCampaign, WatchDuration } from '../types';
import { formatPKR } from '../utils/video';
import { WorkerActivationModal } from './WorkerActivationModal';
import { EarningsHistoryTable } from './EarningsHistoryTable';
import {
  Play,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  Gift,
  Copy,
  Check,
  AlertTriangle,
  Receipt,
  Wallet,
  ArrowRight
} from 'lucide-react';

export const TaskBoard: React.FC = () => {
  const {
    campaigns,
    openVideoModal,
    hasWatchedToday,
    currentUser,
    viewHistory,
    openWithdrawModal,
    openReferralModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<number | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Intercept video play if worker is not yet activated
  const handleStartTask = (campaign: VideoCampaign) => {
    if (currentUser.activationStatus !== 'activated') {
      setShowActivationModal(true);
      return;
    }
    openVideoModal(campaign);
  };

  const categories = [
    'All',
    'Education',
    'Tech & Reviews',
    'Entertainment',
    'Lifestyle',
    'Gaming',
    'Islamic & Culture',
  ];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    if (c.status !== 'active') return false;
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedDuration !== 'All' && c.targetWatchSeconds !== selectedDuration) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchChannel = c.channelName.toLowerCase().includes(q);
      if (!matchTitle && !matchChannel) return false;
    }
    return true;
  });

  // Calculate today's stats for worker
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const viewsToday = viewHistory.filter((v) => v.watchedAt > oneDayAgo && v.userId === currentUser.id);
  const earnedToday = viewsToday.reduce((sum, v) => sum + v.rewardPKR, 0);

  const potentialEarnings = campaigns
    .filter((c) => c.status === 'active' && !hasWatchedToday(c.id))
    .reduce((sum, c) => sum + c.rewardPerViewPKR, 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Worker Account Activation Banner (Clean & Punchy) */}
      {currentUser.activationStatus !== 'activated' && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Account Activation
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {currentUser.activationStatus === 'pending_verification' ? 'Under Review' : 'Just 3.6 Dollars'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentUser.activationStatus === 'pending_verification'
                  ? 'Request sent to Admin (Sabir Hussain - 03264022010). Verifying payment...'
                  : 'Join in Just 3.6 Dollars (1,000 PKR) to unlock daily paid video tasks.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowActivationModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{currentUser.activationStatus === 'pending_verification' ? 'Check Status' : 'Join in Just 3.6 Dollars'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Performance Header (Reduced Text, Modern, Mobile Friendly) */}
      <div className="hero-banner rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Punchy title & quick status */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Join in Just 3.6 Dollars • Instant JazzCash & EasyPaisa</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-white hero-title tracking-tight">
              Watch Videos & Earn PKR Daily
            </h1>
            
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Anti-Cheat Active
              </span>
              <span className="text-slate-500">•</span>
              <span>Available Reward: <strong className="text-emerald-400 font-bold">{formatPKR(potentialEarnings)}</strong></span>
            </div>
          </div>

          {/* Right: Compact Stats Strip */}
          <div className="hero-stats-strip grid grid-cols-3 gap-2 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 shadow-inner">
            <div className="text-center px-1">
              <div className="text-[10px] text-slate-400 font-medium">Earned Today</div>
              <div className="text-sm sm:text-base font-black text-emerald-400">
                {formatPKR(earnedToday)}
              </div>
            </div>

            <div className="text-center px-1 border-x border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium">Watched</div>
              <div className="text-sm sm:text-base font-black text-emerald-400">
                {viewsToday.length}
              </div>
            </div>

            <div className="text-center px-1">
              <div className="text-[10px] text-slate-400 font-medium">Balance</div>
              <div className="text-sm sm:text-base font-black text-emerald-400">
                {formatPKR(currentUser.walletBalancePKR)}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Refer & Earn (Compact 1-Line Bar) */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white">Refer Friends: </span>
            <span className="text-slate-300">Get 100 PKR + 10% commission.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs">
            <span className="text-slate-400 text-[10px]">Code:</span>
            <span className="font-mono font-black text-amber-400">{currentUser.referralCode || 'HAMZA786'}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentUser.referralCode || 'HAMZA786');
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="text-slate-400 hover:text-white ml-1 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={openReferralModal}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
          >
            Invite
          </button>
        </div>
      </div>

      {/* Primary Tab Selector (Clean Segmented Control) */}
      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Available Tasks ({filteredCampaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Earnings Statement</span>
        </button>
      </div>

      {activeTab === 'history' ? (
        <EarningsHistoryTable
          userId={currentUser.id}
          showWalletSummary={true}
          onOpenWithdrawal={openWithdrawModal}
        />
      ) : (
        <>
          {/* Search & Category Filter Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search video task..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Duration buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['All', 30, 60, 90, 120] as const).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setSelectedDuration(dur)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                      selectedDuration === dur
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {dur === 'All' ? 'All' : `${dur}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Video Tasks Grid (Mobile-friendly layout) */}
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No tasks matching your filter</h3>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedDuration('All');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredCampaigns.map((campaign) => {
                const watchedToday = hasWatchedToday(campaign.id);
                const progressPercent = Math.min(100, Math.round((campaign.viewsDelivered / campaign.totalTargetViews) * 100));

                return (
                  <div
                    key={campaign.id}
                    className={`flex flex-col bg-slate-900 border rounded-xl sm:rounded-2xl overflow-hidden transition-all ${
                      watchedToday
                        ? 'border-slate-800/60 opacity-75'
                        : 'border-slate-800 hover:border-emerald-500/50 hover:shadow-lg'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      <img
                        src={campaign.thumbnailUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-slate-300">
                        {campaign.category}
                      </div>

                      <div className="absolute top-2 right-2 bg-slate-950/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-black text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {campaign.targetWatchSeconds}s
                      </div>

                      {/* Play Hover Overlay for Desktop */}
                      {!watchedToday && (
                        <div
                          onClick={() => handleStartTask(campaign)}
                          className="absolute inset-0 bg-black/40 opacity-0 sm:hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      {watchedToday && (
                        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-3 text-center">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Watched Today
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 truncate">
                          {campaign.channelName}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                          {campaign.title}
                        </h3>
                      </div>

                      {/* Bottom Info & Button */}
                      <div className="space-y-2 pt-1 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {progressPercent}% completed
                          </span>
                          <div className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            +{formatPKR(campaign.rewardPerViewPKR)}
                          </div>
                        </div>

                        {watchedToday ? (
                          <button
                            disabled
                            className="w-full py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Claimed (Reset: 24h)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartTask(campaign)}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Watch & Earn {formatPKR(campaign.rewardPerViewPKR)}</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Platform Security Note (Minimalist, No Wordy AI Slop) */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-2 text-[11px] text-slate-400 border-t border-slate-850">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Active Tab Timer
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Instant Wallet Credit
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Min 500 PKR Cashout
            </span>
          </div>
        </>
      )}

      {/* Worker Activation Modal */}
      {showActivationModal && (
        <WorkerActivationModal
          isOpen={showActivationModal}
          onClose={() => setShowActivationModal(false)}
        />
      )}

    </div>
  );
};
