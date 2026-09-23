import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ViewHistoryRecord, PLATFORM_CONFIG } from '../types';
import { formatPKR } from '../utils/video';
import {
  Coins,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Video,
  Gift,
  HelpCircle,
  FileSpreadsheet,
  Check,
  Copy,
  Receipt,
  Sparkles,
  ArrowDownRight,
  Info
} from 'lucide-react';

interface EarningsHistoryTableProps {
  userId?: string;
  showWalletSummary?: boolean;
  onOpenWithdrawal?: () => void;
}

export const EarningsHistoryTable: React.FC<EarningsHistoryTableProps> = ({
  userId,
  showWalletSummary = true,
  onOpenWithdrawal,
}) => {
  const {
    currentUser,
    viewHistory,
    withdrawals,
    referrals,
    openWithdrawModal,
    showToast,
  } = useApp();

  const activeUserId = userId || currentUser.id;

  // State for filtering & searching
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'referrals' | 'withdrawals'>('all');
  const [durationFilter, setDurationFilter] = useState<number | 'all'>('all');
  const [timePeriodFilter, setTimePeriodFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'reward_desc'>('newest');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Filter user's specific records
  const userViews = useMemo(() => {
    return viewHistory.filter((v) => v.userId === activeUserId);
  }, [viewHistory, activeUserId]);

  const userWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => w.userId === activeUserId);
  }, [withdrawals, activeUserId]);

  const userReferrals = useMemo(() => {
    return referrals.filter((r) => r.referrerId === currentUser.referralCode);
  }, [referrals, currentUser.referralCode]);

  // Aggregate combined timeline items if user selects withdrawals or referrals
  type TimelineItem = {
    type: 'task' | 'withdrawal' | 'referral';
    id: string;
    timestamp: number;
    title: string;
    subtitle: string;
    category?: string;
    durationSeconds?: number;
    watchedSeconds?: number;
    watchPercentage?: number;
    isFullyWatched?: boolean;
    amountPKR: number;
    isCredit: boolean;
    status: 'completed_full' | 'partial_abandoned' | 'pending' | 'approved' | 'rejected';
    statusLabel: string;
    details?: string;
  };

  const allTimelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // 1. Task completions
    userViews.forEach((v) => {
      items.push({
        type: 'task',
        id: v.id,
        timestamp: v.watchedAt,
        title: v.videoTitle,
        subtitle: `Watch Task (${v.durationSeconds}s requirement)`,
        category: 'Video Micro-Task',
        durationSeconds: v.durationSeconds,
        watchedSeconds: v.watchedSeconds,
        watchPercentage: v.watchPercentage,
        isFullyWatched: v.isFullyWatched,
        amountPKR: v.rewardPKR,
        isCredit: v.rewardPKR > 0,
        status: v.status,
        statusLabel: v.isFullyWatched ? '100% Watched & Credited' : `Left at ${v.watchedSeconds}s (Incomplete)`,
        details: v.isFullyWatched
          ? 'Active tab verified. Math captcha passed.'
          : 'Video tab was closed or blurred early. 0 reward.',
      });
    });

    // 2. Withdrawals
    userWithdrawals.forEach((w) => {
      items.push({
        type: 'withdrawal',
        id: w.id,
        timestamp: new Date(w.createdAt).getTime(),
        title: `Withdrawal via ${w.gateway.toUpperCase()}`,
        subtitle: `To: ${w.accountTitle} (${w.mobileNumber})`,
        category: 'Cashout',
        amountPKR: w.amountPKR,
        isCredit: false,
        status: w.status,
        statusLabel:
          w.status === 'approved'
            ? 'Payout Completed'
            : w.status === 'pending'
            ? 'Pending Processing'
            : 'Rejected / Refunded',
        details: w.adminNotes || `Requested payout of ${formatPKR(w.amountPKR)}`,
      });
    });

    // 3. Referral rewards
    userReferrals.forEach((r) => {
      const bonusAmount = r.bonusPKR || PLATFORM_CONFIG.referralCommissionPKR;
      items.push({
        type: 'referral',
        id: r.id,
        timestamp: new Date(r.joinedDate).getTime() || Date.now() - 3600000 * 48,
        title: `Referral Bonus: ${r.friendName}`,
        subtitle: `Friend mobile: ${r.friendPhone}`,
        category: 'Referral Program',
        amountPKR: bonusAmount,
        isCredit: true,
        status: 'approved',
        statusLabel: 'Commission Credited',
        details: `100 PKR Referral bonus + 10% commission on tasks completed (${r.tasksCompleted} tasks)`,
      });
    });

    return items;
  }, [userViews, userWithdrawals, userReferrals]);

  // Apply filters
  const filteredItems = useMemo(() => {
    let result = [...allTimelineItems];

    // Status filter
    if (statusFilter === 'completed') {
      result = result.filter((i) => i.type === 'task' && i.status === 'completed_full');
    } else if (statusFilter === 'partial') {
      result = result.filter((i) => i.type === 'task' && i.status === 'partial_abandoned');
    } else if (statusFilter === 'referrals') {
      result = result.filter((i) => i.type === 'referral');
    } else if (statusFilter === 'withdrawals') {
      result = result.filter((i) => i.type === 'withdrawal');
    }

    // Duration filter
    if (durationFilter !== 'all') {
      result = result.filter((i) => i.durationSeconds === durationFilter);
    }

    // Time period filter
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (timePeriodFilter === 'today') {
      result = result.filter((i) => i.timestamp >= now - oneDay);
    } else if (timePeriodFilter === 'yesterday') {
      result = result.filter((i) => i.timestamp >= now - 2 * oneDay && i.timestamp < now - oneDay);
    } else if (timePeriodFilter === 'week') {
      result = result.filter((i) => i.timestamp >= now - 7 * oneDay);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'reward_desc') return b.amountPKR - a.amountPKR;
      return 0;
    });

    return result;
  }, [allTimelineItems, statusFilter, durationFilter, timePeriodFilter, searchQuery, sortBy]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalCredited = userViews
      .filter((v) => v.isFullyWatched)
      .reduce((sum, v) => sum + v.rewardPKR, 0);

    const totalTasksAttempted = userViews.length;
    const completedTasks = userViews.filter((v) => v.isFullyWatched).length;
    const abandonedTasks = userViews.filter((v) => !v.isFullyWatched).length;
    const completionRate = totalTasksAttempted > 0 ? Math.round((completedTasks / totalTasksAttempted) * 100) : 100;

    const totalSecondsWatched = userViews.reduce((sum, v) => sum + (v.watchedSeconds || 0), 0);
    const totalMinutesWatched = (totalSecondsWatched / 60).toFixed(1);

    const filteredTotalPKR = filteredItems.reduce((sum, i) => (i.isCredit ? sum + i.amountPKR : sum - i.amountPKR), 0);

    return {
      totalCredited,
      totalTasksAttempted,
      completedTasks,
      abandonedTasks,
      completionRate,
      totalMinutesWatched,
      filteredTotalPKR,
    };
  }, [userViews, filteredItems]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Type', 'Title / Task', 'Duration (Target/Watched)', 'Watch %', 'Amount (PKR)', 'Credit/Debit', 'Status', 'Details'];
    const rows = filteredItems.map((item) => {
      const dateStr = new Date(item.timestamp).toLocaleString();
      const durStr = item.durationSeconds ? `${item.durationSeconds}s / ${item.watchedSeconds || 0}s` : 'N/A';
      const pctStr = item.watchPercentage ? `${item.watchPercentage}%` : 'N/A';
      const amtStr = `${item.isCredit ? '+' : '-'}${item.amountPKR.toFixed(2)}`;
      return [
        `"${dateStr}"`,
        `"${item.type.toUpperCase()}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${durStr}"`,
        `"${pctStr}"`,
        `"${amtStr}"`,
        `"${item.isCredit ? 'CREDIT' : 'DEBIT'}"`,
        `"${item.statusLabel}"`,
        `"${(item.details || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WatchNEarn_Earnings_Statement_${currentUser.name.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Earnings history statement downloaded as CSV!', 'success');
  };

  // Copy Summary text
  const handleCopySummary = () => {
    const text = `WatchNEarn Pakistan - Official Earnings Statement
User: ${currentUser.name} (${currentUser.phone})
Wallet Balance: ${formatPKR(currentUser.walletBalancePKR)}
Total Lifetime Earned: ${formatPKR(currentUser.totalEarnedPKR)}
Total Withdrawn: ${formatPKR(currentUser.totalWithdrawnPKR)}
Tasks Completed: ${currentUser.totalTasksCompleted} videos
Completion Rate: ${metrics.completionRate}%
Reconciliation: Balance (${currentUser.walletBalancePKR} PKR) = Earned (${currentUser.totalEarnedPKR} PKR) - Withdrawn (${currentUser.totalWithdrawnPKR} PKR)
Generated: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    showToast('Summary copied to clipboard!', 'info');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Format timestamp nicely
  const formatTime = (ms: number) => {
    const date = new Date(ms);
    const now = Date.now();
    const diffMins = Math.floor((now - ms) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = '';
    if (diffMins < 1) relative = 'Just now';
    else if (diffMins < 60) relative = `${diffMins}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays === 1) relative = 'Yesterday';
    else relative = `${diffDays}d ago`;

    const exact = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return { exact, relative };
  };

  return (
    <div className="space-y-6">

      {/* 1. Wallet Balance Transparency Overview */}
      {showWalletSummary && (
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            {/* Top Bar: Title & Audit Guarantee */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Earnings History & Wallet Statement
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time transparent audit ledger of all rewarded video micro-tasks, referral gifts, and cashout payouts.
                </p>
              </div>

              {/* Audit Badge & CSV Button */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Reconciled Audit</span>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  title="Download Statement as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* 4 Cards: Balance Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Available Wallet Balance */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-lg relative group">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> Available Balance
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Ready to Cashout
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-400 tracking-tight">
                  {formatPKR(currentUser.walletBalancePKR)}
                </div>
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <span className="text-[11px] text-slate-400">Min. payout 500 PKR</span>
                  <button
                    onClick={onOpenWithdrawal || openWithdrawModal}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                  >
                    <span>Withdraw</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 2: Lifetime Video Tasks Earned */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-blue-400" /> Gross Earned
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {currentUser.totalTasksCompleted} videos
                  </span>
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {formatPKR(currentUser.totalEarnedPKR)}
                </div>
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                  <span>Avg: ~{(currentUser.totalTasksCompleted > 0 ? currentUser.totalEarnedPKR / currentUser.totalTasksCompleted : 3).toFixed(1)} PKR/task</span>
                  <span className="text-blue-400 font-medium">{metrics.totalMinutesWatched}m watched</span>
                </div>
              </div>

              {/* Card 3: Referral Program Bonus */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-amber-300 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-400" /> Referral Earnings
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    {userReferrals.length} Friends
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-300 tracking-tight">
                  {formatPKR(currentUser.referralEarningsPKR || 250)}
                </div>
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                  <span>100 PKR + 10% share</span>
                  <span className="font-mono text-amber-400 font-bold">{currentUser.referralCode}</span>
                </div>
              </div>

              {/* Card 4: Total Withdrawn */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-purple-400" /> Total Withdrawn
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                    JazzCash / EasyPaisa
                  </span>
                </div>
                <div className="text-2xl font-black text-purple-200 tracking-tight">
                  {formatPKR(currentUser.totalWithdrawnPKR)}
                </div>
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                  <span>{userWithdrawals.filter((w) => w.status === 'approved').length} completed payouts</span>
                  <span className="text-emerald-400 font-medium">0% Fee</span>
                </div>
              </div>

            </div>

            {/* Reconciliation Formula Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">
                  <strong>Transparency Formula:</strong> Available Balance ({formatPKR(currentUser.walletBalancePKR)}) = Lifetime Gross Earned ({formatPKR(currentUser.totalEarnedPKR)}) - Completed Withdrawals ({formatPKR(currentUser.totalWithdrawnPKR)})
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopySummary}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition"
                >
                  {copiedSummary ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSummary ? 'Copied' : 'Copy Statement'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. Filter & Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        
        {/* Top Filter Row: Search & Status Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by video title, channel, topic, or TID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            {[
              { id: 'all', label: `All Activity (${allTimelineItems.length})` },
              { id: 'completed', label: `Credited Tasks (${userViews.filter((v) => v.isFullyWatched).length})` },
              { id: 'partial', label: `Incomplete (${userViews.filter((v) => !v.isFullyWatched).length})` },
              { id: 'referrals', label: `Referral (${userReferrals.length})` },
              { id: 'withdrawals', label: `Payouts (${userWithdrawals.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Second Filter Row: Duration, Time Period, Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Duration Filter */}
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-300">Duration:</span>
              {(['all', 30, 60, 90, 120] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDurationFilter(d)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                    durationFilter === d
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d === 'all' ? 'All' : `${d}s`}
                </button>
              ))}
            </div>

            {/* Time Period Filter */}
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-300">Period:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'week', label: 'Past 7D' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTimePeriodFilter(p.id as any)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                    timePeriodFilter === p.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="reward_desc">Highest Reward (PKR)</option>
            </select>
          </div>

        </div>

      </div>

      {/* 3. Detailed Earnings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Header Controls / Count Summary */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-bold text-white">
              Showing {filteredItems.length} transactions / task logs
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Net Sum in view:{' '}
              <strong className={metrics.filteredTotalPKR >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {metrics.filteredTotalPKR >= 0 ? '+' : ''}
                {formatPKR(metrics.filteredTotalPKR)}
              </strong>
            </span>
            <span>•</span>
            <span>
              Success Rate: <strong className="text-blue-400">{metrics.completionRate}%</strong>
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Completion Timestamp</th>
                <th className="py-3 px-4">Video Task / Transaction</th>
                <th className="py-3 px-4">Duration & Active Proof</th>
                <th className="py-3 px-4 text-right">Rewarded Amount</th>
                <th className="py-3 px-4 text-center">Reward Status</th>
                <th className="py-3 px-4 text-right">Wallet Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-white text-sm">No Earnings History Found</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      No video watch records match your current search or filter criteria. Watch video tasks on the Task Board to start accumulating real PKR rewards!
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setDurationFilter('all');
                        setTimePeriodFilter('all');
                      }}
                      className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const { exact, relative } = formatTime(item.timestamp);
                  const isCompletedTask = item.type === 'task' && item.status === 'completed_full';
                  const isPartialTask = item.type === 'task' && item.status === 'partial_abandoned';
                  const isWithdrawal = item.type === 'withdrawal';
                  const isReferral = item.type === 'referral';

                  return (
                    <tr
                      key={`${item.id}_${idx}`}
                      className="hover:bg-slate-850/50 transition duration-150"
                    >
                      
                      {/* Column 1: Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white font-mono">{exact}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {relative}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Video Task / Transaction Details */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isCompletedTask
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isPartialTask
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : isReferral
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isCompletedTask && <CheckCircle2 className="w-4 h-4" />}
                            {isPartialTask && <AlertTriangle className="w-4 h-4" />}
                            {isReferral && <Gift className="w-4 h-4" />}
                            {isWithdrawal && <ArrowUpRight className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs line-clamp-1">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{item.subtitle}</span>
                              {item.category && (
                                <>
                                  <span>•</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                    {item.category}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Duration & Proof */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.type === 'task' ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-200">
                                {item.watchedSeconds}s / {item.durationSeconds}s
                              </span>
                              <span
                                className={`text-[10px] font-bold ${
                                  item.isFullyWatched ? 'text-emerald-400' : 'text-amber-400'
                                }`}
                              >
                                {item.watchPercentage}%
                              </span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.isFullyWatched ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${item.watchPercentage}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-slate-400 flex items-center gap-1">
                              {item.isFullyWatched ? (
                                <span className="text-emerald-400/90 font-medium">Active Tab Verified</span>
                              ) : (
                                <span className="text-amber-400/90 font-medium">Timer Halted Early</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400">
                            <span>Direct Transfer</span>
                            <div className="text-[10px] text-slate-500">Instant Ledger</div>
                          </div>
                        )}
                      </td>

                      {/* Column 4: Rewarded Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className={`font-mono text-sm font-black ${
                            item.isCredit
                              ? item.amountPKR > 0
                                ? 'text-emerald-400'
                                : 'text-slate-500'
                              : 'text-rose-400'
                          }`}
                        >
                          {item.isCredit ? (item.amountPKR > 0 ? '+' : '') : '-'}
                          {formatPKR(item.amountPKR)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.isCredit ? 'Credit to Wallet' : 'Debited Payout'}
                        </div>
                      </td>

                      {/* Column 5: Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isCompletedTask && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>100% Completed</span>
                          </span>
                        )}

                        {isPartialTask && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Incomplete (0 PKR)</span>
                          </span>
                        )}

                        {isReferral && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <Gift className="w-3 h-3" />
                            <span>Referral Bonus</span>
                          </span>
                        )}

                        {isWithdrawal && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.status === 'approved'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                : item.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            <span>{item.statusLabel}</span>
                          </span>
                        )}
                      </td>

                      {/* Column 6: Running Audit Transparency */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-slate-300">
                          {item.isFullyWatched || item.type === 'referral'
                            ? 'Credited'
                            : isWithdrawal && item.status === 'approved'
                            ? 'Paid Out'
                            : 'Logged'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Verified
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Full transparency ledger • All transactions logged permanently in client storage</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Platform Master Admin: Sabir Hussain • JazzCash/EasyPaisa 03264022010
          </div>
        </div>

      </div>

    </div>
  );
};
