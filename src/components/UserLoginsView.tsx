import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Users,
  Smartphone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  LogIn,
  Search,
  Wifi,
  Mail,
  Phone,
  Check,
  XCircle,
  UserCheck,
  ShieldAlert,
  UserPlus
} from 'lucide-react';

interface UserLoginsViewProps {
  modeTitle?: string;
  className?: string;
}

export const UserLoginsView: React.FC<UserLoginsViewProps> = ({
  modeTitle = 'User Logins & Account Approval Management',
  className = '',
}) => {
  const {
    userSessions,
    allUsers,
    viewHistory,
    approveUser,
    rejectUser,
    openAuthModal,
    currentUser,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'worker' | 'advertiser'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count pending approvals
  const pendingCount = allUsers.filter((u) => u.approvalStatus === 'pending_approval').length;

  // Filtered list of user sessions and users
  const filteredUsers = allUsers.filter((user) => {
    // Status / role filter
    if (statusFilter === 'pending' && user.approvalStatus !== 'pending_approval') return false;
    if (statusFilter === 'approved' && user.approvalStatus !== 'approved') return false;
    if (statusFilter === 'worker' && user.role !== 'worker') return false;
    if (statusFilter === 'advertiser' && user.role !== 'advertiser') return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`space-y-5 ${className}`}>
      
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              {modeTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Admin verification center. Every user must register with a valid <strong>Gmail</strong> and <strong>Pakistani Phone Number</strong>. Review incoming registrations and click <strong>Approve</strong> to authorize account access.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAuthModal}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Test Register / Login</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Total Registered Users</div>
          <div className="text-xl font-black text-white">{allUsers.length}</div>
          <div className="text-[10px] text-slate-500">Workers & Advertisers</div>
        </div>

        <div className="bg-slate-900 border border-amber-900/40 rounded-xl p-3.5 space-y-1 bg-amber-950/10">
          <div className="text-[11px] text-amber-400 font-semibold flex items-center justify-between">
            <span>Pending Admin Approval</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                Action
              </span>
            )}
          </div>
          <div className="text-xl font-black text-amber-400">{pendingCount} Accounts</div>
          <div className="text-[10px] text-slate-400">Awaiting your approval</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-emerald-400 font-medium">Active Logged Sessions</div>
          <div className="text-xl font-black text-emerald-400">{userSessions.length}</div>
          <div className="text-[10px] text-slate-500">Verified Pakistani IPs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-purple-400 font-medium">Approved Users</div>
          <div className="text-xl font-black text-purple-400">
            {allUsers.filter((u) => u.approvalStatus === 'approved').length}
          </div>
          <div className="text-[10px] text-slate-500">Unrestricted task access</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Accounts ({allUsers.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <span>Pending Approval</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/30 text-amber-200">
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved ({allUsers.filter((u) => u.approvalStatus === 'approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('worker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'worker'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Workers
          </button>
          <button
            onClick={() => setStatusFilter('advertiser')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'advertiser'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Advertisers
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Gmail, phone, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users / Logins Records Table & Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Registered Users & Login Audit Records</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified identity credentials (Gmail & Phone), device footprints, and approval actions.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Showing {filteredUsers.length} records
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching user records found for your current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User & Gmail Address</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Account Role</th>
                  <th className="py-3 px-4">Password Status</th>
                  <th className="py-3 px-4">Last Login / Device</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => {
                  const session = userSessions.find((s) => s.userId === user.id || s.userPhone === user.phone);
                  const isApproved = user.approvalStatus === 'approved';
                  const isPending = user.approvalStatus === 'pending_approval' || !user.approvalStatus;
                  const isRejected = user.approvalStatus === 'rejected';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-800/50 transition ${
                        isPending ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Name & Gmail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.id === currentUser.id && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="font-mono text-blue-400">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-slate-300">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Pakistan (+92)
                        </div>
                      </td>

                      {/* Account Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            user.role === 'worker'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : user.role === 'advertiser'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Password */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium">User Configured</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Private credentials
                        </div>
                      </td>

                      {/* Last Login / Session details */}
                      <td className="py-3.5 px-4">
                        {session ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] text-slate-300">
                              <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{session.device}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{session.location}</span>
                              <span>•</span>
                              <span>{session.loginTime}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500 text-[11px]">
                            {user.lastLoginAt || 'No recent session'}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold animate-pulse">
                            <Clock className="w-3 h-3" />
                            Pending Approval
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                            <XCircle className="w-3 h-3" />
                            Rejected / Blocked
                          </span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => approveUser(user.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
                              title="Approve this user account"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {isApproved && user.role !== 'admin' && (
                            <button
                              onClick={() => rejectUser(user.id)}
                              className="px-2.5 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs transition border border-slate-700"
                              title="Revoke / Suspend Account"
                            >
                              Suspend
                            </button>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => approveUser(user.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition"
                            >
                              Re-Approve
                            </button>
                          )}
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

    </div>
  );
};
