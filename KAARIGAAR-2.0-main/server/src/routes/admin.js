const express = require('express');
const router = express.Router();
const db = require('../db/database');
const paymentService = require('../services/paymentService');

// GET /api/admin/commission-rules
router.get('/commission-rules', (req, res) => {
  const rules = db.find('commission_rules', () => true);
  res.json({ success: true, count: rules.length, rules });
});

// PUT /api/admin/commission-rules
// Update or create commission rule
router.put('/commission-rules', (req, res) => {
  try {
    const { categoryId, categoryName, commissionPercentage, fixedFee, isDefault } = req.body;

    if (commissionPercentage === undefined || commissionPercentage < 0 || commissionPercentage > 50) {
      return res.status(400).json({ error: 'Commission percentage must be between 0% and 50%' });
    }

    const cleanPct = parseFloat(commissionPercentage);
    const cleanFee = parseFloat(fixedFee || 0);

    const existing = db.findOne('commission_rules', (r) => r.categoryId === categoryId);
    let rule;

    if (existing) {
      const updated = db.update(
        'commission_rules',
        (r) => r.categoryId === categoryId,
        {
          commissionPercentage: cleanPct,
          fixedFee: cleanFee,
          categoryName: categoryName || existing.categoryName,
          updatedBy: req.body.adminId || 'admin',
          updatedAt: new Date().toISOString(),
        }
      );
      rule = updated[0];
    } else {
      rule = db.insert('commission_rules', {
        id: `comm_${categoryId}_${Date.now()}`,
        categoryId: categoryId || '*',
        categoryName: categoryName || 'Custom Craft Category',
        commissionPercentage: cleanPct,
        fixedFee: cleanFee,
        isDefault: Boolean(isDefault),
        updatedBy: req.body.adminId || 'admin',
        updatedAt: new Date().toISOString(),
      });
    }

    db.logAudit('commission_rule', rule.id, 'COMMISSION_RULE_UPDATED', req.body.adminId || 'admin', 'admin', {
      categoryId,
      commissionPercentage: cleanPct,
      fixedFee: cleanFee,
    });

    res.json({
      success: true,
      message: 'Commission rule updated successfully',
      rule,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/reconciliation
// Financial Reconciliation Report
router.get('/reconciliation', (req, res) => {
  const orders = db.find('orders', () => true);
  const transactions = db.find('transactions', () => true);
  const commissions = db.find('order_seller_commissions', () => true);
  const settlements = db.find('seller_settlements', () => true);
  const refunds = db.find('refunds', () => true);

  // 1. Gross Merchandise Value (GMV) of all paid orders
  const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid' || o.paymentStatus === 'COD Confirmed');
  const totalGmv = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // 2. Total Platform Revenue (Commissions earned)
  const platformRevenueEarned = commissions
    .filter((c) => c.settlementStatus !== 'withheld')
    .reduce((sum, c) => sum + (c.platformCommission || 0), 0);

  // 3. Total Gateway Processing Fees
  const gatewayFeesTotal = commissions
    .filter((c) => c.settlementStatus !== 'withheld')
    .reduce((sum, c) => sum + (c.gatewayFee || 0), 0);

  // 4. Total Payouts Disbursed to Sellers
  const payoutsDisbursed = settlements
    .filter((s) => s.payoutStatus === 'completed')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  // 5. Total Refunds Processed
  const totalRefundedAmount = refunds
    .filter((r) => r.status === 'processed')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // 6. Remaining Seller Liabilities (Unsettled delivered or processing orders)
  const sellerLiabilities = commissions
    .filter((c) => c.settlementStatus === 'pending' || c.settlementStatus === 'eligible')
    .reduce((sum, c) => sum + (c.netSellerAmount || 0), 0);

  res.json({
    success: true,
    reconciliation: {
      totalGmv: Math.round(totalGmv * 100) / 100,
      totalOrdersCount: orders.length,
      paidOrdersCount: paidOrders.length,
      platformRevenueEarned: Math.round(platformRevenueEarned * 100) / 100,
      gatewayFeesTotal: Math.round(gatewayFeesTotal * 100) / 100,
      payoutsDisbursed: Math.round(payoutsDisbursed * 100) / 100,
      totalRefundedAmount: Math.round(totalRefundedAmount * 100) / 100,
      sellerLiabilities: Math.round(sellerLiabilities * 100) / 100,
      netPlatformProfit: Math.round((platformRevenueEarned - gatewayFeesTotal) * 100) / 100,
      currency: 'INR',
      generatedAt: new Date().toISOString(),
    },
  });
});

// GET /api/admin/refunds
router.get('/refunds', (req, res) => {
  const refunds = db.find('refunds', () => true);
  const enriched = refunds.map((r) => {
    const order = db.findOne('orders', (o) => o.id === r.orderId);
    return {
      ...r,
      orderNumber: order?.orderNumber || 'N/A',
      customerName: order?.customerName || 'N/A',
      totalOrderAmount: order?.totalAmount || 0,
    };
  });
  res.json({ success: true, count: enriched.length, refunds: enriched });
});

// POST /api/admin/refunds/:id/action
router.post('/refunds/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNotes } = req.body; // 'approve' | 'reject'

    const refund = db.findOne('refunds', (r) => r.id === id);
    if (!refund) return res.status(404).json({ error: 'Refund request not found' });

    if (action === 'approve') {
      db.update('refunds', (r) => r.id === id, {
        status: 'processed',
        approvedBy: req.body.adminId || 'admin',
        notes: adminNotes || refund.notes,
        processedAt: new Date().toISOString(),
      });
      db.logAudit('refund', id, 'REFUND_APPROVED', req.body.adminId || 'admin', 'admin', { refundId: id });
      return res.json({ success: true, message: 'Refund approved and processed' });
    } else if (action === 'reject') {
      db.update('refunds', (r) => r.id === id, {
        status: 'rejected',
        notes: adminNotes || 'Rejected by admin review',
      });
      db.logAudit('refund', id, 'REFUND_REJECTED', req.body.adminId || 'admin', 'admin', { refundId: id, adminNotes });
      return res.json({ success: true, message: 'Refund request rejected' });
    }

    res.status(400).json({ error: 'Action must be approve or reject' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/sellers
router.get('/sellers', (req, res) => {
  const accounts = db.find('seller_payout_accounts', () => true);
  res.json({ success: true, count: accounts.length, sellers: accounts });
});

// POST /api/admin/sellers/:id/verify
router.post('/sellers/:id/verify', (req, res) => {
  const { id } = req.params;
  const updated = db.update('seller_payout_accounts', (a) => a.id === id || a.sellerId === id, {
    verificationStatus: 'verified',
  });

  if (updated.length === 0) {
    return res.status(404).json({ error: 'Seller payout account not found' });
  }

  db.logAudit('seller_payout_account', id, 'SELLER_KYC_VERIFIED', req.body.adminId || 'admin', 'admin', {});
  res.json({ success: true, message: 'Seller bank account verified for payouts', account: updated[0] });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req, res) => {
  const { entityType, action, limit = 50 } = req.query;
  const logs = db.find('audit_logs', (l) => {
    if (entityType && l.entityType !== entityType) return false;
    if (action && l.action !== action) return false;
    return true;
  });

  res.json({ success: true, count: logs.length, logs: logs.slice(0, parseInt(limit, 10)) });
});

module.exports = router;
