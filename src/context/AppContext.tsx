import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ADMIN_SECURITY_PIN,
  AppTheme,
  DepositRequest,
  LoginAuditRecord,
  PaymentGateway,
  PLATFORM_CONFIG,
  ReferralRecord,
  UserProfile,
  UserRole,
  UserSession,
  VideoCampaign,
  ViewHistoryRecord,
  WatchDuration,
  WithdrawalRequest,
} from '../types';
import { sounds } from '../utils/audio';
import { parseVideoUrl } from '../utils/video';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUserRole: (role: UserRole) => void;
  campaigns: VideoCampaign[];
  createCampaign: (data: {
    title: string;
    channelName: string;
    category: VideoCampaign['category'];
    videoUrl: string;
    targetWatchSeconds: WatchDuration;
    totalTargetViews: number;
  }) => { success: boolean; error?: string };
  toggleCampaignStatus: (campaignId: string) => void;
  deleteCampaign: (campaignId: string) => void;

  deposits: DepositRequest[];
  submitDeposit: (data: {
    gateway: PaymentGateway;
    accountTitle: string;
    senderNumber: string;
    transactionId: string;
    amountPKR: number;
    screenshotUrl?: string;
    depositType?: 'campaign_budget' | 'worker_activation';
    customNote?: string;
  }) => { success: boolean; error?: string };
  approveDeposit: (depositId: string) => void;
  rejectDeposit: (depositId: string, notes: string) => void;

  // Worker Activation Fee Functions
  submitWorkerActivation: (data: {
    gateway: PaymentGateway;
    senderName: string;
    senderNumber: string;
    transactionId: string;
    amountPKR: number;
    referralCode?: string;
  }) => { success: boolean; error?: string };
  approveWorkerActivation: (depositId: string) => void;
  activateWorkerAccount: (userId: string) => void;

  withdrawals: WithdrawalRequest[];
  submitWithdrawal: (data: {
    gateway: PaymentGateway;
    accountTitle: string;
    mobileNumber: string;
    amountPKR: number;
  }) => { success: boolean; error?: string };
  approveWithdrawal: (withdrawalId: string) => void;
  rejectWithdrawal: (withdrawalId: string, notes: string) => void;

  viewHistory: ViewHistoryRecord[];
  recordVideoWatch: (
    campaignId: string,
    watchedSeconds?: number,
    isFullyWatched?: boolean
  ) => { success: boolean; rewardPKR: number; error?: string };
  logPartialWatch: (campaignId: string, watchedSeconds: number) => void;
  hasWatchedToday: (campaignId: string) => boolean;

  // User Authentication & Approval Records (Admin Controlled)
  userSessions: UserSession[];
  loginAuditLogs: LoginAuditRecord[];
  addLoginAuditLog: (
    record: Omit<LoginAuditRecord, 'id' | 'timestamp' | 'timeFormatted' | 'relativeTime'>
  ) => void;
  clearLoginAuditLogs: () => void;
  loginAsUser: (name: string, phone: string, role: UserRole) => void;
  registerUser: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    referralCode?: string;
  }) => { success: boolean; message: string; user?: UserProfile };
  loginUser: (
    emailOrPhone: string,
    password?: string
  ) => { success: boolean; message: string; user?: UserProfile };
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;

  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;

  // Theme
  currentTheme: AppTheme;
  switchTheme: (theme: AppTheme) => void;

  // Admin PIN Protection (7467)
  isAdminUnlocked: boolean;
  isPinModalOpen: boolean;
  openPinModal: () => void;
  closePinModal: () => void;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;

  // Referrals
  referrals: ReferralRecord[];
  applyReferralCode: (code: string) => { success: boolean; bonusPKR?: number; error?: string };
  isReferralModalOpen: boolean;
  openReferralModal: () => void;
  closeReferralModal: () => void;

  resetDemoData: () => void;
  activeVideoModal: VideoCampaign | null;
  openVideoModal: (campaign: VideoCampaign) => void;
  closeVideoModal: () => void;

  isWithdrawModalOpen: boolean;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;

  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const STORAGE_KEY = 'watchnearn_state_v1';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_worker_1',
    name: 'Hamza Tariq',
    email: 'hamza.worker786@gmail.com',
    phone: '03045892113',
    password: 'password123',
    role: 'worker',
    approvalStatus: 'approved',
    registeredAt: '2026-06-12 14:30',
    lastLoginAt: '8 mins ago',
    walletBalancePKR: 440.00,
    depositBalancePKR: 0,
    totalEarnedPKR: 1940.00,
    totalWithdrawnPKR: 1500.00,
    totalTasksCompleted: 68,
    joinedDate: '2026-06-12',
    referralCode: 'HAMZA786',
    referralBonusPKR: 400.00,
    referralEarningsPKR: 174.00,
    totalReferralsCount: 4,
    isActivated: true,
    activationStatus: 'activated',
    activationPaidPKR: 1000,
  },
  {
    id: 'user_worker_2',
    name: 'Ali Abbas',
    email: 'ali.abbas99@gmail.com',
    phone: '03084491028',
    password: 'password123',
    role: 'worker',
    approvalStatus: 'pending_approval',
    registeredAt: '2026-09-20 18:20',
    lastLoginAt: '2 mins ago',
    walletBalancePKR: 150.00,
    depositBalancePKR: 0,
    totalEarnedPKR: 150.00,
    totalWithdrawnPKR: 0,
    totalTasksCompleted: 5,
    joinedDate: '2026-09-20',
    referralCode: 'ALI786',
    referredBy: 'HAMZA786',
    referralBonusPKR: 50.00,
    referralEarningsPKR: 0,
    totalReferralsCount: 0,
    isActivated: false,
    activationStatus: 'pending_verification',
    activationTid: 'JC9182374619',
    activationGateway: 'jazzcash',
    activationPaidPKR: 900,
  },
  {
    id: 'user_worker_3',
    name: 'Ayesha Bibi',
    email: 'ayesha.bibi.pk@gmail.com',
    phone: '03125549012',
    password: 'password123',
    role: 'worker',
    approvalStatus: 'approved',
    registeredAt: '2026-08-14 11:20',
    lastLoginAt: '1 hour ago',
    walletBalancePKR: 520.00,
    depositBalancePKR: 0,
    totalEarnedPKR: 1220.00,
    totalWithdrawnPKR: 700.00,
    totalTasksCompleted: 42,
    joinedDate: '2026-08-14',
    referralCode: 'AYESHA99',
    referralBonusPKR: 100.00,
    referralEarningsPKR: 65.00,
    totalReferralsCount: 1,
    isActivated: true,
    activationStatus: 'activated',
    activationPaidPKR: 1000,
  },
  {
    id: 'user_worker_4',
    name: 'Bilal Shah',
    email: 'bilal.shah92@gmail.com',
    phone: '03339182341',
    password: 'password123',
    role: 'worker',
    approvalStatus: 'pending_approval',
    registeredAt: '2026-09-22 09:45',
    lastLoginAt: '20 mins ago',
    walletBalancePKR: 0,
    depositBalancePKR: 0,
    totalEarnedPKR: 0,
    totalWithdrawnPKR: 0,
    totalTasksCompleted: 0,
    joinedDate: '2026-09-22',
    referralCode: 'BILAL77',
    referralBonusPKR: 0,
    referralEarningsPKR: 0,
    totalReferralsCount: 0,
    isActivated: false,
    activationStatus: 'pending_verification',
    activationTid: 'EP7712398401',
    activationGateway: 'easypaisa',
    activationPaidPKR: 900,
  },
  {
    id: 'user_worker_5',
    name: 'Fatima Noor',
    email: 'fatima.noor.pk@gmail.com',
    phone: '03456789123',
    password: 'password123',
    role: 'worker',
    approvalStatus: 'approved',
    registeredAt: '2026-09-01 13:10',
    lastLoginAt: '3 hours ago',
    walletBalancePKR: 280.00,
    depositBalancePKR: 0,
    totalEarnedPKR: 280.00,
    totalWithdrawnPKR: 0,
    totalTasksCompleted: 14,
    joinedDate: '2026-09-01',
    referralCode: 'FATIMA55',
    referredBy: 'HAMZA786',
    referralBonusPKR: 50.00,
    referralEarningsPKR: 0,
    totalReferralsCount: 0,
    isActivated: true,
    activationStatus: 'activated',
    activationPaidPKR: 1000,
  },
  {
    id: 'user_worker_6',
    name: 'Kashif Mehmood',
    email: 'kashif.mehmood@gmail.com',
    phone: '03017765432',
    password: 'password123',
    role: 'worker',
    approvalStatus: 'rejected',
    registeredAt: '2026-07-04 15:40',
    lastLoginAt: '5 days ago',
    walletBalancePKR: 45.00,
    depositBalancePKR: 0,
    totalEarnedPKR: 45.00,
    totalWithdrawnPKR: 0,
    totalTasksCompleted: 2,
    joinedDate: '2026-07-04',
    referralCode: 'KASHIF21',
    referralBonusPKR: 0,
    referralEarningsPKR: 0,
    totalReferralsCount: 0,
    isActivated: false,
    activationStatus: 'unpaid',
  },
  {
    id: 'user_advertiser_1',
    name: 'Zubair Media Agency',
    email: 'zubair.media.pk@gmail.com',
    phone: '03214920481',
    password: 'password123',
    role: 'advertiser',
    approvalStatus: 'approved',
    registeredAt: '2026-05-18 10:15',
    lastLoginAt: '14 mins ago',
    walletBalancePKR: 0,
    depositBalancePKR: 4850.00,
    totalEarnedPKR: 0,
    totalWithdrawnPKR: 0,
    totalTasksCompleted: 0,
    joinedDate: '2026-05-18',
    referralCode: 'ZUBAIR99',
    referralBonusPKR: 0,
    referralEarningsPKR: 0,
    totalReferralsCount: 0,
    isActivated: true,
    activationStatus: 'activated',
  },
  {
    id: 'user_advertiser_2',
    name: 'Usman Farooq Digital',
    email: 'usman.brands.pk@gmail.com',
    phone: '03008472911',
    password: 'password123',
    role: 'advertiser',
    approvalStatus: 'approved',
    registeredAt: '2026-07-29 16:05',
    lastLoginAt: 'Yesterday',
    walletBalancePKR: 0,
    depositBalancePKR: 2500.00,
    totalEarnedPKR: 0,
    totalWithdrawnPKR: 0,
    totalTasksCompleted: 0,
    joinedDate: '2026-07-29',
    referralCode: 'USMANPK',
    referralBonusPKR: 0,
    referralEarningsPKR: 0,
    totalReferralsCount: 0,
    isActivated: true,
    activationStatus: 'activated',
  },
  {
    id: 'user_admin_1',
    name: 'Sabir Hussain (Master Admin)',
    email: 'sabir.hussain@watchnearn.pk',
    phone: '03264022010',
    password: 'password123',
    role: 'admin',
    approvalStatus: 'approved',
    registeredAt: '2026-01-01 00:00',
    lastLoginAt: 'Just now',
    walletBalancePKR: 0,
    depositBalancePKR: 0,
    totalEarnedPKR: 0,
    totalWithdrawnPKR: 0,
    totalTasksCompleted: 0,
    joinedDate: '2026-01-01',
    referralCode: 'SABIRPK',
    referralBonusPKR: 0,
    referralEarningsPKR: 0,
    totalReferralsCount: 0,
    isActivated: true,
    activationStatus: 'activated',
  },
];

const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'sess_1',
    userId: 'user_worker_2',
    userName: 'Ali Abbas',
    userEmail: 'ali.abbas99@gmail.com',
    userPhone: '03084491028',
    role: 'worker',
    approvalStatus: 'pending_approval',
    device: 'Samsung Galaxy A32 (Android 14)',
    location: 'Lahore, Punjab',
    ip: '39.40.182.44 (Jazz 4G)',
    loginTime: '2 mins ago',
    status: 'online',
  },
  {
    id: 'sess_2',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userEmail: 'hamza.worker786@gmail.com',
    userPhone: '03045892113',
    role: 'worker',
    approvalStatus: 'approved',
    device: 'Xiaomi Redmi Note 13',
    location: 'Faisalabad, Punjab',
    ip: '119.160.67.12 (Nayatel Fiber)',
    loginTime: '8 mins ago',
    status: 'online',
  },
  {
    id: 'sess_3',
    userId: 'user_advertiser_1',
    userName: 'Zubair Media Agency',
    userEmail: 'zubair.media.pk@gmail.com',
    userPhone: '03214920481',
    role: 'advertiser',
    approvalStatus: 'approved',
    device: 'Chrome Windows 11 (Desktop)',
    location: 'Karachi, Sindh',
    ip: '182.180.91.200 (PTCL Flash Fiber)',
    loginTime: '14 mins ago',
    status: 'online',
  },
  {
    id: 'sess_4',
    userId: 'user_worker_3',
    userName: 'Fatima Batool',
    userEmail: 'fatima.batool91@gmail.com',
    userPhone: '03337821903',
    role: 'worker',
    approvalStatus: 'approved',
    device: 'Infinix Hot 40 Pro',
    location: 'Rawalpindi, Punjab',
    ip: '103.255.4.18 (Zong 4G)',
    loginTime: '25 mins ago',
    status: 'online',
  },
  {
    id: 'sess_5',
    userId: 'user_worker_4',
    userName: 'Usman Ghani',
    userEmail: 'usman.ghani.pk@gmail.com',
    userPhone: '03129876543',
    role: 'worker',
    approvalStatus: 'approved',
    device: 'Vivo Y21T',
    location: 'Multan, Punjab',
    ip: '115.186.134.50 (Telenor 4G)',
    loginTime: '40 mins ago',
    status: 'active_5m_ago',
  },
  {
    id: 'sess_6',
    userId: 'user_advertiser_2',
    userName: 'Hafeez Center Tech PC',
    userEmail: 'hafeez.tech.store@gmail.com',
    userPhone: '03008812349',
    role: 'advertiser',
    approvalStatus: 'approved',
    device: 'MacBook Pro (macOS Sequoia)',
    location: 'Lahore, Punjab',
    ip: '39.50.21.89 (StormFiber)',
    loginTime: '1 hour ago',
    status: 'active_5m_ago',
  },
];

const INITIAL_LOGIN_AUDIT_LOGS: LoginAuditRecord[] = [
  {
    id: 'log_audit_1',
    userId: 'user_admin_1',
    userName: 'Sabir Hussain (Master Admin)',
    userEmail: 'aaminhousing786@gmail.com',
    userPhone: '0300-8657467',
    role: 'admin',
    timestamp: Date.now() - 1000 * 60 * 2, // 2 mins ago
    timeFormatted: '23 Sep 2026, 02:42:15 PM',
    relativeTime: '2m ago',
    device: 'Desktop Browser (Windows 11)',
    browser: 'Chrome 128 / Windows',
    ipAddress: '39.50.21.89',
    isp: 'StormFiber Gigabit',
    city: 'Lahore, Punjab',
    status: 'success',
    authMethod: 'Gmail & Password',
    sessionStatus: 'active_online',
    approvalStatus: 'approved',
    loginNotes: 'Master Super Administrator logged in with verified 4-digit PIN clearance (7467).',
  },
  {
    id: 'log_audit_2',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userEmail: 'hamza.worker786@gmail.com',
    userPhone: '0304-5892113',
    role: 'worker',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
    timeFormatted: '23 Sep 2026, 02:39:10 PM',
    relativeTime: '5m ago',
    device: 'Xiaomi Redmi Note 13 (Android 14)',
    browser: 'Chrome Mobile 128',
    ipAddress: '119.160.67.12',
    isp: 'Nayatel Fiber',
    city: 'Faisalabad, Punjab',
    status: 'success',
    authMethod: 'Phone & Password',
    sessionStatus: 'active_online',
    approvalStatus: 'approved',
    loginNotes: 'Active video watching session in progress. Account fully approved.',
  },
  {
    id: 'log_audit_3',
    userId: 'user_worker_2',
    userName: 'Ali Abbas',
    userEmail: 'ali.abbas99@gmail.com',
    userPhone: '0308-4491028',
    role: 'worker',
    timestamp: Date.now() - 1000 * 60 * 12, // 12 mins ago
    timeFormatted: '23 Sep 2026, 02:32:00 PM',
    relativeTime: '12m ago',
    device: 'Samsung Galaxy A32 (Android 14)',
    browser: 'Chrome Mobile 127',
    ipAddress: '39.40.182.44',
    isp: 'Jazz 4G LTE',
    city: 'Lahore, Punjab',
    status: 'blocked_pending_approval',
    authMethod: 'Gmail & Password',
    sessionStatus: 'active_online',
    approvalStatus: 'pending_approval',
    loginNotes: 'Account registration logged. Restricted access mode until Admin approves account.',
  },
  {
    id: 'log_audit_4',
    userId: 'user_advertiser_1',
    userName: 'Zubair Media Agency',
    userEmail: 'zubair.media.pk@gmail.com',
    userPhone: '0321-4920481',
    role: 'advertiser',
    timestamp: Date.now() - 1000 * 60 * 25, // 25 mins ago
    timeFormatted: '23 Sep 2026, 02:19:40 PM',
    relativeTime: '25m ago',
    device: 'MacBook Pro (macOS 15)',
    browser: 'Safari 18.0',
    ipAddress: '182.180.91.200',
    isp: 'PTCL Flash Fiber',
    city: 'Karachi, Sindh',
    status: 'success',
    authMethod: 'Gmail & Password',
    sessionStatus: 'active_online',
    approvalStatus: 'approved',
    loginNotes: 'Advertiser dashboard accessed for creating YouTube promotional campaigns.',
  },
  {
    id: 'log_audit_5',
    userId: 'user_worker_3',
    userName: 'Fatima Batool',
    userEmail: 'fatima.batool91@gmail.com',
    userPhone: '0333-7821903',
    role: 'worker',
    timestamp: Date.now() - 1000 * 60 * 42, // 42 mins ago
    timeFormatted: '23 Sep 2026, 02:02:18 PM',
    relativeTime: '42m ago',
    device: 'Infinix Hot 40 Pro (Android 13)',
    browser: 'Chrome Mobile 128',
    ipAddress: '103.255.4.18',
    isp: 'Zong 4G High-Speed',
    city: 'Rawalpindi, Punjab',
    status: 'success',
    authMethod: 'Phone & Password',
    sessionStatus: 'idle',
    approvalStatus: 'approved',
    loginNotes: 'Completed 3 tasks today. Currently idle.',
  },
  {
    id: 'log_audit_6',
    userId: 'user_worker_4',
    userName: 'Bilal Shah',
    userEmail: 'bilal.shah92@gmail.com',
    userPhone: '0333-9182341',
    role: 'worker',
    timestamp: Date.now() - 1000 * 60 * 68, // 1h 8m ago
    timeFormatted: '23 Sep 2026, 01:36:50 PM',
    relativeTime: '1h ago',
    device: 'Vivo Y21 (Android 12)',
    browser: 'Vivo Browser / Android',
    ipAddress: '175.107.12.8',
    isp: 'Zong 4G',
    city: 'Peshawar, KPK',
    status: 'blocked_pending_approval',
    authMethod: 'Gmail & Password',
    sessionStatus: 'idle',
    approvalStatus: 'pending_approval',
    loginNotes: 'Pending verification of JazzCash worker activation fee (TID: EP7712398401).',
  },
  {
    id: 'log_audit_7',
    userId: 'user_worker_5',
    userName: 'Usman Ghani',
    userEmail: 'usman.ghani.pk@gmail.com',
    userPhone: '0312-9876543',
    role: 'worker',
    timestamp: Date.now() - 1000 * 60 * 120, // 2h ago
    timeFormatted: '23 Sep 2026, 12:44:11 PM',
    relativeTime: '2h ago',
    device: 'Vivo Y21T (Android 13)',
    browser: 'Chrome Mobile 126',
    ipAddress: '115.186.134.50',
    isp: 'Telenor 4G',
    city: 'Multan, Punjab',
    status: 'success',
    authMethod: 'Gmail & Password',
    sessionStatus: 'logged_out',
    approvalStatus: 'approved',
    loginNotes: 'Requested withdrawal of 1,500 PKR via JazzCash.',
  },
  {
    id: 'log_audit_8',
    userId: 'user_advertiser_2',
    userName: 'Hafeez Center Tech PC',
    userEmail: 'hafeez.tech.store@gmail.com',
    userPhone: '0300-8812349',
    role: 'advertiser',
    timestamp: Date.now() - 1000 * 60 * 190, // ~3h ago
    timeFormatted: '23 Sep 2026, 11:34:02 AM',
    relativeTime: '3h ago',
    device: 'HP Spectre x360 (Windows 11)',
    browser: 'Edge 128 / Windows',
    ipAddress: '39.50.21.89',
    isp: 'StormFiber',
    city: 'Lahore, Punjab',
    status: 'success',
    authMethod: 'Gmail & Password',
    sessionStatus: 'logged_out',
    approvalStatus: 'approved',
    loginNotes: 'Submitted manual deposit of 2,500 PKR for budget top-up.',
  },
  {
    id: 'log_audit_9',
    userId: 'user_unknown_99',
    userName: 'Unrecognized Attempt',
    userEmail: 'unknown.suspicious99@gmail.com',
    userPhone: '0301-9988776',
    role: 'worker',
    timestamp: Date.now() - 1000 * 60 * 240, // 4h ago
    timeFormatted: '23 Sep 2026, 10:44:10 AM',
    relativeTime: '4h ago',
    device: 'Linux / Automated Emulation',
    browser: 'HeadlessChrome 125',
    ipAddress: '202.163.112.5',
    isp: 'PTCL Quetta Broadband',
    city: 'Quetta, Balochistan',
    status: 'failed_credentials',
    authMethod: 'Gmail & Password',
    sessionStatus: 'logged_out',
    approvalStatus: 'rejected',
    loginNotes: 'Flagged by system: 3 consecutive invalid password attempts from unrecognized network.',
  },
];

const INITIAL_REFERRALS: ReferralRecord[] = [
  {
    id: 'ref_1',
    referrerId: 'user_worker_1',
    friendName: 'Ali Raza (Lahore)',
    friendPhone: '0301-4455667',
    joinedDate: '2026-08-14',
    status: 'active_earner',
    bonusPKR: 100,
    commissionEarnedPKR: 85.50,
    tasksCompleted: 42,
  },
  {
    id: 'ref_2',
    referrerId: 'user_worker_1',
    friendName: 'Usman Ghani (Karachi)',
    friendPhone: '0312-9876543',
    joinedDate: '2026-08-28',
    status: 'active_earner',
    bonusPKR: 100,
    commissionEarnedPKR: 56.50,
    tasksCompleted: 28,
  },
  {
    id: 'ref_3',
    referrerId: 'user_worker_1',
    friendName: 'Saima Noor (Faisalabad)',
    friendPhone: '0333-2233445',
    joinedDate: '2026-09-05',
    status: 'registered',
    bonusPKR: 100,
    commissionEarnedPKR: 0,
    tasksCompleted: 0,
  },
  {
    id: 'ref_4',
    referrerId: 'user_worker_1',
    friendName: 'Kamran Siddiqui (Rawalpindi)',
    friendPhone: '0345-6677889',
    joinedDate: '2026-09-12',
    status: 'active_earner',
    bonusPKR: 100,
    commissionEarnedPKR: 32.00,
    tasksCompleted: 16,
  },
];

const INITIAL_CAMPAIGNS: VideoCampaign[] = [
  {
    id: 'camp_1',
    creatorId: 'user_advertiser_1',
    creatorName: 'CodeWithUrdu',
    title: 'How to Learn Python & AI in Urdu (2026 Complete Roadmap)',
    channelName: 'Urdu Tech Academy',
    category: 'Education',
    videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kqtD5dpn9C8?autoplay=1&mute=0&controls=1&rel=0&playsinline=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    platform: 'youtube',
    targetWatchSeconds: 60,
    totalTargetViews: 500,
    viewsDelivered: 348,
    rewardPerViewPKR: 3.00,
    costPerViewPKR: 4.50,
    totalCostPKR: 2250.00,
    remainingBudgetPKR: 684.00,
    status: 'active',
    createdAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'camp_2',
    creatorId: 'user_advertiser_1',
    creatorName: 'Karachi Food Diaries',
    title: 'Original Burns Road Beef Nihari Secret Recipe (Full Review)',
    channelName: 'Flavor Pakistan',
    category: 'Lifestyle',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&controls=1&rel=0&playsinline=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    platform: 'youtube',
    targetWatchSeconds: 30,
    totalTargetViews: 1000,
    viewsDelivered: 890,
    rewardPerViewPKR: 1.50,
    costPerViewPKR: 2.25,
    totalCostPKR: 2250.00,
    remainingBudgetPKR: 247.50,
    status: 'active',
    createdAt: '2026-09-19T14:30:00Z',
  },
  {
    id: 'camp_3',
    creatorId: 'user_advertiser_1',
    creatorName: 'Pak Cricket Passion',
    title: 'Top 10 Fastest Deliveries in PSL History - Speedometer Records',
    channelName: 'Green Shirts TV',
    category: 'Entertainment',
    videoUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/3JZ_D3ELwOQ?autoplay=1&mute=0&controls=1&rel=0&playsinline=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3b0?w=600&auto=format&fit=crop&q=80',
    platform: 'youtube',
    targetWatchSeconds: 90,
    totalTargetViews: 400,
    viewsDelivered: 165,
    rewardPerViewPKR: 4.50,
    costPerViewPKR: 6.75,
    totalCostPKR: 2700.00,
    remainingBudgetPKR: 1586.25,
    status: 'active',
    createdAt: '2026-09-20T08:15:00Z',
  },
  {
    id: 'camp_4',
    creatorId: 'user_advertiser_1',
    creatorName: 'Tech Urdu Lab',
    title: 'Samsung Galaxy S26 Ultra vs iPhone 17 Pro Max Camera Battle in Lahore',
    channelName: 'Tech Urdu Lab',
    category: 'Tech & Reviews',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kJQP7kiw5Fk?autoplay=1&mute=0&controls=1&rel=0&playsinline=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    platform: 'youtube',
    targetWatchSeconds: 120,
    totalTargetViews: 200,
    viewsDelivered: 112,
    rewardPerViewPKR: 6.50,
    costPerViewPKR: 9.50,
    totalCostPKR: 1900.00,
    remainingBudgetPKR: 836.00,
    status: 'active',
    createdAt: '2026-09-21T11:45:00Z',
  },
  {
    id: 'camp_5',
    creatorId: 'user_advertiser_1',
    creatorName: 'Al-Huda Studio',
    title: 'Surah Ar-Rahman Beautiful Tilawat with Urdu Translation',
    channelName: 'Noor Islamic Media',
    category: 'Islamic & Culture',
    videoUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/21X5lGlDOfg?autoplay=1&mute=0&controls=1&rel=0&playsinline=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&auto=format&fit=crop&q=80',
    platform: 'youtube',
    targetWatchSeconds: 60,
    totalTargetViews: 600,
    viewsDelivered: 420,
    rewardPerViewPKR: 3.00,
    costPerViewPKR: 4.50,
    totalCostPKR: 2700.00,
    remainingBudgetPKR: 810.00,
    status: 'active',
    createdAt: '2026-09-21T15:20:00Z',
  },
  {
    id: 'camp_6',
    creatorId: 'user_advertiser_1',
    creatorName: 'Hafeez Center Tech',
    title: 'Best Budget Gaming PC for Under 65,000 PKR (Full Benchmarks)',
    channelName: 'Hafeez PC Gamerz',
    category: 'Gaming',
    videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fJ9rUzIMcZQ?autoplay=1&mute=0&controls=1&rel=0&playsinline=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
    platform: 'youtube',
    targetWatchSeconds: 60,
    totalTargetViews: 300,
    viewsDelivered: 95,
    rewardPerViewPKR: 3.00,
    costPerViewPKR: 4.50,
    totalCostPKR: 1350.00,
    remainingBudgetPKR: 922.50,
    status: 'active',
    createdAt: '2026-09-22T09:00:00Z',
  },
];

const INITIAL_DEPOSITS: DepositRequest[] = [
  {
    id: 'dep_100',
    userId: 'user_worker_2',
    userName: 'Ali Abbas',
    userPhone: '0308-4491028',
    gateway: 'jazzcash',
    accountTitle: 'Ali Abbas',
    senderNumber: '0308-4491028',
    transactionId: 'JC9182374619',
    amountPKR: 500,
    screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    depositType: 'campaign_budget',
    paymentDescription: 'Ali Abbas na 500 rupees deposit kia hen Sabir k account men (JazzCash: 03264022010) - TID: JC9182374619',
    createdAt: '2026-09-22T22:45:00Z',
  },
  {
    id: 'dep_101',
    userId: 'user_advertiser_1',
    userName: 'Zubair Media Agency',
    userPhone: '0321-4920481',
    gateway: 'jazzcash',
    accountTitle: 'Zubair Ali Khan',
    senderNumber: '0321-4920481',
    transactionId: 'JC8472910384',
    amountPKR: 5000,
    screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    depositType: 'campaign_budget',
    paymentDescription: 'Zubair Media na 5000 rupees deposit kia hen Sabir k account men (JazzCash: 03264022010) - TID: JC8472910384',
    adminNotes: 'Verified with JazzCash SMS 8558. Balance credited to advertiser.',
    createdAt: '2026-09-17T12:00:00Z',
    reviewedAt: '2026-09-17T12:15:00Z',
  },
  {
    id: 'dep_102',
    userId: 'user_advertiser_1',
    userName: 'Zubair Media Agency',
    userPhone: '0321-4920481',
    gateway: 'easypaisa',
    accountTitle: 'Zubair Ali Khan',
    senderNumber: '0345-9182374',
    transactionId: 'EP9283746102',
    amountPKR: 3500,
    screenshotUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    depositType: 'campaign_budget',
    paymentDescription: 'Zubair Media na 3500 rupees deposit kia hen Sabir k account men (EasyPaisa: 03264022010) - TID: EP9283746102',
    createdAt: '2026-09-22T19:30:00Z',
  },
  {
    id: 'dep_act_1',
    userId: 'user_worker_2',
    userName: 'Ali Abbas',
    userPhone: '0308-4491028',
    gateway: 'jazzcash',
    accountTitle: 'Ali Abbas',
    senderNumber: '0308-4491028',
    transactionId: 'JC7718293012',
    amountPKR: 900,
    screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    depositType: 'worker_activation',
    paymentDescription: 'Ali Abbas na 900 rupees worker activation fee deposit kia hen Sabir k account men (JazzCash: 03264022010) [Referred by Hamza: -100 PKR Discount applied]. TID: JC7718293012',
    createdAt: '2026-09-22T21:00:00Z',
  },
];

const INITIAL_VIEW_HISTORY: ViewHistoryRecord[] = [
  // Today's completed tasks for Hamza Tariq (user_worker_1)
  {
    id: 'vh_1',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_1',
    videoTitle: 'How to Learn Python & AI in Urdu (2026 Complete Roadmap)',
    durationSeconds: 60,
    watchedSeconds: 60,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 3.00,
    status: 'completed_full',
    watchedAt: Date.now() - 1000 * 60 * 35, // 35 mins ago
    city: 'Faisalabad',
  },
  {
    id: 'vh_1b',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_4',
    videoTitle: 'Samsung Galaxy S26 Ultra vs iPhone 17 Pro Max Camera Battle',
    durationSeconds: 120,
    watchedSeconds: 120,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 6.50,
    status: 'completed_full',
    watchedAt: Date.now() - 1000 * 60 * 115, // ~2 hours ago
    city: 'Faisalabad',
  },
  {
    id: 'vh_1c',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_2',
    videoTitle: 'Original Burns Road Beef Nihari Secret Recipe (Full Review)',
    durationSeconds: 30,
    watchedSeconds: 30,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 1.50,
    status: 'completed_full',
    watchedAt: Date.now() - 1000 * 60 * 220, // ~3.5 hours ago
    city: 'Faisalabad',
  },
  {
    id: 'vh_1d',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_3',
    videoTitle: 'Top 10 Fastest Deliveries in PSL History - Speedometer Records',
    durationSeconds: 90,
    watchedSeconds: 32,
    watchPercentage: 35,
    isFullyWatched: false,
    rewardPKR: 0,
    status: 'partial_abandoned',
    watchedAt: Date.now() - 1000 * 60 * 310, // ~5 hours ago
    city: 'Faisalabad',
  },
  {
    id: 'vh_1e',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_6',
    videoTitle: 'Best Budget Gaming PC for Under 65,000 PKR (Full Benchmarks)',
    durationSeconds: 60,
    watchedSeconds: 60,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 3.00,
    status: 'completed_full',
    watchedAt: Date.now() - 1000 * 60 * 420, // ~7 hours ago
    city: 'Faisalabad',
  },
  // Yesterday's completed tasks for Hamza Tariq
  {
    id: 'vh_1f',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_5',
    videoTitle: 'Surah Ar-Rahman Beautiful Tilawat with Urdu Translation',
    durationSeconds: 60,
    watchedSeconds: 60,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 3.00,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 26,
    city: 'Faisalabad',
  },
  {
    id: 'vh_1g',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_3',
    videoTitle: 'Top 10 Fastest Deliveries in PSL History - Speedometer Records',
    durationSeconds: 90,
    watchedSeconds: 90,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 4.50,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 29,
    city: 'Faisalabad',
  },
  {
    id: 'vh_1h',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_4',
    videoTitle: 'Samsung Galaxy S26 Ultra vs iPhone 17 Pro Max Camera Battle',
    durationSeconds: 120,
    watchedSeconds: 120,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 6.50,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 33,
    city: 'Faisalabad',
  },
  {
    id: 'vh_1i',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_2',
    videoTitle: 'Original Burns Road Beef Nihari Secret Recipe (Full Review)',
    durationSeconds: 30,
    watchedSeconds: 30,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 1.50,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 36,
    city: 'Faisalabad',
  },
  // Previous Days tasks for Hamza Tariq
  {
    id: 'vh_1j',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_1',
    videoTitle: 'How to Learn Python & AI in Urdu (2026 Complete Roadmap)',
    durationSeconds: 60,
    watchedSeconds: 60,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 3.00,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 52,
    city: 'Faisalabad',
  },
  {
    id: 'vh_1k',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_6',
    videoTitle: 'Best Budget Gaming PC for Under 65,000 PKR (Full Benchmarks)',
    durationSeconds: 60,
    watchedSeconds: 60,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 3.00,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 55,
    city: 'Faisalabad',
  },
  {
    id: 'vh_1l',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    campaignId: 'camp_3',
    videoTitle: 'Top 10 Fastest Deliveries in PSL History - Speedometer Records',
    durationSeconds: 90,
    watchedSeconds: 90,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 4.50,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 78,
    city: 'Faisalabad',
  },
  // Other workers
  {
    id: 'vh_2',
    userId: 'user_worker_2',
    userName: 'Ali Abbas',
    userPhone: '0308-4491028',
    campaignId: 'camp_2',
    videoTitle: 'Original Burns Road Beef Nihari Secret Recipe (Full Review)',
    durationSeconds: 30,
    watchedSeconds: 30,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 1.50,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 3,
    city: 'Lahore',
  },
  {
    id: 'vh_3',
    userId: 'user_worker_3',
    userName: 'Fatima Batool',
    userPhone: '0333-7821903',
    campaignId: 'camp_4',
    videoTitle: 'Samsung Galaxy S26 Ultra vs iPhone 17 Pro Max Camera Battle',
    durationSeconds: 120,
    watchedSeconds: 48,
    watchPercentage: 40,
    isFullyWatched: false,
    rewardPKR: 0,
    status: 'partial_abandoned',
    watchedAt: Date.now() - 3600000 * 4,
    city: 'Rawalpindi',
  },
  {
    id: 'vh_4',
    userId: 'user_worker_4',
    userName: 'Usman Ghani',
    userPhone: '0312-9876543',
    campaignId: 'camp_3',
    videoTitle: 'Top 10 Fastest Deliveries in PSL History - Speedometer Records',
    durationSeconds: 90,
    watchedSeconds: 90,
    watchPercentage: 100,
    isFullyWatched: true,
    rewardPKR: 4.50,
    status: 'completed_full',
    watchedAt: Date.now() - 3600000 * 6,
    city: 'Multan',
  },
];

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wd_201',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    gateway: 'jazzcash',
    accountTitle: 'Hamza Tariq',
    mobileNumber: '0304-5892113',
    amountPKR: 1500,
    feePKR: 0,
    status: 'approved',
    adminNotes: 'Sent via JazzCash 8558 TID #JC9928172635 to Sabir client',
    createdAt: '2026-09-15T16:00:00Z',
    reviewedAt: '2026-09-15T17:30:00Z',
  },
  {
    id: 'wd_202',
    userId: 'user_worker_1',
    userName: 'Hamza Tariq',
    userPhone: '0304-5892113',
    gateway: 'easypaisa',
    accountTitle: 'Hamza Tariq',
    mobileNumber: '0345-1298765',
    amountPKR: 500,
    feePKR: 0,
    status: 'pending',
    createdAt: '2026-09-22T21:10:00Z',
  },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('worker');
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
    const validThemes: AppTheme[] = ['light', 'deep_navy', 'midnight_blue', 'charcoal', 'violet'];
    if (saved && validThemes.includes(saved as AppTheme)) {
      return saved as AppTheme;
    }
    return 'light';
  });

  // Admin PIN Protection (Code 7467)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // User Sessions & Logins (Advertiser and Worker visibility)
  const [userSessions, setUserSessions] = useState<UserSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  // Real-Time Login Audit Logs (Admin Clearance Only)
  const [loginAuditLogs, setLoginAuditLogs] = useState<LoginAuditRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_login_audits`);
    return saved ? JSON.parse(saved) : INITIAL_LOGIN_AUDIT_LOGS;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_login_audits`, JSON.stringify(loginAuditLogs));
  }, [loginAuditLogs]);

  const addLoginAuditLog = (
    data: Omit<LoginAuditRecord, 'id' | 'timestamp' | 'timeFormatted' | 'relativeTime'>
  ) => {
    const now = Date.now();
    const dateObj = new Date(now);
    const timeFormatted = dateObj.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newLog: LoginAuditRecord = {
      ...data,
      id: `log_live_${now}_${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now,
      timeFormatted,
      relativeTime: 'Just now',
    };

    setLoginAuditLogs((prev) => [newLog, ...prev]);
  };

  const clearLoginAuditLogs = () => {
    setLoginAuditLogs([]);
    showToast('Login audit logs cleared.', 'info');
  };

  // Referrals
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_referrals`);
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [campaigns, setCampaigns] = useState<VideoCampaign[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`);
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [deposits, setDeposits] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deposits`);
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_withdrawals`);
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
  });

  const [viewHistory, setViewHistory] = useState<ViewHistoryRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_views`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 8) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_VIEW_HISTORY;
  });

  const [activeVideoModal, setActiveVideoModal] = useState<VideoCampaign | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_theme`, currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_referrals`, JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_deposits`, JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_withdrawals`, JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_views`, JSON.stringify(viewHistory));
  }, [viewHistory]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const currentUser = users.find((u) => u.role === currentRole) || users[0];

  const switchTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    showToast(`Color Theme switched to ${theme.toUpperCase()}!`, 'info');
  };

  const unlockAdmin = (pin: string): boolean => {
    if (pin.trim() === ADMIN_SECURITY_PIN) {
      setIsAdminUnlocked(true);
      setIsPinModalOpen(false);
      setCurrentRole('admin');
      sounds.playRewardChime();
      showToast('Admin Portal Unlocked! Welcome to Super Admin Console.', 'success');
      return true;
    } else {
      sounds.playWarningBuzz();
      showToast('Invalid Security PIN! Access denied.', 'error');
      return false;
    }
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    if (currentRole === 'admin') {
      setCurrentRole('worker');
    }
    showToast('Admin Portal locked.', 'info');
  };

  const openPinModal = () => setIsPinModalOpen(true);
  const closePinModal = () => setIsPinModalOpen(false);

  const openReferralModal = () => setIsReferralModalOpen(true);
  const closeReferralModal = () => setIsReferralModalOpen(false);

  const applyReferralCode = (code: string): { success: boolean; bonusPKR?: number; error?: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, error: 'Please enter a referral code.' };
    if (clean === currentUser.referralCode) {
      return { success: false, error: 'You cannot use your own referral code.' };
    }
    if (currentUser.referredBy) {
      return { success: false, error: `You have already applied referral code: ${currentUser.referredBy}` };
    }

    const bonus = 50.0;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            referredBy: clean,
            walletBalancePKR: Number((u.walletBalancePKR + bonus).toFixed(2)),
            totalEarnedPKR: Number((u.totalEarnedPKR + bonus).toFixed(2)),
            referralBonusPKR: Number((u.referralBonusPKR + bonus).toFixed(2)),
          };
        }
        return u;
      })
    );

    const newRecord: ReferralRecord = {
      id: `ref_${Date.now()}`,
      referrerId: clean,
      friendName: `${currentUser.name} (You)`,
      friendPhone: currentUser.phone,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active_earner',
      bonusPKR: bonus,
      commissionEarnedPKR: 0,
      tasksCompleted: currentUser.totalTasksCompleted,
    };
    setReferrals((prev) => [newRecord, ...prev]);

    sounds.playRewardChime();
    showToast(`Mubarak! Referral code ${clean} applied! +50 PKR Welcome Gift credited to your wallet!`, 'success');
    return { success: true, bonusPKR: bonus };
  };

  const switchUserRole = (role: UserRole) => {
    if (role === 'admin' && !isAdminUnlocked) {
      setIsPinModalOpen(true);
      return;
    }
    setCurrentRole(role);
    showToast(`Switched view to ${role === 'worker' ? 'Worker (Task Earner)' : role === 'advertiser' ? 'Content Creator (Advertiser)' : 'Platform Admin'}`, 'info');
  };

  // 24-hour cooldown check for fraud prevention
  const hasWatchedToday = (campaignId: string): boolean => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return viewHistory.some(
      (v) => v.campaignId === campaignId && v.userId === currentUser.id && v.watchedAt > oneDayAgo
    );
  };

  // Complete video watch and reward user (Full vs Partial Watch tracking)
  const recordVideoWatch = (
    campaignId: string,
    watchedSeconds?: number,
    isFullyWatched: boolean = true
  ): { success: boolean; rewardPKR: number; error?: string } => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return { success: false, rewardPKR: 0, error: 'Campaign not found' };
    }

    if (hasWatchedToday(campaignId)) {
      return { success: false, rewardPKR: 0, error: '24-hour cooldown active for this video' };
    }

    const duration = campaign.targetWatchSeconds;
    const actualSeconds = watchedSeconds !== undefined ? watchedSeconds : duration;
    const pct = Math.min(100, Math.round((actualSeconds / duration) * 100));
    const reward = isFullyWatched ? campaign.rewardPerViewPKR : 0;

    // 1. Record complete watch log
    const newLog: ViewHistoryRecord = {
      id: `view_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      campaignId,
      videoTitle: campaign.title,
      durationSeconds: duration,
      watchedSeconds: actualSeconds,
      watchPercentage: pct,
      isFullyWatched: isFullyWatched,
      rewardPKR: reward,
      status: isFullyWatched ? 'completed_full' : 'partial_abandoned',
      watchedAt: Date.now(),
      city: 'Pakistan',
    };
    setViewHistory((prev) => [newLog, ...prev]);

    if (isFullyWatched) {
      // 2. Credit worker wallet
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              walletBalancePKR: Number((u.walletBalancePKR + reward).toFixed(2)),
              totalEarnedPKR: Number((u.totalEarnedPKR + reward).toFixed(2)),
              totalTasksCompleted: u.totalTasksCompleted + 1,
            };
          }
          return u;
        })
      );

      // 3. Update campaign stats
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === campaignId) {
            const newViews = c.viewsDelivered + 1;
            const costSpent = c.costPerViewPKR;
            const newRemaining = Math.max(0, c.remainingBudgetPKR - costSpent);
            return {
              ...c,
              viewsDelivered: newViews,
              remainingBudgetPKR: Number(newRemaining.toFixed(2)),
              status: newViews >= c.totalTargetViews || newRemaining <= 0 ? 'completed' : c.status,
            };
          }
          return c;
        })
      );

      showToast(`Earned +${reward.toFixed(2)} PKR! Video 100% watched.`, 'success');
      return { success: true, rewardPKR: reward };
    } else {
      showToast(`Video partially watched (${actualSeconds}/${duration}s). No reward credited.`, 'info');
      return { success: false, rewardPKR: 0, error: 'Video watched partially' };
    }
  };

  const logPartialWatch = (campaignId: string, watchedSeconds: number) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const duration = campaign.targetWatchSeconds;
    const actualSeconds = Math.max(1, Math.min(duration, watchedSeconds));
    const pct = Math.min(100, Math.round((actualSeconds / duration) * 100));

    const newLog: ViewHistoryRecord = {
      id: `view_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      campaignId,
      videoTitle: campaign.title,
      durationSeconds: duration,
      watchedSeconds: actualSeconds,
      watchPercentage: pct,
      isFullyWatched: false,
      rewardPKR: 0,
      status: 'partial_abandoned',
      watchedAt: Date.now(),
      city: 'Pakistan',
    };
    setViewHistory((prev) => [newLog, ...prev]);
  };

  // Create video campaign
  const createCampaign = (data: {
    title: string;
    channelName: string;
    category: VideoCampaign['category'];
    videoUrl: string;
    targetWatchSeconds: WatchDuration;
    totalTargetViews: number;
  }) => {
    const rateInfo = PLATFORM_CONFIG.durationRates.find((r) => r.duration === data.targetWatchSeconds) || PLATFORM_CONFIG.durationRates[1];
    const totalCost = Number((rateInfo.advertiserCostPKR * data.totalTargetViews).toFixed(2));

    const advertiser = users.find((u) => u.role === 'advertiser');
    if (!advertiser || advertiser.depositBalancePKR < totalCost) {
      return {
        success: false,
        error: `Insufficient Deposit Funds. Total cost is ${totalCost.toFixed(2)} PKR, but your deposit balance is only ${(advertiser?.depositBalancePKR || 0).toFixed(2)} PKR. Please deposit funds first via JazzCash or EasyPaisa.`,
      };
    }

    const parsed = parseVideoUrl(data.videoUrl);

    // Deduct advertiser deposit balance
    setUsers((prev) =>
      prev.map((u) => {
        if (u.role === 'advertiser') {
          return {
            ...u,
            depositBalancePKR: Number((u.depositBalancePKR - totalCost).toFixed(2)),
          };
        }
        return u;
      })
    );

    const newCampaign: VideoCampaign = {
      id: `camp_${Date.now()}`,
      creatorId: advertiser.id,
      creatorName: advertiser.name,
      title: data.title.trim(),
      channelName: data.channelName.trim(),
      category: data.category,
      videoUrl: data.videoUrl,
      embedUrl: parsed.embedUrl,
      thumbnailUrl: parsed.thumbnailUrl,
      platform: parsed.platform,
      targetWatchSeconds: data.targetWatchSeconds,
      totalTargetViews: data.totalTargetViews,
      viewsDelivered: 0,
      rewardPerViewPKR: rateInfo.workerRewardPKR,
      costPerViewPKR: rateInfo.advertiserCostPKR,
      totalCostPKR: totalCost,
      remainingBudgetPKR: totalCost,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    showToast(`Campaign "${data.title.substring(0, 30)}..." launched successfully!`, 'success');
    return { success: true };
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          const nextStatus = c.status === 'active' ? 'paused' : 'active';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const deleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    // Refund remaining budget back to advertiser deposit
    if (campaign.remainingBudgetPKR > 0) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === campaign.creatorId) {
            return {
              ...u,
              depositBalancePKR: Number((u.depositBalancePKR + campaign.remainingBudgetPKR).toFixed(2)),
            };
          }
          return u;
        })
      );
    }

    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    showToast(`Campaign deleted. Refunded ${campaign.remainingBudgetPKR.toFixed(2)} PKR remaining budget.`, 'info');
  };

  // Submit deposit (Advertiser campaign deposit or general deposit to Sabir Hussain)
  const submitDeposit = (data: {
    gateway: PaymentGateway;
    accountTitle: string;
    senderNumber: string;
    transactionId: string;
    amountPKR: number;
    screenshotUrl?: string;
    depositType?: 'campaign_budget' | 'worker_activation';
    customNote?: string;
  }) => {
    if (data.amountPKR < 100) {
      return { success: false, error: 'Minimum deposit amount is 100 PKR' };
    }
    if (!data.transactionId.trim()) {
      return { success: false, error: 'Transaction ID (TID) is required' };
    }

    const gatewayLabel = data.gateway === 'jazzcash' ? 'JazzCash' : 'EasyPaisa';
    const note =
      data.customNote ||
      `${data.accountTitle || currentUser.name} na ${data.amountPKR} rupees deposit kia hen Sabir k account men (${gatewayLabel}: 03264022010). TID: ${data.transactionId.trim().toUpperCase()}`;

    const newDeposit: DepositRequest = {
      id: `dep_${Date.now()}`,
      userId: currentUser.id,
      userName: data.accountTitle || currentUser.name,
      userPhone: data.senderNumber || currentUser.phone,
      gateway: data.gateway,
      accountTitle: data.accountTitle || currentUser.name,
      senderNumber: data.senderNumber || currentUser.phone,
      transactionId: data.transactionId.trim().toUpperCase(),
      amountPKR: data.amountPKR,
      screenshotUrl: data.screenshotUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      depositType: data.depositType || 'campaign_budget',
      paymentDescription: note,
      createdAt: new Date().toISOString(),
    };

    setDeposits((prev) => [newDeposit, ...prev]);
    showToast(`Payment request submitted: "${data.amountPKR} PKR to Sabir Hussain". Pending verification.`, 'success');
    return { success: true };
  };

  // Worker Activation Fee submission
  const submitWorkerActivation = (data: {
    gateway: PaymentGateway;
    senderName: string;
    senderNumber: string;
    transactionId: string;
    amountPKR: number;
    referralCode?: string;
  }) => {
    if (!data.transactionId.trim()) {
      return { success: false, error: 'Please enter the transaction TID.' };
    }

    const gatewayLabel = data.gateway === 'jazzcash' ? 'JazzCash' : 'EasyPaisa';
    const hasDiscount = Boolean(data.referralCode || currentUser.referredBy);
    const desc = `${data.senderName} na ${data.amountPKR} rupees worker activation fee deposit kia hen Sabir k account men (${gatewayLabel}: 03264022010)${
      hasDiscount ? ' [Referred: -100 PKR Discount applied]' : ''
    }. TID: ${data.transactionId.trim().toUpperCase()}`;

    const newDeposit: DepositRequest = {
      id: `act_${Date.now()}`,
      userId: currentUser.id,
      userName: data.senderName,
      userPhone: data.senderNumber,
      gateway: data.gateway,
      accountTitle: data.senderName,
      senderNumber: data.senderNumber,
      transactionId: data.transactionId.trim().toUpperCase(),
      amountPKR: data.amountPKR,
      screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      depositType: 'worker_activation',
      paymentDescription: desc,
      createdAt: new Date().toISOString(),
    };

    setDeposits((prev) => [newDeposit, ...prev]);

    // Update current worker profile state
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            activationStatus: 'pending_verification',
            activationTid: data.transactionId.trim().toUpperCase(),
            activationGateway: data.gateway,
            activationPaidPKR: data.amountPKR,
            referredBy: data.referralCode ? data.referralCode.trim().toUpperCase() : u.referredBy,
          };
        }
        return u;
      })
    );

    showToast(`Activation fee submitted! Sabir Hussain will verify your TID #${data.transactionId.trim().toUpperCase()} and activate your account.`, 'success');
    return { success: true };
  };

  // Approve worker activation
  const approveWorkerActivation = (depositId: string) => {
    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    const workerId = deposit.userId;
    const worker = users.find((u) => u.id === workerId);

    // 1. Activate worker
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === workerId) {
          return {
            ...u,
            isActivated: true,
            activationStatus: 'activated',
            activationPaidPKR: deposit.amountPKR,
          };
        }
        return u;
      })
    );

    // 2. If referred, pay referrer their 100 PKR commission!
    if (worker?.referredBy) {
      const refCode = worker.referredBy;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.referralCode === refCode) {
            return {
              ...u,
              walletBalancePKR: Number((u.walletBalancePKR + PLATFORM_CONFIG.referralCommissionPKR).toFixed(2)),
              totalEarnedPKR: Number((u.totalEarnedPKR + PLATFORM_CONFIG.referralCommissionPKR).toFixed(2)),
              referralEarningsPKR: Number((u.referralEarningsPKR + PLATFORM_CONFIG.referralCommissionPKR).toFixed(2)),
            };
          }
          return u;
        })
      );

      setReferrals((prev) =>
        prev.map((r) => {
          if (r.referrerId === refCode || r.friendPhone === worker.phone) {
            return {
              ...r,
              status: 'active_earner',
              commissionEarnedPKR: Number((r.commissionEarnedPKR + 100).toFixed(2)),
            };
          }
          return r;
        })
      );
    }

    // 3. Mark deposit approved
    setDeposits((prev) =>
      prev.map((d) => {
        if (d.id === depositId) {
          return {
            ...d,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            adminNotes: 'Worker account verified & activated. Payment received in Sabir Hussain account (03264022010).',
          };
        }
        return d;
      })
    );

    showToast(`Worker "${deposit.userName}" activated successfully! 100 PKR bonus sent to referrer.`, 'success');
  };

  // Direct Admin activate worker account
  const activateWorkerAccount = (userId: string) => {
    const worker = users.find((u) => u.id === userId);
    if (!worker) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            approvalStatus: 'approved',
            isActivated: true,
            activationStatus: 'activated',
            activationPaidPKR: u.activationPaidPKR || 1000,
          };
        }
        return u;
      })
    );

    // If referred, pay referrer
    if (worker.referredBy) {
      const refCode = worker.referredBy;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.referralCode === refCode) {
            return {
              ...u,
              walletBalancePKR: Number((u.walletBalancePKR + PLATFORM_CONFIG.referralCommissionPKR).toFixed(2)),
              totalEarnedPKR: Number((u.totalEarnedPKR + PLATFORM_CONFIG.referralCommissionPKR).toFixed(2)),
              referralEarningsPKR: Number((u.referralEarningsPKR + PLATFORM_CONFIG.referralCommissionPKR).toFixed(2)),
            };
          }
          return u;
        })
      );

      setReferrals((prev) =>
        prev.map((r) => {
          if (r.referrerId === refCode || r.friendPhone === worker.phone) {
            return {
              ...r,
              status: 'active_earner',
              commissionEarnedPKR: Number((r.commissionEarnedPKR + 100).toFixed(2)),
            };
          }
          return r;
        })
      );
    }

    // Approve any pending deposit for worker activation
    setDeposits((prev) =>
      prev.map((d) => {
        if (d.userId === userId && d.depositType === 'worker_activation' && d.status === 'pending') {
          return {
            ...d,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            adminNotes: 'Worker activated manually by Admin.',
          };
        }
        return d;
      })
    );

    showToast(`Worker "${worker.name}" activated! Earning tasks unlocked.`, 'success');
  };

  // Approve deposit
  const approveDeposit = (depositId: string) => {
    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    if (deposit.depositType === 'worker_activation') {
      approveWorkerActivation(depositId);
      return;
    }

    // Credit advertiser deposit balance
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === deposit.userId) {
          return {
            ...u,
            depositBalancePKR: Number((u.depositBalancePKR + deposit.amountPKR).toFixed(2)),
          };
        }
        return u;
      })
    );

    setDeposits((prev) =>
      prev.map((d) => {
        if (d.id === depositId) {
          return {
            ...d,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            adminNotes: 'Transaction TID verified. Deposit balance added.',
          };
        }
        return d;
      })
    );

    showToast(`Deposit #${deposit.transactionId} approved! ${deposit.amountPKR} PKR credited.`, 'success');
  };

  // User Registration with Gmail, Phone Number, Password, Role (Admin Approval required)
  const registerUser = (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    referralCode?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim().replace(/[-\s]/g, '');
    const cleanName = data.name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid Gmail address.' };
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid Pakistani mobile number (e.g. 03001234567).' };
    }
    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Please set a password with at least 4 characters.' };
    }

    const existingEmail = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return { success: false, message: 'An account with this Gmail address already exists. Please log in.' };
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: cleanName || 'New User',
      email: cleanEmail,
      phone: cleanPhone,
      password: data.password,
      role: data.role,
      approvalStatus: 'pending_approval',
      registeredAt: new Date().toLocaleString(),
      lastLoginAt: 'Just registered',
      walletBalancePKR: 0,
      depositBalancePKR: data.role === 'advertiser' ? 1000 : 0,
      totalEarnedPKR: 0,
      totalWithdrawnPKR: 0,
      totalTasksCompleted: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      referralCode: (cleanName.substring(0, 4) || 'USER').toUpperCase() + Math.floor(100 + Math.random() * 900),
      referredBy: data.referralCode ? data.referralCode.trim().toUpperCase() : undefined,
      referralBonusPKR: 0,
      referralEarningsPKR: 0,
      totalReferralsCount: 0,
      isActivated: false,
      activationStatus: 'unpaid',
    };

    setUsers((prev) => [newUser, ...prev]);

    // Record session for Admin visibility
    const newSession: UserSession = {
      id: `sess_${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      userPhone: newUser.phone,
      role: newUser.role,
      approvalStatus: 'pending_approval',
      device: typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Android Mobile App' : 'Desktop Web',
      location: 'Pakistan',
      ip: '39.40.182.' + Math.floor(10 + Math.random() * 80),
      loginTime: 'Just now',
      status: 'online',
    };

    setUserSessions((prev) => [newSession, ...prev]);
    setCurrentRole(data.role);

    // Record Real-Time Login Audit Log for Admin Monitoring
    addLoginAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      userPhone: newUser.phone,
      role: newUser.role,
      device: typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Android Mobile Device' : 'Desktop Browser',
      browser: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Chrome') ? 'Chrome 128' : 'Mobile Browser') : 'Chrome 128',
      ipAddress: '39.40.182.' + Math.floor(10 + Math.random() * 80),
      isp: 'Jazz 4G LTE',
      city: 'Pakistan',
      status: 'blocked_pending_approval',
      authMethod: 'Registration Login',
      sessionStatus: 'active_online',
      approvalStatus: 'pending_approval',
      loginNotes: 'New registration submitted. Awaiting manual Admin (Sabir Hussain) approval.',
    });

    showToast(`Registration submitted! Admin (Sabir Hussain) will verify your Gmail & Phone and approve your account.`, 'info');
    return { success: true, message: 'Registration submitted. Pending Admin approval.', user: newUser };
  };

  // User Login with Gmail or Phone Number + Password
  const loginUser = (emailOrPhone: string, password?: string) => {
    const raw = emailOrPhone.trim().toLowerCase();
    const cleanPhone = raw.replace(/[-\s]/g, '');

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === raw ||
        u.phone.replace(/[-\s]/g, '') === cleanPhone
    );

    if (!user) {
      addLoginAuditLog({
        userId: 'unknown_attempt',
        userName: 'Unregistered User',
        userEmail: raw.includes('@') ? raw : 'Not Provided',
        userPhone: !raw.includes('@') ? raw : 'Not Provided',
        role: 'worker',
        device: typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Android Mobile Device' : 'Desktop Browser',
        browser: 'Chrome 128',
        ipAddress: '39.40.182.' + Math.floor(10 + Math.random() * 80),
        isp: 'Jazz 4G LTE',
        city: 'Pakistan',
        status: 'failed_credentials',
        authMethod: raw.includes('@') ? 'Gmail & Password' : 'Phone & Password',
        sessionStatus: 'logged_out',
        approvalStatus: 'rejected',
        loginNotes: `Unrecognized credentials attempted: "${raw}". Account not found.`,
      });
      return { success: false, message: 'No registered user found with this Gmail or Mobile number.' };
    }

    if (password && user.password && user.password !== password) {
      addLoginAuditLog({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        role: user.role,
        device: typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Android Mobile Device' : 'Desktop Browser',
        browser: 'Chrome 128',
        ipAddress: '39.40.182.' + Math.floor(10 + Math.random() * 80),
        isp: 'Nayatel Fiber',
        city: 'Pakistan',
        status: 'failed_credentials',
        authMethod: raw.includes('@') ? 'Gmail & Password' : 'Phone & Password',
        sessionStatus: 'logged_out',
        approvalStatus: user.approvalStatus,
        loginNotes: 'Invalid password submitted for verified account.',
      });
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }

    // Update last login
    const updatedUser: UserProfile = {
      ...user,
      lastLoginAt: 'Just now',
    };
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setCurrentRole(user.role);

    // Record session
    const newSession: UserSession = {
      id: `sess_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      role: user.role,
      approvalStatus: user.approvalStatus,
      device: typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Android Mobile App' : 'Desktop Web',
      location: 'Pakistan',
      ip: '39.40.182.' + Math.floor(10 + Math.random() * 80),
      loginTime: 'Just now',
      status: 'online',
    };

    setUserSessions((prev) => [newSession, ...prev.filter((s) => s.userId !== user.id)]);

    // Record Real-Time Login Audit Log
    addLoginAuditLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      role: user.role,
      device: typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Android Mobile App' : 'Desktop Browser',
      browser: 'Chrome 128',
      ipAddress: '39.40.182.' + Math.floor(10 + Math.random() * 80),
      isp: 'Nayatel Fiber',
      city: 'Pakistan',
      status: user.approvalStatus === 'pending_approval' ? 'blocked_pending_approval' : user.approvalStatus === 'rejected' ? 'suspended_account' : 'success',
      authMethod: raw.includes('@') ? 'Gmail & Password' : 'Phone & Password',
      sessionStatus: 'active_online',
      approvalStatus: user.approvalStatus,
      loginNotes: user.approvalStatus === 'pending_approval'
        ? 'Login session queued in restricted mode. Requires Admin approval.'
        : user.approvalStatus === 'rejected'
        ? 'Account is suspended by administrator.'
        : 'User authenticated successfully. Dashboard active.',
    });

    if (user.approvalStatus === 'pending_approval') {
      showToast(`Welcome ${user.name}. Account is currently pending Admin (Sabir Hussain) approval.`, 'info');
    } else if (user.approvalStatus === 'rejected') {
      showToast(`Account for ${user.name} is currently suspended or rejected by Admin.`, 'error');
    } else {
      showToast(`Welcome back, ${user.name}! Account active & approved.`, 'success');
    }

    return { success: true, message: 'Login successful.', user: updatedUser };
  };

  // Admin approves user account
  const approveUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            approvalStatus: 'approved',
          };
        }
        return u;
      })
    );

    setUserSessions((prev) =>
      prev.map((s) => {
        if (s.userId === userId) {
          return {
            ...s,
            approvalStatus: 'approved',
          };
        }
        return s;
      })
    );

    setLoginAuditLogs((prev) =>
      prev.map((log) => {
        if (log.userId === userId) {
          return {
            ...log,
            approvalStatus: 'approved',
            status: log.status === 'blocked_pending_approval' ? 'success' : log.status,
            loginNotes: 'Account officially approved by Master Admin (Sabir Hussain).',
          };
        }
        return log;
      })
    );

    showToast(`User "${target.name}" approved! Their login and earning access is now active.`, 'success');
  };

  // Admin rejects user account
  const rejectUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            approvalStatus: 'rejected',
          };
        }
        return u;
      })
    );

    setUserSessions((prev) =>
      prev.map((s) => {
        if (s.userId === userId) {
          return {
            ...s,
            approvalStatus: 'rejected',
          };
        }
        return s;
      })
    );

    setLoginAuditLogs((prev) =>
      prev.map((log) => {
        if (log.userId === userId) {
          return {
            ...log,
            approvalStatus: 'rejected',
            sessionStatus: 'logged_out',
            status: 'suspended_account',
            loginNotes: 'Account access suspended by Master Admin (Sabir Hussain).',
          };
        }
        return log;
      })
    );

    showToast(`User "${target.name}" account access rejected.`, 'info');
  };

  // Quick switch session
  const loginAsUser = (name: string, phone: string, role: UserRole) => {
    const cleanPhone = phone.trim() || '0300-1234567';
    const cleanName = name.trim() || 'Pakistan User';

    const existing = users.find((u) => u.phone === cleanPhone);
    let targetUser: UserProfile;

    if (existing) {
      targetUser = { ...existing, role };
      setUsers((prev) => prev.map((u) => (u.id === existing.id ? targetUser : u)));
    } else {
      targetUser = {
        id: `user_${Date.now()}`,
        name: cleanName,
        email: `${cleanName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone: cleanPhone,
        password: 'password123',
        role,
        approvalStatus: 'approved',
        registeredAt: new Date().toLocaleString(),
        lastLoginAt: 'Just now',
        walletBalancePKR: 0,
        depositBalancePKR: role === 'advertiser' ? 2500 : 0,
        totalEarnedPKR: 0,
        totalWithdrawnPKR: 0,
        totalTasksCompleted: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        referralCode: cleanName.substring(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900),
        referralBonusPKR: 0,
        referralEarningsPKR: 0,
        totalReferralsCount: 0,
        isActivated: role === 'advertiser' ? true : false,
        activationStatus: role === 'advertiser' ? 'activated' : 'unpaid',
      };
      setUsers((prev) => [targetUser, ...prev]);
    }

    setCurrentRole(role);

    const newSession: UserSession = {
      id: `sess_${Date.now()}`,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      userPhone: targetUser.phone,
      role: targetUser.role,
      approvalStatus: targetUser.approvalStatus,
      device: typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile Web Browser' : 'Chrome Windows 11',
      location: 'Pakistan',
      ip: '39.40.182.' + Math.floor(10 + Math.random() * 80) + ' (Jazz/Zong)',
      loginTime: 'Just now',
      status: 'online',
    };

    setUserSessions((prev) => [newSession, ...prev.filter((s) => s.userId !== targetUser.id)]);
    showToast(`Logged in as ${targetUser.name} (${role === 'worker' ? 'Worker Mode' : role === 'advertiser' ? 'Advertiser Mode' : 'Admin Mode'})`, 'success');
  };

  const rejectDeposit = (depositId: string, notes: string) => {
    setDeposits((prev) =>
      prev.map((d) => {
        if (d.id === depositId) {
          return {
            ...d,
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            adminNotes: notes || 'TID not found or invalid transaction receipt proof.',
          };
        }
        return d;
      })
    );
    showToast(`Deposit rejected. Reason recorded.`, 'info');
  };

  // Submit withdrawal
  const submitWithdrawal = (data: {
    gateway: PaymentGateway;
    accountTitle: string;
    mobileNumber: string;
    amountPKR: number;
  }) => {
    const worker = users.find((u) => u.id === currentUser.id);
    if (!worker) return { success: false, error: 'User not found' };

    if (data.amountPKR < PLATFORM_CONFIG.minWithdrawalPKR) {
      return {
        success: false,
        error: `Minimum withdrawal amount is ${PLATFORM_CONFIG.minWithdrawalPKR} PKR. Your balance is ${worker.walletBalancePKR.toFixed(2)} PKR.`,
      };
    }

    if (worker.walletBalancePKR < data.amountPKR) {
      return {
        success: false,
        error: `Insufficient balance! You requested ${data.amountPKR} PKR, but your available balance is ${worker.walletBalancePKR.toFixed(2)} PKR.`,
      };
    }

    // Deduct immediately from worker wallet
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === worker.id) {
          return {
            ...u,
            walletBalancePKR: Number((u.walletBalancePKR - data.amountPKR).toFixed(2)),
          };
        }
        return u;
      })
    );

    const newWithdrawal: WithdrawalRequest = {
      id: `wd_${Date.now()}`,
      userId: worker.id,
      userName: worker.name,
      userPhone: worker.phone,
      gateway: data.gateway,
      accountTitle: data.accountTitle,
      mobileNumber: data.mobileNumber,
      amountPKR: data.amountPKR,
      feePKR: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setWithdrawals((prev) => [newWithdrawal, ...prev]);
    showToast(`Withdrawal request of ${data.amountPKR} PKR submitted via ${data.gateway.toUpperCase()}!`, 'success');
    return { success: true };
  };

  // Approve withdrawal
  const approveWithdrawal = (withdrawalId: string) => {
    const wd = withdrawals.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;

    // Record to user's totalWithdrawn
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === wd.userId) {
          return {
            ...u,
            totalWithdrawnPKR: Number((u.totalWithdrawnPKR + wd.amountPKR).toFixed(2)),
          };
        }
        return u;
      })
    );

    setWithdrawals((prev) =>
      prev.map((w) => {
        if (w.id === withdrawalId) {
          return {
            ...w,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            adminNotes: `Transferred to ${wd.accountTitle} (${wd.mobileNumber}) via ${wd.gateway.toUpperCase()}.`,
          };
        }
        return w;
      })
    );

    showToast(`Withdrawal of ${wd.amountPKR} PKR approved & marked paid!`, 'success');
  };

  // Reject withdrawal
  const rejectWithdrawal = (withdrawalId: string, notes: string) => {
    const wd = withdrawals.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;

    // Refund worker wallet balance
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === wd.userId) {
          return {
            ...u,
            walletBalancePKR: Number((u.walletBalancePKR + wd.amountPKR).toFixed(2)),
          };
        }
        return u;
      })
    );

    setWithdrawals((prev) =>
      prev.map((w) => {
        if (w.id === withdrawalId) {
          return {
            ...w,
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            adminNotes: notes || 'Account details mismatch or invalid mobile number.',
          };
        }
        return w;
      })
    );

    showToast(`Withdrawal rejected. ${wd.amountPKR} PKR refunded to worker wallet.`, 'info');
  };

  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_campaigns`);
    localStorage.removeItem(`${STORAGE_KEY}_deposits`);
    localStorage.removeItem(`${STORAGE_KEY}_withdrawals`);
    localStorage.removeItem(`${STORAGE_KEY}_views`);
    setUsers(INITIAL_USERS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setDeposits(INITIAL_DEPOSITS);
    setWithdrawals(INITIAL_WITHDRAWALS);
    setViewHistory([]);
    setCurrentRole('worker');
    showToast('Platform reset to fresh Pakistani demo seed state!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers: users,
        switchUserRole,
        campaigns,
        createCampaign,
        toggleCampaignStatus,
        deleteCampaign,
        deposits,
        submitDeposit,
        approveDeposit,
        rejectDeposit,
        submitWorkerActivation,
        approveWorkerActivation,
        activateWorkerAccount,
        withdrawals,
        submitWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        viewHistory,
        recordVideoWatch,
        logPartialWatch,
        hasWatchedToday,
        userSessions,
        loginAuditLogs,
        addLoginAuditLog,
        clearLoginAuditLogs,
        loginAsUser,
        registerUser,
        loginUser,
        approveUser,
        rejectUser,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
        currentTheme,
        switchTheme,
        isAdminUnlocked,
        isPinModalOpen,
        openPinModal,
        closePinModal,
        unlockAdmin,
        lockAdmin,
        referrals,
        applyReferralCode,
        isReferralModalOpen,
        openReferralModal,
        closeReferralModal,
        resetDemoData,
        activeVideoModal,
        openVideoModal: (c) => setActiveVideoModal(c),
        closeVideoModal: () => setActiveVideoModal(null),
        isWithdrawModalOpen,
        openWithdrawModal: () => setIsWithdrawModalOpen(true),
        closeWithdrawModal: () => setIsWithdrawModalOpen(false),
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
