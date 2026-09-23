import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ShieldCheck, KeyRound, AlertTriangle, X, CheckCircle, ArrowRight } from 'lucide-react';
import { ADMIN_SECURITY_PIN } from '../types';

export const AdminLockModal: React.FC = () => {
  const { isPinModalOpen, closePinModal, unlockAdmin, switchUserRole } = useApp();
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isPinModalOpen) {
      setPin('');
      setErrorMessage('');
      setErrorShake(false);
      setIsSuccess(false);
    }
  }, [isPinModalOpen]);

  if (!isPinModalOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMessage('');
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const verifyPin = (codeToVerify: string) => {
    if (codeToVerify === ADMIN_SECURITY_PIN) {
      setIsSuccess(true);
      setTimeout(() => {
        unlockAdmin(codeToVerify);
      }, 350);
    } else {
      setErrorShake(true);
      setErrorMessage('Incorrect PIN code! Please enter the valid admin passcode.');
      setTimeout(() => {
        setPin('');
        setErrorShake(false);
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className={`relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-7 text-center transition-all ${
          errorShake ? 'animate-shake border-rose-500/80 shadow-rose-500/20' : ''
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => {
            closePinModal();
            switchUserRole('worker');
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-750 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 mb-4">
          {isSuccess ? (
            <CheckCircle className="w-8 h-8 text-emerald-300 animate-bounce" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-xl font-black text-white tracking-tight">
          Admin Portal Security
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Financial data & payout approval console is locked.
        </p>

        {/* Admin note */}
        <div className="mt-2.5 py-1.5 px-3 rounded-lg bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 font-medium">
          Enter 4-Digit Administrator Security Passcode
        </div>

        {/* 4-Digit Display */}
        <div className="flex justify-center items-center gap-3 my-5">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            return (
              <div
                key={index}
                className={`w-12 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border transition-all ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : hasDigit
                    ? 'border-purple-500 bg-purple-500/15 text-white shadow-sm shadow-purple-500/30'
                    : 'border-slate-800 bg-slate-950/80 text-slate-600'
                }`}
              >
                {hasDigit ? '●' : '○'}
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold mb-3">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-lg font-bold text-white transition-all shadow-sm border border-slate-750"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-lg font-bold text-white transition-all shadow-sm border border-slate-750"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            ⌫
          </button>
        </div>

        {/* Security badge at footer - NO 7467 hint */}
        <div className="pt-2.5 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Restricted to authorized system administrators</span>
        </div>
      </div>
    </div>
  );
};
