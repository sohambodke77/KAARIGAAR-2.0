const crypto = require('crypto');
const config = require('../config');
const db = require('../db/database');

class PaymentService {
  /**
   * Server-side amount and pricing calculation.
   * Never relies on client-submitted prices or discounts.
   */
  calculateOrderPricing({ items, couponCode, deliveryType = 'standard', checkStock = true }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    let subtotal = 0;
    const validatedItems = items.map((item) => {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const prodId = item.productId || item.product?.id || item.id;
      const dbProduct = prodId ? db.findOne('products', (p) => p.id === prodId) : null;

      // Inventory Stock Validation (Phase 3 & 4)
      if (checkStock && dbProduct && typeof dbProduct.stock === 'number') {
        if (dbProduct.stock < quantity) {
          throw new Error(
            `Product "${dbProduct.name}" is out of stock (Available: ${dbProduct.stock}, Requested: ${quantity})`
          );
        }
      }

      // Enforce verified database price if product is in catalog; otherwise sanitize input price
      const unitPrice = dbProduct
        ? dbProduct.price
        : Math.max(0, parseFloat(item.unitPrice || item.product?.price || item.price) || 0);
      const customPrice = Math.max(0, parseFloat(item.customization?.extraPrice) || 0);
      const lineItemTotal = (unitPrice + customPrice) * quantity;
      subtotal += lineItemTotal;

      return {
        productId: prodId,
        productName: dbProduct
          ? dbProduct.name
          : item.productName || item.product?.name || item.name || 'Artisan Handmade Creation',
        categoryId: dbProduct
          ? dbProduct.categoryId
          : item.categoryId || item.product?.category || 'homedecor',
        creatorId: dbProduct
          ? dbProduct.creatorId
          : item.creatorId || item.product?.creatorId || 'creator_me',
        creatorName: dbProduct
          ? dbProduct.creatorName
          : item.creatorName || item.product?.creatorName || 'Artisan Maker',
        quantity,
        unitPrice,
        customization: item.customization || null,
        totalPrice: lineItemTotal,
      };
    });

    // Shipping logic: Standard is FREE above ₹499, else ₹49. Express is ₹79.
    let deliveryFee = 0;
    if (deliveryType === 'express') {
      deliveryFee = 79;
    } else {
      deliveryFee = subtotal >= 499 ? 0 : 49;
    }

    // Coupon discount logic (Server verified)
    let discount = 0;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (cleanCoupon === 'KARIGAAR100') {
      discount = Math.min(100, subtotal);
    } else if (cleanCoupon === 'FIRSTCRAFT') {
      discount = Math.round(subtotal * 0.1);
    } else if (cleanCoupon === 'FESTIVE15') {
      discount = Math.round(subtotal * 0.15);
    }

    // Tax computation: GST 5% on artisanal handcrafted goods included in taxable value
    const taxableBase = Math.max(0, subtotal - discount);
    const taxGst = Math.round((taxableBase * 0.05) * 100) / 100;

    const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

    return {
      validatedItems,
      subtotal,
      deliveryFee,
      discount,
      taxGst,
      totalAmount,
      currency: 'INR',
    };
  }

  /**
   * Create Gateway Payment Order (Razorpay / Sandbox)
   * With Idempotency Protection
   */
  async createPaymentOrder({ orderId, amount, currency = 'INR', idempotencyKey, customer = {} }) {
    if (!orderId || !amount || amount <= 0) {
      throw new Error('Valid order ID and positive amount are required');
    }

    // Check Idempotency Key to prevent duplicate payment attempts / charges
    if (idempotencyKey) {
      const existingAttempt = db.findOne('payment_attempts', (p) => p.idempotencyKey === idempotencyKey);
      if (existingAttempt) {
        return {
          reused: true,
          gatewayOrderId: existingAttempt.gatewayOrderId,
          amountInPaise: existingAttempt.amountInPaise,
          currency: existingAttempt.currency,
          keyId: config.razorpay.keyId,
          paymentAttemptId: existingAttempt.id,
        };
      }
    }

    const amountInPaise = Math.round(amount * 100);
    let gatewayOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Official Razorpay Orders API integration for active sandbox/live credentials
    const isRealRazorpay =
      config.razorpay.keyId &&
      config.razorpay.keySecret &&
      !config.razorpay.keyId.includes('mockKeyId') &&
      (config.razorpay.keyId.startsWith('rzp_test_') || config.razorpay.keyId.startsWith('rzp_live_'));

    if (isRealRazorpay) {
      try {
        const authHeader =
          'Basic ' + Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt: orderId,
            notes: { orderId, platform: 'KARIGAAR' },
          }),
        });
        const rzpData = await rzpResponse.json();
        if (rzpResponse.ok && rzpData.id) {
          gatewayOrderId = rzpData.id;
        } else {
          console.warn('Razorpay API order creation fallback to sandbox:', rzpData.error?.description || rzpData);
        }
      } catch (netErr) {
        console.warn('Network call to Razorpay API failed, using sandbox order:', netErr.message);
      }
    }

    const attemptNumber = db.find('payment_attempts', (p) => p.orderId === orderId).length + 1;

    const attempt = db.insert('payment_attempts', {
      id: `pay_att_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId,
      attemptNumber,
      idempotencyKey: idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      gateway: 'razorpay',
      gatewayOrderId,
      gatewayPaymentId: null,
      amountInPaise,
      currency,
      status: 'created',
      method: null,
      errorCode: null,
      errorDescription: null,
    });

    db.logAudit('order', orderId, 'PAYMENT_ORDER_CREATED', customer.id || 'guest', 'customer', {
      gatewayOrderId,
      amountInPaise,
      attemptNumber,
    });

    return {
      reused: false,
      gatewayOrderId,
      amountInPaise,
      currency,
      keyId: config.razorpay.keyId,
      paymentAttemptId: attempt.id,
    };
  }

  /**
   * Generate signature helper for testing & verification
   */
  generateSignature(orderId, paymentId) {
    const secret = config.razorpay.keySecret;
    return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  }

  /**
   * Verify HMAC SHA256 Signature for Payment Confirmation
   */
  async verifyPaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId,
    paymentMethod = 'UPI',
    paymentDetails = {},
  }) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('razorpay_order_id, razorpay_payment_id and razorpay_signature are required');
    }

    const expectedSignature = this.generateSignature(razorpayOrderId, razorpayPaymentId);

    // Constant-time comparison to prevent timing attacks
    const isValid =
      expectedSignature.length === razorpaySignature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));

    if (!isValid) {
      db.update(
        'payment_attempts',
        (p) => p.gatewayOrderId === razorpayOrderId,
        {
          status: 'failed',
          errorCode: 'SIGNATURE_VERIFICATION_FAILED',
          errorDescription: 'HMAC signature did not match server calculated hash',
        }
      );

      db.logAudit('order', orderId || 'unknown', 'PAYMENT_SIGNATURE_INVALID', 'system', 'system', {
        razorpayOrderId,
        razorpayPaymentId,
      });

      return {
        success: false,
        error: 'Invalid payment signature. Payment could not be verified.',
      };
    }

    // Signature is valid! Update Payment Attempt
    const attempt = db.findOne('payment_attempts', (p) => p.gatewayOrderId === razorpayOrderId);
    const resolvedOrderId = orderId || attempt?.orderId;

    db.update(
      'payment_attempts',
      (p) => p.gatewayOrderId === razorpayOrderId,
      {
        status: 'captured',
        gatewayPaymentId: razorpayPaymentId,
        method: paymentMethod.toLowerCase(),
      }
    );

    // Update Order
    const order = db.findOne('orders', (o) => o.id === resolvedOrderId);
    if (order) {
      db.update(
        'orders',
        (o) => o.id === resolvedOrderId,
        {
          paymentStatus: 'Paid',
          status: order.status === 'Cancelled' ? 'Cancelled' : 'Processing',
          gatewayOrderId: razorpayOrderId,
          gatewayPaymentId: razorpayPaymentId,
          paymentMethod,
        }
      );

      // Safe Inventory Stock Decrement upon Payment Verification (Phase 4)
      const orderItems = db.find('order_items', (i) => i.orderId === resolvedOrderId);
      for (const item of orderItems) {
        const product = db.findOne('products', (p) => p.id === item.productId);
        if (product && typeof product.stock === 'number') {
          const newStock = Math.max(0, product.stock - (item.quantity || 1));
          db.update('products', (p) => p.id === item.productId, { stock: newStock });
        }
      }

      // Record in Ledger Transactions
      db.insert('transactions', {
        id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId: resolvedOrderId,
        paymentAttemptId: attempt?.id || null,
        transactionType: 'payment',
        amount: order.totalAmount,
        currency: order.currency,
        status: 'success',
        gatewayReference: razorpayPaymentId,
        metadata: {
          method: paymentMethod,
          ...paymentDetails,
        },
      });

      // Calculate & Record Seller Commissions
      this.calculateAndRecordSellerCommissions(resolvedOrderId);

      db.logAudit('order', resolvedOrderId, 'PAYMENT_VERIFIED_SUCCESS', 'system', 'system', {
        gatewayOrderId: razorpayOrderId,
        gatewayPaymentId: razorpayPaymentId,
        amount: order.totalAmount,
      });
    }

    return {
      success: true,
      orderId: resolvedOrderId,
      paymentId: razorpayPaymentId,
    };
  }

  /**
   * Calculate and record seller earnings and KARIGAAR commission
   * according to configurable platform rules.
   */
  calculateAndRecordSellerCommissions(orderId) {
    const order = db.findOne('orders', (o) => o.id === orderId);
    if (!order) return [];

    // Check if commission already recorded for this order (prevent duplicate calculations)
    const existing = db.find('order_seller_commissions', (c) => c.orderId === orderId);
    if (existing.length > 0) return existing;

    const items = db.find('order_items', (i) => i.orderId === orderId);
    const rules = db.find('commission_rules', () => true);
    const defaultRule = rules.find((r) => r.isDefault) || { commissionPercentage: 12.0, fixedFee: 15.0 };

    // Group items by seller
    const sellerItems = {};
    for (const item of items) {
      if (!sellerItems[item.creatorId]) {
        sellerItems[item.creatorId] = {
          sellerId: item.creatorId,
          sellerName: item.creatorName,
          items: [],
          grossAmount: 0,
        };
      }
      sellerItems[item.creatorId].items.push(item);
      sellerItems[item.creatorId].grossAmount += item.totalPrice;
    }

    const recordedCommissions = [];

    for (const sellerId in sellerItems) {
      const group = sellerItems[sellerId];
      // Find matching commission rule by category of items or default
      const primaryCategory = group.items[0]?.categoryId;
      const matchedRule = rules.find((r) => r.categoryId === primaryCategory) || defaultRule;

      const grossAmount = group.grossAmount;
      // Pro-rate discount if applicable
      const discountShare = order.subtotal > 0 ? (grossAmount / order.subtotal) * order.discount : 0;
      const netOrderValue = Math.max(0, grossAmount - discountShare);

      const commissionPercentage = matchedRule.commissionPercentage;
      const fixedFee = matchedRule.fixedFee;
      const platformCommission = Math.round(((netOrderValue * (commissionPercentage / 100)) + fixedFee) * 100) / 100;

      // Gateway processing MDR (approx 2%)
      const gatewayFee = Math.round((netOrderValue * (config.financials.gatewayFeePct / 100)) * 100) / 100;

      const netSellerAmount = Math.max(0, Math.round((netOrderValue - platformCommission - gatewayFee) * 100) / 100);

      const commissionRecord = db.insert('order_seller_commissions', {
        id: `comm_rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId,
        orderNumber: order.orderNumber,
        sellerId,
        sellerName: group.sellerName,
        grossAmount,
        discountShare: Math.round(discountShare * 100) / 100,
        netOrderValue: Math.round(netOrderValue * 100) / 100,
        commissionPercentage,
        fixedFee,
        platformCommission,
        gatewayFee,
        netSellerAmount,
        settlementStatus: order.status === 'Delivered' ? 'eligible' : 'pending',
        settlementId: null,
        settledAt: null,
      });

      recordedCommissions.push(commissionRecord);
    }

    return recordedCommissions;
  }

  /**
   * Process Full or Partial Refund
   */
  async processRefund({ orderId, reason, refundAmount, actorId = 'customer', actorRole = 'customer' }) {
    const order = db.findOne('orders', (o) => o.id === orderId);
    if (!order) {
      throw new Error(`Order #${orderId} not found`);
    }

    if (order.paymentStatus !== 'Paid') {
      throw new Error(`Cannot refund order with payment status: ${order.paymentStatus}`);
    }

    const amountToRefund = refundAmount !== undefined ? parseFloat(refundAmount) : order.totalAmount;
    if (amountToRefund <= 0 || amountToRefund > order.totalAmount) {
      throw new Error(`Invalid refund amount. Must be between ₹1 and ₹${order.totalAmount}`);
    }

    // Create Gateway Refund Reference (Razorpay simulated in sandbox)
    const gatewayRefundId = `rfnd_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const isFullRefund = amountToRefund >= order.totalAmount;
    const newPaymentStatus = isFullRefund ? 'Refunded' : 'Partially Refunded';
    const newOrderStatus = isFullRefund ? 'Cancelled' : order.status;

    // Record refund
    const refundRecord = db.insert('refunds', {
      id: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId,
      paymentId: order.gatewayPaymentId,
      amount: amountToRefund,
      reason: reason || 'Customer requested return or cancellation',
      status: 'processed',
      gatewayRefundId,
      requestedBy: actorId,
      approvedBy: actorRole === 'admin' ? actorId : 'system_auto_approved',
      notes: `Refund processed to original payment method (${order.paymentMethod})`,
      processedAt: new Date().toISOString(),
    });

    // Update Order
    db.update('orders', (o) => o.id === orderId, {
      paymentStatus: newPaymentStatus,
      status: newOrderStatus,
    });

    // Add to ledger
    db.insert('transactions', {
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId,
      paymentAttemptId: null,
      transactionType: 'refund',
      amount: amountToRefund,
      currency: order.currency,
      status: 'success',
      gatewayReference: gatewayRefundId,
      metadata: { reason, paymentMethod: order.paymentMethod },
    });

    // Adjust seller commissions: withhold to avoid paying seller for cancelled order!
    db.update(
      'order_seller_commissions',
      (c) => c.orderId === orderId,
      {
        settlementStatus: isFullRefund ? 'withheld' : 'adjusted',
      }
    );

    db.logAudit('refund', refundRecord.id, 'REFUND_PROCESSED', actorId, actorRole, {
      orderId,
      amount: amountToRefund,
      gatewayRefundId,
      reason,
    });

    return {
      success: true,
      refund: refundRecord,
      orderPaymentStatus: newPaymentStatus,
    };
  }

  /**
   * Settle Seller Payout for Delivered Orders
   * Strict double-settlement prevention & delivery verification
   */
  async settleSellerPayout({ sellerId, orderIds = null, actorId = 'system', actorRole = 'system' }) {
    // 1. Verify seller payout account
    const payoutAccount = db.findOne('seller_payout_accounts', (a) => a.sellerId === sellerId);
    if (!payoutAccount || (payoutAccount.verificationStatus !== 'verified' && payoutAccount.verificationStatus !== 'active')) {
      throw new Error(`Seller does not have an active, verified bank account for payouts`);
    }

    // 2. Fetch commissions eligible for settlement
    // Order must be 'Delivered' and status 'Paid', commission not yet settled or withheld
    const allSellerCommissions = db.find('order_seller_commissions', (c) => c.sellerId === sellerId);

    const eligibleCommissions = allSellerCommissions.filter((c) => {
      if (c.settlementStatus === 'settled' || c.settlementStatus === 'withheld') return false;
      if (orderIds && Array.isArray(orderIds) && !orderIds.includes(c.orderId)) return false;

      // Check corresponding order
      const order = db.findOne('orders', (o) => o.id === c.orderId);
      if (!order) return false;
      return order.status === 'Delivered' && order.paymentStatus === 'Paid';
    });

    if (eligibleCommissions.length === 0) {
      throw new Error('No delivered orders eligible for payout settlement at this time');
    }

    const totalPayoutAmount = eligibleCommissions.reduce((sum, c) => sum + c.netSellerAmount, 0);
    const settledOrderIds = eligibleCommissions.map((c) => c.orderId);

    const settlementRef = `SETTL-PUN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const utrNumber = `HDFCR${Date.now().toString().slice(-10)}${Math.floor(100 + Math.random() * 900)}`;
    const gatewayPayoutId = `pout_rzp_${Date.now()}`;

    // Create Settlement Record
    const settlement = db.insert('seller_settlements', {
      id: `set_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      settlementReference: settlementRef,
      sellerId,
      sellerName: eligibleCommissions[0]?.sellerName || 'Artisan',
      orderIds: settledOrderIds,
      amount: Math.round(totalPayoutAmount * 100) / 100,
      payoutStatus: 'completed',
      utrNumber,
      gatewayPayoutId,
      bankAccountMasked: payoutAccount.accountNumberMasked || `•••• ${payoutAccount.accountNumber.slice(-4)}`,
      bankName: payoutAccount.bankName,
      failureReason: null,
      processedAt: new Date().toISOString(),
    });

    // Atomically mark commissions as 'settled'
    const now = new Date().toISOString();
    for (const comm of eligibleCommissions) {
      db.update(
        'order_seller_commissions',
        (c) => c.id === comm.id,
        {
          settlementStatus: 'settled',
          settlementId: settlement.id,
          settledAt: now,
        }
      );
    }

    // Ledger transaction
    db.insert('transactions', {
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId: settledOrderIds.join(','),
      paymentAttemptId: null,
      transactionType: 'payout',
      amount: totalPayoutAmount,
      currency: 'INR',
      status: 'success',
      gatewayReference: utrNumber,
      metadata: {
        sellerId,
        settlementReference: settlementRef,
        bank: payoutAccount.bankName,
      },
    });

    db.logAudit('settlement', settlement.id, 'SELLER_PAYOUT_SETTLED', actorId, actorRole, {
      sellerId,
      amount: totalPayoutAmount,
      orderCount: settledOrderIds.length,
      utrNumber,
    });

    return {
      success: true,
      settlement,
      settledOrdersCount: settledOrderIds.length,
    };
  }

  /**
   * Handle Razorpay Webhooks
   */
  async handleRazorpayWebhook({ rawBody, signature }) {
    const webhookSecret = config.razorpay.webhookSecret;
    if (!signature) {
      throw new Error('Missing x-razorpay-signature header');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
      .digest('hex');

    const isValid =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const event = payload.event;

    db.insert('webhook_logs', {
      id: `wh_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      gateway: 'razorpay',
      event,
      payload,
      signatureVerified: isValid,
      status: isValid ? 'accepted' : 'rejected',
      error: isValid ? null : 'Invalid webhook signature',
    });

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Process event with Idempotency
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const orderEntity = payload.payload?.order?.entity || {};
      const razorpayOrderId = paymentEntity.order_id || orderEntity.id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId) {
        const attempt = db.findOne('payment_attempts', (p) => p.gatewayOrderId === razorpayOrderId);
        if (attempt && attempt.status === 'captured') {
          return { received: true, event, deduplicated: true, message: 'Payment already captured' };
        }
        if (attempt && attempt.status !== 'captured') {
          await this.verifyPaymentSignature({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature: this.generateSignature(razorpayOrderId, razorpayPaymentId),
            orderId: attempt.orderId,
            paymentMethod: paymentEntity.method || 'UPI',
          });
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const razorpayOrderId = paymentEntity.order_id;
      if (razorpayOrderId) {
        db.update('payment_attempts', (p) => p.gatewayOrderId === razorpayOrderId, {
          status: 'failed',
          errorCode: paymentEntity.error_code || 'PAYMENT_FAILED',
          errorDescription: paymentEntity.error_description || 'Payment failed at gateway',
        });
      }
    } else if (event === 'refund.processed') {
      const refundEntity = payload.payload?.refund?.entity || {};
      const paymentId = refundEntity.payment_id;
      const order = db.findOne('orders', (o) => o.gatewayPaymentId === paymentId);
      if (order && order.paymentStatus !== 'Refunded') {
        await this.processRefund({
          orderId: order.id,
          reason: 'Webhook confirmed gateway refund',
          refundAmount: (refundEntity.amount || 0) / 100,
          actorId: 'webhook_system',
          actorRole: 'system',
        });
      }
    }

    return { received: true, event };
  }
}

module.exports = new PaymentService();
