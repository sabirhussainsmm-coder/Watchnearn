import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  X,
  Mail,
  Phone,
  Lock,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  LogIn,
  UserPlus,
  Coins,
  Video,
  ArrowRight
} from 'lucide-react';

export const UserAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    registerUser,
    loginUser,
    currentUser,
    allUsers,
    loginAsUser,
    switchUserRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('worker');
  const [regReferralCode, setRegReferralCode] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please provide a valid Gmail or Email address.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 10) {
      setRegError('Please enter a valid Pakistani mobile number (e.g., 03001234567).');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('Please set a password with at least 4 characters.');
      return;
    }

    const res = registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword,
      role: regRole,
      referralCode: regReferralCode.trim() || undefined,
    });

    if (!res.success) {
      setRegError(res.message);
    } else {
      setRegSuccess('Your account registration has been submitted to Admin (Sabir Hussain) for approval. You can view its pending status below.');
      setTimeout(() => {
        closeAuthModal();
      }, 2500);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your Gmail or Mobile number.');
      return;
    }

    const res = loginUser(loginIdentifier.trim(), loginPassword.trim());
    if (!res.success) {
      setLoginError(res.message);
    } else {
      closeAuthModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Account Access & Registration</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official User Authentication & Verification Portal
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 dark:bg-slate-850 m-4 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('register')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Join (Just 3.6 Dollars)</span>
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 pb-6 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* Admin Approval Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-xs">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-amber-800 dark:text-amber-200 space-y-1">
              <span className="font-bold block">Admin Approval Required:</span>
              <p className="text-[11px] leading-relaxed">
                All accounts require verification. Provide your valid <strong>Gmail</strong> and <strong>Mobile Number</strong>. Master Admin (Sabir Hussain) will verify and approve your account. You set your own password.
              </p>
            </div>
          </div>

          {activeTab === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Abbas"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Gmail / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gmail / Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. ali.abbas@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Admin will log and verify this Gmail address.
                </span>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pakistani Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Jazz, Telenor, Zong, or Ufone number for notifications & withdrawals.
                </span>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Your Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Set your secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  You control your password. Keep it private.
                </span>
              </div>

              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('worker')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                      regRole === 'worker'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Worker</div>
                      <div className="text-[10px] opacity-75">Watch & Earn • Just 3.6 Dollars</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('advertiser')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                      regRole === 'advertiser'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Video className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Advertiser</div>
                      <div className="text-[10px] opacity-75">Promote Videos</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. HAMZA786"
                  value={regReferralCode}
                  onChange={(e) => setRegReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 uppercase"
                />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
                  Join in Just 3.6 Dollars (1,000 PKR) — Referral code gives 100 PKR discount (Pay 900 PKR)!
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join in Just 3.6 Dollars • Submit for Admin Approval</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Gmail or Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gmail or Mobile Phone Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Gmail or 03xxxxxxxxx"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Account</span>
              </button>
            </form>
          )}

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Test Profiles (Demo Sandbox):
            </div>
            <div className="space-y-1.5">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    loginAsUser(u.name, u.phone, u.role);
                    closeAuthModal();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition border text-left ${
                    currentUser.id === u.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px]">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{u.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 capitalize font-medium">
                          {u.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {u.email} • {u.phone}
                      </div>
                    </div>
                  </div>
                  <div>
                    {u.approvalStatus === 'approved' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        Approved
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                        Pending Admin
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
