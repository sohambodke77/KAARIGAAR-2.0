const express = require('express');
const router = express.Router();
const db = require('../db/database');
const paymentService = require('../services/paymentService');

// POST /api/orders/create
router.post('/create', async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      deliveryType = 'standard',
      couponCode = '',
      paymentMethod = 'UPI',
      customer = {},
    } = req.body;

    if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.address || !deliveryAddress.pincode) {
      return res.status(400).json({ error: 'Complete delivery address is required' });
    }

    // 1. Calculate pricing securely on the server
    const pricing = paymentService.calculateOrderPricing({
      items,
      couponCode,
      deliveryType,
    });

    const orderId = `kg_ord_${Date.now()}`;
    const orderNumber = `KG-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = db.insert('orders', {
      id: orderId,
      orderNumber,
      customerId: customer.id || 'usr_guest',
      customerName: customer.name || deliveryAddress.name,
      customerEmail: customer.email || 'customer@kaarigaar.com',
      customerPhone: customer.phone || deliveryAddress.phone,
      deliveryAddress,
      deliveryType,
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      discount: pricing.discount,
      couponCode: pricing.discount > 0 ? couponCode.trim().toUpperCase() : null,
      taxGst: pricing.taxGst,
      totalAmount: pricing.totalAmount,
      currency: pricing.currency,
      status: paymentMethod === 'COD' ? 'Processing' : 'Pending Payment',
      paymentStatus: paymentMethod === 'COD' ? 'COD — Payment Pending' : 'Pending',
      paymentMethod,
      gatewayOrderId: null,
      gatewayPaymentId: null,
      trackingNumber: `DEL-PUN-${Math.floor(100000 + Math.random() * 900000)}`,
      courierPartner: deliveryType === 'express' ? 'Pune Artisan Priority Courier' : 'Pune Artisan Express Delivery',
      estimatedDelivery: deliveryType === 'express' ? '1 to 2 business days' : '3 to 5 business days',
    });

    // Insert items
    for (const item of pricing.validatedItems) {
      db.insert('order_items', {
        id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId,
        productId: item.productId,
        productName: item.productName,
        categoryId: item.categoryId,
        creatorId: item.creatorId,
        creatorName: item.creatorName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: item.customization,
        totalPrice: item.totalPrice,
      });
    }

    // If COD, calculate seller commissions right away
    if (paymentMethod === 'COD') {
      paymentService.calculateAndRecordSellerCommissions(orderId);
      db.logAudit('order', orderId, 'ORDER_PLACED_COD', customer.id || 'guest', 'customer', {
        totalAmount: pricing.totalAmount,
      });
    } else {
      db.logAudit('order', orderId, 'ORDER_CREATED', customer.id || 'guest', 'customer', {
        totalAmount: pricing.totalAmount,
      });
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      pricing,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders
router.get('/', (req, res) => {
  const { customerId, status } = req.query;
  const orders = db.find('orders', (o) => {
    if (customerId && o.customerId !== customerId) return false;
    if (status && status !== 'All' && o.status !== status) return false;
    return true;
  });

  // Attach first item thumbnail and item count for list rendering
  const enrichedOrders = orders.map((ord) => {
    const items = db.find('order_items', (i) => i.orderId === ord.id);
    return {
      ...ord,
      itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
      items,
    };
  });

  res.json({ success: true, count: enrichedOrders.length, orders: enrichedOrders });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const order = db.findOne('orders', (o) => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.find('order_items', (i) => i.orderId === order.id);
  const paymentAttempts = db.find('payment_attempts', (p) => p.orderId === order.id);
  const transactions = db.find('transactions', (t) => t.orderId === order.id);
  const refunds = db.find('refunds', (r) => r.orderId === order.id);

  // Build standard 5-step Amazon/Flipkart tracking timeline
  const isDelivered = order.status === 'Delivered';
  const isShipped = isDelivered || order.status === 'Shipped';
  const isQualityChecked = isShipped || order.status === 'Quality Checked' || order.status === 'Ready to Ship';
  const isInStudio = isQualityChecked || order.status === 'In Studio';
  const isConfirmed = order.paymentStatus === 'Paid' || order.paymentStatus === 'COD Confirmed';

  const timeline = [
    {
      title: 'Order Placed & Confirmed',
      description: `Payment verified via ${order.paymentMethod}. Maker notified.`,
      date: new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      completed: isConfirmed,
      current: isConfirmed && !isInStudio,
    },
    {
      title: 'In the Maker’s Studio',
      description: 'Artisan handcrafting, engraving, and customizing materials.',
      date: isInStudio ? 'In progress' : 'Pending',
      completed: isInStudio,
      current: isInStudio && !isQualityChecked,
    },
    {
      title: 'Quality Check & Packed',
      description: 'Passed artisanal finishing and packed in eco-friendly wrap.',
      date: isQualityChecked ? 'Completed' : 'Pending',
      completed: isQualityChecked,
      current: isQualityChecked && !isShipped,
    },
    {
      title: 'Dispatched with Courier',
      description: `${order.courierPartner} • Tracking #${order.trackingNumber}`,
      date: isShipped ? 'Dispatched' : 'Pending',
      completed: isShipped,
      current: isShipped && !isDelivered,
    },
    {
      title: 'Delivered',
      description: `Doorstep delivery at ${order.deliveryAddress.locality}, Pune.`,
      date: isDelivered ? order.estimatedDelivery : 'Expected ' + order.estimatedDelivery,
      completed: isDelivered,
      current: isDelivered,
    },
  ];

  res.json({
    success: true,
    order: {
      ...order,
      items,
      paymentAttempts,
      transactions,
      refunds,
      timeline,
    },
  });
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber, courierPartner } = req.body;

  const validStatuses = ['Processing', 'In Studio', 'Quality Checked', 'Ready to Ship', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const patch = { status };
  if (trackingNumber) patch.trackingNumber = trackingNumber;
  if (courierPartner) patch.courierPartner = courierPartner;

  const updated = db.update('orders', (o) => o.id === id || o.orderNumber === id, patch);
  if (updated.length === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const updatedOrder = updated[0];

  // If status is Delivered, update COD payments to Paid and seller commissions to 'eligible'
  if (status === 'Delivered') {
    if (
      updatedOrder.paymentStatus === 'COD — Payment Pending' ||
      updatedOrder.paymentStatus === 'COD Confirmed'
    ) {
      db.update('orders', (o) => o.id === updatedOrder.id, { paymentStatus: 'Paid' });
      updatedOrder.paymentStatus = 'Paid';
    }

    db.update(
      'order_seller_commissions',
      (c) => c.orderId === updatedOrder.id && c.settlementStatus === 'pending',
      { settlementStatus: 'eligible' }
    );
  }

  db.logAudit('order', updatedOrder.id, 'ORDER_STATUS_UPDATED', req.body.actorId || 'system', req.body.actorRole || 'seller', {
    newStatus: status,
  });

  res.json({ success: true, order: updatedOrder });
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const order = db.findOne('orders', (o) => o.id === id || o.orderNumber === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'Shipped' || order.status === 'Delivered') {
      return res.status(400).json({ error: 'Orders already dispatched cannot be cancelled directly. Please request a return.' });
    }

    if (order.paymentStatus === 'Paid') {
      // Auto-trigger gateway refund for paid orders
      const refundResult = await paymentService.processRefund({
        orderId: order.id,
        reason,
        refundAmount: order.totalAmount,
        actorId: req.body.actorId || 'customer',
        actorRole: 'customer',
      });
      return res.json({
        success: true,
        message: 'Order cancelled and refund initiated successfully',
        refund: refundResult.refund,
      });
    }

    // Unpaid or COD order
    db.update('orders', (o) => o.id === order.id, {
      status: 'Cancelled',
      paymentStatus: 'Cancelled',
    });

    db.update('order_seller_commissions', (c) => c.orderId === order.id, {
      settlementStatus: 'withheld',
    });

    db.logAudit('order', order.id, 'ORDER_CANCELLED', req.body.actorId || 'customer', 'customer', { reason });

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/orders/:id/refund-request
router.post('/:id/refund-request', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAmount } = req.body;

    const order = db.findOne('orders', (o) => o.id === id || o.orderNumber === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const result = await paymentService.processRefund({
      orderId: order.id,
      reason,
      refundAmount,
      actorId: req.body.actorId || 'customer',
      actorRole: 'customer',
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders/:id/invoice
router.get('/:id/invoice', (req, res) => {
  const { id } = req.params;
  const order = db.findOne('orders', (o) => o.id === id || o.orderNumber === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.find('order_items', (i) => i.orderId === order.id);

  const invoice = {
    invoiceNumber: `INV-KG-${order.orderNumber.replace('KG-', '')}-2026`,
    invoiceDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    marketplace: {
      name: 'KARIGAAR ARTISAN MARKETPLACE PRIVATE LIMITED',
      address: '7th Floor, Craft Atelier Tower, Kothrud, Pune, Maharashtra 411038',
      gstin: '27AABCK9412M1Z8',
      cin: 'U74999PN2026PTC198421',
      supportEmail: 'care@kaarigaar.in',
      supportPhone: '+91 20 6712 9000',
    },
    buyer: {
      name: order.deliveryAddress.name,
      phone: order.deliveryAddress.phone,
      address: `${order.deliveryAddress.address}, ${order.deliveryAddress.locality}`,
      city: `${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`,
      state: 'Maharashtra (27)',
    },
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      paymentMethod: order.paymentMethod,
      gatewayPaymentId: order.gatewayPaymentId || 'N/A (Cash on Delivery)',
      paymentStatus: order.paymentStatus,
    },
    items: items.map((it, idx) => ({
      serialNo: idx + 1,
      name: it.productName,
      artisanName: it.creatorName,
      hsnCode: '9701 (Handmade Art & Crafts)',
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      taxableAmount: it.totalPrice,
      cgstRate: '2.5%',
      cgstAmount: Math.round(it.totalPrice * 0.025 * 100) / 100,
      sgstRate: '2.5%',
      sgstAmount: Math.round(it.totalPrice * 0.025 * 100) / 100,
      totalAmount: it.totalPrice,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount,
    taxGstTotal: order.taxGst,
    totalAmount: order.totalAmount,
    currency: 'INR',
  };

  res.json({ success: true, invoice });
});

module.exports = router;
