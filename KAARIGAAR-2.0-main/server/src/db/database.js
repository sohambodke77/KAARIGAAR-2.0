const fs = require('fs');
const path = require('path');
const config = require('../config');

class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      products: [],
      orders: [],
      order_items: [],
      payment_attempts: [],
      transactions: [],
      refunds: [],
      seller_payout_accounts: [],
      commission_rules: [],
      order_seller_commissions: [],
      seller_settlements: [],
      webhook_logs: [],
      audit_logs: [],
    };
    this.init();
  }

  init() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } catch (err) {
        console.warn('Failed to parse database file, resetting with seed data:', err.message);
        this.seedInitialData();
        this.save();
      }
    } else {
      this.seedInitialData();
      this.save();
    }

    if (!this.data.products || this.data.products.length === 0) {
      this.seedProducts();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      try {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
      } catch (retryErr) {
        console.warn('Database save warning:', retryErr.message);
      }
    }
  }

  seedProducts() {
    this.data.products = [
      {
        id: 'prod_crochet_sunflower',
        name: 'Everlasting Hand-Hooked Sunflower Pot',
        price: 1299,
        stock: 25,
        categoryId: 'crochet',
        creatorId: 'creator_1',
        creatorName: 'Ananya Mukherjee',
      },
      {
        id: 'prod_crochet_tulip',
        name: 'Handmade Crochet Tulip Bouquet',
        price: 850,
        stock: 30,
        categoryId: 'crochet',
        creatorId: 'creator_1',
        creatorName: 'Ananya Mukherjee',
      },
      {
        id: 'prod_resin_nameplate',
        name: 'Teak & Emerald Resin Nameplate',
        price: 2150,
        stock: 12,
        categoryId: 'resin',
        creatorId: 'creator_me',
        creatorName: 'Sanket Joshi',
      },
      {
        id: 'prod_brass_diya',
        name: 'Hand-cast Floral Brass Diya',
        price: 650,
        stock: 40,
        categoryId: 'homedecor',
        creatorId: 'creator_2',
        creatorName: 'Sunita Devi',
      },
      {
        id: 'prod_ceramic_mug',
        name: 'Studio Pottery Stoneware Mug',
        price: 580,
        stock: 15,
        categoryId: 'pottery',
        creatorId: 'creator_me',
        creatorName: 'Sanket Joshi',
      },
      {
        id: 'prod_mithila_painting',
        name: 'Mithila Tree of Life Heritage Painting',
        price: 3200,
        stock: 5,
        categoryId: 'paintings',
        creatorId: 'creator_2',
        creatorName: 'Sunita Devi',
      },
      {
        id: 'prod_out_of_stock_sample',
        name: 'Rare Vintage Handwoven Brocade Stole',
        price: 3800,
        stock: 0,
        categoryId: 'homedecor',
        creatorId: 'creator_1',
        creatorName: 'Ananya Mukherjee',
      },
    ];
  }

  seedInitialData() {
    this.seedProducts();

    // 1. Commission Rules (Configurable by admin)
    this.data.commission_rules = [
      {
        id: 'comm_default',
        categoryId: '*',
        categoryName: 'All Other Crafts (Default)',
        commissionPercentage: 12.0,
        fixedFee: 15.0,
        isDefault: true,
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'comm_crochet',
        categoryId: 'crochet',
        categoryName: 'Crochet & Fiber Art',
        commissionPercentage: 10.0,
        fixedFee: 10.0,
        isDefault: false,
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'comm_jewellery',
        categoryId: 'jewellery',
        categoryName: 'Handmade Jewellery',
        commissionPercentage: 15.0,
        fixedFee: 20.0,
        isDefault: false,
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'comm_resin',
        categoryId: 'resin',
        categoryName: 'Resin Art & Botanicals',
        commissionPercentage: 12.0,
        fixedFee: 15.0,
        isDefault: false,
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'comm_pottery',
        categoryId: 'pottery',
        categoryName: 'Studio Ceramics & Pottery',
        commissionPercentage: 8.0,
        fixedFee: 10.0,
        isDefault: false,
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'comm_paintings',
        categoryId: 'paintings',
        categoryName: 'Traditional Folk Paintings & Heritage Art',
        commissionPercentage: 15.0,
        fixedFee: 25.0,
        isDefault: false,
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'comm_candles',
        categoryId: 'candles',
        categoryName: 'Organic Soy & Beeswax Candles',
        commissionPercentage: 10.0,
        fixedFee: 10.0,
        isDefault: false,
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
      },
    ];

    // 2. Seller Payout Accounts (Verified bank accounts)
    this.data.seller_payout_accounts = [
      {
        id: 'payout_acc_1',
        sellerId: 'creator_1', // Ananya Mukherjee (Vana Crochet)
        accountHolderName: 'Ananya Mukherjee',
        accountNumber: '91823481239102',
        accountNumberMasked: '•••• •••• •••• 9102',
        ifscCode: 'HDFC0001822',
        bankName: 'HDFC Bank, Kothrud Pune',
        upiVpa: 'ananya.mukherjee@okhdfcbank',
        verificationStatus: 'verified', // 'pending' | 'verified' | 'active'
        linkedAccountId: 'acc_rzp_linked_ananya_01',
        createdAt: '2026-01-10T10:00:00.000Z',
        updatedAt: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'payout_acc_2',
        sellerId: 'creator_2', // Sunita Devi (Mithila Heritage)
        accountHolderName: 'Sunita Devi',
        accountNumber: '50100492817291',
        accountNumberMasked: '•••• •••• •••• 7291',
        ifscCode: 'SBIN0004521',
        bankName: 'State Bank of India, Alandi Pune',
        upiVpa: 'sunitadevi@oksbi',
        verificationStatus: 'verified',
        linkedAccountId: 'acc_rzp_linked_sunita_02',
        createdAt: '2026-02-14T11:30:00.000Z',
        updatedAt: '2026-02-14T11:30:00.000Z',
      },
      {
        id: 'payout_acc_me',
        sellerId: 'creator_me', // Current logged-in artisan profile
        accountHolderName: 'Sanket Joshi',
        accountNumber: '382910482910',
        accountNumberMasked: '•••• •••• •••• 2910',
        ifscCode: 'ICIC0000341',
        bankName: 'ICICI Bank, Deccan Gymkhana Pune',
        upiVpa: 'sanket.craft@okicici',
        verificationStatus: 'verified',
        linkedAccountId: 'acc_rzp_linked_me_03',
        createdAt: '2026-03-01T09:00:00.000Z',
        updatedAt: '2026-03-01T09:00:00.000Z',
      },
    ];

    // 3. Demo Orders with verified transactions & seller earnings
    const pastDate1 = new Date(Date.now() - 7 * 86400000).toISOString();
    const pastDate2 = new Date(Date.now() - 3 * 86400000).toISOString();
    const today = new Date().toISOString();

    // Order 1: Delivered (Eligible / Settled)
    const order1Id = 'kg_ord_1001';
    const order1Num = 'KG-94821';
    this.data.orders.push({
      id: order1Id,
      orderNumber: order1Num,
      customerId: 'usr_cust_1',
      customerName: 'Pooja Deshmukh',
      customerEmail: 'pooja.deshmukh@gmail.com',
      customerPhone: '+91 98221 44556',
      deliveryAddress: {
        name: 'Pooja Deshmukh',
        phone: '+91 98221 44556',
        address: 'B-601, Rohan Ashima, Near MIT College',
        locality: 'Kothrud',
        city: 'Pune',
        pincode: '411038',
      },
      subtotal: 1299,
      deliveryFee: 0,
      discount: 100,
      taxGst: 65, // 5% GST included in artisan items
      totalAmount: 1199,
      currency: 'INR',
      status: 'Delivered',
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      gatewayOrderId: 'order_KG94821_RZP',
      gatewayPaymentId: 'pay_KG94821_RZP_01',
      trackingNumber: 'DEL-PUN-982144',
      courierPartner: 'Pune Artisan Express Delivery',
      estimatedDelivery: 'Delivered on Oct 10',
      createdAt: pastDate1,
      updatedAt: pastDate1,
    });

    this.data.order_items.push({
      id: 'item_1001_1',
      orderId: order1Id,
      productId: 'prod_crochet_sunflower',
      productName: 'Everlasting Hand-Hooked Sunflower Pot',
      categoryId: 'crochet',
      creatorId: 'creator_1',
      creatorName: 'Ananya Mukherjee',
      quantity: 1,
      unitPrice: 1299,
      customization: { initials: 'P&R', extraPrice: 0 },
      totalPrice: 1299,
    });

    this.data.payment_attempts.push({
      id: 'pay_att_1001',
      orderId: order1Id,
      attemptNumber: 1,
      idempotencyKey: 'idemp_order1_init',
      gateway: 'razorpay',
      gatewayOrderId: 'order_KG94821_RZP',
      gatewayPaymentId: 'pay_KG94821_RZP_01',
      amountInPaise: 119900,
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      vpa: 'pooja@okhdfcbank',
      errorCode: null,
      errorDescription: null,
      createdAt: pastDate1,
    });

    this.data.transactions.push({
      id: 'txn_1001_pay',
      orderId: order1Id,
      paymentAttemptId: 'pay_att_1001',
      transactionType: 'payment',
      amount: 1199,
      currency: 'INR',
      status: 'success',
      gatewayReference: 'pay_KG94821_RZP_01',
      metadata: { method: 'upi', bank: 'HDFC Bank' },
      createdAt: pastDate1,
    });

    // Commission for Order 1: 10% Crochet + ₹10 fixed fee = ₹139.90. Net to seller: ₹1,159.10 - ₹24 gateway fee = ₹1,135.10
    this.data.order_seller_commissions.push({
      id: 'comm_rec_1001',
      orderId: order1Id,
      orderNumber: order1Num,
      sellerId: 'creator_1',
      sellerName: 'Ananya Mukherjee',
      grossAmount: 1299,
      discountShare: 100,
      netOrderValue: 1199,
      commissionPercentage: 10.0,
      fixedFee: 10.0,
      platformCommission: 139.9,
      gatewayFee: 23.98, // 2% gateway processing
      netSellerAmount: 1035.12,
      settlementStatus: 'settled',
      settlementId: 'set_ref_98012',
      settledAt: pastDate2,
    });

    this.data.seller_settlements.push({
      id: 'set_ref_98012',
      settlementReference: 'SETTL-PUN-20261011-001',
      sellerId: 'creator_1',
      sellerName: 'Ananya Mukherjee',
      orderIds: [order1Id],
      amount: 1035.12,
      payoutStatus: 'completed',
      utrNumber: 'HDFCR202610119821034',
      gatewayPayoutId: 'pout_rzp_98012_succ',
      failureReason: null,
      createdAt: pastDate2,
      processedAt: pastDate2,
    });

    // Order 2: In Studio / Processing (Seller: creator_1, Pending settlement)
    const order2Id = 'kg_ord_1002';
    const order2Num = 'KG-94855';
    this.data.orders.push({
      id: order2Id,
      orderNumber: order2Num,
      customerId: 'usr_cust_2',
      customerName: 'Aditya Kulkarni',
      customerEmail: 'aditya.k@outlook.com',
      customerPhone: '+91 97654 32109',
      deliveryAddress: {
        name: 'Aditya Kulkarni',
        phone: '+91 97654 32109',
        address: '4th Floor, Platinum Square, Viman Nagar',
        locality: 'Viman Nagar',
        city: 'Pune',
        pincode: '411014',
      },
      subtotal: 1850,
      deliveryFee: 0,
      discount: 0,
      taxGst: 92.5,
      totalAmount: 1850,
      currency: 'INR',
      status: 'In Studio',
      paymentStatus: 'Paid',
      paymentMethod: 'Card',
      gatewayOrderId: 'order_KG94855_RZP',
      gatewayPaymentId: 'pay_KG94855_RZP_02',
      trackingNumber: 'DEL-PUN-982155',
      courierPartner: 'Pune Artisan Express Delivery',
      estimatedDelivery: '3 to 5 business days',
      createdAt: pastDate2,
      updatedAt: today,
    });

    this.data.order_items.push({
      id: 'item_1002_1',
      orderId: order2Id,
      productId: 'prod_crochet_bouquet',
      productName: 'Pastel Knitted Blossom Bouquet',
      categoryId: 'crochet',
      creatorId: 'creator_1',
      creatorName: 'Ananya Mukherjee',
      quantity: 1,
      unitPrice: 1850,
      customization: { message: 'Happy 5th Anniversary' },
      totalPrice: 1850,
    });

    this.data.payment_attempts.push({
      id: 'pay_att_1002',
      orderId: order2Id,
      attemptNumber: 1,
      idempotencyKey: 'idemp_order2_init',
      gateway: 'razorpay',
      gatewayOrderId: 'order_KG94855_RZP',
      gatewayPaymentId: 'pay_KG94855_RZP_02',
      amountInPaise: 185000,
      currency: 'INR',
      status: 'captured',
      method: 'card',
      errorCode: null,
      errorDescription: null,
      createdAt: pastDate2,
    });

    this.data.transactions.push({
      id: 'txn_1002_pay',
      orderId: order2Id,
      paymentAttemptId: 'pay_att_1002',
      transactionType: 'payment',
      amount: 1850,
      currency: 'INR',
      status: 'success',
      gatewayReference: 'pay_KG94855_RZP_02',
      metadata: { method: 'card', cardType: 'RuPay Platinum', last4: '8812' },
      createdAt: pastDate2,
    });

    this.data.order_seller_commissions.push({
      id: 'comm_rec_1002',
      orderId: order2Id,
      orderNumber: order2Num,
      sellerId: 'creator_1',
      sellerName: 'Ananya Mukherjee',
      grossAmount: 1850,
      discountShare: 0,
      netOrderValue: 1850,
      commissionPercentage: 10.0,
      fixedFee: 10.0,
      platformCommission: 195.0,
      gatewayFee: 37.0,
      netSellerAmount: 1618.0,
      settlementStatus: 'pending', // Pending because item is still being handcrafted!
      settlementId: null,
      settledAt: null,
    });

    // 4. Audit Log initial seed
    this.data.audit_logs.push({
      id: 'audit_init_1',
      entityType: 'system',
      entityId: 'kaarigaar_marketplace',
      action: 'SYSTEM_INITIALIZED',
      actorId: 'admin_sys',
      actorRole: 'admin',
      details: { message: 'KARIGAAR Payment & Payout Engine online in sandbox mode' },
      createdAt: pastDate1,
    });
  }

  // --- CRUD Operations ---

  find(tableName, filterFn = () => true) {
    if (!this.data[tableName]) return [];
    return this.data[tableName].filter(filterFn);
  }

  findOne(tableName, filterFn) {
    if (!this.data[tableName]) return null;
    return this.data[tableName].find(filterFn) || null;
  }

  insert(tableName, doc) {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }
    const record = {
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt || new Date().toISOString(),
    };
    this.data[tableName].unshift(record);
    this.save();
    return record;
  }

  update(tableName, filterFn, updateDataOrFn) {
    if (!this.data[tableName]) return [];
    let updatedCount = 0;
    const now = new Date().toISOString();

    this.data[tableName] = this.data[tableName].map((item) => {
      if (filterFn(item)) {
        updatedCount++;
        const patch = typeof updateDataOrFn === 'function' ? updateDataOrFn(item) : updateDataOrFn;
        return {
          ...item,
          ...patch,
          updatedAt: now,
        };
      }
      return item;
    });

    if (updatedCount > 0) {
      this.save();
    }
    return this.find(tableName, filterFn);
  }

  remove(tableName, filterFn) {
    if (!this.data[tableName]) return 0;
    const initialLen = this.data[tableName].length;
    this.data[tableName] = this.data[tableName].filter((item) => !filterFn(item));
    const removedCount = initialLen - this.data[tableName].length;
    if (removedCount > 0) {
      this.save();
    }
    return removedCount;
  }

  // Audit Log Helper
  logAudit(entityType, entityId, action, actorId = 'system', actorRole = 'system', details = {}) {
    const log = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      entityType,
      entityId,
      action,
      actorId,
      actorRole,
      details,
      createdAt: new Date().toISOString(),
    };
    this.insert('audit_logs', log);
    return log;
  }
}

const db = new JsonDatabase(config.dbFilePath);

module.exports = db;
