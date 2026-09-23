import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentGateway, PLATFORM_CONFIG, VideoCampaign, WatchDuration } from '../types';
import { formatPKR, parseVideoUrl } from '../utils/video';
import {
  Video,
  PlusCircle,
  Copy,
  Check,
  Upload,
  Coins,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Clock,
  Eye,
  DollarSign,
  AlertCircle,
  Sparkles,
  Smartphone,
  Layers,
  Users
} from 'lucide-react';
import { PaymentLogo } from './PaymentLogo';

export const AdvertiserDashboard: React.FC = () => {
  const {
    currentUser,
    campaigns,
    createCampaign,
    toggleCampaignStatus,
    deleteCampaign,
    deposits,
    submitDeposit,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'new-campaign' | 'deposit'>('campaigns');

  // New Campaign Form State
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channelName, setChannelName] = useState(currentUser.name || 'Pak Media Creator');
  const [category, setCategory] = useState<VideoCampaign['category']>('Tech & Reviews');
  const [targetWatchSeconds, setTargetWatchSeconds] = useState<WatchDuration>(60);
  const [totalTargetViews, setTotalTargetViews] = useState<number>(500);
  const [campaignError, setCampaignError] = useState('');

  // Deposit Form State
  const [depositGateway, setDepositGateway] = useState<PaymentGateway>('jazzcash');
  const [depositAccountTitle, setDepositAccountTitle] = useState('');
  const [depositSenderNumber, setDepositSenderNumber] = useState('');
  const [depositTID, setDepositTID] = useState('');
  const [depositAmount, setDepositAmount] = useState<number>(2000);
  const [depositScreenshot, setDepositScreenshot] = useState<string>('');
  const [depositError, setDepositError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${text} to clipboard!`, 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Live video preview
  const parsedPreview = videoUrl.trim() ? parseVideoUrl(videoUrl) : null;

  // Rate calculation
  const currentRate = PLATFORM_CONFIG.durationRates.find((r) => r.duration === targetWatchSeconds) || PLATFORM_CONFIG.durationRates[1];
  const calculatedTotalCost = Number((currentRate.advertiserCostPKR * totalTargetViews).toFixed(2));
  const workerPayoutTotal = Number((currentRate.workerRewardPKR * totalTargetViews).toFixed(2));
  const platformFee = Number((calculatedTotalCost - workerPayoutTotal).toFixed(2));

  // Filter creator's campaigns
  const myCampaigns = campaigns.filter((c) => c.creatorId === currentUser.id);

  // Handle image upload for deposit screenshot
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCampaignError('');

    if (!videoUrl.trim()) {
      setCampaignError('Please enter a valid YouTube or Vimeo video link.');
      return;
    }
    if (!title.trim()) {
      setCampaignError('Please provide a descriptive video campaign title.');
      return;
    }

    const res = createCampaign({
      title,
      channelName,
      category,
      videoUrl,
      targetWatchSeconds,
      totalTargetViews,
    });

    if (res.success) {
      setVideoUrl('');
      setTitle('');
      setActiveTab('campaigns');
    } else {
      setCampaignError(res.error || 'Failed to create campaign.');
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');

    if (!depositAccountTitle.trim()) {
      setDepositError('Account Title is required.');
      return;
    }
    if (!depositTID.trim()) {
      setDepositError('Transaction ID (TID) from JazzCash/EasyPaisa SMS is required.');
      return;
    }

    const res = submitDeposit({
      gateway: depositGateway,
      accountTitle: depositAccountTitle.trim(),
      senderNumber: depositSenderNumber.trim(),
      transactionId: depositTID.trim(),
      amountPKR: depositAmount,
      screenshotUrl: depositScreenshot,
    });

    if (res.success) {
      setDepositTID('');
      setDepositScreenshot('');
      setActiveTab('deposit');
    } else {
      setDepositError(res.error || 'Failed to submit deposit.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Ad Budget Overview */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Video className="w-3.5 h-3.5" />
            <span>Advertiser Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Promote Videos to Pakistani Viewers
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Real human watch-time with active tab detection and verified retention.
          </p>
        </div>

        {/* Deposit Balance Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-2.5 min-w-[240px]">
          <div className="text-xs text-slate-400 font-medium">Available Ad Budget</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {formatPKR(currentUser.depositBalancePKR)}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setActiveTab('deposit')}
              className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('new-campaign')}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              New Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'bg-emerald-500 text-gray-950'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          My Campaigns ({myCampaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('new-campaign')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'new-campaign'
              ? 'bg-emerald-500 text-gray-950'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create Video Campaign
        </button>

        <button
          onClick={() => setActiveTab('deposit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'deposit'
              ? 'bg-emerald-500 text-gray-950'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Deposit Funds (JazzCash / EasyPaisa)
        </button>
      </div>

      {/* Tab 1: My Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {myCampaigns.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Campaigns Yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
                You haven't launched any video campaigns yet. Deposit funds via JazzCash or EasyPaisa to start driving targeted Pakistani views!
              </p>
              <button
                onClick={() => setActiveTab('new-campaign')}
                className="mt-4 px-5 py-2.5 bg-emerald-500 text-gray-950 font-bold rounded-xl text-xs"
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCampaigns.map((camp) => {
                const percent = Math.min(100, Math.round((camp.viewsDelivered / camp.totalTargetViews) * 100));
                return (
                  <div
                    key={camp.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-gray-700 transition"
                  >
                    <div>
                      {/* Thumbnail header */}
                      <div className="relative aspect-video bg-black">
                        <img
                          src={camp.thumbnailUrl}
                          alt={camp.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-gray-950/80 backdrop-blur-md text-[10px] font-bold text-gray-300">
                          {camp.category}
                        </div>
                        <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          camp.status === 'active'
                            ? 'bg-emerald-500/90 text-gray-950'
                            : camp.status === 'paused'
                            ? 'bg-amber-500/90 text-gray-950'
                            : 'bg-blue-500/90 text-white'
                        }`}>
                          {camp.status}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="text-[11px] text-gray-400">{camp.channelName}</div>
                          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight mt-0.5">
                            {camp.title}
                          </h3>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 bg-gray-950 p-2.5 rounded-xl border border-gray-800 text-center">
                          <div>
                            <span className="text-[10px] text-gray-400">Views Delivered</span>
                            <div className="text-sm font-black text-white">
                              {camp.viewsDelivered} / {camp.totalTargetViews}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400">Remaining Budget</span>
                            <div className="text-sm font-black text-emerald-400">
                              {formatPKR(camp.remainingBudgetPKR)}
                            </div>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-gray-400">
                            <span>Delivery Progress</span>
                            <span className="font-semibold text-white">{percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                          <span>Target Time: <strong className="text-white">{camp.targetWatchSeconds}s</strong></span>
                          <span>Worker Payout: <strong className="text-emerald-400">{formatPKR(camp.rewardPerViewPKR)}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => toggleCampaignStatus(camp.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          camp.status === 'active'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {camp.status === 'active' ? (
                          <>
                            <Pause className="w-3.5 h-3.5" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Resume
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => deleteCampaign(camp.id)}
                        className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                        title="Delete & Refund Unused Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Create Video Campaign */}
      {activeTab === 'new-campaign' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Create New Video Campaign</h2>
              <p className="text-xs text-gray-400">Specify your video link, target duration, and required Pakistani views.</p>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-4">
              
              {/* Video URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Video URL (YouTube or Vimeo)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-gray-400">Supports standard links, youtu.be, shorts, and Vimeo links.</span>
              </div>

              {/* Title & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Campaign / Video Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Viral Vlog in Islamabad"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Channel / Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tech Studio PK"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VideoCampaign['category'])}
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tech & Reviews">Tech & Reviews</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Islamic & Culture">Islamic & Culture</option>
                  <option value="News & Politics">News & Politics</option>
                </select>
              </div>

              {/* Duration Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Target Watch Duration (Seconds)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PLATFORM_CONFIG.durationRates.map((r) => (
                    <div
                      key={r.duration}
                      onClick={() => setTargetWatchSeconds(r.duration)}
                      className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                        targetWatchSeconds === r.duration
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div className="text-base font-black text-white">{r.duration}s</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{r.advertiserCostPKR.toFixed(2)} PKR / view</div>
                      <div className="text-[10px] text-emerald-400 font-bold mt-1">
                        Worker: {r.workerRewardPKR.toFixed(2)} PKR
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Views Slider & Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-300">
                    Total Required Views
                  </label>
                  <span className="text-sm font-bold text-white">
                    {totalTargetViews.toLocaleString()} Views
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={totalTargetViews}
                  onChange={(e) => setTotalTargetViews(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex items-center gap-2 mt-2">
                  {[100, 250, 500, 1000, 2500].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setTotalTargetViews(v)}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {campaignError && (
                <p className="text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
                  {campaignError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Launch Campaign ({formatPKR(calculatedTotalCost)})
              </button>

            </form>
          </div>

          {/* Cost Calculator Sidebar */}
          <div className="space-y-4">
            
            {/* Live Cost Breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Live Campaign Budget Calculator
              </h3>

              <div className="space-y-2 text-xs divide-y divide-gray-800">
                <div className="flex justify-between py-1.5 text-gray-400">
                  <span>Target Watch Time</span>
                  <span className="font-semibold text-white">{targetWatchSeconds} Seconds</span>
                </div>
                <div className="flex justify-between py-1.5 text-gray-400">
                  <span>Requested Views</span>
                  <span className="font-semibold text-white">{totalTargetViews.toLocaleString()} Views</span>
                </div>
                <div className="flex justify-between py-1.5 text-gray-400">
                  <span>Rate Per View</span>
                  <span className="font-semibold text-white">{currentRate.advertiserCostPKR.toFixed(2)} PKR</span>
                </div>
                <div className="flex justify-between py-1.5 text-emerald-400 font-semibold">
                  <span>Worker Payout Pool (70%)</span>
                  <span>{formatPKR(workerPayoutTotal)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-gray-400">
                  <span>Platform Anti-Cheat & Verification</span>
                  <span>{formatPKR(platformFee)}</span>
                </div>
                <div className="flex justify-between pt-3 text-sm font-black text-white">
                  <span>Total Campaign Cost:</span>
                  <span className="text-emerald-400">{formatPKR(calculatedTotalCost)}</span>
                </div>
              </div>

              {/* Balance Check */}
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Your Deposit Balance:</span>
                  <span className="font-bold text-white">{formatPKR(currentUser.depositBalancePKR)}</span>
                </div>
                {currentUser.depositBalancePKR < calculatedTotalCost && (
                  <p className="text-[11px] text-rose-400 pt-1">
                    ⚠️ Short by {formatPKR(calculatedTotalCost - currentUser.depositBalancePKR)}. Please deposit funds first.
                  </p>
                )}
              </div>

              {currentUser.depositBalancePKR < calculatedTotalCost && (
                <button
                  type="button"
                  onClick={() => setActiveTab('deposit')}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-xs transition"
                >
                  Deposit Funds via JazzCash / EasyPaisa
                </button>
              )}
            </div>

            {/* Preview Card */}
            {parsedPreview && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-semibold text-gray-400">Video Preview</span>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <img
                    src={parsedPreview.thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-gray-300 font-medium truncate">
                  Platform: {parsedPreview.platform.toUpperCase()}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Tab 3: Deposit Funds (Manual Local Gateways) */}
      {activeTab === 'deposit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Official Account Details */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Official Receiving Accounts (Sabir Hussain)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Transfer funds to Sabir Hussain and enter your TID in the form below for verification.
                </p>
              </div>

              {/* JazzCash Official Account Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 to-gray-950 border border-rose-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <PaymentLogo gateway="jazzcash" size="sm" />
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded">SMS: 8558</span>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400">Account Title:</div>
                  <div className="text-xs font-bold text-white">
                    Sabir Hussain
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400">Mobile Number:</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-base font-black text-white font-mono">
                      03264022010
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('03264022010', 'jc_acc')}
                      className="p-1.5 text-gray-400 hover:text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                    >
                      {copiedKey === 'jc_acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* EasyPaisa Official Account Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-gray-950 border border-emerald-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <PaymentLogo gateway="easypaisa" size="sm" />
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">SMS: 3737</span>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400">Account Title:</div>
                  <div className="text-xs font-bold text-white">
                    Sabir Hussain
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400">Mobile Number:</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-base font-black text-white font-mono">
                      03264022010
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('03264022010', 'ep_acc')}
                      className="p-1.5 text-gray-400 hover:text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                    >
                      {copiedKey === 'ep_acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-[11px] text-gray-400">
                💡 <strong>Verification Workflow:</strong> Sabir Hussain verifies incoming TIDs and approves credit directly to your advertising balance.
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white">Submit Deposit Receipt & Details</h2>
                <p className="text-xs text-gray-400">Enter the amount deposited to Sabir Hussain's account along with the TID.</p>
              </div>

              {/* Example Notice */}
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs space-y-1">
                <span className="font-bold text-blue-300 block">
                  Workflow Summary:
                </span>
                <p className="text-gray-300">
                  Advertiser deposits funds into Sabir Hussain's account (03264022010) and submits TID. Admin manually verifies and marks payment received to unlock budget.
                </p>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4">
                
                {/* Gateway */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Select Payment Method:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setDepositGateway('jazzcash')}
                      className={`p-3 rounded-xl border cursor-pointer text-center transition flex flex-col items-center justify-center gap-1 ${
                        depositGateway === 'jazzcash'
                          ? 'bg-rose-950/40 border-rose-500 text-white ring-1 ring-rose-500'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <PaymentLogo gateway="jazzcash" size="sm" />
                      <div className="text-[10px] text-gray-400">SMS Sender: 8558</div>
                    </div>

                    <div
                      onClick={() => setDepositGateway('easypaisa')}
                      className={`p-3 rounded-xl border cursor-pointer text-center transition flex flex-col items-center justify-center gap-1 ${
                        depositGateway === 'easypaisa'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <PaymentLogo gateway="easypaisa" size="sm" />
                      <div className="text-[10px] text-gray-400">SMS Sender: 3737</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sender Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Sender Account Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ali Abbas"
                      value={depositAccountTitle}
                      onChange={(e) => setDepositAccountTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Sender Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Sender Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="03211234567"
                      value={depositSenderNumber}
                      onChange={(e) => setDepositSenderNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Deposit Amount (PKR)
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={50}
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* TID */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Transaction ID (TID from SMS)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JC849201934 or EP9382710"
                      value={depositTID}
                      onChange={(e) => setDepositTID(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                {/* Live Message Preview */}
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs">
                  <span className="text-gray-400 text-[10px] block font-bold uppercase tracking-wider mb-1">
                    Message Sent to Admin:
                  </span>
                  <p className="text-gray-200 italic font-medium">
                    "{depositAccountTitle || 'Ali Abbas'} deposited {depositAmount} PKR to Sabir Hussain ({depositGateway === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}: 03264022010). TID: {depositTID.trim().toUpperCase() || 'JC849201934'}"
                  </p>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Payment Receipt Screenshot Proof
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-800 border-dashed rounded-xl hover:border-emerald-500/50 transition">
                    <div className="space-y-1 text-center">
                      {depositScreenshot ? (
                        <div className="space-y-2">
                          <img
                            src={depositScreenshot}
                            alt="Screenshot Preview"
                            className="max-h-36 mx-auto rounded-lg shadow"
                          />
                          <button
                            type="button"
                            onClick={() => setDepositScreenshot('')}
                            className="text-xs text-rose-400 hover:underline"
                          >
                            Remove / Change Image
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-8 w-8 text-gray-500" />
                          <div className="flex text-xs text-gray-400 justify-center">
                            <label className="relative cursor-pointer rounded-md font-bold text-emerald-400 hover:text-emerald-300 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleScreenshotChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-[10px] text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {depositError && (
                  <p className="text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
                    {depositError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black rounded-xl text-sm shadow-md transition cursor-pointer"
                >
                  Submit Deposit Ticket ({formatPKR(depositAmount)})
                </button>

              </form>
            </div>

            {/* Deposit History */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Your Submitted Deposits</h3>
              
              {deposits.filter((d) => d.userId === currentUser.id).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No deposits submitted yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {deposits
                    .filter((d) => d.userId === currentUser.id)
                    .map((dep) => (
                      <div
                        key={dep.id}
                        className="p-3 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white">
                              TID: {dep.transactionId}
                            </span>
                            <PaymentLogo gateway={dep.gateway} size="sm" />
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {dep.accountTitle} • {new Date(dep.createdAt).toLocaleDateString()}
                          </div>
                          {dep.paymentDescription && (
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              "{dep.paymentDescription}"
                            </div>
                          )}
                          {dep.adminNotes && (
                            <div className="text-[10px] text-emerald-400 italic">
                              {dep.adminNotes}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-white">
                            {formatPKR(dep.amountPKR)}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              dep.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : dep.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400 animate-pulse'
                            }`}
                          >
                            {dep.status === 'approved' ? 'Approved & Credited' : dep.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
