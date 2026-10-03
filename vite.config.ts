import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import dotenv from 'dotenv';
import { defineConfig, Plugin } from 'vite';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

function razorpayApiPlugin(): Plugin {
  return {
    name: 'razorpay-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname.replace(/\/+$/, ''); // Strip trailing slashes

        // Set CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_Tj4JBvarYSU6EW';
        const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '6BHxJW2WIOZVRgUkC8F3oI0e';

        // 1. Health check
        if (pathname === '/api/health' && (req.method === 'GET' || req.method === 'HEAD')) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          return res.end(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            razorpayConfigured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
          }));
        }

        // 2. Create Order
        if (pathname === '/api/create-order' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              let amountInPaise = Number(parsed.amount);
              if (!amountInPaise || isNaN(amountInPaise)) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, error: 'Invalid amount provided' }));
              }

              // Auto-convert to paise if passed in rupees
              if (amountInPaise < 100) {
                amountInPaise = amountInPaise * 100;
              }

              if (amountInPaise < 100) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, error: 'Amount must be at least 100 paise (₹1)' }));
              }

              const orderReceipt = parsed.receipt || `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;
              const postData = JSON.stringify({
                amount: Math.round(amountInPaise),
                currency: parsed.currency || 'INR',
                receipt: orderReceipt,
                notes: {
                  planType: parsed.planType || 'lifetime_99',
                  candidateName: parsed.candidateName || 'Candidate',
                  candidatePhone: parsed.candidatePhone || '9876543210',
                },
              });

              const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
              const razorpayReq = https.request('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${auth}`,
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(postData),
                },
              }, (razorpayRes) => {
                let responseData = '';
                razorpayRes.on('data', chunk => { responseData += chunk; });
                razorpayRes.on('end', () => {
                  try {
                    const rzpJson = responseData ? JSON.parse(responseData) : {};
                    if (razorpayRes.statusCode && razorpayRes.statusCode >= 400) {
                      res.setHeader('Content-Type', 'application/json');
                      res.statusCode = razorpayRes.statusCode;
                      return res.end(JSON.stringify({
                        success: false,
                        error: rzpJson?.error?.description || rzpJson?.error?.message || 'Razorpay order creation failed',
                      }));
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    return res.end(JSON.stringify({
                      success: true,
                      order_id: rzpJson.id,
                      id: rzpJson.id,
                      amount: rzpJson.amount,
                      currency: rzpJson.currency,
                      key_id: RAZORPAY_KEY_ID,
                    }));
                  } catch (parseErr: any) {
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ success: false, error: 'Error parsing Razorpay response: ' + parseErr.message }));
                  }
                });
              });

              razorpayReq.on('error', (err) => {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message || 'Payment gateway connection error' }));
              });

              razorpayReq.write(postData);
              razorpayReq.end();
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              return res.end(JSON.stringify({ success: false, error: err.message || 'Server error processing order' }));
            }
          });
          return;
        }

        // 3. Verify Payment
        if (pathname === '/api/verify-payment' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = parsed;

              if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                return res.end(JSON.stringify({
                  success: false,
                  error: 'Missing required Razorpay payment verification fields (order_id, payment_id, or signature)',
                }));
              }

              const expectedSignature = crypto
                .createHmac('sha256', RAZORPAY_KEY_SECRET)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

              const isSignatureValid = expectedSignature === razorpay_signature;

              if (!isSignatureValid) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                return res.end(JSON.stringify({
                  success: false,
                  error: 'Invalid payment signature. Verification failed.',
                }));
              }

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                message: 'Payment verified successfully',
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                planType: planType || 'lifetime_99',
                verifiedAt: Date.now(),
              }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              return res.end(JSON.stringify({ success: false, error: err.message || 'Internal server error' }));
            }
          });
          return;
        }

        return next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), razorpayApiPlugin()],
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas') || id.includes('node_modules/dompurify')) {
              return 'vendor-pdf';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/motion')) {
              return 'vendor-motion';
            }
            if (id.includes('generatedQuizzesMetadata') || id.includes('contentIndex')) {
              return 'quiz-metadata';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react', 'motion/react'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
