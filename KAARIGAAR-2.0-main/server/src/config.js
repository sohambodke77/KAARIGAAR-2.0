const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_karigaar_mock_key',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_sample_key_982341',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_karigaar_sandbox_secret_2026',
  },

  cashfree: {
    appId: process.env.CASHFREE_APP_ID || 'TEST_APP_ID_KARIGAAR',
    secretKey: process.env.CASHFREE_SECRET_KEY || 'TEST_SECRET_KEY_KARIGAAR',
    environment: process.env.CASHFREE_ENVIRONMENT || 'SANDBOX',
  },

  financials: {
    defaultCommissionPct: parseFloat(process.env.PLATFORM_DEFAULT_COMMISSION_PCT) || 12.0,
    fixedOrderFee: parseFloat(process.env.PLATFORM_FIXED_ORDER_FEE) || 15.0,
    gatewayFeePct: parseFloat(process.env.GATEWAY_PROCESSING_FEE_PCT) || 2.0,
  },

  dbFilePath: path.join(__dirname, '..', 'data', 'kaarigaar.db.json'),
};

module.exports = config;
