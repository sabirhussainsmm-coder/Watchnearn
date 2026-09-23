import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/video';
import { UserProfile } from '../types';
import { PaymentLogo } from './PaymentLogo';
import { UserLoginsView } from './UserLoginsView';
import { RealTimeLoginAuditLog } from './RealTimeLoginAuditLog';
import {
  ShieldCheck,
  Users,
  Coins,
  Wallet,
  TrendingUp,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  X,
  PlaySquare,
  Sparkles,
  Smartphone,
  Check,
  Activity,
  LogIn,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  Calendar,
  Filter,
  ArrowUpDown,
  Download,
  UserCheck,
  Megaphone,
  Shield,
  BadgeCheck,
  CheckCircle2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    allUsers,
    campaigns,
    deposits,
    approveDeposit,
    rejectDeposit,
    withdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    toggleCampaignStatus,
    viewHistory,
    userSessions,
    approveUser,
    rejectUser,
    activateWorkerAccount,
    resetDemoData,
    isAdminUnlocked,
    lockAdmin,
    openPinModal,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deposits' | 'video-watches' | 'withdrawals' | 'campaigns' | 'users' | 'logins'>('deposits');
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [rejectModalItem, setRejectModalItem] = useState<{ id: string; type: 'deposit' | 'withdrawal' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [watchFilter, setWatchFilter] = useState<'all' | 'full' | 'partial'>('all');
  const [watchSearch, setWatchSearch] = useState('');

  // User Directory & Audit Log State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'worker' | 'advertiser' | 'admin'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [userActivationFilter, setUserActivationFilter] = useState<'all' | 'activated' | 'pending' | 'unpaid'>('all');
  const [userSortBy, setUserSortBy] = useState<'newest' | 'oldest' | 'highest_balance' | 'highest_earned' | 'name'>('newest');
  const [selectedUserDossier, setSelectedUserDossier] = useState<UserProfile | null>(null);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  // If Admin is locked with PIN 7467, show the Locked Screen
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-purple-900/60 p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Admin Portal Is Locked</h2>
            <p className="text-xs text-slate-400 mt-1">
              Financial data and approvals require the 4-digit security PIN.
            </p>
          </div>
          <button
            onClick={openPinModal}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
          >
            <Lock className="w-4 h-4" />
            <span>Enter Security PIN to Unlock</span>
          </button>
        </div>
      </div>
    );
  }

  // Platform Analytics Calculations
  const totalApprovedDepositsPKR = deposits
    .filter((d) => d.status === 'approved')
    .reduce((sum, d) => sum + d.amountPKR, 0);

  const totalPaidWithdrawalsPKR = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, w) => sum + w.amountPKR, 0);

  const totalActiveCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const totalViewsWatched = campaigns.reduce((sum, c) => sum + c.viewsDelivered, 0);

  // Net platform profit: Approved advertiser deposits minus actual worker cashouts paid
  const netPlatformProfitPKR = totalApprovedDepositsPKR - totalPaidWithdrawalsPKR;

  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  const handleConfirmReject = () => {
    if (!rejectModalItem) return;
    if (rejectModalItem.type === 'deposit') {
      rejectDeposit(rejectModalItem.id, rejectReason || 'Transaction ID not verified in JazzCash/EasyPaisa statement.');
    } else {
      rejectWithdrawal(rejectModalItem.id, rejectReason || 'Account title mismatch or invalid Pakistani mobile number.');
    }
    setRejectModalItem(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Admin Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900 to-purple-950 border border-purple-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>WatchNEarn Master Admin Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Financial & Task Operations Console
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Review manual JazzCash & EasyPaisa deposits, approve worker payouts, moderate video tasks, and inspect live Pakistani platform metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={lockAdmin}
            className="px-3.5 py-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            title="Lock Admin Portal"
          >
            <Lock className="w-3.5 h-3.5 text-purple-300" />
            <span>Lock Console</span>
          </button>

          <button
            onClick={resetDemoData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* High-Level Platform Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Registered</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white">
            {allUsers.length} Users
          </div>
          <div className="text-[10px] text-gray-400">Workers & Advertisers</div>
        </div>

        {/* Total Deposits */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Gross Deposits</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">
            {formatPKR(totalApprovedDepositsPKR)}
          </div>
          <div className="text-[10px] text-gray-400">{deposits.filter(d => d.status === 'approved').length} verified transactions</div>
        </div>

        {/* Total Payouts */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Paid Withdrawals</span>
            <Wallet className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400">
            {formatPKR(totalPaidWithdrawalsPKR)}
          </div>
          <div className="text-[10px] text-gray-400">Cashouts sent to workers</div>
        </div>

        {/* Net Profit */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Net Platform Profit</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">
            {formatPKR(netPlatformProfitPKR)}
          </div>
          <div className="text-[10px] text-gray-400">Deposits - Payouts</div>
        </div>

        {/* Views Delivered */}
        <div className="col-span-2 lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Views Delivered</span>
            <Video className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white">
            {totalViewsWatched.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400">{totalActiveCampaigns} Active Campaigns</div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'deposits'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <span>Manual Deposits</span>
          {pendingDeposits.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-gray-950 font-black">
              {pendingDeposits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logins')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logins'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-Time Login Activity Log</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {allUsers.filter((u) => u.approvalStatus === 'pending_approval').length > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
              {allUsers.filter((u) => u.approvalStatus === 'pending_approval').length} Pending
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-black">
              {allUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('video-watches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'video-watches'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <PlaySquare className="w-3.5 h-3.5" />
          <span>Worker Video Watch Log</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500 text-white font-black">
            {viewHistory.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'withdrawals'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <span>Worker Cashouts ({withdrawals.length})</span>
          {pendingWithdrawals.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <span>Campaigns ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Registered Users Directory & Audit Log</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-purple-300 font-bold">
            {allUsers.length}
          </span>
          {allUsers.filter((u) => u.approvalStatus === 'pending_approval').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
              {allUsers.filter((u) => u.approvalStatus === 'pending_approval').length} Pending
            </span>
          )}
        </button>
      </div>

      {/* Tab Content: Deposits */}
      {activeTab === 'deposits' && (
        <div className="space-y-6">
          {/* Sabir Hussain Official Account Status Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  صابر حسین (Sabir Hussain) - آفیشل وصولی اکاؤنٹ
                </h4>
                <p className="text-xs text-slate-400">
                  نمبر: <span className="font-mono font-bold text-white">03264022010</span> (JazzCash SMS 8558 اور EasyPaisa SMS 3737)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PaymentLogo gateway="jazzcash" size="sm" />
              <PaymentLogo gateway="easypaisa" size="sm" />
            </div>
          </div>

          {/* Pending Deposit Cards (Quick Manual Verification) */}
          {pendingDeposits.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>دستی تصدیق کی منتظر ادائیگیاں ({pendingDeposits.length} Pending Verifications)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-5 rounded-2xl bg-gray-900 border-2 border-amber-500/40 shadow-lg space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PaymentLogo gateway={dep.gateway} size="sm" />
                        <div>
                          <span className="font-bold text-sm text-white">{dep.userName || dep.accountTitle}</span>
                          <span className="block text-[11px] text-gray-400 font-mono">{dep.senderNumber}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-400">{formatPKR(dep.amountPKR)}</span>
                        <span className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          {dep.depositType === 'worker_activation' ? 'Worker Activation Fee' : 'Ad Budget'}
                        </span>
                      </div>
                    </div>

                    {/* Deposit Description as specified by user */}
                    <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs">
                      <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                        ادائیگی کی تفصیل (Payment Note):
                      </div>
                      <p className="text-gray-200 font-medium">
                        "{dep.paymentDescription || `${dep.userName} na ${dep.amountPKR} rupees deposit kia hen sabir k account men (03264022010). TID: ${dep.transactionId}`}"
                      </p>
                    </div>

                    {/* TID & Proof */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-gray-400 text-[11px]">TID: </span>
                        <span className="font-mono font-black text-amber-300">{dep.transactionId}</span>
                      </div>
                      {dep.screenshotUrl && (
                        <button
                          onClick={() => setScreenshotModalUrl(dep.screenshotUrl)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> تصویر ثبوت دیکھیں
                        </button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                      <button
                        onClick={() => approveDeposit(dep.id)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-gray-950 font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>پیمنٹ وصول ہو گئی - تصدیق کریں (Approve & Credit)</span>
                      </button>
                      <button
                        onClick={() => setRejectModalItem({ id: dep.id, type: 'deposit' })}
                        className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        مسترد (Reject)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Deposits Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Manual JazzCash & EasyPaisa Deposit History</h3>
                <p className="text-xs text-gray-400">All reviewed deposits and worker activation fee transactions.</p>
              </div>
              <span className="text-xs text-gray-400 font-bold">
                Total: {deposits.length} Deposits
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">TID / Date</th>
                    <th className="py-3 px-4">Sender / Account Title</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount (PKR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-gray-800/40 transition">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-white">{dep.transactionId}</div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(dep.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{dep.accountTitle || dep.userName}</div>
                        <div className="text-[10px] text-gray-400">{dep.senderNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <PaymentLogo gateway={dep.gateway} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-800 text-gray-300">
                          {dep.depositType === 'worker_activation' ? 'Worker Fee' : 'Ad Campaign'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm text-emerald-400">
                        {formatPKR(dep.amountPKR)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          dep.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : dep.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}>
                          {dep.status === 'approved' ? 'Payment Verified' : dep.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {dep.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveDeposit(dep.id)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg text-xs transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModalItem({ id: dep.id, type: 'deposit' })}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-xs font-bold transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500">{dep.adminNotes || 'Processed'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Worker Video Watch Data (Full vs Partial Watch Analytics) */}
      {activeTab === 'video-watches' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlaySquare className="w-5 h-5 text-purple-400" />
                  <span>Worker Video Watch Analytics & Audit Tracking</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Verify whether workers completed full 100% video watches or abandoned early. Rewards are strictly credited for full watches.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setWatchFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    watchFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  All ({viewHistory.length})
                </button>
                <button
                  onClick={() => setWatchFilter('full')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    watchFilter === 'full' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  100% Watched ({viewHistory.filter((v) => v.isFullyWatched).length})
                </button>
                <button
                  onClick={() => setWatchFilter('partial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    watchFilter === 'partial' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Partial Abandoned ({viewHistory.filter((v) => !v.isFullyWatched).length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Worker & Mobile</th>
                    <th className="py-3 px-4">Video Campaign Title</th>
                    <th className="py-3 px-4">Target Duration</th>
                    <th className="py-3 px-4">Watched Duration</th>
                    <th className="py-3 px-4">Watch Status</th>
                    <th className="py-3 px-4">Reward</th>
                    <th className="py-3 px-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {viewHistory
                    .filter((v) => {
                      if (watchFilter === 'full') return v.isFullyWatched;
                      if (watchFilter === 'partial') return !v.isFullyWatched;
                      return true;
                    })
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{item.userName || 'Worker'}</div>
                          <div className="font-mono text-[11px] text-gray-400">{item.userPhone || '0300-1234567'}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-gray-200 truncate">{item.videoTitle}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{item.campaignId}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {item.durationSeconds}s
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">
                              {item.watchedSeconds || item.durationSeconds}s
                            </span>
                            <span className="text-[10px] text-gray-400">
                              ({item.watchPercentage || (item.isFullyWatched ? 100 : 35)}%)
                            </span>
                          </div>
                          <div className="w-20 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${item.isFullyWatched ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${item.watchPercentage || (item.isFullyWatched ? 100 : 35)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {item.isFullyWatched ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>100% Full Watch</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Abandoned ({item.watchedSeconds}s)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-sm text-emerald-400">
                          {item.rewardPKR > 0 ? `+${item.rewardPKR.toFixed(2)} PKR` : '0.00 PKR'}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[11px] text-gray-400 font-mono">
                          {new Date(item.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Real-Time User Login Activity Log */}
      {activeTab === 'logins' && (
        <RealTimeLoginAuditLog />
      )}

      {/* Tab Content: Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Worker Withdrawal Payout Queue</h3>
              <p className="text-xs text-gray-400">Send money via official JazzCash/EasyPaisa portal and update status.</p>
            </div>
            <span className="text-xs text-rose-400 font-bold">
              {pendingWithdrawals.length} Pending Payout
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Worker Title</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Receiving Mobile Number</th>
                  <th className="py-3 px-4">Payout Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {w.accountTitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        w.gateway === 'jazzcash'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {w.gateway}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {w.mobileNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-emerald-400">
                      {formatPKR(w.amountPKR)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        w.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : w.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {w.status === 'approved' ? 'Paid' : w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {w.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveWithdrawal(w.id)}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg text-xs transition"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => setRejectModalItem({ id: w.id, type: 'withdrawal' })}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-xs font-bold transition"
                          >
                            Reject & Refund
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: All Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-gray-800">
            <h3 className="text-base font-bold text-white">Platform Video Campaigns</h3>
            <p className="text-xs text-gray-400">Monitor active watch campaigns, organic view progress, and budget balances.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Title & Channel</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Worker Reward</th>
                  <th className="py-3 px-4">Remaining Budget</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/40 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-white truncate">{c.title}</div>
                      <div className="text-[10px] text-gray-400">{c.channelName} • {c.category}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {c.targetWatchSeconds}s
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{c.viewsDelivered} / {c.totalTargetViews} views</div>
                      <div className="w-24 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${Math.min(100, (c.viewsDelivered / c.totalTargetViews) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {formatPKR(c.rewardPerViewPKR)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatPKR(c.remainingBudgetPKR)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleCampaignStatus(c.id)}
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold"
                      >
                        {c.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Users - Registered Users Directory & Detailed Audit Log */}
      {activeTab === 'users' && (() => {
        // Summary calculations
        const totalUsersCount = allUsers.length;
        const workersList = allUsers.filter((u) => u.role === 'worker');
        const advertisersList = allUsers.filter((u) => u.role === 'advertiser');
        const pendingApprovalCount = allUsers.filter((u) => u.approvalStatus === 'pending_approval' || !u.approvalStatus).length;
        const approvedCount = allUsers.filter((u) => u.approvalStatus === 'approved').length;
        const suspendedCount = allUsers.filter((u) => u.approvalStatus === 'rejected').length;
        const activatedWorkersCount = allUsers.filter((u) => u.role === 'worker' && u.isActivated).length;
        const pendingActivationCount = allUsers.filter((u) => u.role === 'worker' && u.activationStatus === 'pending_verification').length;
        const totalUserBalancesPKR = allUsers.reduce(
          (sum, u) => sum + (u.role === 'advertiser' ? u.depositBalancePKR : u.walletBalancePKR),
          0
        );

        // Filter and sort users
        const displayedUsers = allUsers
          .filter((u) => {
            // Role filter
            if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;

            // Status filter
            if (userStatusFilter === 'pending' && u.approvalStatus !== 'pending_approval') return false;
            if (userStatusFilter === 'approved' && u.approvalStatus !== 'approved') return false;
            if (userStatusFilter === 'rejected' && u.approvalStatus !== 'rejected') return false;

            // Activation filter
            if (userActivationFilter === 'activated' && !u.isActivated) return false;
            if (userActivationFilter === 'pending' && u.activationStatus !== 'pending_verification') return false;
            if (userActivationFilter === 'unpaid' && (u.isActivated || u.activationStatus === 'pending_verification')) return false;

            // Search query across name, email, phone, referralCode, id
            if (!userSearchQuery.trim()) return true;
            const q = userSearchQuery.toLowerCase().trim();
            const cleanPhone = u.phone.replace(/[-\s]/g, '');
            return (
              u.name.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              cleanPhone.includes(q.replace(/[-\s]/g, '')) ||
              (u.referralCode && u.referralCode.toLowerCase().includes(q)) ||
              u.id.toLowerCase().includes(q)
            );
          })
          .sort((a, b) => {
            if (userSortBy === 'newest') {
              const dateA = a.registeredAt || a.joinedDate || '';
              const dateB = b.registeredAt || b.joinedDate || '';
              return dateB.localeCompare(dateA);
            }
            if (userSortBy === 'oldest') {
              const dateA = a.registeredAt || a.joinedDate || '';
              const dateB = b.registeredAt || b.joinedDate || '';
              return dateA.localeCompare(dateB);
            }
            if (userSortBy === 'highest_balance') {
              const balA = a.role === 'advertiser' ? a.depositBalancePKR : a.walletBalancePKR;
              const balB = b.role === 'advertiser' ? b.depositBalancePKR : b.walletBalancePKR;
              return balB - balA;
            }
            if (userSortBy === 'highest_earned') {
              return (b.totalEarnedPKR || 0) - (a.totalEarnedPKR || 0);
            }
            if (userSortBy === 'name') {
              return a.name.localeCompare(b.name);
            }
            return 0;
          });

        const handleCopyAllContacts = () => {
          const text = displayedUsers
            .map(
              (u, i) =>
                `${i + 1}. ${u.name} | Role: ${u.role.toUpperCase()} | Phone: ${u.phone} | Gmail: ${u.email} | Status: ${u.approvalStatus} | Registered: ${u.registeredAt || u.joinedDate}`
            )
            .join('\n');
          navigator.clipboard.writeText(text);
          showToast(`Copied ${displayedUsers.length} user contact records to clipboard!`, 'success');
        };

        const handleExportJson = () => {
          const blob = new Blob([JSON.stringify(displayedUsers, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `watchnearn-users-audit-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast('User registry audit log exported successfully!', 'success');
        };

        const copyPhoneOrEmail = (val: string, label: string) => {
          navigator.clipboard.writeText(val);
          setCopiedContact(val);
          showToast(`Copied ${label}: ${val}`, 'info');
          setTimeout(() => setCopiedContact(null), 2000);
        };

        const getWhatsAppLink = (phone: string, name: string) => {
          const clean = phone.replace(/[-\s]/g, '');
          const intlNumber = clean.startsWith('0') ? '92' + clean.slice(1) : clean.startsWith('+92') ? clean.slice(1) : clean;
          const msg = encodeURIComponent(`Hello ${name}, this is Sabir Hussain from WatchNEarn Pakistan regarding your registered account.`);
          return `https://wa.me/${intlNumber}?text=${msg}`;
        };

        return (
          <div className="space-y-6">
            
            {/* Header & Access Level Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Access Only • Confidential Registry
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                    Live Verified Data
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Registered Users Directory & Audit Log
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Comprehensive audit registry of all registered workers, advertisers, and administrators. Track registration dates, verified contact details (Pakistani mobile numbers & Gmail), account approval statuses, activation fee records, and lifetime earning balances.
                </p>
              </div>

              {/* Action Buttons: Copy / Export */}
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  onClick={handleCopyAllContacts}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="Copy contact details of all filtered users"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>Copy Contact List</span>
                </button>
                <button
                  onClick={handleExportJson}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                  title="Export complete user registry audit"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Registry</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Total Users</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-black text-white">{totalUsersCount}</div>
                <div className="text-[10px] text-slate-400">
                  {workersList.length} Workers • {advertisersList.length} Advertisers
                </div>
              </div>

              <div
                onClick={() => setUserStatusFilter(userStatusFilter === 'pending' ? 'all' : 'pending')}
                className={`border rounded-xl p-3.5 space-y-1 cursor-pointer transition ${
                  userStatusFilter === 'pending'
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Pending Approvals</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-black text-amber-300 flex items-center gap-1.5">
                  <span>{pendingApprovalCount}</span>
                  {pendingApprovalCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <div className="text-[10px] text-amber-400/80 font-semibold">
                  {userStatusFilter === 'pending' ? 'Showing Pending Only' : 'Click to Filter Pending'}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Approved Accounts</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-emerald-400">{approvedCount}</div>
                <div className="text-[10px] text-slate-400">{suspendedCount} Suspended / Rejected</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Activated Workers</span>
                  <BadgeCheck className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-xl font-black text-teal-300">{activatedWorkersCount}</div>
                <div className="text-[10px] text-slate-400">
                  {pendingActivationCount} Pending TID Verification
                </div>
              </div>

              <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>User Balances</span>
                  <Wallet className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-black text-white">{formatPKR(totalUserBalancesPKR)}</div>
                <div className="text-[10px] text-slate-400">Workers & Advertisers total</div>
              </div>

            </div>

            {/* Search, Filter & Sort Controls */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
              
              {/* Row 1: Search & Sort */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by Name, Gmail address, Pakistani phone (03XX), Referral code, or ID..."
                    className="w-full pl-9.5 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                    <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px] text-slate-400">Sort:</span>
                    <select
                      value={userSortBy}
                      onChange={(e) => setUserSortBy(e.target.value as any)}
                      className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="newest" className="bg-slate-900 text-white">Newest Registered</option>
                      <option value="oldest" className="bg-slate-900 text-white">Oldest Registered</option>
                      <option value="highest_balance" className="bg-slate-900 text-white">Highest Balance</option>
                      <option value="highest_earned" className="bg-slate-900 text-white">Highest Total Earned</option>
                      <option value="name" className="bg-slate-900 text-white">Name (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-800/80 text-xs">
                
                {/* Role Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Role:</span>
                  <button
                    onClick={() => setUserRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      userRoleFilter === 'all'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({allUsers.length})
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('worker')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      userRoleFilter === 'worker'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Workers ({workersList.length})</span>
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('advertiser')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      userRoleFilter === 'advertiser'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Megaphone className="w-3 h-3" />
                    <span>Advertisers ({advertisersList.length})</span>
                  </button>
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Status:</span>
                  <button
                    onClick={() => setUserStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      userStatusFilter === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    All Statuses
                  </button>
                  <button
                    onClick={() => setUserStatusFilter('pending')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      userStatusFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                        : 'bg-slate-950 text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Pending ({pendingApprovalCount})</span>
                  </button>
                  <button
                    onClick={() => setUserStatusFilter('approved')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      userStatusFilter === 'approved'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-950 text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Approved ({approvedCount})</span>
                  </button>
                  <button
                    onClick={() => setUserStatusFilter('rejected')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      userStatusFilter === 'rejected'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-950 text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    <span>Suspended ({suspendedCount})</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Detailed Table Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Registered Accounts Registry ({displayedUsers.length} of {allUsers.length} Users)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click on any user row or "View Dossier" for full audit details and administrative controls.
                  </p>
                </div>

                {displayedUsers.length !== allUsers.length && (
                  <button
                    onClick={() => {
                      setUserSearchQuery('');
                      setUserRoleFilter('all');
                      setUserStatusFilter('all');
                      setUserActivationFilter('all');
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer self-start sm:self-auto"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">User & Role</th>
                      <th className="py-3.5 px-4">Registration Date</th>
                      <th className="py-3.5 px-4">Contact Details (Phone / Email)</th>
                      <th className="py-3.5 px-4">Account & Activation Status</th>
                      <th className="py-3.5 px-4">Wallet / Deposit</th>
                      <th className="py-3.5 px-4">Lifetime Activity</th>
                      <th className="py-3.5 px-4 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {displayedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                          <p className="text-sm font-semibold text-slate-300">No registered users match your criteria.</p>
                          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filter selections.</p>
                        </td>
                      </tr>
                    ) : (
                      displayedUsers.map((u) => {
                        const isApproved = u.approvalStatus === 'approved';
                        const isPending = u.approvalStatus === 'pending_approval' || !u.approvalStatus;
                        const isSuspended = u.approvalStatus === 'rejected';

                        const formattedPhone = u.phone.length === 11 && u.phone.startsWith('03')
                          ? `${u.phone.slice(0, 4)}-${u.phone.slice(4)}`
                          : u.phone;

                        return (
                          <tr
                            key={u.id}
                            className={`hover:bg-slate-800/50 transition ${
                              isPending ? 'bg-amber-950/15' : isSuspended ? 'bg-rose-950/10' : ''
                            }`}
                          >
                            {/* Column 1: User & Role */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                    u.role === 'admin'
                                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                      : u.role === 'advertiser'
                                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                                      : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {u.role === 'admin' && (
                                      <Shield className="w-3 h-3 text-purple-400 shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                                        u.role === 'admin'
                                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                          : u.role === 'advertiser'
                                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      }`}
                                    >
                                      {u.role}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      ID: {u.id.replace('user_', '')}
                                    </span>
                                  </div>
                                  {u.referralCode && (
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      Ref: <span className="font-mono font-bold text-purple-300">{u.referralCode}</span>
                                      {u.referredBy && (
                                        <span className="text-slate-500"> (by {u.referredBy})</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Registration Date & Time */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-start gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-white text-xs">
                                    {u.registeredAt || u.joinedDate || '2026-06-12'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span>Joined: {u.joinedDate || '2026'}</span>
                                  </div>
                                  {u.lastLoginAt && (
                                    <div className="text-[10px] text-emerald-400/90 font-medium mt-0.5">
                                      Last login: {u.lastLoginAt}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Column 3: Contact Details (Phone & Email) */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1.5">
                                {/* Email */}
                                <div className="flex items-center gap-1.5 group">
                                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <a
                                    href={`mailto:${u.email}`}
                                    className="font-mono text-xs text-blue-400 hover:text-blue-300 hover:underline truncate max-w-[190px]"
                                    title="Click to send email"
                                  >
                                    {u.email}
                                  </a>
                                  <button
                                    onClick={() => copyPhoneOrEmail(u.email, 'Gmail')}
                                    className="p-1 text-slate-500 hover:text-white rounded transition cursor-pointer"
                                    title="Copy Gmail"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Phone & WhatsApp */}
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="font-mono font-bold text-white text-xs">
                                    {formattedPhone}
                                  </span>
                                  <button
                                    onClick={() => copyPhoneOrEmail(u.phone, 'Mobile Phone')}
                                    className="p-1 text-slate-500 hover:text-white rounded transition cursor-pointer"
                                    title="Copy phone number"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <a
                                    href={getWhatsAppLink(u.phone, u.name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition flex items-center gap-1 text-[10px] font-bold"
                                    title="Chat directly on WhatsApp"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                </div>
                              </div>
                            </td>

                            {/* Column 4: Account & Activation Status */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1.5">
                                {/* Approval Status */}
                                <div>
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Approved</span>
                                    </span>
                                  ) : isPending ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 animate-pulse">
                                      <Clock className="w-3 h-3" />
                                      <span>Pending Review</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                                      <XCircle className="w-3 h-3" />
                                      <span>Suspended</span>
                                    </span>
                                  )}
                                </div>

                                {/* Worker Activation Fee Status */}
                                {u.role === 'worker' && (
                                  <div>
                                    {u.isActivated ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/25">
                                        <BadgeCheck className="w-3 h-3" />
                                        <span>Fee Paid (Activated)</span>
                                      </span>
                                    ) : u.activationStatus === 'pending_verification' ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25">
                                        <span>TID: {u.activationTid || 'Pending'}</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                        <span>Fee Unpaid</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Column 5: Balances */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {u.role === 'advertiser' ? (
                                <div>
                                  <div className="font-bold text-amber-400 text-xs">
                                    {formatPKR(u.depositBalancePKR)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">Ad Deposit Fund</div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-bold text-emerald-400 text-xs">
                                    {formatPKR(u.walletBalancePKR)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">Worker Wallet</div>
                                </div>
                              )}
                            </td>

                            {/* Column 6: Lifetime Activity */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div>
                                <div className="font-bold text-white text-xs">
                                  {formatPKR(u.totalEarnedPKR)}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {u.totalTasksCompleted} Tasks • {u.totalReferralsCount} Referrals
                                </div>
                              </div>
                            </td>

                            {/* Column 7: Admin Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* View Dossier Button */}
                                <button
                                  onClick={() => setSelectedUserDossier(u)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                                  title="View complete user dossier & audit details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Quick Approve */}
                                {isPending ? (
                                  <button
                                    onClick={() => approveUser(u.id)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black rounded-lg text-xs transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3 font-bold" />
                                    <span>Approve</span>
                                  </button>
                                ) : isSuspended ? (
                                  <button
                                    onClick={() => approveUser(u.id)}
                                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-bold transition border border-emerald-500/30 cursor-pointer"
                                  >
                                    Reinstate
                                  </button>
                                ) : u.role !== 'admin' ? (
                                  <button
                                    onClick={() => rejectUser(u.id)}
                                    className="px-2.5 py-1 text-slate-400 hover:text-rose-400 rounded-lg text-xs transition border border-slate-800 hover:border-rose-900 cursor-pointer"
                                    title="Suspend user access"
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-purple-400 font-bold px-2 py-0.5 bg-purple-500/10 rounded">
                                    Master Admin
                                  </span>
                                )}

                                {/* Quick Activate Worker (if pending fee verification) */}
                                {u.role === 'worker' && !u.isActivated && (
                                  <button
                                    onClick={() => activateWorkerAccount(u.id)}
                                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer shadow-sm"
                                    title="Verify 1,000 PKR activation fee and unlock tasks"
                                  >
                                    Activate
                                  </button>
                                )}

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
              <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Showing {displayedUsers.length} of {allUsers.length} registered accounts</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Sabir Hussain Admin Security Clearance • 03264022010
                </div>
              </div>

            </div>

          </div>
        );
      })()}

      {/* Screenshot Proof Preview Modal */}
      {screenshotModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-lg w-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Payment Screenshot Proof</h4>
              <button
                onClick={() => setScreenshotModalUrl(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center">
              <img
                src={screenshotModalUrl}
                alt="Proof"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
            <button
              onClick={() => setScreenshotModalUrl(null)}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                Reject {rejectModalItem.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </h4>
              <button
                onClick={() => setRejectModalItem(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Please specify the reason for rejection (this will be visible to the user):
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. TID not found in 8558/3737 SMS history, or Account title mismatch."
              className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Dossier & Audit Inspection Modal */}
      {selectedUserDossier && (() => {
        const u = selectedUserDossier;
        const isApproved = u.approvalStatus === 'approved';
        const isPending = u.approvalStatus === 'pending_approval' || !u.approvalStatus;
        const isSuspended = u.approvalStatus === 'rejected';

        const formattedPhone = u.phone.length === 11 && u.phone.startsWith('03')
          ? `${u.phone.slice(0, 4)}-${u.phone.slice(4)}`
          : u.phone;

        const cleanPhone = u.phone.replace(/[-\s]/g, '');
        const intlNumber = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone.startsWith('+92') ? cleanPhone.slice(1) : cleanPhone;
        const whatsAppUrl = `https://wa.me/${intlNumber}?text=${encodeURIComponent(
          `Hello ${u.name}, this is Sabir Hussain from WatchNEarn Pakistan regarding your account (${u.email}).`
        )}`;

        const copyText = (val: string, label: string) => {
          navigator.clipboard.writeText(val);
          setCopiedContact(val);
          showToast(`Copied ${label}: ${val}`, 'info');
          setTimeout(() => setCopiedContact(null), 2000);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-5 p-6 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                      u.role === 'admin'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : u.role === 'advertiser'
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-white">{u.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : u.role === 'advertiser'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Confidential User Dossier • ID: <span className="font-mono text-slate-300">{u.id}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserDossier(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Card 1: Registration Audit */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                    <Calendar className="w-4 h-4" />
                    <span>Registration & Activity Audit</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Exact Registration:</span>
                      <span className="font-bold text-white font-mono">{u.registeredAt || u.joinedDate || '2026-06-12 14:30'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Joined Date:</span>
                      <span className="text-slate-200">{u.joinedDate || '2026-06-12'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Last Active Session:</span>
                      <span className="text-emerald-400 font-semibold">{u.lastLoginAt || 'Recent'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Referral Code:</span>
                      <span className="font-mono font-bold text-purple-300">{u.referralCode || 'N/A'}</span>
                    </div>
                    {u.referredBy && (
                      <div className="flex justify-between py-1 text-slate-400">
                        <span>Referred by:</span>
                        <span className="font-mono text-slate-300">{u.referredBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Contact Details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <Smartphone className="w-4 h-4" />
                    <span>Verified Contact Details</span>
                  </div>
                  
                  {/* Gmail */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-blue-400" />
                        Gmail Address
                      </span>
                      <button
                        onClick={() => copyText(u.email, 'Gmail')}
                        className="text-slate-400 hover:text-white flex items-center gap-0.5 text-[10px]"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>{copiedContact === u.email ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <a
                      href={`mailto:${u.email}`}
                      className="text-xs font-mono text-blue-400 hover:underline block break-all font-semibold"
                    >
                      {u.email}
                    </a>
                  </div>

                  {/* Phone & WhatsApp */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        Pakistani Mobile
                      </span>
                      <button
                        onClick={() => copyText(u.phone, 'Mobile Phone')}
                        className="text-slate-400 hover:text-white flex items-center gap-0.5 text-[10px]"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>{copiedContact === u.phone ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-white font-bold">{formattedPhone}</span>
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30 transition"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>

                {/* Card 3: Account & Approval Status */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Account Verification & Status</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Approval State:</span>
                      {isApproved ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          Approved & Active
                        </span>
                      ) : isPending ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 animate-pulse">
                          Pending Admin Approval
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                          Account Suspended
                        </span>
                      )}
                    </div>

                    {u.role === 'worker' && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Activation Fee:</span>
                        {u.isActivated ? (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                            Fee Paid (1,000 PKR)
                          </span>
                        ) : u.activationStatus === 'pending_verification' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            TID: {u.activationTid || 'Pending'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                            Unpaid
                          </span>
                        )}
                      </div>
                    )}

                    {u.activationGateway && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Payment Channel:</span>
                        <span className="uppercase text-slate-300 font-bold">{u.activationGateway}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 4: Financial Ledger */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Coins className="w-4 h-4" />
                    <span>Financial Ledger & Tasks</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {u.role === 'advertiser' ? (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ad Deposit Balance:</span>
                        <span className="font-bold text-amber-400">{formatPKR(u.depositBalancePKR)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Wallet Balance:</span>
                          <span className="font-bold text-emerald-400">{formatPKR(u.walletBalancePKR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Earned:</span>
                          <span className="font-bold text-white">{formatPKR(u.totalEarnedPKR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Withdrawn:</span>
                          <span className="font-bold text-slate-300">{formatPKR(u.totalWithdrawnPKR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tasks Completed:</span>
                          <span className="font-bold text-blue-400">{u.totalTasksCompleted} videos</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Referrals Commission:</span>
                          <span className="font-bold text-purple-300">{formatPKR(u.referralEarningsPKR || 0)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Admin Actions Footer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Administrative Clearance: <span className="text-purple-300 font-bold">Sabir Hussain (Master Admin)</span>
                </div>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <button
                      onClick={() => {
                        approveUser(u.id);
                        setSelectedUserDossier({ ...u, approvalStatus: 'approved' });
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 font-bold" />
                      <span>Approve Account</span>
                    </button>
                  )}

                  {isApproved && u.role !== 'admin' && (
                    <button
                      onClick={() => {
                        rejectUser(u.id);
                        setSelectedUserDossier({ ...u, approvalStatus: 'rejected' });
                      }}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold rounded-xl text-xs transition border border-rose-500/30 cursor-pointer"
                    >
                      Suspend Access
                    </button>
                  )}

                  {isSuspended && (
                    <button
                      onClick={() => {
                        approveUser(u.id);
                        setSelectedUserDossier({ ...u, approvalStatus: 'approved' });
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Reinstate User
                    </button>
                  )}

                  {u.role === 'worker' && !u.isActivated && (
                    <button
                      onClick={() => {
                        activateWorkerAccount(u.id);
                        setSelectedUserDossier({ ...u, isActivated: true, activationStatus: 'activated' });
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-600/30 cursor-pointer"
                    >
                      Verify Fee & Activate
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedUserDossier(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
