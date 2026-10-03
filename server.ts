import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Parse JSON bodies
app.use(express.json());

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_Tj4JBvarYSU6EW';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '6BHxJW2WIOZVRgUkC8F3oI0e';

// Initialize Razorpay Instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    razorpayConfigured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
  });
});

/**
 * STEP 1: CREATE RAZORPAY ORDER
 * Endpoint: POST /api/create-order
 * Minimum amount: 100 paise (₹1)
 */
app.post('/api/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt, planType, candidateName, candidatePhone } = req.body;

    // Amount can be passed in paise or converted from rupees
    let amountInPaise = Number(amount);
    if (!amountInPaise || isNaN(amountInPaise)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount provided',
      });
    }

    // Ensure amount is at least 100 paise
    if (amountInPaise < 100) {
      amountInPaise = amountInPaise * 100; // Auto-convert from INR if passed in rupees
    }

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1)',
      });
    }

    const orderReceipt = receipt || `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

    const options = {
      amount: Math.round(amountInPaise),
      currency: currency || 'INR',
      receipt: orderReceipt,
      notes: {
        planType: planType || 'lifetime_99',
        candidateName: candidateName || 'Candidate',
        candidatePhone: candidatePhone || '9876543210',
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    const statusCode = error?.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error?.error?.description || error?.message || 'Failed to create Razorpay order',
    });
  }
});

/**
 * STEP 3: VERIFY RAZORPAY PAYMENT SIGNATURE
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
app.post('/api/verify-payment', (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
      candidateName,
      candidatePhone,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required Razorpay payment verification fields (order_id, payment_id, or signature)',
      });
    }

    // Generate expected HMAC-SHA256 signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.warn(`Payment Signature Mismatch for Order: ${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      planType: planType || 'lifetime_99',
      verifiedAt: Date.now(),
    });
  } catch (error: any) {
    console.error('Razorpay Verify Signature Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error during payment verification',
    });
  }
});

// Vite Middleware for Full-Stack Development / Static Serving in Production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> Razorpay Standard Checkout API mounted on /api/*`);
  });
}

startServer();
