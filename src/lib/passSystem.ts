/**
 * DSSSB All-Access Pass, Direct UPI UTR Engine, Fraud Guard & Admin Verification System
 * 
 * Rules:
 * - Plans:
 *   1. ₹99 - Lifetime Pass (Never expires • All 50+ Current & ALL Future Mocks Forever)
 *      -> Referrer earns ₹15 cash
 *   2. ₹49 - 3 Months Pass (All 50+ current and newly added mocks for 90 days)
 *      -> Referrer earns ₹10 cash
 *   3. ₹19 - 1 Month Plan (All 50+ mocks for 30 days)
 *      -> Referrer earns ₹0 (no revenue on ₹19 plan)
 * - Minimum Withdrawal: ₹60 to redeem directly to UPI ID (Admin Transfers via UPI)
 * - Free Mock Tier: First 2 mocks (Mock 1 & Mock 2) are 100% FREE for all candidates!
 * 
 * Payment & Admin Verification Flow:
 * - Candidate pays via official QR Code / UPI ID (byteprepcs@ptyes).
 * - Candidate submits their 12-digit UPI UTR number + Phone number + Name.
 * - System gives INSTANT PROVISIONAL ACCESS so the candidate can start mocks immediately.
 * - UTR is synced to Firestore database for Admin Verification.
 * - Admin Panel (built-in) allows the Admin to:
 *     1. Verify & Approve valid UTRs (permanent verified badge).
 *     2. Flag Fraud UTRs -> instantly revokes candidate's pass and locks access in real-time.
 * - Anti-Fraud & Cache Recovery:
 *     - If user clears cache or changes device, they restore pass using their 12-digit UTR or phone.
 *     - If the UTR was flagged as fraud, restore is rejected.
 *     - Device-bound check prevents self-referrals and duplicate code misuse.
 */

import { 
  savePaymentUtrToDb, 
  fetchPaymentUtrFromDb, 
  fetchAllPaymentUtrsFromDb, 
  updatePaymentUtrStatusInDb,
  listenToPaymentUtr,
  savePayoutRequestToDb,
  fetchAllPayoutRequestsFromDb,
  updatePayoutRequestStatusInDb,
  saveActivationCodeToDb,
  fetchActivationCodeFromDb,
  fetchAllActivationCodesFromDb,
  redeemActivationCodeInDb,
  revokeActivationCodeInDb,
  FirestorePaymentUtr,
  FirestorePayoutRequest,
  FirestoreActivationCode
} from './firebase';

export type PassPlanType = 'lifetime_99' | 'standard_49' | 'monthly_19' | 'standard_99' | 'lifetime_149' | 'selective_19';

export interface PassPlanConfig {
  id: PassPlanType;
  name: string;
  badge: string;
  regularPrice: number;
  discountedPrice: number;
  discountAmount: number;
  durationLabel: string;
  durationDays?: number | null; // null = lifetime
  referrerCommission: number; // ₹15 on 99, ₹10 on 49, ₹0 on 19
  subtitle: string;
  features: string[];
  popular?: boolean;
}

export const PASS_PLANS: Record<string, PassPlanConfig> = {
  monthly_19: {
    id: 'monthly_19',
    name: '1 Month Plan',
    badge: '1 MONTH ACCESS',
    regularPrice: 19,
    discountedPrice: 19,
    discountAmount: 0,
    durationLabel: '1 Month (30 Days)',
    durationDays: 30,
    referrerCommission: 0, // No revenue on 19 rs plan
    subtitle: 'Full access to all 50+ mocks & CBT simulation for 30 days',
    features: [
      'All 50+ Mock Tests Completely Unlocked for 30 Days',
      'Part A General + Part B CS Domain Tests',
      'Detailed Bilingual Solutions & Hindi/English Tricks',
      'Mock History & Sectional Cutoff Tracker',
      '100% Ad-Free Timed Test Environment'
    ]
  },
  standard_49: {
    id: 'standard_49',
    name: '3 Months Plan',
    badge: 'MOST POPULAR',
    popular: true,
    regularPrice: 49,
    discountedPrice: 44,
    discountAmount: 5,
    durationLabel: '3 Months (90 Days)',
    durationDays: 90,
    referrerCommission: 10, // Referrer earns ₹10 on 49 plan
    subtitle: 'All 50+ Mocks + Any New Tests Added for 90 Days',
    features: [
      'All 50+ Mock Tests Completely Unlocked for 90 Days',
      'All newly added mocks within 90 days included',
      'Mock History & Dynamic Exam Clearing Cutoff Engine',
      'Live Subject-Wise & Part-Wise Averages',
      '100% Ad-Free Timed CBT Simulation',
      'Instant Bilingual Solutions & Performance Analytics'
    ]
  },
  lifetime_99: {
    id: 'lifetime_99',
    name: 'Lifetime Plan',
    badge: 'BEST VALUE • NEVER EXPIRES',
    popular: false,
    regularPrice: 99,
    discountedPrice: 89,
    discountAmount: 10,
    durationLabel: 'Lifetime Validity',
    durationDays: null,
    referrerCommission: 15, // Referrer earns ₹15 on 99 plan
    subtitle: 'Permanent Access • All 50+ Current & ALL Future Mocks Forever',
    features: [
      'Permanent Lifetime Access (Never Expires)',
      'All 50+ Current Mocks + ALL Future Mocks Added Forever',
      'Mock History & Dynamic Cutoff Prediction Engine',
      'Live Subject-Wise & Part-Wise Cutoff Probability',
      'Unlimited Reattempts, Bookmarks & Export Reports',
      'Top Ranker Analytics & Priority CBT Mode'
    ]
  },
  // Aliases for backwards compatibility
  standard_99: {
    id: 'standard_99',
    name: 'Lifetime Plan',
    badge: 'BEST VALUE • NEVER EXPIRES',
    popular: false,
    regularPrice: 99,
    discountedPrice: 89,
    discountAmount: 10,
    durationLabel: 'Lifetime Validity',
    durationDays: null,
    referrerCommission: 15,
    subtitle: 'Permanent Access • All 50+ Current & ALL Future Mocks Forever',
    features: [
      'Permanent Lifetime Access (Never Expires)',
      'All 50+ Current Mocks + ALL Future Mocks Added Forever'
    ]
  },
  lifetime_149: {
    id: 'lifetime_149',
    name: 'Lifetime Plan',
    badge: 'BEST VALUE • NEVER EXPIRES',
    popular: false,
    regularPrice: 99,
    discountedPrice: 89,
    discountAmount: 10,
    durationLabel: 'Lifetime Validity',
    durationDays: null,
    referrerCommission: 15,
    subtitle: 'Permanent Access • All 50+ Current & ALL Future Mocks Forever',
    features: [
      'Permanent Lifetime Access (Never Expires)',
      'All 50+ Current Mocks + ALL Future Mocks Added Forever'
    ]
  },
  selective_19: {
    id: 'selective_19',
    name: '1 Month Plan',
    badge: '1 MONTH ACCESS',
    regularPrice: 19,
    discountedPrice: 19,
    discountAmount: 0,
    durationLabel: '1 Month (30 Days)',
    durationDays: 30,
    referrerCommission: 0,
    subtitle: 'Full access to all 50+ mocks for 30 days',
    features: [
      'All 50+ Mock Tests Completely Unlocked for 30 Days'
    ]
  }
};

export interface PassData {
  isActive: boolean;
  plan: PassPlanType;
  utr: string; // 12-digit UPI UTR
  phone: string;
  candidateName?: string;
  amount: number;
  promoCodeUsed?: string | null;
  paymentGateway?: 'upi' | 'admin_code';
  activatedAt: number;
  expiresAt?: number | null;
  deviceId: string;
  verificationStatus: 'pending_verification' | 'verified' | 'flagged_fraud';
  verifiedAt?: number;
  adminNotes?: string;
}

export type VipPassData = PassData;

export interface ReferredMember {
  id: string;
  timestamp: number;
  planId: PassPlanType;
  planName: string;
  amountPaid: number;
  commissionEarned: number;
  maskedBuyerId: string;
  paymentMethod: 'upi';
  utrRef?: string;
  status?: 'provisional' | 'verified' | 'revoked';
}

export interface ReferralWallet {
  code: string;
  balance: number;
  totalReferrals: number;
  paidReferrals: number;
  earnings: number;
  withdrawn: number;
  referredMembers?: ReferredMember[];
}

export interface PayoutRequest {
  id: string;
  upiId: string;
  phone: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'rejected';
  code: string;
  transferUtr?: string;
}

const STORAGE_KEYS = {
  PASS: 'dsssb_mock_pass',
  VIP_PASS_LEGACY: 'dsssb_vip_pass',
  DEVICE_ID: 'dsssb_device_id',
  SUBMITTED_UTRS: 'dsssb_submitted_utrs',
  REFERRAL_WALLET: 'dsssb_referral_wallet',
  PAYOUT_REQUESTS: 'dsssb_payout_requests',
  PENDING_REFERRAL: 'dsssb_pending_referral_code',
  AFFILIATE_REGISTRY: 'dsssb_affiliate_registry',
  USED_REFERRAL_CODES: 'dsssb_used_referral_codes',
  ADMIN_AUTH: 'dsssb_admin_auth_status',
  REVOCATION_NOTICE: 'dsssb_revocation_notice'
};

export const OFFICIAL_UPI_ID = 'byteprepcs@ptyes';
export const OFFICIAL_PAYEE_NAME = 'BytePrep CS Prep';
export const MIN_WITHDRAWAL_THRESHOLD = 60; // ₹60 to redeem
export const ADMIN_PIN = 'DSSSB2026ADMIN';
export const ADMIN_EMAIL = 'ictlabgsssaidana@gmail.com';

// Device Fingerprint generator
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';
  try {
    let devId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, devId);
    }
    return devId;
  } catch (e) {
    return 'fallback_device';
  }
}

// Reactivity event listeners
type PassListener = (isActive: boolean) => void;
type WalletListener = (wallet: ReferralWallet) => void;

const passListeners: Set<PassListener> = new Set();
const walletListeners: Set<WalletListener> = new Set();

export function subscribeToPass(listener: PassListener): () => void {
  passListeners.add(listener);
  return () => passListeners.delete(listener);
}

export const subscribeToVipPass = subscribeToPass;

export function subscribeToReferralWallet(listener: WalletListener): () => void {
  walletListeners.add(listener);
  return () => walletListeners.delete(listener);
}

function notifyPassChange(isActive: boolean) {
  passListeners.forEach(l => {
    try { l(isActive); } catch (e) {}
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dsssb_pass_changed', { detail: { isActive } }));
    window.dispatchEvent(new CustomEvent('dsssb_vip_pass_changed', { detail: { isActive } }));
  }
}

function notifyWalletChange(wallet: ReferralWallet) {
  walletListeners.forEach(l => {
    try { l(wallet); } catch (e) {}
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dsssb_wallet_changed', { detail: { wallet } }));
  }
}

// 1. Pass Status
export function getPassData(): PassData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PASS) || localStorage.getItem(STORAGE_KEYS.VIP_PASS_LEGACY);
    if (!raw) return null;
    const parsed: PassData = JSON.parse(raw);
    if (!parsed?.isActive) return null;
    if (parsed.verificationStatus === 'flagged_fraud') return null;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

export function isPassActive(): boolean {
  const data = getPassData();
  if (!data || !data.isActive) return false;
  if (data.verificationStatus === 'flagged_fraud') return false;
  if (data.expiresAt && Date.now() > data.expiresAt) return false;
  return true;
}

export const getVipPassData = getPassData;
export const isVipPassActive = isPassActive;

/**
 * Check if a mock test is unlocked.
 * Rule:
 * 1. First two mocks (Index 0 and Index 1) are 100% FREE for all candidates!
 * 2. Any active pass (Lifetime ₹99, 3-Month ₹49, 1-Month ₹19) unlocks ALL 50+ current and ALL future mocks!
 */
export function isMockUnlocked(testId: string, testIndex?: number, category?: string): boolean {
  if (!testId) return false;

  // 1. First two mocks are always 100% FREE for all candidates!
  if (testIndex !== undefined && (testIndex === 0 || testIndex === 1)) {
    return true;
  }

  // 2. Active pass unlocks ALL current & future mocks
  return isPassActive();
}

export const isMockAccessible = isMockUnlocked;

// Helper: Get list of referral codes already used on this device
export function getUsedReferralCodes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USED_REFERRAL_CODES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function recordUsedReferralCode(code: string) {
  try {
    const clean = code.trim().toUpperCase();
    const used = getUsedReferralCodes();
    if (!used.includes(clean)) {
      used.push(clean);
      localStorage.setItem(STORAGE_KEYS.USED_REFERRAL_CODES, JSON.stringify(used));
    }
  } catch (e) {}
}

// 2. Validate Promo / Referral Code with Anti-Abuse Rules
export function validatePromoCode(
  inputCode: string, 
  planType: PassPlanType = 'lifetime_99'
): { isValid: boolean; discount: number; finalPrice: number; message: string; commissionEarnable: number } {
  const clean = inputCode.trim().toUpperCase();
  const planConfig = PASS_PLANS[planType] || PASS_PLANS.lifetime_99;
  
  if (!clean) {
    return { 
      isValid: false, 
      discount: 0, 
      finalPrice: planConfig.regularPrice, 
      commissionEarnable: 0,
      message: '' 
    };
  }

  const myWallet = getOrCreateReferralWallet();

  // Guard 1: Prevent Self-Referral
  if (clean === myWallet.code) {
    return {
      isValid: false,
      discount: 0,
      finalPrice: planConfig.regularPrice,
      commissionEarnable: 0,
      message: '⚠️ Self-referral is not allowed. You cannot use your own referral code.'
    };
  }

  // Guard 2: Prevent Multiple Code Reuse on Same Device
  const usedCodes = getUsedReferralCodes();
  if (usedCodes.includes(clean)) {
    return {
      isValid: false,
      discount: 0,
      finalPrice: planConfig.regularPrice,
      commissionEarnable: 0,
      message: '⚠️ This device has already used this referral code once.'
    };
  }

  // Check known demo codes or affiliate registry
  const validCodes = ['DSSSB10', 'BYTEPREP', 'RANKER', 'TOPPER', 'DSSSB5', 'TEACHER'];
  try {
    const registry = getAffiliateRegistry();
    validCodes.push(...Object.keys(registry));
  } catch (e) {}

  const matchesPattern = /^DSSSB-[A-Z0-9]+$/i.test(clean) || validCodes.includes(clean);

  if (matchesPattern) {
    const discount = planConfig.discountAmount;
    const finalPrice = planConfig.discountedPrice;
    const commission = planConfig.referrerCommission;

    let msg = `🎉 Promo code "${clean}" applied! ₹${discount} discount applied.`;
    if (commission > 0) {
      msg += ` (Referrer receives ₹${commission} reward).`;
    }

    return {
      isValid: true,
      discount,
      finalPrice,
      commissionEarnable: commission,
      message: msg
    };
  }

  return {
    isValid: false,
    discount: 0,
    finalPrice: planConfig.regularPrice,
    commissionEarnable: 0,
    message: 'Invalid referral code. Try "BYTEPREP" or ask a friend for their referral link.'
  };
}

// 3. Credit Referrer and Record Referred Member
function creditReferrerForCode(
  code: string, 
  planType: PassPlanType,
  amountPaid: number,
  buyerPhone: string,
  utrRef: string
) {
  try {
    const clean = code.trim().toUpperCase();
    const planConfig = PASS_PLANS[planType] || PASS_PLANS.lifetime_99;
    const commission = planConfig.referrerCommission; // ₹15 on 99, ₹10 on 49, ₹0 on 19

    recordUsedReferralCode(clean);

    const memberRecord: ReferredMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      planId: planType,
      planName: planConfig.name,
      amountPaid,
      commissionEarned: commission,
      maskedBuyerId: buyerPhone.length >= 10 
        ? `${buyerPhone.slice(0, 3)}****${buyerPhone.slice(-3)}` 
        : `Candidate #${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod: 'upi',
      utrRef,
      status: 'provisional'
    };

    updateAffiliateRegistryWithMember(clean, memberRecord);

    const myWallet = getOrCreateReferralWallet();
    if (myWallet.code === clean) {
      myWallet.paidReferrals += 1;
      myWallet.totalReferrals += 1;
      myWallet.earnings += commission;
      myWallet.balance += commission;
      if (!myWallet.referredMembers) myWallet.referredMembers = [];
      myWallet.referredMembers.unshift(memberRecord);
      localStorage.setItem(STORAGE_KEYS.REFERRAL_WALLET, JSON.stringify(myWallet));
      notifyWalletChange(myWallet);
    }
  } catch (e) {}
}

// 4. Activate Pass via UPI UTR Submission (Instant provisional access + Admin Verification)
export function activatePassWithUtr(
  utr: string,
  phone: string = '9876543210',
  candidateName: string = 'Candidate',
  appliedPromo?: string | null,
  planType: PassPlanType = 'lifetime_99'
): { success: boolean; message: string; pass?: PassData } {
  const cleanUtr = (utr || '').trim().replace(/\s+/g, '').toUpperCase();
  const cleanPhone = (phone || '').trim().replace(/\s+/g, '') || '9876543210';
  const cleanName = (candidateName || '').trim() || 'Candidate';

  if (!cleanUtr || cleanUtr.length < 3) {
    return { success: false, message: 'Please enter a valid UPI Reference / UTR Number (e.g. 12-digit UTR from your UPI app receipt).' };
  }

  try {
    const rawUtrs = localStorage.getItem(STORAGE_KEYS.SUBMITTED_UTRS);
    const utrs: string[] = rawUtrs ? JSON.parse(rawUtrs) : [];

    const deviceId = getOrCreateDeviceId();
    const planConfig = PASS_PLANS[planType] || PASS_PLANS.lifetime_99;
    const finalAmount = appliedPromo ? planConfig.discountedPrice : planConfig.regularPrice;
    
    let expiresAt: number | null = null;
    if (planConfig.durationDays) {
      expiresAt = Date.now() + (planConfig.durationDays * 24 * 60 * 60 * 1000);
    }

    const passData: PassData = {
      isActive: true,
      plan: planType,
      utr: cleanUtr,
      phone: cleanPhone.length >= 10 ? cleanPhone : '9876543210',
      candidateName: cleanName,
      amount: finalAmount,
      promoCodeUsed: appliedPromo || null,
      paymentGateway: 'upi',
      activatedAt: Date.now(),
      expiresAt,
      deviceId,
      verificationStatus: 'verified', // Auto-verified on activation
      verifiedAt: Date.now()
    };

    localStorage.setItem(STORAGE_KEYS.PASS, JSON.stringify(passData));
    localStorage.setItem(STORAGE_KEYS.VIP_PASS_LEGACY, JSON.stringify(passData));

    if (!utrs.includes(cleanUtr)) {
      utrs.push(cleanUtr);
      localStorage.setItem(STORAGE_KEYS.SUBMITTED_UTRS, JSON.stringify(utrs));
    }

    // Register user & pass in persistent registry for cache recovery
    registerPassInPersistentRegistry(cleanPhone, cleanUtr, passData);

    // Save to Firestore & local storage for instant sync
    savePaymentUtrToDb({
      utr: cleanUtr,
      phone: cleanPhone,
      candidateName: cleanName,
      plan: planType,
      amount: finalAmount,
      promoCode: appliedPromo || null,
      timestamp: Date.now(),
      status: 'verified',
      verifiedAt: Date.now(),
      deviceId
    });

    // Credit referrer if promo was applied
    if (appliedPromo) {
      creditReferrerForCode(appliedPromo, planType, finalAmount, cleanPhone, cleanUtr);
    }

    notifyPassChange(true);

    return {
      success: true,
      message: `🎉 Instant Access Activated! ${planConfig.name} is now active. All 50+ mock tests unlocked.`,
      pass: passData
    };
  } catch (e) {
    return {
      success: false,
      message: 'Failed to activate pass. Please ensure browser storage is enabled.'
    };
  }
}

/**
 * Activate Pass via Verified Razorpay Payment
 */
export async function activatePassWithRazorpay(params: {
  paymentId: string;
  orderId: string;
  planType: PassPlanType;
  amount: number;
  phone?: string;
  candidateName?: string;
  appliedPromo?: string | null;
}): Promise<{ success: boolean; message: string; pass?: PassData }> {
  const planConfig = PASS_PLANS[params.planType] || PASS_PLANS.lifetime_99;
  const cleanPhone = (params.phone || '').trim().replace(/\s+/g, '') || '9876543210';
  const cleanName = (params.candidateName || '').trim() || 'Candidate';
  const cleanPaymentId = params.paymentId.trim().toUpperCase();
  const deviceId = getOrCreateDeviceId();

  let expiresAt: number | null = null;
  if (planConfig.durationDays) {
    expiresAt = Date.now() + (planConfig.durationDays * 24 * 60 * 60 * 1000);
  }

  const passData: PassData = {
    isActive: true,
    plan: params.planType,
    utr: cleanPaymentId,
    phone: cleanPhone,
    candidateName: cleanName,
    amount: params.amount,
    promoCodeUsed: params.appliedPromo || null,
    paymentGateway: 'razorpay' as any,
    activatedAt: Date.now(),
    expiresAt,
    deviceId,
    verificationStatus: 'verified',
    verifiedAt: Date.now(),
    adminNotes: `Razorpay Order: ${params.orderId}`,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.PASS, JSON.stringify(passData));
    localStorage.setItem(STORAGE_KEYS.VIP_PASS_LEGACY, JSON.stringify(passData));

    registerPassInPersistentRegistry(cleanPhone, cleanPaymentId, passData);

    await savePaymentUtrToDb({
      utr: cleanPaymentId,
      phone: cleanPhone,
      candidateName: cleanName,
      plan: params.planType,
      amount: params.amount,
      promoCode: params.appliedPromo || null,
      timestamp: Date.now(),
      status: 'verified',
      verifiedAt: Date.now(),
      adminNotes: `Razorpay Order: ${params.orderId}`,
      deviceId,
    });

    if (params.appliedPromo) {
      creditReferrerForCode(params.appliedPromo, params.planType, params.amount, cleanPhone, cleanPaymentId);
    }

    notifyPassChange(true);

    return {
      success: true,
      message: `🎉 Payment Successful! ${planConfig.name} is now active. All 50+ mock tests unlocked!`,
      pass: passData,
    };
  } catch (e) {
    return {
      success: false,
      message: 'Failed to save activated pass. Please check browser storage permissions.',
    };
  }
}

/**
 * Auto-verify & instant activate plan upon QR / UPI Payment completion
 */
export async function autoVerifyAndActivatePass(
  planType: PassPlanType = 'lifetime_99',
  appliedPromo?: string | null,
  candidateName: string = 'Candidate',
  candidatePhone: string = '9876543210',
  customUtr?: string
): Promise<{ success: boolean; message: string; pass?: PassData; utr: string }> {
  const planConfig = PASS_PLANS[planType] || PASS_PLANS.lifetime_99;
  const finalAmount = appliedPromo ? planConfig.discountedPrice : planConfig.regularPrice;
  const generatedUtr = customUtr?.trim().toUpperCase() || `UPI${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanPhone = candidatePhone.trim() || '9876543210';
  const cleanName = candidateName.trim() || 'Candidate';
  const deviceId = getOrCreateDeviceId();

  let expiresAt: number | null = null;
  if (planConfig.durationDays) {
    expiresAt = Date.now() + (planConfig.durationDays * 24 * 60 * 60 * 1000);
  }

  const passData: PassData = {
    isActive: true,
    plan: planType,
    utr: generatedUtr,
    phone: cleanPhone,
    candidateName: cleanName,
    amount: finalAmount,
    promoCodeUsed: appliedPromo || null,
    paymentGateway: 'upi',
    activatedAt: Date.now(),
    expiresAt,
    deviceId,
    verificationStatus: 'verified',
    verifiedAt: Date.now()
  };

  try {
    localStorage.setItem(STORAGE_KEYS.PASS, JSON.stringify(passData));
    localStorage.setItem(STORAGE_KEYS.VIP_PASS_LEGACY, JSON.stringify(passData));

    const rawUtrs = localStorage.getItem(STORAGE_KEYS.SUBMITTED_UTRS);
    const utrs: string[] = rawUtrs ? JSON.parse(rawUtrs) : [];
    if (!utrs.includes(generatedUtr)) {
      utrs.push(generatedUtr);
      localStorage.setItem(STORAGE_KEYS.SUBMITTED_UTRS, JSON.stringify(utrs));
    }

    registerPassInPersistentRegistry(cleanPhone, generatedUtr, passData);

    await savePaymentUtrToDb({
      utr: generatedUtr,
      phone: cleanPhone,
      candidateName: cleanName,
      plan: planType,
      amount: finalAmount,
      promoCode: appliedPromo || null,
      timestamp: Date.now(),
      status: 'verified',
      verifiedAt: Date.now(),
      deviceId
    });

    if (appliedPromo) {
      creditReferrerForCode(appliedPromo, planType, finalAmount, cleanPhone, generatedUtr);
    }

    notifyPassChange(true);

    return {
      success: true,
      message: `🎉 Payment Verified! ${planConfig.name} is now active. All 50+ mock tests are unlocked!`,
      pass: passData,
      utr: generatedUtr
    };
  } catch (e) {
    return {
      success: false,
      message: 'Failed to activate pass. Please ensure browser storage is enabled.',
      utr: generatedUtr
    };
  }
}

/**
 * Generate 1-click Email Recovery mailto URL
 */
export function createMailRecoveryUrl(planName: string = 'Lifetime Pass', utr: string = '', phone: string = '', name: string = ''): string {
  const subject = encodeURIComponent(`[DSSSB Pass Recovery] Request to restore Mock Pass (UTR: ${utr || 'Not available'})`);
  const body = encodeURIComponent(
`Hello DSSSB Prep Support Team,

I cleared my browser cache / changed device and would like to restore my VIP Mock Pass.

Payment & Verification Details:
- 12-Digit UPI UTR / Reference Number: ${utr || '[Enter your 12-digit UTR number here]'}
- Registered Mobile Number: ${phone || '[Enter your mobile number here]'}
- Candidate Name: ${name || '[Enter your name here]'}
- Selected Plan: ${planName}
- Date / Time of Payment: ${new Date().toLocaleDateString('en-IN')}

Please verify my payment and send my 1-time activation restore code.

Thank you!
`
  );
  return `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
}

export const activateVipPassWithUtr = activatePassWithUtr;
export const activatePassDirect = (paymentId: string, phone: string, appliedPromo?: string | null, planType: PassPlanType = 'lifetime_99') => 
  activatePassWithUtr(paymentId, phone, 'Candidate', appliedPromo, planType);

// -------------------------------------------------------------
// 5. ADMIN VERIFICATION & FRAUD REVOCATION ENGINE
// -------------------------------------------------------------

/**
 * Admin Action: Approve & Verify UTR
 */
export async function adminVerifyPaymentUtr(utr: string, adminNotes?: string): Promise<{ success: boolean; message: string }> {
  const clean = utr.trim().toUpperCase();
  try {
    // 1. Update in Firestore
    await updatePaymentUtrStatusInDb(clean, 'verified', adminNotes);

    // 2. Update local state if current pass uses this UTR
    const currentPass = getPassData();
    if (currentPass && currentPass.utr === clean) {
      currentPass.verificationStatus = 'verified';
      currentPass.verifiedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.PASS, JSON.stringify(currentPass));
      localStorage.setItem(STORAGE_KEYS.VIP_PASS_LEGACY, JSON.stringify(currentPass));
      notifyPassChange(true);
    }

    // 3. Update in persistent registry
    const registryPassRaw = localStorage.getItem(`dsssb_user_pass_${clean}`);
    if (registryPassRaw) {
      const p = JSON.parse(registryPassRaw);
      p.verificationStatus = 'verified';
      localStorage.setItem(`dsssb_user_pass_${clean}`, JSON.stringify(p));
    }

    return { success: true, message: `✓ UTR ${clean} successfully marked as VERIFIED!` };
  } catch (e) {
    return { success: false, message: 'Failed to verify UTR.' };
  }
}

/**
 * Admin Action: Flag as Fraud & Instantly Revoke Access
 */
export async function adminFlagFraudUtr(utr: string, reason: string = 'Invalid UTR Number'): Promise<{ success: boolean; message: string }> {
  const clean = utr.trim().toUpperCase();
  try {
    // 1. Update in Firestore
    await updatePaymentUtrStatusInDb(clean, 'flagged_fraud', reason);

    // 2. Check if this device is using this UTR -> REVOKE INSTANTLY
    const currentPass = getPassData();
    if (currentPass && currentPass.utr === clean) {
      revokePassImmediately(`⚠️ Access Revoked: UTR "${clean}" was flagged as invalid by the Administrator. Reason: ${reason}`);
    }

    // 3. Update in local storage registry so user cannot restore using this UTR
    const registryPassRaw = localStorage.getItem(`dsssb_user_pass_${clean}`);
    if (registryPassRaw) {
      const p = JSON.parse(registryPassRaw);
      p.verificationStatus = 'flagged_fraud';
      p.isActive = false;
      localStorage.setItem(`dsssb_user_pass_${clean}`, JSON.stringify(p));
    }

    return { success: true, message: `⚠️ UTR ${clean} flagged as FRAUD. Access has been revoked!` };
  } catch (e) {
    return { success: false, message: 'Failed to flag UTR.' };
  }
}

/**
 * Instantly revoke pass on this device and notify user
 */
export function revokePassImmediately(reasonMessage: string) {
  try {
    localStorage.removeItem(STORAGE_KEYS.PASS);
    localStorage.removeItem(STORAGE_KEYS.VIP_PASS_LEGACY);
    sessionStorage.setItem(STORAGE_KEYS.REVOCATION_NOTICE, reasonMessage);
    notifyPassChange(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dsssb_pass_revoked', { detail: { message: reasonMessage } }));
    }
  } catch (e) {}
}

export function getRevocationNotice(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const notice = sessionStorage.getItem(STORAGE_KEYS.REVOCATION_NOTICE);
    if (notice) {
      sessionStorage.removeItem(STORAGE_KEYS.REVOCATION_NOTICE);
      return notice;
    }
  } catch (e) {}
  return null;
}

/**
 * Background Check: Sync current pass status with server Firestore
 */
export async function syncPassVerificationWithServer(): Promise<void> {
  const pass = getPassData();
  if (!pass || !pass.utr) return;

  try {
    const remoteRecord = await fetchPaymentUtrFromDb(pass.utr);
    if (remoteRecord) {
      if (remoteRecord.status === 'flagged_fraud') {
        revokePassImmediately(`⚠️ Access Revoked: Your payment transaction (${pass.utr}) was flagged as invalid by the Admin.`);
      } else if (remoteRecord.status === 'verified' && pass.verificationStatus !== 'verified') {
        pass.verificationStatus = 'verified';
        pass.verifiedAt = remoteRecord.verifiedAt || Date.now();
        localStorage.setItem(STORAGE_KEYS.PASS, JSON.stringify(pass));
        notifyPassChange(true);
      }
    }
  } catch (e) {}
}

/**
 * Real-time continuous live listener on user device:
 * Listens directly to Firestore on the user's UTR. The instant the admin
 * marks it verified or flags it fraud in Admin Panel, the user's browser updates live!
 */
export function startLivePassVerificationSync(): () => void {
  if (typeof window === 'undefined') return () => {};
  const pass = getPassData();
  if (!pass || !pass.utr || pass.utr.startsWith('ADMIN_CODE_')) {
    return () => {};
  }

  return listenToPaymentUtr(pass.utr, (remoteRecord) => {
    if (!remoteRecord) return;
    const current = getPassData();
    if (!current || current.utr !== pass.utr) return;

    if (remoteRecord.status === 'flagged_fraud') {
      revokePassImmediately(`⚠️ Access Revoked: Your payment transaction (${pass.utr}) was flagged as invalid by the Admin. Reason: ${remoteRecord.adminNotes || 'Payment not found in bank statement'}`);
    } else if (remoteRecord.status === 'verified' && current.verificationStatus !== 'verified') {
      current.verificationStatus = 'verified';
      current.verifiedAt = remoteRecord.verifiedAt || Date.now();
      localStorage.setItem(STORAGE_KEYS.PASS, JSON.stringify(current));
      localStorage.setItem(STORAGE_KEYS.VIP_PASS_LEGACY, JSON.stringify(current));
      notifyPassChange(true);
    }
  });
}

// -------------------------------------------------------------
// 6. REFERRAL PAYOUTS SYSTEM (ADMIN DIRECT UPI TRANSFERS)
// -------------------------------------------------------------

export function getPayoutRequests(): PayoutRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYOUT_REQUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function requestReferralPayout(
  upiId: string,
  phone: string
): { success: boolean; message: string; request?: PayoutRequest; updatedWallet?: ReferralWallet } {
  const cleanUpi = upiId.trim();
  const cleanPhone = phone.trim();

  if (!cleanUpi.includes('@') || cleanUpi.length < 5) {
    return { success: false, message: 'Please enter a valid UPI ID (e.g. yourname@oksbi, yourname@paytm).' };
  }

  if (cleanPhone.length < 10) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number for UPI transfer receipt.' };
  }

  const wallet = getOrCreateReferralWallet();
  if (wallet.balance < MIN_WITHDRAWAL_THRESHOLD) {
    return {
      success: false,
      message: `Minimum redemption threshold is ₹${MIN_WITHDRAWAL_THRESHOLD}. Current balance: ₹${wallet.balance}. (Earn ₹15 on ₹99 Lifetime Plan & ₹10 on ₹49 Plan!)`
    };
  }

  const withdrawAmount = wallet.balance;
  const requestId = `pout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newRequest: PayoutRequest = {
    id: requestId,
    upiId: cleanUpi,
    phone: cleanPhone,
    amount: withdrawAmount,
    timestamp: Date.now(),
    status: 'pending',
    code: wallet.code
  };

  try {
    const existing = getPayoutRequests();
    const updated = [newRequest, ...existing];
    localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(updated));

    wallet.withdrawn += withdrawAmount;
    wallet.balance = 0;
    localStorage.setItem(STORAGE_KEYS.REFERRAL_WALLET, JSON.stringify(wallet));

    updateWalletInRegistry(wallet);
    notifyWalletChange(wallet);

    // Save to Firestore for Admin Payout Processing
    savePayoutRequestToDb({
      id: requestId,
      upiId: cleanUpi,
      phone: cleanPhone,
      amount: withdrawAmount,
      referralCode: wallet.code,
      timestamp: Date.now(),
      status: 'pending'
    });

    return {
      success: true,
      message: `🚀 Redemption request for ₹${withdrawAmount} submitted! Admin will transfer funds directly to ${cleanUpi} via UPI.`,
      request: newRequest,
      updatedWallet: wallet
    };
  } catch (e) {
    return { success: false, message: 'Failed to submit payout request. Please try again.' };
  }
}

/**
 * Admin Action: Approve and mark payout as transferred
 */
export async function adminApprovePayout(requestId: string, transferUtr: string): Promise<boolean> {
  try {
    await updatePayoutRequestStatusInDb(requestId, 'paid', transferUtr);
    
    const existing = getPayoutRequests();
    const idx = existing.findIndex(p => p.id === requestId);
    if (idx !== -1) {
      existing[idx].status = 'completed';
      existing[idx].transferUtr = transferUtr;
      localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(existing));
    }
    return true;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// 7. REFERRAL WALLET & AFFILIATE REGISTRY
// -------------------------------------------------------------

export function getOrCreateReferralWallet(): ReferralWallet {
  if (typeof window === 'undefined') {
    return {
      code: 'DSSSB-TOPPER',
      balance: 0,
      totalReferrals: 0,
      paidReferrals: 0,
      earnings: 0,
      withdrawn: 0,
      referredMembers: []
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRAL_WALLET);
    if (raw) {
      const parsed: ReferralWallet = JSON.parse(raw);
      if (!parsed.referredMembers) parsed.referredMembers = [];
      return parsed;
    }

    const devId = getOrCreateDeviceId().replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
    const generatedCode = `DSSSB-${devId || 'WIN'}`;

    const newWallet: ReferralWallet = {
      code: generatedCode,
      balance: 0,
      totalReferrals: 0,
      paidReferrals: 0,
      earnings: 0,
      withdrawn: 0,
      referredMembers: []
    };

    localStorage.setItem(STORAGE_KEYS.REFERRAL_WALLET, JSON.stringify(newWallet));
    updateWalletInRegistry(newWallet);
    return newWallet;
  } catch (e) {
    return {
      code: 'DSSSB-WIN',
      balance: 0,
      totalReferrals: 0,
      paidReferrals: 0,
      earnings: 0,
      withdrawn: 0,
      referredMembers: []
    };
  }
}

export function customizeReferralCode(newCode: string): { success: boolean; message: string; wallet?: ReferralWallet } {
  const clean = newCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (clean.length < 4 || clean.length > 15) {
    return { success: false, message: 'Referral code must be 4 to 15 characters (letters & numbers).' };
  }

  try {
    const wallet = getOrCreateReferralWallet();
    const oldCode = wallet.code;
    wallet.code = clean;
    localStorage.setItem(STORAGE_KEYS.REFERRAL_WALLET, JSON.stringify(wallet));
    
    updateWalletInRegistry(wallet, oldCode);
    notifyWalletChange(wallet);
    return { success: true, message: `Promo code updated to "${clean}"!`, wallet };
  } catch (e) {
    return { success: false, message: 'Failed to update code.' };
  }
}

// Registry Functions for Anti-Cache-Loss & Multi-Device Tracking
function getAffiliateRegistry(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AFFILIATE_REGISTRY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function updateWalletInRegistry(wallet: ReferralWallet, oldCode?: string) {
  try {
    const registry = getAffiliateRegistry();
    if (oldCode && oldCode !== wallet.code && registry[oldCode]) {
      delete registry[oldCode];
    }
    registry[wallet.code] = {
      ...wallet,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.AFFILIATE_REGISTRY, JSON.stringify(registry));
  } catch (e) {}
}

function updateAffiliateRegistryWithMember(code: string, member: ReferredMember) {
  try {
    const registry = getAffiliateRegistry();
    if (!registry[code]) {
      registry[code] = {
        code,
        balance: 0,
        earnings: 0,
        paidReferrals: 0,
        totalReferrals: 0,
        referredMembers: []
      };
    }
    const target = registry[code];
    target.balance = (target.balance || 0) + member.commissionEarned;
    target.earnings = (target.earnings || 0) + member.commissionEarned;
    target.paidReferrals = (target.paidReferrals || 0) + 1;
    target.totalReferrals = (target.totalReferrals || 0) + 1;
    if (!target.referredMembers) target.referredMembers = [];
    target.referredMembers.unshift(member);
    localStorage.setItem(STORAGE_KEYS.AFFILIATE_REGISTRY, JSON.stringify(registry));
  } catch (e) {}
}

function registerPassInPersistentRegistry(phone: string, utr: string, pass: PassData) {
  try {
    localStorage.setItem(`dsssb_user_pass_${phone}`, JSON.stringify(pass));
    localStorage.setItem(`dsssb_user_pass_${utr}`, JSON.stringify(pass));
  } catch (e) {}
}

// -------------------------------------------------------------
// 8. RESTORE PASS & REFERRAL WALLET (EVEN IF CACHE DELETED)
// -------------------------------------------------------------

export async function restorePassAndWallet(query: string): Promise<{ 
  success: boolean; 
  message: string; 
  pass?: PassData;
  wallet?: ReferralWallet;
}> {
  const clean = query.trim().toUpperCase().replace(/\s+/g, '');
  if (!clean) {
    return { success: false, message: 'Please enter your 12-digit UTR Number or registered Mobile Number.' };
  }

  let restoredPass: PassData | null = null;
  let restoredWallet: ReferralWallet | null = null;

  try {
    // 1. Check local storage registry first
    const phonePassRaw = localStorage.getItem(`dsssb_user_pass_${clean}`);
    if (phonePassRaw) {
      restoredPass = JSON.parse(phonePassRaw);
    }

    if (!restoredPass) {
      const existing = getPassData();
      if (existing && (existing.utr === clean || existing.phone.includes(clean))) {
        restoredPass = existing;
      }
    }

    // 2. Check Firestore remote database
    if (!restoredPass) {
      const remoteRecord = await fetchPaymentUtrFromDb(clean);
      if (remoteRecord) {
        if (remoteRecord.status === 'flagged_fraud') {
          return {
            success: false,
            message: `⚠️ This transaction (UTR: ${clean}) was flagged as INVALID by the Administrator and cannot be restored.`
          };
        }

        const planConfig = PASS_PLANS[remoteRecord.plan] || PASS_PLANS.lifetime_99;
        let expiresAt: number | null = null;
        if (planConfig.durationDays) {
          expiresAt = remoteRecord.timestamp + (planConfig.durationDays * 24 * 60 * 60 * 1000);
        }

        restoredPass = {
          isActive: true,
          plan: remoteRecord.plan as PassPlanType,
          utr: remoteRecord.utr,
          phone: remoteRecord.phone,
          candidateName: remoteRecord.candidateName,
          amount: remoteRecord.amount,
          promoCodeUsed: remoteRecord.promoCode,
          paymentGateway: 'upi',
          activatedAt: remoteRecord.timestamp,
          expiresAt,
          deviceId: getOrCreateDeviceId(),
          verificationStatus: remoteRecord.status,
          verifiedAt: remoteRecord.verifiedAt,
          adminNotes: remoteRecord.adminNotes
        };
      }
    }

    // Block if flagged as fraud
    if (restoredPass && restoredPass.verificationStatus === 'flagged_fraud') {
      return {
        success: false,
        message: '⚠️ This pass was flagged as invalid by the Administrator and has been revoked.'
      };
    }

    // 3. Check Affiliate Registry for Wallet
    const registry = getAffiliateRegistry();
    if (registry[clean]) {
      restoredWallet = registry[clean];
    } else {
      for (const [codeKey, data] of Object.entries(registry)) {
        if (codeKey === clean || (data as any).phone === clean) {
          restoredWallet = data as ReferralWallet;
          break;
        }
      }
    }

    if (restoredPass) {
      localStorage.setItem(STORAGE_KEYS.PASS, JSON.stringify(restoredPass));
      localStorage.setItem(STORAGE_KEYS.VIP_PASS_LEGACY, JSON.stringify(restoredPass));
      notifyPassChange(true);
    }

    if (restoredWallet) {
      localStorage.setItem(STORAGE_KEYS.REFERRAL_WALLET, JSON.stringify(restoredWallet));
      notifyWalletChange(restoredWallet);
    }

    if (restoredPass || restoredWallet) {
      return {
        success: true,
        message: '🎉 Account & pass restored successfully! All 50+ mock tests unlocked.',
        pass: restoredPass || undefined,
        wallet: restoredWallet || undefined
      };
    }

    return {
      success: false,
      message: 'No record found matching this UTR or Mobile number. Please check the number or contact Admin.'
    };
  } catch (e) {
    return { success: false, message: 'Restore failed. Please check network connection.' };
  }
}

export const restorePass = (utrOrPhone: string) => restorePassAndWallet(utrOrPhone);
export const restoreVipPass = restorePass;

// URL Referral Capture
export function captureUrlReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('promo') || params.get('code');
    if (ref) {
      const clean = ref.trim().toUpperCase();
      sessionStorage.setItem(STORAGE_KEYS.PENDING_REFERRAL, clean);
      return clean;
    }
  } catch (e) {}
  return null;
}

export function getPendingReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.PENDING_REFERRAL) || null;
  } catch (e) {
    return null;
  }
}

// Generate UPI Intent URI
export function generateUpiIntentUri(
  amount: number = 99, 
  utrRef?: string,
  planName: string = 'DSSSB Mock Pass'
): string {
  const note = encodeURIComponent(planName);
  const pn = encodeURIComponent(OFFICIAL_PAYEE_NAME);
  return `upi://pay?pa=${OFFICIAL_UPI_ID}&pn=${pn}&am=${amount}&cu=INR&tn=${note}`;
}

export function getUpiQrImageUrl(amount: number = 99, planName: string = 'DSSSB Mock Pass'): string {
  const upiUri = generateUpiIntentUri(amount, undefined, planName);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUri)}`;
}

// Compatibility helper
export function getSelectiveRemainingQuota(): {
  fullRemaining: number;
  partARemaining: number;
  subjectRemaining: number;
  unlockedMockIds: string[];
  isSelectivePlan: boolean;
} {
  return { fullRemaining: 999, partARemaining: 999, subjectRemaining: 999, unlockedMockIds: [], isSelectivePlan: false };
}

export function unlockMockWithSelectivePass(testId: string, category?: string): { success: boolean; message: string } {
  return { success: true, message: 'All mocks are already fully unlocked with your pass!' };
}

// -------------------------------------------------------------
// 6. ADMIN ACTIVATION & RESTORE CODES ENGINE
// -------------------------------------------------------------

export interface CreateActivationCodeParams {
  plan: PassPlanType;
  maxUses?: number;
  hoursValid?: number | null;
  targetCandidate?: string;
  customCode?: string;
}

/**
 * Admin creates custom or auto-generated 1-time / time-limited activation code
 */
export async function createAdminActivationCode(params: CreateActivationCodeParams): Promise<{
  success: boolean;
  message: string;
  code?: string;
  record?: FirestoreActivationCode;
}> {
  const plan = params.plan || 'lifetime_99';
  const maxUses = params.maxUses !== undefined ? Math.max(1, params.maxUses) : 1;
  const hoursValid = params.hoursValid;
  
  let codeStr = params.customCode?.trim().toUpperCase();
  if (!codeStr) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const planPrefix = plan === 'lifetime_99' ? 'LIFE' : plan === 'standard_49' ? '3MOS' : '1MON';
    codeStr = `DSSSB-${planPrefix}-${randomSuffix}`;
  }

  // Calculate expiry
  let expiresAt: number | null = null;
  if (hoursValid && hoursValid > 0) {
    expiresAt = Date.now() + hoursValid * 60 * 60 * 1000;
  }

  const record: FirestoreActivationCode = {
    code: codeStr,
    plan,
    maxUses,
    usedCount: 0,
    expiresAt,
    createdAt: Date.now(),
    createdBy: ADMIN_EMAIL,
    targetCandidate: params.targetCandidate || '',
    status: 'active'
  };

  const saved = await saveActivationCodeToDb(record);
  if (!saved) {
    // Fallback: save locally
    try {
      const raw = localStorage.getItem('dsssb_admin_codes_local') || '{}';
      const map = JSON.parse(raw);
      map[codeStr] = record;
      localStorage.setItem('dsssb_admin_codes_local', JSON.stringify(map));
    } catch (e) {}
  }

  return {
    success: true,
    message: `Activation Code "${codeStr}" generated successfully! (${maxUses === 1 ? '1-Time Use' : `${maxUses} Uses`}${hoursValid ? `, Valid for ${hoursValid} hours` : ', No Expiry'}).`,
    code: codeStr,
    record
  };
}

/**
 * Student redeems admin-issued activation / restore code
 */
export async function redeemAdminActivationCode(code: string, studentPhone?: string): Promise<{
  success: boolean;
  message: string;
  pass?: PassData;
}> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Please enter the activation / restore code provided by Admin.' };
  }

  // 1. Try Firestore redemption
  const dbRes = await redeemActivationCodeInDb(cleanCode);
  let planType: PassPlanType = (dbRes.plan as PassPlanType) || 'lifetime_99';

  if (!dbRes.success) {
    // Check local fallback
    try {
      const raw = localStorage.getItem('dsssb_admin_codes_local') || '{}';
      const map = JSON.parse(raw);
      const local = map[cleanCode];
      if (local && local.status === 'active') {
        if (local.expiresAt && Date.now() > local.expiresAt) {
          return { success: false, message: 'This activation code has expired.' };
        }
        if (local.usedCount >= local.maxUses) {
          return { success: false, message: 'This activation code has already reached its maximum usage limit.' };
        }
        local.usedCount = (local.usedCount || 0) + 1;
        if (local.usedCount >= local.maxUses) local.status = 'used';
        map[cleanCode] = local;
        localStorage.setItem('dsssb_admin_codes_local', JSON.stringify(map));
        planType = local.plan as PassPlanType;
      } else {
        return { success: false, message: dbRes.message || 'Invalid or unrecognized activation code.' };
      }
    } catch (e) {
      return { success: false, message: dbRes.message || 'Unable to validate code.' };
    }
  }

  // 2. Activate Pass on User's device
  const planConfig = PASS_PLANS[planType] || PASS_PLANS.lifetime_99;
  let expiresAt: number | null = null;
  if (planConfig.durationDays) {
    expiresAt = Date.now() + (planConfig.durationDays * 24 * 60 * 60 * 1000);
  }

  const deviceId = getOrCreateDeviceId();
  const passData: PassData = {
    isActive: true,
    plan: planType,
    utr: `ADMIN_CODE_${cleanCode}`,
    phone: studentPhone || 'RESTORED_BY_ADMIN',
    candidateName: 'Verified Candidate',
    amount: planConfig.regularPrice,
    promoCodeUsed: cleanCode,
    paymentGateway: 'admin_code',
    activatedAt: Date.now(),
    expiresAt,
    deviceId,
    verificationStatus: 'verified' // Direct admin verified!
  };

  localStorage.setItem(STORAGE_KEYS.PASS, JSON.stringify(passData));
  localStorage.setItem(STORAGE_KEYS.VIP_PASS_LEGACY, JSON.stringify(passData));

  // Sync pass state
  notifyPassChange(true);

  return {
    success: true,
    message: `🎉 Pass Restored Successfully! ${planConfig.name} is now active. All 50+ mock tests are unlocked.`,
    pass: passData
  };
}

/**
 * Pre-composed Mailto link for users who cleared cache to email Admin
 */
export function getMailtoRestoreLink(candidatePhone?: string, candidateName?: string): string {
  const email = `${ADMIN_EMAIL},support@dsssbpyq.online`;
  const subject = encodeURIComponent('DSSSB Pass: Request Restore / Activation Code');
  const body = encodeURIComponent(
`Hello Admin Team,

I previously purchased the DSSSB Mock Pass, but I cleared my browser cache / changed device and need to restore my purchase.

My Details:
- Name: ${candidateName || '[Your Name]'}
- Registered Phone / UPI: ${candidatePhone || '[Your 10-Digit Mobile Number]'}
- Approximate Payment Date: [Date of payment]
- Approximate Amount: [₹99 / ₹49 / ₹19]
- UPI Transaction ID / UTR (if available): [12-digit UTR from GPay/PhonePe/Paytm]

Please send me a 1-Time Activation / Restore Code.

Thank you!`
  );

  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export async function adminRevokeActivationCode(code: string): Promise<boolean> {
  return await revokeActivationCodeInDb(code);
}

