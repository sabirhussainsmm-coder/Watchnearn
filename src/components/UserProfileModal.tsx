import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EarningsHistoryTable } from './EarningsHistoryTable';
import { formatPKR } from '../utils/video';
import {
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Coins,
  History,
  ArrowUpRight,
  Gift,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Calendar,
  Lock,
  Wallet,
  Smartphone,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    closeProfileModal,
    openWithdrawModal,
    openAuthModal,
    openReferralModal,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'earnings' | 'kyc' | 'withdrawals'>('earnings');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isProfileModalOpen) return null;

  const formattedPhone =
    currentUser.phone.length === 11 && currentUser.phone.startsWith('03')
      ? `${currentUser.phone.slice(0, 4)}-${currentUser.phone.slice(4)}`
      : currentUser.phone;

  const handleCopy = (text: string, type: 'phone' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
    showToast(`Copied ${type === 'phone' ? 'Mobile Number' : 'Gmail'} to clipboard!`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-5 sm:p-7 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          
          <div className="flex items-start sm:items-center gap-4">
            
            {/* User Avatar */}
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-600 text-white shadow-purple-600/30'
                    : currentUser.role === 'advertiser'
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/30'
                }`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] ${
                  currentUser.approvalStatus === 'approved'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-slate-950 font-bold'
                }`}
                title={currentUser.approvalStatus === 'approved' ? 'Approved Account' : 'Pending Approval'}
              >
                {currentUser.approvalStatus === 'approved' ? '✓' : '!'}
              </div>
            </div>

            {/* User Name & Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-white">{currentUser.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : currentUser.role === 'advertiser'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {currentUser.role === 'worker' ? 'Task Earner (Worker)' : currentUser.role}
                </span>

                {currentUser.isActivated && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Fee Paid (Activated)
                  </span>
                )}
              </div>

              {/* Contact summary */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Mail className="w-3 h-3 text-blue-400" />
                  {currentUser.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                  {formattedPhone}
                </span>
                <span>•</span>
                <span className="text-slate-500">
                  Joined: {currentUser.joinedDate || '2026-06-12'}
                </span>
              </div>
            </div>

          </div>

          {/* Close & Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                closeProfileModal();
                openAuthModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              title="Switch to another user or register new"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch User</span>
            </button>
            <button
              onClick={closeProfileModal}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white bg-slate-850/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Earnings History & Wallet Statement</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'kyc'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white bg-slate-850/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Profile & KYC</span>
          </button>
        </div>

        {/* Tab 1: Detailed Earnings History Table */}
        {activeTab === 'earnings' && (
          <EarningsHistoryTable
            userId={currentUser.id}
            showWalletSummary={true}
            onOpenWithdrawal={() => {
              closeProfileModal();
              openWithdrawModal();
            }}
          />
        )}

        {/* Tab 2: Account & KYC Details */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box 1: Contact & Credentials */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-blue-400 border-b border-slate-900 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Contact Credentials
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
                    Admin Approved
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  
                  {/* Gmail */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Gmail Address (Google Login)</span>
                      <button
                        onClick={() => handleCopy(currentUser.email, 'email')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-sm text-blue-400 font-bold break-all">
                      {currentUser.email}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Pakistani Mobile Number (JazzCash / EasyPaisa)</span>
                      <button
                        onClick={() => handleCopy(currentUser.phone, 'phone')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-sm text-emerald-400 font-bold">
                      {formattedPhone}
                    </div>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Account ID:</span>
                    <span className="font-mono text-slate-300 font-semibold">{currentUser.id}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Password Status:</span>
                    <span className="text-slate-300 font-mono">•••••••• (Secure)</span>
                  </div>

                </div>
              </div>

              {/* Box 2: Worker Activation & Referrals */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-slate-900 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    Worker Activation & Referrals
                  </span>
                  <span className="text-[10px] text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded-full font-bold">
                    {currentUser.isActivated ? 'Active Earner' : 'Activation Needed'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Worker Status:</span>
                    <span className="font-bold text-emerald-400">
                      {currentUser.isActivated ? 'Just 3.6 Dollars (1,000 PKR) Paid' : 'Join in Just 3.6 Dollars (Pending Verification)'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Your Referral Code:</span>
                    <span className="font-mono font-black text-amber-400 text-sm">{currentUser.referralCode}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Invited Referrals:</span>
                    <span className="font-bold text-white">{currentUser.totalReferralsCount || 3} friends</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Referral Commissions:</span>
                    <span className="font-bold text-amber-300">{formatPKR(currentUser.referralEarningsPKR || 250)}</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        closeProfileModal();
                        openReferralModal();
                      }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Open Refer & Earn Dashboard</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
