const express = require('express');
const router = express.Router();
const db = require('../db/database');
const paymentService = require('../services/paymentService');

// GET /api/sellers/:sellerId/dashboard
// Returns complete Earnings & Payments metrics for the seller
router.get('/:sellerId/dashboard', (req, res) => {
  const { sellerId } = req.params;

  // Fetch all commissions associated with this seller
  const commissions = db.find('order_seller_commissions', (c) => c.sellerId === sellerId);
  const settlements = db.find('seller_settlements', (s) => s.sellerId === sellerId);
  const payoutAccount = db.findOne('seller_payout_accounts', (a) => a.sellerId === sellerId);

  // Compute metrics:
  // 1. Gross Order Value
  const grossOrderValue = commissions.reduce((sum, c) => sum + (c.grossAmount || 0), 0);

  // 2. Platform Commission
  const totalPlatformCommission = commissions.reduce((sum, c) => sum + (c.platformCommission || 0), 0);

  // 3. Gateway Fees
  const totalGatewayFees = commissions.reduce((sum, c) => sum + (c.gatewayFee || 0), 0);

  // 4. Refunds & Adjustments
  const totalRefundAdjustments = commissions
    .filter((c) => c.settlementStatus === 'withheld' || c.settlementStatus === 'adjusted')
    .reduce((sum, c) => sum + (c.grossAmount || 0), 0);

  // 5. Paid-out Earnings (from completed settlements)
  const paidOutEarnings = settlements
    .filter((s) => s.payoutStatus === 'completed')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  // 6. Available Balance (delivered orders ready for payout)
  const availableBalance = commissions
    .filter((c) => {
      if (c.settlementStatus === 'eligible') return true;
      if (c.settlementStatus === 'pending') {
        const ord = db.findOne('orders', (o) => o.id === c.orderId);
        return ord && ord.status === 'Delivered' && ord.paymentStatus === 'Paid';
      }
      return false;
    })
    .reduce((sum, c) => sum + (c.netSellerAmount || 0), 0);

  // 7. Pending Settlement (orders in transit, in studio, or awaiting delivery)
  const pendingSettlement = commissions
    .filter((c) => {
      if (c.settlementStatus === 'settled' || c.settlementStatus === 'withheld') return false;
      const ord = db.findOne('orders', (o) => o.id === c.orderId);
      return !ord || ord.status !== 'Delivered';
    })
    .reduce((sum, c) => sum + (c.netSellerAmount || 0), 0);

  // 8. Total Net Earnings
  const totalNetEarnings = commissions
    .filter((c) => c.settlementStatus !== 'withheld')
    .reduce((sum, c) => sum + (c.netSellerAmount || 0), 0);

  res.json({
    success: true,
    sellerId,
    metrics: {
      grossOrderValue: Math.round(grossOrderValue * 100) / 100,
      totalSalesCount: commissions.length,
      platformCommission: Math.round(totalPlatformCommission * 100) / 100,
      gatewayFees: Math.round(totalGatewayFees * 100) / 100,
      refundAdjustments: Math.round(totalRefundAdjustments * 100) / 100,
      totalNetEarnings: Math.round(totalNetEarnings * 100) / 100,
      paidOutEarnings: Math.round(paidOutEarnings * 100) / 100,
      availableBalance: Math.round(availableBalance * 100) / 100,
      pendingSettlement: Math.round(pendingSettlement * 100) / 100,
    },
    payoutAccount: payoutAccount
      ? {
          id: payoutAccount.id,
          accountHolderName: payoutAccount.accountHolderName,
          accountNumberMasked: payoutAccount.accountNumberMasked,
          ifscCode: payoutAccount.ifscCode,
          bankName: payoutAccount.bankName,
          upiVpa: payoutAccount.upiVpa,
          verificationStatus: payoutAccount.verificationStatus,
        }
      : null,
  });
});

// GET /api/sellers/:sellerId/orders
// Returns orders and commission breakdown for the seller
router.get('/:sellerId/orders', (req, res) => {
  const { sellerId } = req.params;
  const commissions = db.find('order_seller_commissions', (c) => c.sellerId === sellerId);

  const enrichedOrders = commissions.map((comm) => {
    const order = db.findOne('orders', (o) => o.id === comm.orderId);
    const items = db.find('order_items', (i) => i.orderId === comm.orderId && i.creatorId === sellerId);

    // Determine live settlement readiness
    let liveSettlementStatus = comm.settlementStatus;
    if (comm.settlementStatus === 'pending' && order && order.status === 'Delivered') {
      liveSettlementStatus = 'eligible';
    }

    return {
      commissionId: comm.id,
      orderId: comm.orderId,
      orderNumber: comm.orderNumber,
      orderDate: order?.createdAt || comm.createdAt,
      orderStatus: order?.status || 'Unknown',
      paymentStatus: order?.paymentStatus || 'Unknown',
      deliveryAddress: order?.deliveryAddress,
      items,
      grossAmount: comm.grossAmount,
      commissionPercentage: comm.commissionPercentage,
      fixedFee: comm.fixedFee,
      platformCommission: comm.platformCommission,
      gatewayFee: comm.gatewayFee,
      netSellerAmount: comm.netSellerAmount,
      settlementStatus: liveSettlementStatus,
      settlementId: comm.settlementId,
      settledAt: comm.settledAt,
    };
  });

  res.json({ success: true, count: enrichedOrders.length, orders: enrichedOrders });
});

// GET /api/sellers/:sellerId/payout-account
router.get('/:sellerId/payout-account', (req, res) => {
  const { sellerId } = req.params;
  const account = db.findOne('seller_payout_accounts', (a) => a.sellerId === sellerId);

  if (!account) {
    return res.json({
      success: true,
      hasAccount: false,
      account: null,
    });
  }

  res.json({
    success: true,
    hasAccount: true,
    account: {
      id: account.id,
      sellerId: account.sellerId,
      accountHolderName: account.accountHolderName,
      accountNumberMasked: account.accountNumberMasked,
      ifscCode: account.ifscCode,
      bankName: account.bankName,
      upiVpa: account.upiVpa,
      verificationStatus: account.verificationStatus,
      createdAt: account.createdAt,
    },
  });
});

// POST /api/sellers/:sellerId/payout-account
// Onboard or update seller bank details with verification
router.post('/:sellerId/payout-account', (req, res) => {
  try {
    const { sellerId } = req.params;
    const { accountHolderName, accountNumber, ifscCode, bankName, upiVpa } = req.body;

    if (!accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({ error: 'Account holder name, account number, and IFSC code are required' });
    }

    // Validate IFSC code (Format: 4 letters, 0, 6 digits/letters)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!ifscRegex.test(cleanIfsc)) {
      return res.status(400).json({ error: 'Invalid Indian Financial System Code (IFSC). Example: HDFC0001822' });
    }

    if (accountNumber.length < 9 || accountNumber.length > 18) {
      return res.status(400).json({ error: 'Bank account number must be between 9 and 18 digits' });
    }

    const maskedNumber = `•••• •••• •••• ${accountNumber.slice(-4)}`;
    const resolvedBank = bankName || `Bank (${cleanIfsc.substring(0, 4)}) Pune Branch`;

    const existing = db.findOne('seller_payout_accounts', (a) => a.sellerId === sellerId);

    let record;
    if (existing) {
      const updated = db.update(
        'seller_payout_accounts',
        (a) => a.sellerId === sellerId,
        {
          accountHolderName,
          accountNumber,
          accountNumberMasked: maskedNumber,
          ifscCode: cleanIfsc,
          bankName: resolvedBank,
          upiVpa: upiVpa || existing.upiVpa || '',
          verificationStatus: 'verified', // Auto-verified in sandbox
        }
      );
      record = updated[0];
    } else {
      record = db.insert('seller_payout_accounts', {
        id: `payout_acc_${Date.now()}`,
        sellerId,
        accountHolderName,
        accountNumber,
        accountNumberMasked: maskedNumber,
        ifscCode: cleanIfsc,
        bankName: resolvedBank,
        upiVpa: upiVpa || '',
        verificationStatus: 'verified',
        linkedAccountId: `acc_rzp_linked_${sellerId}_${Date.now()}`,
      });
    }

    db.logAudit('seller_payout_account', record.id, 'SELLER_BANK_ONBOARDED', sellerId, 'seller', {
      bankName: resolvedBank,
      ifsc: cleanIfsc,
      accountHolder: accountHolderName,
    });

    res.json({
      success: true,
      message: 'Artisan bank payout account verified and linked successfully',
      account: {
        id: record.id,
        sellerId: record.sellerId,
        accountHolderName: record.accountHolderName,
        accountNumberMasked: record.accountNumberMasked,
        ifscCode: record.ifscCode,
        bankName: record.bankName,
        upiVpa: record.upiVpa,
        verificationStatus: record.verificationStatus,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/sellers/:sellerId/request-payout
// Triggers settlement for delivered orders
router.post('/:sellerId/request-payout', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { orderIds } = req.body;

    const result = await paymentService.settleSellerPayout({
      sellerId,
      orderIds: orderIds || null,
      actorId: sellerId,
      actorRole: 'seller',
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/sellers/:sellerId/settlements
router.get('/:sellerId/settlements', (req, res) => {
  const { sellerId } = req.params;
  const settlements = db.find('seller_settlements', (s) => s.sellerId === sellerId);
  res.json({ success: true, count: settlements.length, settlements });
});

module.exports = router;
