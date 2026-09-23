import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentGateway, PLATFORM_CONFIG } from '../types';
import { PaymentLogo } from './PaymentLogo';
import {
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Lock,
  ArrowRight,
  Clock,
  Gift,
} from 'lucide-react';

interface WorkerActivationModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const WorkerActivationModal: React.FC<WorkerActivationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, submitWorkerActivation, showToast } = useApp();

  const [gateway, setGateway] = useState<PaymentGateway>('jazzcash');
  const [senderName, setSenderName] = useState(currentUser.name || 'Ali Abbas');
  const [senderNumber, setSenderNumber] = useState(currentUser.phone || '0308-4491028');
  const [tid, setTid] = useState(currentUser.activationTid || '');
  const [referralInput, setReferralInput] = useState(currentUser.referredBy || 'HAMZA786');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const hasReferralDiscount = Boolean(referralInput.trim() || currentUser.referredBy);
  const activationFeePKR = hasReferralDiscount
    ? PLATFORM_CONFIG.workerActivationFeePKR - PLATFORM_CONFIG.referralDiscountPKR // 900 PKR
    : PLATFORM_CONFIG.workerActivationFeePKR; // 1,000 PKR

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${text} to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tid.trim()) {
      showToast('Please enter the Transaction ID (TID) from your JazzCash / EasyPaisa SMS.', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = submitWorkerActivation({
      gateway,
      senderName: senderName.trim(),
      senderNumber: senderNumber.trim(),
      transactionId: tid.trim(),
      amountPKR: activationFeePKR,
      referralCode: referralInput.trim(),
    });

    setIsSubmitting(false);
    if (res.success && onClose) {
      onClose();
    }
  };

  const isPending = currentUser.activationStatus === 'pending_verification';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-snug">
                Worker Account Activation (Just 3.6 Dollars)
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Join in Just 3.6 Dollars (1,000 PKR) to unlock unlimited daily video task earnings
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 text-xl font-bold leading-none cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Alert if Pending */}
          {isPending && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-600 dark:text-amber-400">
                  Verification Pending
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Your activation submission has been received (TID: <span className="font-mono font-bold text-slate-900 dark:text-white">{currentUser.activationTid || tid}</span>). Admin (Sabir Hussain) will verify via SMS record and activate your account shortly.
                </p>
                <p className="text-[11px] text-amber-500 font-medium">
                  💡 Note: Admin can approve in 1-click from the Admin Portal.
                </p>
              </div>
            </div>
          )}

          {/* Pricing Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Standard Fee */}
            <div className={`p-4 rounded-xl border ${!hasReferralDiscount ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'}`}>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard Worker Registration</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Just 3.6 Dollars <span className="text-xs font-bold text-slate-500">(1,000 PKR)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Join in Just 3.6 Dollars for lifetime activation & unlimited video watching access
              </p>
            </div>

            {/* Referral Discounted Fee */}
            <div className={`p-4 rounded-xl border ${hasReferralDiscount ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Referral Discount (-100 PKR)
                </span>
                <span className="text-[10px] font-black uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  Savings
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                900 <span className="text-xs font-bold text-slate-500">PKR</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                Join in Just 3.6 Dollars with referral discount (Pay 900 PKR), plus referrer receives 100 PKR cash bonus!
              </p>
            </div>
          </div>

          {/* Official Payment Accounts (Sabir Hussain) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Official Receiving Accounts (Sabir Hussain)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                Instant Verification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* JazzCash Official Account */}
              <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <PaymentLogo gateway="jazzcash" size="sm" />
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded">
                    SMS: 8558
                  </span>
                </div>
                <div className="text-xs">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Account Title:</div>
                  <div className="font-extrabold text-slate-900 dark:text-white">Sabir Hussain</div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    03264022010
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('03264022010', 'jc_num')}
                    className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Copy Number"
                  >
                    {copiedField === 'jc_num' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* EasyPaisa Official Account */}
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <PaymentLogo gateway="easypaisa" size="sm" />
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    SMS: 3737
                  </span>
                </div>
                <div className="text-xs">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Account Title:</div>
                  <div className="font-extrabold text-slate-900 dark:text-white">Sabir Hussain</div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    03264022010
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('03264022010', 'ep_num')}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Copy Number"
                  >
                    {copiedField === 'ep_num' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              💡 Send funds from your JazzCash or EasyPaisa app to <strong>03264022010 (Sabir Hussain)</strong> and enter the Transaction ID (TID) from your confirmation SMS below.
            </p>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gateway Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGateway('jazzcash')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer ${
                    gateway === 'jazzcash'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20 ring-2 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <PaymentLogo gateway="jazzcash" size="sm" />
                </button>

                <button
                  type="button"
                  onClick={() => setGateway('easypaisa')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer ${
                    gateway === 'easypaisa'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <PaymentLogo gateway="easypaisa" size="sm" />
                </button>
              </div>
            </div>

            {/* Sender Name & Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sender Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Abbas"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sender Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="0308-4491028"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Friend's Referral Code (-100 PKR Discount)</span>
                {hasReferralDiscount && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                    ✓ 100 PKR Discount Applied
                  </span>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. HAMZA786"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                className="w-full px-3 py-2 text-sm uppercase font-mono tracking-wider bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Entering a referral code reduces your joining fee to 900 PKR (Save on 3.6 Dollars), and your friend gets 100 PKR cash bonus!
              </p>
            </div>

            {/* Transaction ID (TID) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Transaction ID (TID from SMS) *
              </label>
              <input
                type="text"
                required
                placeholder={gateway === 'jazzcash' ? 'e.g. JC9182374619 (12-Digit TID)' : 'e.g. EP8829103948 (11-Digit TID)'}
                value={tid}
                onChange={(e) => setTid(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm uppercase font-mono font-bold tracking-wider bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Enter the TID received in SMS from JazzCash (8558) or EasyPaisa (3737). Admin (Sabir Hussain) will verify against transaction records.
              </p>
            </div>

            {/* Live Message Preview */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs">
              <span className="font-bold text-blue-800 dark:text-blue-300 block mb-0.5">
                Admin Notification Dispatch:
              </span>
              <p className="text-slate-700 dark:text-slate-200 italic font-medium">
                "{senderName || 'Ali Abbas'} deposited {activationFeePKR} PKR (Just 3.6 Dollars joining fee) to Sabir Hussain ({gateway === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}: 03264022010). TID: {tid.trim().toUpperCase() || 'JC9182374619'}"
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Submit {activationFeePKR} PKR (Just 3.6 Dollars) & Request Verification
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
