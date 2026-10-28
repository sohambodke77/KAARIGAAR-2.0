const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');

// POST /api/webhooks/razorpay
router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await paymentService.handleRazorpayWebhook({
      rawBody,
      signature,
    });

    res.json(result);
  } catch (err) {
    console.error('Razorpay Webhook Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/webhooks/cashfree
router.post('/cashfree', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    console.log('Received Cashfree webhook event:', req.body?.type);
    res.json({ received: true, gateway: 'cashfree' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
