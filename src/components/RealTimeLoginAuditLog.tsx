import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LoginAuditRecord, UserRole } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Search,
  Filter,
  Users,
  Smartphone,
  MapPin,
  Wifi,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Download,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Lock,
  Eye,
  X,
  Radio,
  SlidersHorizontal,
  ChevronDown,
  UserCheck,
  Sparkles
} from 'lucide-react';

interface RealTimeLoginAuditLogProps {
  className?: string;
}

export const RealTimeLoginAuditLog: React.FC<RealTimeLoginAuditLogProps> = ({ className = '' }) => {
  const {
    currentUser,
    isAdminUnlocked,
    openPinModal,
    loginAuditLogs,
    addLoginAuditLog,
    allUsers,
    approveUser,
    rejectUser,
    showToast,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'success' | 'pending' | 'failed'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'worker' | 'advertiser' | 'admin'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '1h' | '24h' | '7d'>('all');
  const [autoRefreshActive, setAutoRefreshActive] = useState(true);
  const [selectedLogDetail, setSelectedLogDetail] = useState<LoginAuditRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(new Date().toLocaleTimeString());

  // Clock ticker for live time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Strict Admin Role Clearance Guard
  if (currentUser.role !== 'admin' || !isAdminUnlocked) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-rose-900/60 shadow-2xl text-center max-w-2xl mx-auto my-8 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 uppercase tracking-wider">
            Confidential Admin Clearance Required
          </span>
          <h3 className="text-xl font-black text-white mt-2">
            Restricted Access: Sensitive User Login Activity Log
          </h3>
          <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
            This activity log contains private user contact details (Gmail addresses, Pakistani mobile numbers, IP networks, and authentication telemetry). Viewing is strictly restricted to authorized platform administrators.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={openPinModal}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            Enter 4-Digit Security PIN to Authenticate
          </button>
        </div>
      </div>
    );
  }

  // Filtered Login Logs
  const filteredLogs = useMemo(() => {
    const now = Date.now();

    return loginAuditLogs.filter((log) => {
      // Role filter
      if (roleFilter !== 'all' && log.role !== roleFilter) return false;

      // Status filter
      if (statusFilter === 'online' && log.sessionStatus !== 'active_online') return false;
      if (statusFilter === 'success' && log.status !== 'success') return false;
      if (statusFilter === 'pending' && log.status !== 'blocked_pending_approval' && log.approvalStatus !== 'pending_approval') return false;
      if (statusFilter === 'failed' && log.status !== 'failed_credentials' && log.status !== 'suspended_account') return false;

      // Timeframe filter
      if (timeFilter === '1h' && now - log.timestamp > 3600000) return false;
      if (timeFilter === '24h' && now - log.timestamp > 3600000 * 24) return false;
      if (timeFilter === '7d' && now - log.timestamp > 3600000 * 24 * 7) return false;

      // Search query across name, email, phone, IP, city, device
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanPhone = log.userPhone.replace(/[-\s]/g, '');
        const match =
          log.userName.toLowerCase().includes(q) ||
          log.userEmail.toLowerCase().includes(q) ||
          cleanPhone.includes(q.replace(/[-\s]/g, '')) ||
          log.ipAddress.toLowerCase().includes(q) ||
          log.city.toLowerCase().includes(q) ||
          log.device.toLowerCase().includes(q) ||
          log.isp.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [loginAuditLogs, roleFilter, statusFilter, timeFilter, searchQuery]);

  // Statistics counters
  const totalEvents = loginAuditLogs.length;
  const activeOnlineCount = loginAuditLogs.filter((l) => l.sessionStatus === 'active_online').length;
  const pendingApprovalsCount = allUsers.filter((u) => u.approvalStatus === 'pending_approval').length;
  const failedOrBlockedCount = loginAuditLogs.filter(
    (l) => l.status === 'failed_credentials' || l.status === 'suspended_account' || l.status === 'blocked_pending_approval'
  ).length;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    showToast(`Copied ${label}: ${text}`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const clean = phone.replace(/[-\s]/g, '');
    const intlNumber = clean.startsWith('0') ? '92' + clean.slice(1) : clean.startsWith('+92') ? clean.slice(1) : clean;
    const msg = encodeURIComponent(`Hello ${name}, this is Sabir Hussain from WatchNEarn Pakistan Admin Support regarding your login.`);
    return `https://wa.me/${intlNumber}?text=${msg}`;
  };

  const handleExportCsv = () => {
    const headers = [
      'Log ID',
      'Timestamp (Formatted)',
      'Relative Time',
      'User ID',
      'Full Name',
      'Role',
      'Gmail Address',
      'Phone Number',
      'IP Address',
      'ISP Provider',
      'City & Region',
      'Device Model',
      'Auth Status',
      'Session Status',
      'Approval Status',
      'Notes'
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.timeFormatted}"`,
      `"${log.relativeTime}"`,
      `"${log.userId}"`,
      `"${log.userName}"`,
      `"${log.role.toUpperCase()}"`,
      `"${log.userEmail}"`,
      `"${log.userPhone}"`,
      `"${log.ipAddress}"`,
      `"${log.isp}"`,
      `"${log.city}"`,
      `"${log.device}"`,
      `"${log.status}"`,
      `"${log.sessionStatus}"`,
      `"${log.approvalStatus}"`,
      `"${log.loginNotes || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `watchnearn-login-audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredLogs.length} real-time login audit records to CSV!`, 'success');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `watchnearn-login-audit-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Real-time login audit log exported as JSON!', 'success');
  };

  // Simulate an incoming live worker login event for testing real-time ingestion
  const handleSimulateLiveLogin = () => {
    const sampleWorkers = [
      { name: 'Kamran Akram', email: 'kamran.akram88@gmail.com', phone: '0302-7711223', city: 'Sialkot, Punjab', device: 'Oppo A78 (Android 14)', isp: 'Nayatel Fiber' },
      { name: 'Sanaullah Khan', email: 'sanaullah.khan99@gmail.com', phone: '0331-5544332', city: 'Peshawar, KPK', device: 'Vivo V29e', isp: 'Zong 4G' },
      { name: 'Noman Tariq', email: 'noman.tariq.pk@gmail.com', phone: '0315-9988771', city: 'Gujranwala, Punjab', device: 'Redmi 12C', isp: 'Jazz 4G' },
    ];
    const chosen = sampleWorkers[Math.floor(Math.random() * sampleWorkers.length)];

    addLoginAuditLog({
      userId: `user_sim_${Date.now()}`,
      userName: chosen.name,
      userEmail: chosen.email,
      userPhone: chosen.phone,
      role: 'worker',
      device: chosen.device,
      browser: 'Chrome Mobile 128',
      ipAddress: `39.40.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
      isp: chosen.isp,
      city: chosen.city,
      status: 'success',
      authMethod: 'Gmail & Password',
      sessionStatus: 'active_online',
      approvalStatus: 'approved',
      loginNotes: 'Real-time test session ingested successfully via automated test trigger.',
    });

    showToast(`Live login event captured for ${chosen.name}!`, 'success');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Real-Time Live Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-900/60 p-5 md:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Real-Time Stream Active</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Eyes Only • Strictly Confidential
              </span>

              <span className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800">
                Local Time: {currentTimeStr}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              <span>Real-Time User Login Activity & Security Audit Log</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time monitoring console tracking every incoming user authentication attempt across Pakistani networks. Full transparency into verified <strong>Gmail addresses</strong>, <strong>11-digit mobile numbers</strong>, hardware footprints, and IP geolocation to safeguard platform integrity.
            </p>
          </div>

          {/* Quick Header Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulateLiveLogin}
              className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Simulate an incoming worker login event in real-time"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate Live Event</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Download sensitive login audit records as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Download audit records as JSON"
            >
              <span>Export JSON</span>
            </button>
          </div>

        </div>
      </div>

      {/* KPI Real-Time Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Total Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-md">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Total Login Events</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalEvents}</div>
          <div className="text-[11px] text-slate-500">Across all roles & networks</div>
        </div>

        {/* Active Online Users */}
        <div className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-4 space-y-1 shadow-md bg-emerald-950/10">
          <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Active Online Now</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeOnlineCount} Users</div>
          <div className="text-[11px] text-slate-400">Live active Pakistani sessions</div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-slate-900 border border-amber-900/40 rounded-2xl p-4 space-y-1 shadow-md bg-amber-950/10">
          <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingApprovalsCount} Accounts</div>
          <div className="text-[11px] text-slate-400">Requires manual Admin clearance</div>
        </div>

        {/* Flagged / Blocked */}
        <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-4 space-y-1 shadow-md bg-rose-950/10">
          <div className="text-[11px] text-rose-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Blocked / Flagged</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{failedOrBlockedCount} Events</div>
          <div className="text-[11px] text-slate-400">Suspended or wrong credentials</div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by User Name, Gmail, Phone (e.g. 0304), IP, City, or Device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Time:</span>
            {(['all', '1h', '24h', '7d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  timeFilter === t
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Time' : t === '1h' ? 'Past 1H' : t === '24h' ? 'Past 24H' : 'Past 7D'}
              </button>
            ))}
          </div>

        </div>

        {/* Status & Role Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1 font-medium">Status:</span>
            
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Events ({loginAuditLogs.length})
            </button>

            <button
              onClick={() => setStatusFilter('online')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'online'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Active Online ({activeOnlineCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('success')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                statusFilter === 'success'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Successful
            </button>

            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300'
              }`}
            >
              <span>Pending Clearance</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/20">
                {pendingApprovalsCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                statusFilter === 'failed'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-rose-400 hover:text-rose-300'
              }`}
            >
              Flagged / Blocked
            </button>
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1 font-medium">Role:</span>
            {(['all', 'worker', 'advertiser', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition capitalize ${
                  roleFilter === r
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Main Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Real-Time User Login Stream & Identity Verification Log</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every record captures live timestamps, Gmail addresses, and Pakistani mobile numbers for admin transparency.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Showing {filteredLogs.length} of {totalEvents} logs</span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-slate-300 font-bold text-sm">No login events matched your filters</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, role filters, or timeframe options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Timestamp & Age</th>
                  <th className="py-3.5 px-4 font-semibold">User Identity & Role</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Details (Gmail & Phone)</th>
                  <th className="py-3.5 px-4 font-semibold">Device & Network Location</th>
                  <th className="py-3.5 px-4 font-semibold">Authentication Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map((log) => {
                  const isOnline = log.sessionStatus === 'active_online';
                  const isApproved = log.approvalStatus === 'approved';
                  const isPending = log.approvalStatus === 'pending_approval';
                  const isSuspended = log.approvalStatus === 'rejected';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-850/60 transition group cursor-pointer"
                      onClick={() => setSelectedLogDetail(log)}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-white">
                            {log.timeFormatted.split(',')[1] || log.timeFormatted}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {log.timeFormatted.split(',')[0]}
                        </div>
                        <div className="mt-1">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <span>{log.relativeTime}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{log.relativeTime}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* User & Role */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            log.role === 'admin'
                              ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                              : log.role === 'advertiser'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {log.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{log.userName}</span>
                              {log.role === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-black border border-purple-500/30">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                                log.role === 'worker'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : log.role === 'advertiser'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-purple-500/10 text-purple-300'
                              }`}>
                                {log.role}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">{log.userId}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details (Gmail & Pakistani Phone) */}
                      <td className="py-3.5 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          
                          {/* Gmail */}
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-white font-mono text-[11px]">{log.userEmail}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(log.userEmail, 'Gmail')}
                              className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition"
                              title="Copy Gmail Address"
                            >
                              {copiedKey === log.userEmail ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Pakistani Phone */}
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-slate-200 font-mono text-[11px] font-semibold">{log.userPhone}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(log.userPhone, 'Phone')}
                              className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition"
                              title="Copy Phone Number"
                            >
                              {copiedKey === log.userPhone ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>

                            {/* WhatsApp Verification Shortcut */}
                            <a
                              href={getWhatsAppLink(log.userPhone, log.userName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 transition ml-1"
                              title="Message user on WhatsApp for identity verification"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-400" />
                              <span>WhatsApp</span>
                            </a>
                          </div>

                        </div>
                      </td>

                      {/* Device & Network Location */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                            <Smartphone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{log.device}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Wifi className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="font-mono">{log.ipAddress}</span>
                            <span className="text-slate-500">•</span>
                            <span>{log.isp}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>{log.city}</span>
                          </div>
                        </div>
                      </td>

                      {/* Authentication Status */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="space-y-1">
                          {log.status === 'success' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Authenticated</span>
                            </span>
                          ) : log.status === 'blocked_pending_approval' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Clearance</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{log.status === 'suspended_account' ? 'Suspended' : 'Failed Attempt'}</span>
                            </span>
                          )}

                          <div className="text-[10px] text-slate-400">
                            Via: {log.authMethod}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => approveUser(log.userId)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition shadow-sm cursor-pointer"
                              title="Approve user for earning and login"
                            >
                              Approve
                            </button>
                          )}

                          {isApproved && log.role !== 'admin' && (
                            <button
                              onClick={() => rejectUser(log.userId)}
                              className="px-2 py-1 bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 font-semibold rounded-lg text-xs transition cursor-pointer"
                              title="Suspend this user's account"
                            >
                              Suspend
                            </button>
                          )}

                          {isSuspended && (
                            <button
                              onClick={() => approveUser(log.userId)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                              Reinstate
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedLogDetail(log)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Inspect full login record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Detail Modal for Selected Event */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-purple-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Login Audit Record Telemetry</h4>
                  <div className="text-xs text-slate-400 font-mono">ID: {selectedLogDetail.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Pill */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">User</span>
                <div className="font-bold text-white text-sm">{selectedLogDetail.userName}</div>
                <div className="text-slate-400 capitalize">{selectedLogDetail.role} Mode</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Status</span>
                <div className="font-bold text-emerald-400 capitalize">{selectedLogDetail.status.replace('_', ' ')}</div>
                <div className="text-slate-400">{selectedLogDetail.sessionStatus.replace('_', ' ')}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Event Time</span>
                <div className="font-bold text-white font-mono">{selectedLogDetail.timeFormatted}</div>
                <div className="text-slate-400">{selectedLogDetail.relativeTime}</div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="font-bold text-white text-sm flex items-center justify-between">
                <span>Verified User Contact Credentials</span>
                <span className="text-[10px] font-mono text-purple-400">Strictly Confidential</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Registered Gmail:</div>
                  <div className="font-mono text-white font-bold select-all mt-0.5">{selectedLogDetail.userEmail}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Pakistani Mobile Number:</div>
                  <div className="font-mono text-emerald-400 font-bold select-all mt-0.5">{selectedLogDetail.userPhone}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={getWhatsAppLink(selectedLogDetail.userPhone, selectedLogDetail.userName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reach on WhatsApp</span>
                </a>
                <button
                  onClick={() => copyToClipboard(`${selectedLogDetail.userName} | ${selectedLogDetail.userEmail} | ${selectedLogDetail.userPhone}`, 'Contact')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Hardware & Network Forensics */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white">Network & Device Telemetry</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div><span className="text-slate-500">Device:</span> {selectedLogDetail.device}</div>
                <div><span className="text-slate-500">Browser:</span> {selectedLogDetail.browser}</div>
                <div><span className="text-slate-500">IP Address:</span> <span className="font-mono text-white">{selectedLogDetail.ipAddress}</span></div>
                <div><span className="text-slate-500">ISP Provider:</span> {selectedLogDetail.isp}</div>
                <div><span className="text-slate-500">City / Province:</span> {selectedLogDetail.city}</div>
                <div><span className="text-slate-500">Auth Method:</span> {selectedLogDetail.authMethod}</div>
              </div>
              {selectedLogDetail.loginNotes && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 mt-2">
                  <span className="font-bold text-purple-300">Admin Audit Note:</span> {selectedLogDetail.loginNotes}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {selectedLogDetail.approvalStatus === 'pending_approval' && (
                <button
                  onClick={() => {
                    approveUser(selectedLogDetail.userId);
                    setSelectedLogDetail(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Approve Account
                </button>
              )}
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Telemetry
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
