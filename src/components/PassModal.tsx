import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ticket, 
  CheckCircle2, 
  Check, 
  Zap, 
  Sparkles, 
  CreditCard, 
  Tag, 
  Crown, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  RefreshCw,
  KeyRound, 
  Mail, 
  Send,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { Quiz } from '../types';
import { 
  PASS_PLANS, 
  PassPlanType, 
  validatePromoCode, 
  activatePassWithRazorpay,
  restorePassAndWallet, 
  redeemAdminActivationCode, 
  createMailRecoveryUrl,
  isPassActive, 
  getPassData, 
  getPendingReferralCode, 
  ADMIN_EMAIL
} from '../lib/passSystem';
import { openRazorpayStandardCheckout } from '../lib/razorpay';

interface PassModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetQuiz?: Quiz | null;
  onUnlocked?: () => void;
  onOpenReferAndEarn?: () => void;
}

export const PassModal: React.FC<PassModalProps> = ({
  isOpen,
  onClose,
  targetQuiz,
  onUnlocked,
  onOpenReferAndEarn
}) => {
  const [activeTab, setActiveTab] = useState<'pay' | 'restore'>('pay');
  const [selectedPlan, setSelectedPlan] = useState<PassPlanType>('lifetime_99');
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Candidate Details Form State
  const [candidateName, setCandidateName] = useState<string>('');
  const [candidatePhone, setCandidatePhone] = useState<string>('');
  const [candidateEmail, setCandidateEmail] = useState<string>('');

  // Payment Status State
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isSuccessUnlocked, setIsSuccessUnlocked] = useState<boolean>(false);
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>('');
  const [formFeedback, setFormFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Restore Form State
  const [restoreQuery, setRestoreQuery] = useState<string>('');
  const [adminCodeInput, setAdminCodeInput] = useState<string>('');
  const [restoreFeedback, setRestoreFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [isRedeemingCode, setIsRedeemingCode] = useState<boolean>(false);

  const isAlreadyActive = isPassActive();
  const currentPass = getPassData();

  // Price calculations based on selected plan
  const planConfig = PASS_PLANS[selectedPlan] || PASS_PLANS.lifetime_99;
  const finalPrice = appliedPromo ? planConfig.discountedPrice : planConfig.regularPrice;

  // Auto-fill pending referral from URL on open
  useEffect(() => {
    if (isOpen) {
      const pending = getPendingReferralCode();
      if (pending && !appliedPromo) {
        setPromoInput(pending);
        const res = validatePromoCode(pending, selectedPlan);
        if (res.isValid) {
          setAppliedPromo(pending);
          setPromoMessage({ text: res.message, isError: false });
        }
      }
      setFormFeedback(null);
      setRestoreFeedback(null);
      setIsProcessingPayment(false);
      setIsSuccessUnlocked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
      setAppliedPromo(null);
      setPromoMessage(null);
      return;
    }
    const res = validatePromoCode(promoInput, selectedPlan);
    if (res.isValid) {
      setAppliedPromo(promoInput.trim().toUpperCase());
      setPromoMessage({ text: res.message, isError: false });
    } else {
      setAppliedPromo(null);
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  const handleSelectPlan = (plan: PassPlanType) => {
    setSelectedPlan(plan);
    if (appliedPromo) {
      const res = validatePromoCode(appliedPromo, plan);
      setPromoMessage({ text: res.message, isError: !res.isValid });
    }
  };

  // 🚀 Initiate Razorpay Standard Checkout
  const handlePayWithRazorpay = async () => {
    setIsProcessingPayment(true);
    setFormFeedback(null);

    await openRazorpayStandardCheckout({
      planType: selectedPlan,
      amount: finalPrice,
      candidateName: candidateName || 'Candidate',
      candidatePhone: candidatePhone || '9876543210',
      candidateEmail: candidateEmail || 'student@dsssbpyq.online',
      promoCode: appliedPromo,
      onSuccess: async (paymentResult) => {
        setIsProcessingPayment(false);
        // Activate pass with verified signature
        const actRes = await activatePassWithRazorpay({
          paymentId: paymentResult.payment_id,
          orderId: paymentResult.order_id,
          planType: selectedPlan,
          amount: finalPrice,
          phone: candidatePhone || '9876543210',
          candidateName: candidateName || 'Candidate',
          appliedPromo: appliedPromo || null,
        });

        if (actRes.success) {
          setIsSuccessUnlocked(true);
          setConfirmedPaymentId(paymentResult.payment_id);
          setFormFeedback({ text: actRes.message, isError: false });

          if (onUnlocked) onUnlocked();

          // Auto-return smoothly to the test
          setTimeout(() => {
            onClose();
          }, 1800);
        } else {
          setFormFeedback({ text: actRes.message, isError: true });
        }
      },
      onFailure: (errorMessage) => {
        setIsProcessingPayment(false);
        setFormFeedback({ text: `Payment Notice: ${errorMessage}`, isError: true });
      },
      onDismiss: () => {
        setIsProcessingPayment(false);
      },
    });
  };

  // Restore Pass via Phone / Payment ID
  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreFeedback(null);
    setIsRestoring(true);

    const result = await restorePassAndWallet(restoreQuery);
    setIsRestoring(false);

    if (result.success) {
      setRestoreFeedback({ text: `${result.message} Returning to practice...`, isError: false });
      if (onUnlocked) onUnlocked();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setRestoreFeedback({ text: result.message, isError: true });
    }
  };

  // Redeem 1-Time Restore Code from Support
  const handleRedeemAdminCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreFeedback(null);
    setIsRedeemingCode(true);

    const result = await redeemAdminActivationCode(adminCodeInput, candidatePhone);
    setIsRedeemingCode(false);

    if (result.success) {
      setRestoreFeedback({ text: `${result.message} Returning to practice...`, isError: false });
      if (onUnlocked) onUnlocked();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setRestoreFeedback({ text: result.message, isError: true });
    }
  };

  const emailRecoveryUrl = createMailRecoveryUrl(planConfig.name, confirmedPaymentId || restoreQuery, candidatePhone, candidateName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-300 dark:border-indigo-600/70 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-5 text-white shrink-0">
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                <Ticket className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-xs">
                    RAZORPAY SECURE
                  </span>
                  <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                    Instant Auto-Verification
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                  DSSSB CBT Mock Pass
                </h2>
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

          <p className="mt-2 text-xs sm:text-sm font-semibold text-indigo-100 relative z-10">
            {targetQuiz ? (
              <span>Locked: <strong>{targetQuiz.title}</strong>. UPI, Cards, Netbanking &amp; Wallets supported. First 2 mocks free!</span>
            ) : (
              <span>First 2 Mocks 100% Free • ₹99 Lifetime • ₹49 (3 Months) • ₹19 (1 Month)</span>
            )}
          </p>

          {/* Tab Switcher */}
          <div className="mt-3 flex items-center gap-2 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('pay')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'pay'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              💳 Razorpay Instant Checkout
            </button>

            <button
              onClick={() => setActiveTab('restore')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'restore'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              🔄 Restore Pass / Cleared Cache
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">

          {/* Already Active Notice */}
          {isAlreadyActive && (
            <div className="p-3.5 rounded-2xl border-2 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white">
                  VIP Mock Pass is Active! ({currentPass?.plan === 'lifetime_99' ? 'Lifetime Pass' : currentPass?.plan === 'standard_49' ? '3 Months Pass' : '1 Month Pass'})
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                  Payment Ref: <code className="font-mono font-bold">{currentPass?.utr}</code> • All 50+ mock tests are completely unlocked!
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS CELEBRATION SCREEN */}
          {isSuccessUnlocked ? (
            <div className="p-8 text-center bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 rounded-3xl border-2 border-emerald-400 shadow-lg space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <div>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  PAYMENT VERIFIED • PLAN ACTIVE
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  🎉 {planConfig.name} Activated!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Payment ID: <code className="font-mono font-black text-emerald-700 dark:text-emerald-300">{confirmedPaymentId}</code>
                </p>
              </div>

              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-200">
                ⚡ <strong>Returning to test practice...</strong> All 50+ mock tests and bilingual solutions are now unlocked.
              </div>
            </div>
          ) : activeTab === 'pay' ? (
            <>
              {/* 3 PLAN SELECTOR CARDS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Select Your Plan:
                  </label>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    100% Ad-Free • Instant Auto-Unlock
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Plan 1: ₹19 */}
                  <div
                    onClick={() => handleSelectPlan('monthly_19')}
                    className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === 'monthly_19'
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 shadow-sm ring-1 ring-indigo-500'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {PASS_PLANS.monthly_19.badge}
                      </span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'monthly_19' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                        {selectedPlan === 'monthly_19' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">1 Month Plan</h4>
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{PASS_PLANS.monthly_19.regularPrice}
                      </span>
                      <span className="text-[10px] text-slate-500">/ 30 Days</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                      Full mock access for 30 days. Perfect for fast revision.
                    </p>
                  </div>

                  {/* Plan 2: ₹49 */}
                  <div
                    onClick={() => handleSelectPlan('standard_49')}
                    className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === 'standard_49'
                        ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-600 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white font-black">
                        {PASS_PLANS.standard_49.badge}
                      </span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'standard_49' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                        {selectedPlan === 'standard_49' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">3 Months Plan</h4>
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{appliedPromo ? PASS_PLANS.standard_49.discountedPrice : PASS_PLANS.standard_49.regularPrice}
                      </span>
                      {appliedPromo && (
                        <span className="text-xs text-slate-400 line-through">₹{PASS_PLANS.standard_49.regularPrice}</span>
                      )}
                      <span className="text-[10px] text-slate-500">/ 90 Days</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                      All mocks + newly added tests for 90 days. Referrer earns ₹10!
                    </p>
                  </div>

                  {/* Plan 3: ₹99 */}
                  <div
                    onClick={() => handleSelectPlan('lifetime_99')}
                    className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === 'lifetime_99'
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-sm ring-1 ring-amber-400'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black">
                        {PASS_PLANS.lifetime_99.badge}
                      </span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'lifetime_99' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'}`}>
                        {selectedPlan === 'lifetime_99' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      Lifetime Plan
                    </h4>
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{appliedPromo ? PASS_PLANS.lifetime_99.discountedPrice : PASS_PLANS.lifetime_99.regularPrice}
                      </span>
                      {appliedPromo && (
                        <span className="text-xs text-slate-400 line-through">₹{PASS_PLANS.lifetime_99.regularPrice}</span>
                      )}
                      <span className="text-[10px] text-amber-600 font-bold">Forever</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                      Never expires • All 50+ Current &amp; Future Mocks. Referrer earns ₹15!
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Code Input Bar */}
              <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Have a Referral / Promo Code?"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white uppercase placeholder:normal-case focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {promoMessage && (
                  <p className={`text-[11px] font-bold ${promoMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Candidate Details & Razorpay Checkout Box */}
              <div className="bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-800/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black uppercase text-indigo-800 dark:text-indigo-300 tracking-wider">
                      Razorpay Standard Checkout (₹{finalPrice})
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    UPI • GPay • PhonePe • Cards • Netbanking
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Candidate Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Mobile Number (For account backup)
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Main Razorpay Action Button */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePayWithRazorpay}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Opening Razorpay Secure Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Proceed to Pay ₹{finalPrice} with Razorpay</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit Encrypted • 100% Secure • Instant Auto-Activation</span>
                  </div>
                </div>

              </div>

              {/* Form Feedback Toast */}
              {formFeedback && (
                <div className={`p-3 rounded-xl text-xs font-bold border ${formFeedback.isError ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                  {formFeedback.text}
                </div>
              )}
            </>
          ) : (
            /* TAB 2: RESTORE PASS (IF USER CLEARED CACHE / NEW DEVICE) */
            <div className="space-y-4">
              
              {/* Notice Banner */}
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                <strong>💡 Cleared your browser cache or changed devices?</strong><br />
                Your purchase is never lost! Restore your access immediately using your Razorpay payment ID, mobile number, 1-click email request, or support restore code.
              </div>

              {/* Option 1: 1-Click Request Recovery via Email */}
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/40 border-2 border-indigo-300 dark:border-indigo-700/80 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Request Pass Recovery by Email</span>
                  </span>
                  <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-extrabold px-2 py-0.5 rounded-full">
                    Official Support
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Send an email with your Razorpay payment ID / Mobile number to our support team at <strong className="font-mono text-indigo-600 dark:text-indigo-400">{ADMIN_EMAIL}</strong>. We will verify and send your 1-time restore code immediately.
                </p>

                <a
                  href={emailRecoveryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Email with Payment Details</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>

              {/* Option 2: Search & Restore via Payment ID or Phone */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Instant Database Search via Payment ID / Phone
                  </h3>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enter your Razorpay payment ID (e.g. <code className="font-mono font-bold">pay_...</code>) or mobile number:
                </p>

                <form onSubmit={handleRestore} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="e.g. pay_QXXXXXXXXXXXXX or 9876543210"
                    value={restoreQuery}
                    onChange={(e) => setRestoreQuery(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white uppercase font-mono focus:outline-hidden focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={isRestoring || !restoreQuery.trim()}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isRestoring ? 'Searching Database...' : 'Restore Pass via Payment ID / Phone'}</span>
                  </button>
                </form>
              </div>

              {/* Option 3: Redeem Support 1-Time Restore Code */}
              <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Redeem 1-Time Support Restore Code</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  If support gave you a restore code (e.g. <code className="font-mono font-bold">DSSSB-LIFE-XXXX</code>), enter it below:
                </p>
                <form onSubmit={handleRedeemAdminCode} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter Code (e.g. DSSSB-LIFE-8821)"
                    value={adminCodeInput}
                    onChange={(e) => setAdminCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-xl text-xs font-mono font-black text-slate-900 dark:text-white uppercase focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isRedeemingCode || !adminCodeInput.trim()}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isRedeemingCode ? 'Redeeming...' : 'Unlock'}</span>
                  </button>
                </form>
              </div>

              {restoreFeedback && (
                <div className={`p-3 rounded-xl text-xs font-bold border ${restoreFeedback.isError ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                  {restoreFeedback.text}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default PassModal;
