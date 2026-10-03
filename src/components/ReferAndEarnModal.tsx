import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  TrendingUp, 
  Wallet, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Edit2, 
  Zap,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { 
  getOrCreateReferralWallet, 
  subscribeToReferralWallet, 
  customizeReferralCode, 
  requestReferralPayout, 
  getPayoutRequests,
  restorePassAndWallet,
  MIN_WITHDRAWAL_THRESHOLD,
  ReferralWallet,
  PayoutRequest
} from '../lib/passSystem';

interface ReferAndEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPass?: () => void;
}

export const ReferAndEarnModal: React.FC<ReferAndEarnModalProps> = ({
  isOpen,
  onClose
}) => {
  const [wallet, setWallet] = useState<ReferralWallet>(getOrCreateReferralWallet());
  const [payouts, setPayouts] = useState<PayoutRequest[]>(getPayoutRequests());
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Edit custom code states
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState(wallet.code);
  const [codeEditError, setCodeEditError] = useState<string | null>(null);

  // Payout form states (Direct UPI / Bank Payouts)
  const [payoutUpi, setPayoutUpi] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutFeedback, setPayoutFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Cache Recovery state
  const [showRestoreBox, setShowRestoreBox] = useState(false);
  const [restorePhone, setRestorePhone] = useState('');
  const [restoreFeedback, setRestoreFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWallet(getOrCreateReferralWallet());
      setPayouts(getPayoutRequests());
      setNewCodeInput(getOrCreateReferralWallet().code);
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = subscribeToReferralWallet((updated) => {
      setWallet({ ...updated });
      setPayouts(getPayoutRequests());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dsssbpyq.online';
  const referralLink = `${currentUrl}/?ref=${wallet.code}`;

  const shareText = `🔥 Hey! Prepare for DSSSB TGT/PGT Computer Science 2026 with 50+ Full Subject & Part A Mocks!\n\nUse my Referral Code "${wallet.code}" to get instant discount!\nPlans: ₹99 Lifetime • ₹49 (3 Months) • ₹19 (1 Month)\nDirect Link: ${referralLink}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(wallet.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank');
  };

  const handleSaveCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeEditError(null);
    const res = customizeReferralCode(newCodeInput);
    if (res.success && res.wallet) {
      setWallet(res.wallet);
      setIsEditingCode(false);
    } else {
      setCodeEditError(res.message);
    }
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutFeedback(null);
    setPayoutLoading(true);

    setTimeout(() => {
      const res = requestReferralPayout(payoutUpi, payoutPhone);
      setPayoutLoading(false);
      if (res.success) {
        setPayoutFeedback({ text: res.message, isError: false });
        setPayoutUpi('');
        setPayoutPhone('');
        setPayouts(getPayoutRequests());
      } else {
        setPayoutFeedback({ text: res.message, isError: true });
      }
    }, 600);
  };

  const handleRestoreWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreFeedback(null);
    const res = await restorePassAndWallet(restorePhone);
    if (res.success) {
      setRestoreFeedback({ text: res.message, isError: false });
      if (res.wallet) setWallet(res.wallet);
      setPayouts(getPayoutRequests());
    } else {
      setRestoreFeedback({ text: res.message, isError: true });
    }
  };

  const progressPercent = Math.min(100, Math.round((wallet.balance / MIN_WITHDRAWAL_THRESHOLD) * 100));
  const isEligibleForWithdrawal = wallet.balance >= MIN_WITHDRAWAL_THRESHOLD;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-purple-300 dark:border-purple-700/80 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 p-4 sm:p-5 text-white">
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm text-amber-300 flex items-center justify-center shadow-lg border border-white/30 shrink-0">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-xs">
                  REAL CASH PAYOUTS
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                  Refer &amp; Earn Cash to UPI
                </h2>
                <p className="text-xs text-purple-100 font-semibold mt-0.5">
                  Earn ₹15 on Lifetime (₹99) • ₹10 on 3-Mos (₹49) • Redeem at ₹60!
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Revenue Breakdown Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-2xl border border-amber-300/80 dark:border-amber-700/60 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-300 block">Lifetime (₹99)</span>
              <div className="text-base font-black text-amber-600 dark:text-amber-400">
                +₹15 Cash
              </div>
              <span className="text-[9px] text-slate-500 font-bold block">per referral</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-2xl border border-blue-300/80 dark:border-blue-700/60 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-blue-800 dark:text-blue-300 block">3 Months (₹49)</span>
              <div className="text-base font-black text-blue-600 dark:text-blue-400">
                +₹10 Cash
              </div>
              <span className="text-[9px] text-slate-500 font-bold block">per referral</span>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-2xl border border-purple-300/80 dark:border-purple-700/60 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-purple-800 dark:text-purple-300 block">Redeem At</span>
              <div className="text-base font-black text-purple-700 dark:text-purple-300">
                ₹60 Minimum
              </div>
              <span className="text-[9px] text-slate-500 font-bold block">via Direct UPI Transfer</span>
            </div>
          </div>

          {/* User's Referral Link & Code Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Your Exclusive Referral Code
              </span>
              <button
                type="button"
                onClick={() => setIsEditingCode(!isEditingCode)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingCode ? 'Cancel' : 'Customize Code'}</span>
              </button>
            </div>

            {isEditingCode ? (
              <form onSubmit={handleSaveCustomCode} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. DSSSB-AMAN"
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-400 rounded-xl text-xs font-black text-slate-900 dark:text-white uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                <code className="text-base font-black text-purple-700 dark:text-purple-400 font-mono tracking-wider">
                  {wallet.code}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            )}

            {codeEditError && (
              <p className="text-[11px] font-bold text-rose-600">{codeEditError}</p>
            )}

            {/* Share Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleTelegramShare}
                className="py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>Telegram</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Referral Wallet Dashboard with ₹60 Threshold Progress */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/10 border-2 border-amber-300/80 dark:border-amber-600/70 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Your Earnings Wallet
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300">
                Redeem at ₹60
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block">Available Balance</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{wallet.balance}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block">Paid Referrals</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {wallet.paidReferrals}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block">Total Earned</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                  ₹{wallet.earnings}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold block">Withdrawn</span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                  ₹{wallet.withdrawn}
                </span>
              </div>
            </div>

            {/* Threshold Progress Bar (₹60 Target) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {isEligibleForWithdrawal 
                    ? '🎉 ₹60 Threshold Reached! You can withdraw your earnings now.'
                    : `Threshold Progress: ₹${wallet.balance} / ₹${MIN_WITHDRAWAL_THRESHOLD} (₹${MIN_WITHDRAWAL_THRESHOLD - wallet.balance} more to unlock payout)`}
                </span>
                <span className="text-amber-600 font-black">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    isEligibleForWithdrawal
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Direct UPI Payout Form */}
            {isEligibleForWithdrawal ? (
              <form onSubmit={handleRequestPayout} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2.5 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Direct UPI Redemption: Transfer ₹{wallet.balance} to UPI</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter your UPI ID (e.g. name@oksbi)"
                    value={payoutUpi}
                    onChange={(e) => setPayoutUpi(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Phone for SMS Receipt"
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{payoutLoading ? 'Submitting Payout Request...' : `Redeem ₹${wallet.balance} to UPI ID Now`}</span>
                </button>
              </form>
            ) : (
              <div className="p-3 bg-white/70 dark:bg-slate-900/70 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span>Reach ₹60 to unlock 1-click Direct UPI redemption.</span>
                <span className="font-extrabold text-[11px] underline cursor-pointer" onClick={handleWhatsAppShare}>
                  Share Now →
                </span>
              </div>
            )}

            {payoutFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${payoutFeedback.isError ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                {payoutFeedback.text}
              </div>
            )}
          </div>

          {/* Referred Members Breakdown Ledger */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Referred Members &amp; Earnings Log</span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-500">
                {wallet.referredMembers?.length || wallet.paidReferrals || 0} Registered
              </span>
            </div>

            {(!wallet.referredMembers || wallet.referredMembers.length === 0) ? (
              <p className="text-xs text-slate-500 py-2 text-center">
                No paid referrals yet. Share your referral link with candidate groups on WhatsApp &amp; Telegram to earn ₹15 or ₹10 per mock pass!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {wallet.referredMembers.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                    <div>
                      <span className="font-black text-slate-900 dark:text-white block">
                        {m.maskedBuyerId} • {m.planName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • via UPI
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 block">
                        +{m.commissionEarned > 0 ? `₹${m.commissionEarned}` : '₹0'}
                      </span>
                      <span className="text-[9px] text-slate-400">Credit</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cache Deletion & Persistent Account Recovery Tool */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Cleared Browser Cache? Restore Wallet Here</span>
              </span>
              <button
                type="button"
                onClick={() => setShowRestoreBox(!showRestoreBox)}
                className="text-indigo-600 dark:text-indigo-400 font-black text-xs hover:underline cursor-pointer"
              >
                {showRestoreBox ? 'Hide' : 'Restore'}
              </button>
            </div>

            {showRestoreBox && (
              <form onSubmit={handleRestoreWallet} className="space-y-2 pt-2 border-t border-indigo-200 dark:border-indigo-800/60">
                <p className="text-[11px] text-slate-500">
                  Enter the 10-digit mobile number or custom referral code you used previously to re-sync your balance and all referred members.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210 or DSSSB-AMAN"
                    value={restorePhone}
                    onChange={(e) => setRestorePhone(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shrink-0"
                  >
                    Sync
                  </button>
                </div>
                {restoreFeedback && (
                  <p className={`text-[11px] font-bold ${restoreFeedback.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {restoreFeedback.text}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Past Payouts History */}
          {payouts.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>UPI Payouts History</span>
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {payouts.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                        ₹{p.amount} to {p.upiId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • Ref: {p.id}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Transferred
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ReferAndEarnModal;
