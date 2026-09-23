import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/video';
import { sounds } from '../utils/audio';
import {
  X,
  Clock,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Eye,
  RefreshCw,
  Coins
} from 'lucide-react';

export const VideoPlayerModal: React.FC = () => {
  const {
    activeVideoModal,
    closeVideoModal,
    recordVideoWatch,
    logPartialWatch,
    hasWatchedToday,
    currentUser,
  } = useApp();

  const targetSeconds = activeVideoModal?.targetWatchSeconds ?? 0;
  const [secondsRemaining, setSecondsRemaining] = useState(targetSeconds);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isPausedByUnfocus, setIsPausedByUnfocus] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  // Captcha state
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const alreadyWatched = activeVideoModal ? hasWatchedToday(activeVideoModal.id) : false;

  const handleCloseModal = () => {
    if (!activeVideoModal) {
      closeVideoModal();
      return;
    }
    if (!rewardClaimed && !timerFinished && secondsRemaining < targetSeconds) {
      const watched = targetSeconds - secondsRemaining;
      if (watched >= 3) {
        logPartialWatch(activeVideoModal.id, watched);
      }
    }
    closeVideoModal();
  };

  // Initialize Captcha
  const generateNewCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const n2 = Math.floor(Math.random() * 7) + 1; // 1 to 7
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaAnswer('');
    setCaptchaError('');
  };

  useEffect(() => {
    if (!activeVideoModal) return;
    setSecondsRemaining(activeVideoModal.targetWatchSeconds);
    setTimerFinished(false);
    setRewardClaimed(false);
    setIsPausedByUnfocus(false);
    setIsWindowFocused(true);
    generateNewCaptcha();
  }, [activeVideoModal]);

  // Fraud prevention: Listen for visibilitychange and window blur/focus
  useEffect(() => {
    if (!activeVideoModal) return;
    if (alreadyWatched || timerFinished || rewardClaimed) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowFocused(false);
        setIsPausedByUnfocus(true);
        sounds.playWarningBuzz();
      } else {
        setIsWindowFocused(true);
      }
    };

    const handleBlur = () => {
      setIsWindowFocused(false);
      setIsPausedByUnfocus(true);
      sounds.playWarningBuzz();
    };

    const handleFocus = () => {
      setIsWindowFocused(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeVideoModal, alreadyWatched, timerFinished, rewardClaimed]);

  // Countdown timer: only ticks when window is focused and visible
  useEffect(() => {
    if (!activeVideoModal) return;
    if (alreadyWatched || timerFinished || rewardClaimed) return;
    if (!isWindowFocused || isPausedByUnfocus) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerFinished(true);
          sounds.playTick();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVideoModal, alreadyWatched, isWindowFocused, isPausedByUnfocus, timerFinished, rewardClaimed]);

  const handleResumePlayback = () => {
    setIsPausedByUnfocus(false);
    setIsWindowFocused(true);
  };

  const handleVerifyCaptcha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVideoModal) return;
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswer.trim(), 10) !== expected) {
      setCaptchaError(`Incorrect answer (${captchaNum1} + ${captchaNum2} ≠ ${captchaAnswer}). Please try again!`);
      generateNewCaptcha();
      return;
    }

    // Human verified! Record watch and credit wallet
    const result = recordVideoWatch(activeVideoModal.id);
    if (result.success) {
      setRewardAmount(result.rewardPKR);
      setRewardClaimed(true);
      sounds.playRewardChime();

      // Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#34D399', '#3B82F6'],
        });
      } catch {
        // Confetti fallback
      }
    } else {
      setCaptchaError(result.error || 'Failed to claim reward.');
    }
  };

  if (!activeVideoModal) return null;

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.round(((targetSeconds - secondsRemaining) / targetSeconds) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-950 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Paid Task</span>
            </div>
            <span className="text-xs font-semibold text-gray-300 hidden sm:inline">
              {activeVideoModal.channelName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Reward Pill */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-xs font-bold text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>Reward: {formatPKR(activeVideoModal.rewardPerViewPKR)}</span>
            </div>

            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black">
          {/* Iframe */}
          <iframe
            src={activeVideoModal.embedUrl}
            title={activeVideoModal.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          {/* Active Window Fraud Alert Overlay when tab is blurred */}
          {isPausedByUnfocus && !timerFinished && !rewardClaimed && (
            <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 ring-8 ring-rose-500/10 animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Countdown Paused: Window Unfocused!
              </h3>
              <p className="text-sm text-gray-300 max-w-md mt-2 leading-relaxed">
                Our active window fraud prevention system detected that you switched tabs or minimized the browser.
                To ensure high advertiser retention, <strong className="text-emerald-400">you must keep this tab visible and active</strong> to earn your reward.
              </p>
              <button
                onClick={handleResumePlayback}
                className="mt-5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition transform active:scale-95 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Resume Video & Countdown Timer
              </button>
            </div>
          )}

          {/* 24-hr Cooldown Warning Overlay if user already claimed this today */}
          {alreadyWatched && (
            <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                24-Hour Cooldown In Effect
              </h3>
              <p className="text-sm text-gray-300 max-w-md mt-2">
                You have already received the reward for this video task within the last 24 hours. Duplicate views from the same device within 24 hours are limited to protect advertiser budgets.
              </p>
              <button
                onClick={closeVideoModal}
                className="mt-5 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-sm transition"
              >
                Browse Other Tasks
              </button>
            </div>
          )}
        </div>

        {/* Timer Bar & Status Footer */}
        <div className="p-5 bg-gray-900 border-t border-gray-800 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {activeVideoModal.title}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Channel: <span className="text-gray-300 font-medium">{activeVideoModal.channelName}</span> • Target: {activeVideoModal.targetWatchSeconds}s
              </p>
            </div>

            {/* Countdown Display */}
            {!alreadyWatched && !rewardClaimed && (
              <div className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                  timerFinished
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : isPausedByUnfocus
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-gray-950 border-gray-800 text-white'
                }`}>
                  <Clock className={`w-4 h-4 ${!timerFinished && !isPausedByUnfocus ? 'animate-spin' : ''}`} />
                  <span>
                    {timerFinished ? '0s (Complete!)' : `${secondsRemaining}s remaining`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!alreadyWatched && !rewardClaimed && (
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    timerFinished
                      ? 'bg-emerald-400'
                      : isPausedByUnfocus
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Keep this window visible</span>
                <span>{progressPercent}% completed</span>
              </div>
            </div>
          )}

          {/* Human Captcha Box once timer hits 0 */}
          {timerFinished && !rewardClaimed && (
            <div className="p-4 rounded-xl bg-gray-950 border border-emerald-500/40 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <HelpCircle className="w-4 h-4" />
                <span>Human Verification: Solve to claim {formatPKR(activeVideoModal.rewardPerViewPKR)}</span>
              </div>
              
              <form onSubmit={handleVerifyCaptcha} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-base font-black text-white">
                  <span>{captchaNum1}</span>
                  <span>+</span>
                  <span>{captchaNum2}</span>
                  <span>=</span>
                </div>

                <input
                  type="number"
                  placeholder="?"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  autoFocus
                  required
                  className="w-24 text-center py-2 bg-gray-900 border border-gray-700 rounded-xl text-base font-black text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Verify & Claim Earnings
                </button>

                <button
                  type="button"
                  onClick={generateNewCaptcha}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
                  title="New Captcha"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </form>

              {captchaError && (
                <p className="text-xs text-rose-400 font-semibold">{captchaError}</p>
              )}
            </div>
          )}

          {/* Reward Success Box */}
          {rewardClaimed && (
            <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">
                  +{formatPKR(rewardAmount)} Credited to Your Wallet!
                </h4>
                <p className="text-xs text-gray-300 mt-0.5">
                  Great job! Your earnings have been added to your worker balance. You can withdraw to JazzCash or EasyPaisa anytime.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={closeVideoModal}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-sm transition"
                >
                  Next Task
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
