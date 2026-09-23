export type UserRole = 'worker' | 'advertiser' | 'admin';

export type PaymentGateway = 'jazzcash' | 'easypaisa';

export type WatchDuration = 30 | 60 | 90 | 120;

export type AppTheme = 'light' | 'deep_navy' | 'midnight_blue' | 'charcoal' | 'violet';

export const ADMIN_SECURITY_PIN = '7467';

export interface ReferralRecord {
  id: string;
  referrerId: string;
  friendName: string;
  friendPhone: string;
  joinedDate: string;
  status: 'active_earner' | 'registered';
  bonusPKR: number; // 50 PKR welcome/referral bonus
  commissionEarnedPKR: number; // 10% lifetime share
  tasksCompleted: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string; // User's Gmail
  phone: string; // User's Mobile Phone Number
  password?: string; // User-selected password
  role: UserRole;
  approvalStatus: 'approved' | 'pending_approval' | 'rejected'; // Admin must approve before user can earn/login
  walletBalancePKR: number; // Worker earnings available for withdrawal
  depositBalancePKR: number; // Advertiser funds available for campaigns
  totalEarnedPKR: number;
  totalWithdrawnPKR: number;
  totalTasksCompleted: number;
  joinedDate: string;
  lastLoginAt?: string;
  registeredAt?: string;
  referralCode: string;
  referredBy?: string;
  referralBonusPKR: number;
  referralEarningsPKR: number;
  totalReferralsCount: number;
  // Worker Activation Fee Feature
  isActivated: boolean;
  activationStatus: 'unpaid' | 'pending_verification' | 'activated';
  activationTid?: string;
  activationGateway?: PaymentGateway;
  activationPaidPKR?: number;
}

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string; // User Gmail address
  userPhone: string;
  role: UserRole;
  device: string;
  location: string;
  ip: string;
  loginTime: string;
  status: 'online' | 'active_5m_ago' | 'logged_out';
  approvalStatus: 'approved' | 'pending_approval' | 'rejected';
}

export interface LoginAuditRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string; // User's Gmail
  userPhone: string; // 11-digit Pakistani phone
  role: UserRole;
  timestamp: number; // Unix timestamp in ms
  timeFormatted: string; // Formatted date & time (e.g. 23 Sep 2026, 02:45:10 PM)
  relativeTime: string; // e.g. "Just now", "2m ago"
  device: string; // e.g. "Samsung Galaxy A32 (Android 14)"
  browser: string; // e.g. "Chrome Mobile 128"
  ipAddress: string; // e.g. "39.40.182.44"
  isp: string; // e.g. "Jazz 4G", "Nayatel Fiber", "PTCL Flash Fiber"
  city: string; // e.g. "Lahore, Punjab"
  status: 'success' | 'failed_credentials' | 'blocked_pending_approval' | 'suspended_account';
  authMethod: 'Gmail & Password' | 'Phone & Password' | 'Quick Session' | 'Registration Login';
  sessionStatus: 'active_online' | 'idle' | 'logged_out';
  approvalStatus: 'approved' | 'pending_approval' | 'rejected';
  loginNotes?: string;
}

export interface VideoCampaign {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  channelName: string;
  category: 'Tech & Reviews' | 'Entertainment' | 'Education' | 'Islamic & Culture' | 'Gaming' | 'News & Politics' | 'Lifestyle';
  videoUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  platform: 'youtube' | 'vimeo' | 'direct';
  targetWatchSeconds: number;
  totalTargetViews: number;
  viewsDelivered: number;
  rewardPerViewPKR: number; // Worker gets this amount
  costPerViewPKR: number;   // Advertiser pays this amount
  totalCostPKR: number;
  remainingBudgetPKR: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  gateway: PaymentGateway;
  accountTitle: string;
  senderNumber: string;
  transactionId: string; // TID from SMS
  amountPKR: number;
  screenshotUrl: string; // Base64 or sample proof
  status: 'pending' | 'approved' | 'rejected';
  depositType?: 'campaign_budget' | 'worker_activation';
  paymentDescription?: string; // e.g. "Ali Abbas na 500 rupees deposit kia hen sabir k account men"
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  gateway: PaymentGateway;
  accountTitle: string;
  mobileNumber: string;
  amountPKR: number;
  feePKR: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface ViewHistoryRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  campaignId: string;
  videoTitle: string;
  durationSeconds: number; // Required duration (e.g. 60s)
  watchedSeconds: number;  // Seconds actually watched (e.g. 60s or 24s)
  watchPercentage: number; // 0 to 100%
  isFullyWatched: boolean; // true = 100% video completed, false = abandoned/partial
  rewardPKR: number;
  status: 'completed_full' | 'partial_abandoned';
  watchedAt: number; // Timestamp (ms)
  city?: string;
}

export interface PlatformConfig {
  minWithdrawalPKR: number;
  workerActivationFeePKR: number; // Standard: 1,000 PKR
  referralDiscountPKR: number;    // Discount with referral code: 100 PKR (Pay: 900 PKR)
  referralCommissionPKR: number;  // Referrer bonus: 100 PKR
  officialAccounts: {
    jazzcash: {
      accountNumber: string;
      accountTitle: string;
      instructions: string;
    };
    easypaisa: {
      accountNumber: string;
      accountTitle: string;
      instructions: string;
    };
  };
  durationRates: {
    duration: WatchDuration;
    workerRewardPKR: number;
    advertiserCostPKR: number;
  }[];
}

export const PLATFORM_CONFIG: PlatformConfig = {
  minWithdrawalPKR: 500,
  workerActivationFeePKR: 1000,
  referralDiscountPKR: 100,
  referralCommissionPKR: 100,
  officialAccounts: {
    jazzcash: {
      accountNumber: '03264022010',
      accountTitle: 'Sabir Hussain',
      instructions: 'Open JazzCash App -> Send Money -> JazzCash Transfer -> Enter 03264022010 -> Title: Sabir Hussain -> Enter Amount -> Note down the 12-digit TID from 8558 SMS and enter below.'
    },
    easypaisa: {
      accountNumber: '03264022010',
      accountTitle: 'Sabir Hussain',
      instructions: 'Open EasyPaisa App -> Send Money -> EasyPaisa Transfer -> Enter 03264022010 -> Title: Sabir Hussain -> Enter Amount -> Note down the 11-digit TID from 3737 SMS and enter below.'
    }
  },
  durationRates: [
    { duration: 30, workerRewardPKR: 1.50, advertiserCostPKR: 2.25 },
    { duration: 60, workerRewardPKR: 3.00, advertiserCostPKR: 4.50 },
    { duration: 90, workerRewardPKR: 4.50, advertiserCostPKR: 6.75 },
    { duration: 120, workerRewardPKR: 6.50, advertiserCostPKR: 9.50 }
  ]
};
