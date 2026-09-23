import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentGateway, PLATFORM_CONFIG } from '../types';
import { formatPKR } from '../utils/video';
import { PaymentLogo } from './PaymentLogo';
import {
  X,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  History,
  PhoneCall
} from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const {
    isWithdrawModalOpen,
    closeWithdrawModal,
    currentUser,
    isLoggedIn,
    openAuthModal,
    submitWithdrawal,
    withdrawals,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  const [gateway, setGateway] = useState<PaymentGateway>('jazzcash');
  const [accountTitle, setAccountTitle] = useState(isLoggedIn && currentUser.id !== 'guest' ? currentUser.name : '');
  const [mobileNumber, setMobileNumber] = useState(isLoggedIn && currentUser.id !== 'guest' ? currentUser.phone : '');
  const [amountPKR, setAmountPKR] = useState<number>(500);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isWithdrawModalOpen) return null;

  const minPayout = PLATFORM_CONFIG.minWithdrawalPKR;
  const isEligible = currentUser.walletBalancePKR >= minPayout;
  const deficit = Math.max(0, minPayout - currentUser.walletBalancePKR);
  const userWithdrawals = withdrawals.filter((w) => w.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!accountTitle.trim()) {
      setErrorMsg('Please enter your Account Title as registered on your SIM / CNIC.');
      return;
    }

    const cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMsg('Please enter a valid 11-digit Pakistani mobile number (e.g., 03001234567).');
      return;
    }

    if (amountPKR < minPayout) {
      setErrorMsg(`Minimum withdrawal amount is ${minPayout} PKR.`);
      return;
    }

    if (amountPKR > currentUser.walletBalancePKR) {
      setErrorMsg(`Amount exceeds your available balance (${formatPKR(currentUser.walletBalancePKR)}).`);
      return;
    }

    const result = submitWithdrawal({
      gateway,
      accountTitle: accountTitle.trim(),
      mobileNumber: mobileNumber.trim(),
      amountPKR,
    });

    if (result.success) {
      setActiveTab('history');
    } else {
      setErrorMsg(result.error || 'Failed to submit withdrawal request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-950 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Withdrawal Portal</h3>
              <p className="text-xs text-gray-400">Direct JazzCash & EasyPaisa Cashouts</p>
            </div>
          </div>
          <button
            onClick={closeWithdrawModal}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is not logged in */}
        {!isLoggedIn ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sign In Required</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please sign in to access your wallet and request JazzCash / EasyPaisa cashouts.
              </p>
            </div>
            <button
              onClick={() => {
                closeWithdrawModal();
                openAuthModal();
              }}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex border-b border-gray-800 bg-gray-950/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('request')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'request'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Request Payout
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Payout History ({userWithdrawals.length})
          </button>
        </div>

        <div className="p-6 space-y-5">
          {activeTab === 'request' ? (
            <>
              {/* Balance Summary Card */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400">Available Wallet Balance</span>
                    <div className="text-2xl font-black text-emerald-400">
                      {formatPKR(currentUser.walletBalancePKR)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-400">Minimum Threshold</span>
                    <div className="text-sm font-bold text-gray-300">
                      {formatPKR(minPayout)}
                    </div>
                  </div>
                </div>

                {/* Progress bar towards 500 PKR */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isEligible ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, (currentUser.walletBalancePKR / minPayout) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className={isEligible ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                      {isEligible ? '✓ Eligible for payout' : `Need ${formatPKR(deficit)} more to withdraw`}
                    </span>
                    <span className="text-gray-400">
                      {Math.min(100, Math.round((currentUser.walletBalancePKR / minPayout) * 100))}%
                    </span>
                  </div>
                </div>
              </div>

              {!isEligible && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Threshold Notice:</strong> You need at least 500 PKR in your wallet to submit a withdrawal request. Watch more tasks on the Task Board to reach this milestone quickly!
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Gateway Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">
                    Select Receiving Pakistani Gateway:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* JazzCash Option */}
                    <div
                      onClick={() => setGateway('jazzcash')}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        gateway === 'jazzcash'
                          ? 'bg-rose-950/40 border-rose-500 text-white ring-1 ring-rose-500'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <PaymentLogo gateway="jazzcash" size="sm" />
                      <div>
                        <div className="text-xs font-bold text-white">JazzCash</div>
                        <div className="text-[10px] text-gray-400">Mobile Account</div>
                      </div>
                    </div>

                    {/* EasyPaisa Option */}
                    <div
                      onClick={() => setGateway('easypaisa')}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        gateway === 'easypaisa'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <PaymentLogo gateway="easypaisa" size="sm" />
                      <div>
                        <div className="text-xs font-bold text-white">EasyPaisa</div>
                        <div className="text-[10px] text-gray-400">Telenor Microfinance</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Account Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Account Title (Full Name on Account / CNIC)
                  </label>
                  <input
                    type="text"
                    required
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    placeholder="e.g. Muhammad Hamza"
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-gray-400">Must match your JazzCash / EasyPaisa account title to prevent transfer rejection.</span>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    {gateway === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Mobile Number (11 digits)
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="03001234567"
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Amount in PKR */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-300">
                      Withdrawal Amount (PKR)
                    </label>
                    <span className="text-[11px] text-emerald-400">0% Transfer Fee</span>
                  </div>
                  <input
                    type="number"
                    min={minPayout}
                    max={currentUser.walletBalancePKR || minPayout}
                    step={10}
                    value={amountPKR}
                    onChange={(e) => setAmountPKR(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
                  />

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setAmountPKR(500)}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold"
                    >
                      500 PKR
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPKR(1000)}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold"
                    >
                      1,000 PKR
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPKR(Math.floor(currentUser.walletBalancePKR))}
                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-bold"
                    >
                      All ({formatPKR(currentUser.walletBalancePKR)})
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 font-medium bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/50">
                    {errorMsg}
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!isEligible}
                  className={`w-full py-3 rounded-xl text-sm font-extrabold shadow-lg transition flex items-center justify-center gap-2 ${
                    isEligible
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 shadow-emerald-500/20 active:scale-[0.99]'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  {isEligible ? `Submit ${formatPKR(amountPKR)} Cashout Request` : `Earn ${formatPKR(deficit)} more to unlock`}
                </button>

              </form>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {userWithdrawals.length === 0 ? (
                <div className="text-center py-10 bg-gray-950 rounded-xl border border-gray-800">
                  <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No withdrawal requests yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {userWithdrawals.map((w) => (
                    <div
                      key={w.id}
                      className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            w.gateway === 'jazzcash'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {w.gateway}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {w.accountTitle} ({w.mobileNumber})
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {new Date(w.createdAt).toLocaleDateString()} at{' '}
                          {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {w.adminNotes && (
                          <div className="text-[10px] text-gray-300 italic">
                            Note: {w.adminNotes}
                          </div>
                        )}
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-sm font-extrabold text-white">
                          {formatPKR(w.amountPKR)}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            w.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : w.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {w.status === 'approved' ? '✓ Paid' : w.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </>
        )}

      </div>
    </div>
  );
};
