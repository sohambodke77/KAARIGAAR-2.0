const express = require('express');
const router = express.Router();
const db = require('../db/database');
const paymentService = require('../services/paymentService');
const config = require('../config');

// GET /api/payments/methods
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    sandboxMode: true,
    currency: 'INR',
    gateway: 'Razorpay & Cashfree Sandbox',
    methods: [
      {
        id: 'upi',
        name: 'UPI (Unified Payments Interface)',
        description: 'Google Pay, PhonePe, Paytm, BHIM, QR code or VPA',
        icon: 'phone-portrait-outline',
        supportedVpas: ['@okhdfcbank', '@oksbi', '@okaxis', '@okicici', '@ybl', '@paytm'],
        instantVerification: true,
        eligibleMaxAmount: 100000,
      },
      {
        id: 'card',
        name: 'Credit or Debit Card',
        description: 'Visa, MasterCard, RuPay, Maestro with 3D Secure OTP',
        icon: 'card-outline',
        supportedNetworks: ['Visa', 'MasterCard', 'RuPay'],
        instantVerification: true,
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'SBI, HDFC Bank, ICICI Bank, Axis Bank, Kotak, and 50+ Indian banks',
        icon: 'business-outline',
        popularBanks: [
          { code: 'HDFC', name: 'HDFC Bank' },
          { code: 'SBIN', name: 'State Bank of India' },
          { code: 'ICIC', name: 'ICICI Bank' },
          { code: 'UTIB', name: 'Axis Bank' },
          { code: 'KKBK', name: 'Kotak Mahindra Bank' },
          { code: 'PUNB', name: 'Punjab National Bank' },
        ],
      },
      {
        id: 'wallets',
        name: 'Digital Wallets',
        description: 'Paytm Wallet, PhonePe, Mobikwik, Amazon Pay',
        icon: 'wallet-outline',
        supportedWallets: ['Paytm', 'PhonePe', 'Mobikwik', 'Amazon Pay'],
      },
      {
        id: 'cod',
        name: 'Cash on Delivery (COD)',
        description: 'Pay at doorstep via cash or dynamic UPI QR on delivery',
        icon: 'cash-outline',
        maxLimit: 5000,
        verificationRequired: true,
      },
    ],
  });
});

// POST /api/payments/create-order
// Server-side payment order initialization with Idempotency
router.post('/create-order', async (req, res) => {
  try {
    const { orderId, idempotencyKey, customer = {} } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = db.findOne('orders', (o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ error: 'Order has already been paid for' });
    }

    const gatewayOrder = await paymentService.createPaymentOrder({
      orderId: order.id,
      amount: order.totalAmount,
      currency: order.currency,
      idempotencyKey,
      customer: {
        id: customer.id || order.customerId,
        name: customer.name || order.customerName,
        email: customer.email || order.customerEmail,
        phone: customer.phone || order.customerPhone,
      },
    });

    res.json({
      success: true,
      ...gatewayOrder,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        currency: order.currency,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/payments/verify & /api/payments/verify-signature
// Server-side HMAC Signature Verification
const handlePaymentVerification = async (req, res) => {
  try {
    const razorpayOrderId =
      req.body.razorpayOrderId || req.body.gatewayOrderId || req.body.razorpay_order_id;
    const razorpayPaymentId =
      req.body.razorpayPaymentId || req.body.gatewayPaymentId || req.body.razorpay_payment_id;
    const razorpaySignature =
      req.body.razorpaySignature ||
      req.body.gatewaySignature ||
      req.body.razorpay_signature ||
      req.body.signature;
    const orderId = req.body.orderId;
    const paymentMethod = req.body.paymentMethod || 'UPI';
    const paymentDetails = req.body.paymentDetails || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        error:
          'Missing required signature verification parameters: razorpayOrderId, razorpayPaymentId, razorpaySignature',
      });
    }

    const result = await paymentService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
      paymentMethod,
      paymentDetails,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const updatedOrder = db.findOne('orders', (o) => o.id === result.orderId);

    res.json({
      success: true,
      message: 'Payment verified and captured successfully by trusted server',
      order: updatedOrder,
      paymentId: result.paymentId,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

router.post('/verify', handlePaymentVerification);
router.post('/verify-signature', handlePaymentVerification);

// POST /api/payments/retry
// Retry payment for a failed attempt without creating duplicate orders
router.post('/retry', async (req, res) => {
  try {
    const { orderId, previousAttemptId } = req.body;
    const order = db.findOne('orders', (o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ error: 'Order is already marked as paid' });
    }

    // Generate a fresh idempotency key for the retry attempt
    const newIdempotencyKey = `idemp_retry_${order.id}_${Date.now()}`;
    const gatewayOrder = await paymentService.createPaymentOrder({
      orderId: order.id,
      amount: order.totalAmount,
      currency: order.currency,
      idempotencyKey: newIdempotencyKey,
    });

    db.logAudit('order', order.id, 'PAYMENT_RETRY_INITIATED', order.customerId, 'customer', {
      previousAttemptId,
      newAttemptId: gatewayOrder.paymentAttemptId,
    });

    res.json({
      success: true,
      message: 'Payment retry initialized for existing order',
      ...gatewayOrder,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/payments/cod-confirm
// Confirms Cash on Delivery with simulated customer OTP
router.post('/cod-confirm', (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const order = db.findOne('orders', (o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.totalAmount > 5000) {
      return res.status(400).json({ error: 'Cash on delivery is not eligible for orders exceeding ₹5,000' });
    }

    // In sandbox, accept any 4 or 6 digit OTP or standard '1234' / '123456'
    if (otp && otp.length < 4) {
      return res.status(400).json({ error: 'Invalid verification OTP' });
    }

    db.update('orders', (o) => o.id === order.id, {
      paymentStatus: 'COD Confirmed',
      status: 'Processing',
      paymentMethod: 'Cash on Delivery',
    });

    // Calculate seller commissions
    paymentService.calculateAndRecordSellerCommissions(order.id);

    db.logAudit('order', order.id, 'COD_VERIFIED_AND_CONFIRMED', order.customerId, 'customer', {
      totalAmount: order.totalAmount,
    });

    res.json({
      success: true,
      message: 'Cash on Delivery confirmed. Maker has been notified to start crafting.',
      order: db.findOne('orders', (o) => o.id === order.id),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/payments/helper/mock-signature
// Helper for frontend and integration tests to generate a valid sandbox signature
router.post('/mock-signature', (req, res) => {
  const { orderId, paymentId } = req.body;
  if (!orderId || !paymentId) {
    return res.status(400).json({ error: 'orderId and paymentId are required' });
  }
  const signature = paymentService.generateSignature(orderId, paymentId);
  res.json({
    success: true,
    signature,
    orderId,
    paymentId,
  });
});

module.exports = router;
