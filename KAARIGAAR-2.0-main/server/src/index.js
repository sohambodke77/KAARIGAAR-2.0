const express = require('express');
const cors = require('cors');
const config = require('./config');

// Routes
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const sellersRouter = require('./routes/sellers');
const adminRouter = require('./routes/admin');
const webhooksRouter = require('./routes/webhooks');

const app = express();

// Enable Cross-Origin Resource Sharing for React Native / Expo Web
app.use(cors());

// Parse JSON while preserving raw body for webhook HMAC SHA256 signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// Root Portal & Interactive API Explorer
app.get(['/', '/api'], (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KARIGAAR Payment & Payout Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #120B07;
      color: #FAF7F2;
      padding: 32px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 860px;
      width: 100%;
    }
    .header {
      background: #1E140E;
      border: 1px solid rgba(212, 163, 89, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #C59341;
      color: #120B07;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
    }
    h1 { font-size: 20px; color: #FAF7F2; letter-spacing: 1px; }
    .sub { font-size: 13px; color: #D4A359; margin-top: 2px; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(46, 125, 79, 0.2);
      border: 1px solid #2E7D4F;
      color: #4ADE80;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #4ADE80;
      border-radius: 50%;
      box-shadow: 0 0 8px #4ADE80;
    }
    .card {
      background: #1A130D;
      border: 1px solid rgba(212, 163, 89, 0.2);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }
    h2 { font-size: 16px; color: #D4A359; margin-bottom: 14px; letter-spacing: 0.5px; }
    .endpoints-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
    }
    .endpoint-item {
      background: #251B13;
      border: 1px solid rgba(212, 163, 89, 0.15);
      border-radius: 10px;
      padding: 14px;
      text-decoration: none;
      color: #FAF7F2;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .endpoint-item:hover {
      border-color: #D4A359;
      background: #2E2117;
      transform: translateY(-2px);
    }
    .method-tag {
      font-size: 11px;
      font-weight: 700;
      color: #D4A359;
      letter-spacing: 0.5px;
    }
    .endpoint-path {
      font-size: 14px;
      font-weight: 600;
      font-family: monospace;
      color: #FFFFFF;
    }
    .endpoint-desc {
      font-size: 12px;
      color: #A3968C;
    }
    .frontend-banner {
      background: linear-gradient(135deg, #2E1B10 0%, #1A110A 100%);
      border: 1px solid #D4A359;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
    }
    .btn-primary {
      background: #C59341;
      color: #120B07;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      text-decoration: none;
      font-size: 14px;
    }
    .btn-primary:hover { background: #E0AC57; }
    pre {
      background: #0D0805;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 12px;
      color: #A3D9A5;
      border: 1px solid rgba(212, 163, 89, 0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-wrap">
        <div class="logo">का</div>
        <div>
          <h1>KARIGAAR BACKEND API</h1>
          <div class="sub">Payment Gateway & Seller Payout Engine • Sandbox Mode</div>
        </div>
      </div>
      <div class="status-badge">
        <div class="pulse-dot"></div>
        PORT 5000 ONLINE
      </div>
    </div>

    <div class="frontend-banner">
      <div>
        <h3 style="color:#FAF7F2; margin-bottom: 4px;">Launch Customer & Artisan Frontend</h3>
        <p style="font-size: 13px; color: #D4A359;">Access the multi-step checkout, tax invoices, artisan studio, and admin portal</p>
      </div>
      <a href="http://localhost:8081" target="_blank" class="btn-primary">Open Web App (localhost:8081) →</a>
    </div>

    <div class="card">
      <h2>Live Verified API Endpoints</h2>
      <div class="endpoints-grid">
        <a href="/api/health" class="endpoint-item" target="_blank">
          <span class="method-tag">GET</span>
          <span class="endpoint-path">/api/health</span>
          <span class="endpoint-desc">Server health, uptime, currency & sandbox mode</span>
        </a>

        <a href="/api/orders" class="endpoint-item" target="_blank">
          <span class="method-tag">GET</span>
          <span class="endpoint-path">/api/orders</span>
          <span class="endpoint-desc">Live customer orders with fulfillment & payment status</span>
        </a>

        <a href="/api/payments/methods" class="endpoint-item" target="_blank">
          <span class="method-tag">GET</span>
          <span class="endpoint-path">/api/payments/methods</span>
          <span class="endpoint-desc">UPI, Cards (3D Secure), Net Banking, Wallets & COD</span>
        </a>

        <a href="/api/sellers/creator_me/dashboard" class="endpoint-item" target="_blank">
          <span class="method-tag">GET</span>
          <span class="endpoint-path">/api/sellers/creator_me/dashboard</span>
          <span class="endpoint-desc">Artisan earnings, commission breakdown & settlements</span>
        </a>

        <a href="/api/admin/commission-rules" class="endpoint-item" target="_blank">
          <span class="method-tag">GET</span>
          <span class="endpoint-path">/api/admin/commission-rules</span>
          <span class="endpoint-desc">Configurable category rates (Crochet, Jewellery, Resin)</span>
        </a>

        <a href="/api/admin/reconciliation" class="endpoint-item" target="_blank">
          <span class="method-tag">GET</span>
          <span class="endpoint-path">/api/admin/reconciliation</span>
          <span class="endpoint-desc">Financial audit: GMV, revenue, fees & seller liability</span>
        </a>

        <a href="/api/admin/audit-logs" class="endpoint-item" target="_blank">
          <span class="method-tag">GET</span>
          <span class="endpoint-path">/api/admin/audit-logs</span>
          <span class="endpoint-desc">Immutable audit ledger of payment actions</span>
        </a>

        <a href="/api/sellers/creator_me/settlements" class="endpoint-item" target="_blank">
          <span class="method-tag">GET</span>
          <span class="endpoint-path">/api/sellers/creator_me/settlements</span>
          <span class="endpoint-desc">Bank transfer ledger with RBI NEFT/IMPS UTR references</span>
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `);
  }

  res.json({
    status: 'ok',
    service: 'KARIGAAR Artisan Payment & Seller Payout Engine',
    version: '2.0.0',
    sandboxMode: true,
    currency: 'INR',
    documentation: 'See PAYMENT_AND_PAYOUT_SETUP.md',
    endpoints: {
      health: '/api/health',
      orders: '/api/orders',
      paymentMethods: '/api/payments/methods',
      createPaymentOrder: 'POST /api/payments/create-order',
      verifySignature: 'POST /api/payments/verify',
      sellerDashboard: '/api/sellers/:sellerId/dashboard',
      sellerSettlements: '/api/sellers/:sellerId/settlements',
      adminReconciliation: '/api/admin/reconciliation',
      commissionRules: '/api/admin/commission-rules',
      auditLogs: '/api/admin/audit-logs',
    },
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KARIGAAR Artisan Payment & Seller Payout Engine',
    version: '2.0.0',
    sandboxMode: true,
    currency: 'INR',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/sellers', sellersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/webhooks', webhooksRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start Server if not imported by test suite
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` KARIGAAR Backend Engine listening on http://localhost:${PORT}`);
    console.log(` Sandbox Gateway: Razorpay & Cashfree Mock Integration`);
    console.log(` Mode: ${config.env.toUpperCase()}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
