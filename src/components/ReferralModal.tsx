import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/video';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Coins,
  X,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';

export const ReferralModal: React.FC = () => {
  const {
    isReferralModalOpen,
    closeReferralModal,
    currentUser,
    referrals,
    applyReferralCode,
  } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [redeemError, setRedeemError] = useState('');

  if (!isReferralModalOpen) return null;

  const refCode = currentUser.referralCode || 'WATCHPK786';
  const appOrigin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'https://watchnearn.pk';
  const shareUrl = `${appOrigin}/?ref=${refCode}`;

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🎬 WatchNEarn Pakistan: Watch videos and earn real PKR with JazzCash / EasyPaisa payouts!\n\nJoin in Just 3.6 Dollars using my invite link to get a 50 PKR welcome bonus:\n${shareUrl}\n\nOr enter my referral code during sign-up: ${refCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError('');
    if (!inputCode.trim()) {
      setRedeemError('Please enter a referral code.');
      return;
    }
    const res = applyReferralCode(inputCode.trim());
    if (!res.success) {
      setRedeemError(res.error || 'Failed to apply code');
    } else {
      setInputCode('');
    }
  };

  // User's referral stats
  const totalInvited = referrals.length;
  const totalEarnedFromRefs = referrals.reduce(
    (sum, r) => sum + r.bonusPKR + r.commissionEarnedPKR,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden my-6">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 p-6 sm:p-7 text-slate-950">
          <button
            onClick={closeReferralModal}
            className="absolute top-4 right-4 p-2 text-slate-950/70 hover:text-slate-950 rounded-full bg-white/20 hover:bg-white/40 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 text-slate-950 text-xs font-black tracking-wide uppercase">
              <Gift className="w-3.5 h-3.5" />
              Referral Rewards Program
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Refer Friends & Earn Cash
          </h2>
          <p className="text-xs sm:text-sm text-slate-900 font-medium mt-1 max-w-md">
            Earn 100 PKR instant cash bonus for every friend who joins in Just 3.6 Dollars, plus 10% lifetime commission on all their completed video tasks!
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 3 Steps Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-2">
                1
              </div>
              <div className="text-xs font-bold text-white">Share Your Link</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Send your invite link to friends on WhatsApp or social media</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-2">
                2
              </div>
              <div className="text-xs font-bold text-white">Friend Joins</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Your friend joins in Just 3.6 Dollars and gets a 50 PKR welcome bonus</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-2">
                3
              </div>
              <div className="text-xs font-bold text-white">Earn Daily Cash</div>
              <div className="text-[11px] text-slate-400 mt-0.5">You earn 100 PKR + 10% lifetime commission on every task</div>
            </div>
          </div>

          {/* Referral Link & Code Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Personal Referral Code:
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-base font-extrabold text-amber-400 tracking-wider">
                  {refCode}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(refCode, 'code')}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Direct Invite Link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareUrl, 'link')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition cursor-pointer"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Share via WhatsApp (Direct)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'WatchNEarn Pakistan',
                      text: 'Watch videos and earn real PKR with JazzCash / EasyPaisa payouts!',
                      url: shareUrl,
                    });
                  } else {
                    copyToClipboard(shareUrl, 'link');
                  }
                }}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>More Share Options</span>
              </button>
            </div>
          </div>

          {/* Apply Friend's Code Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Have a Referral Code? Claim 50 PKR Bonus (Join in Just 3.6 Dollars)!
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {currentUser.referredBy
                ? `You have already applied referral code (${currentUser.referredBy}) and received your 50 PKR bonus!`
                : 'If you were referred by a friend, enter their referral code below to receive an instant 50 PKR welcome bonus:'}
            </p>

            {!currentUser.referredBy ? (
              <form onSubmit={handleRedeem} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. ALI786 or WELCOME50)"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.toUpperCase());
                      setRedeemError('');
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    Claim 50 PKR
                  </button>
                </div>
                {redeemError && (
                  <p className="text-xs text-rose-400 font-medium">{redeemError}</p>
                )}
              </form>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Code <strong className="font-mono text-white">{currentUser.referredBy}</strong> applied! 50 PKR added to your wallet.
                </span>
              </div>
            )}
          </div>

          {/* Referral Stats & History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Your Referral Team ({totalInvited})</span>
              </h3>
              <div className="text-xs text-amber-400 font-bold">
                Total Earned: {formatPKR(totalEarnedFromRefs)}
              </div>
            </div>

            {referrals.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-400">
                No friends joined using your link yet. Share your invite link above to start earning!
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{ref.friendName}</span>
                        {ref.status === 'active_earner' ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            Active Earner
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                            Registered
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Joined: {ref.joinedDate} · Tasks: {ref.tasksCompleted}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">
                        +{formatPKR(ref.bonusPKR + ref.commissionEarnedPKR)}
                      </div>
                      {ref.commissionEarnedPKR > 0 && (
                        <div className="text-[10px] text-amber-400">
                          10% Com: {formatPKR(ref.commissionEarnedPKR)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Terms: Referral earnings automatically transfer to your main wallet and are eligible for JazzCash & EasyPaisa withdrawal once the 500 PKR threshold is met.
          </p>
        </div>

      </div>
    </div>
  );
};
