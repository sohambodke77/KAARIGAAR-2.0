import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL: Defaults to localhost:5000 for web/emulator, or env var
const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:5000/api';

export interface ApiOrderPricing {
  validatedItems: any[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  taxGst: number;
  totalAmount: number;
  currency: string;
}

export interface ApiOrderResult {
  success: boolean;
  order: any;
  pricing?: ApiOrderPricing;
  message?: string;
}

export interface ApiPaymentOrderResult {
  success: boolean;
  gatewayOrderId: string;
  amountInPaise: number;
  currency: string;
  keyId: string;
  paymentAttemptId: string;
  reused?: boolean;
}

export interface ApiPaymentVerifyResult {
  success: boolean;
  message: string;
  order: any;
  paymentId: string;
  error?: string;
}

export interface ApiSellerDashboard {
  success: boolean;
  sellerId: string;
  metrics: {
    grossOrderValue: number;
    totalSalesCount: number;
    platformCommission: number;
    gatewayFees: number;
    refundAdjustments: number;
    totalNetEarnings: number;
    paidOutEarnings: number;
    availableBalance: number;
    pendingSettlement: number;
  };
  payoutAccount: any;
}

class ApiClient {
  private isServerAvailable: boolean | null = null;
  private lastHealthCheck: number = 0;

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    // Cache health check for 10 seconds
    if (this.isServerAvailable !== null && now - this.lastHealthCheck < 10000) {
      return this.isServerAvailable;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/health`, { credentials: 'omit', signal: controller.signal });
      clearTimeout(timeoutId);
      this.isServerAvailable = res.ok;
    } catch {
      this.isServerAvailable = false;
    }
    this.lastHealthCheck = now;
    return this.isServerAvailable;
  }

  // --- Orders API ---

  async createOrder(payload: {
    items: any[];
    deliveryAddress: any;
    deliveryType?: string;
    couponCode?: string;
    paymentMethod?: string;
    customer?: any;
  }): Promise<ApiOrderResult> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      return data;
    }

    // Local fallback when server is not running
    return this.localCreateOrder(payload);
  }

  async getOrder(orderId: string): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found');
      return data.order;
    }
    return null;
  }

  async updateOrderStatus(orderId: string, status: string, trackingNumber?: string, courierPartner?: string): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber, courierPartner }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');
      return data.order;
    }
    return null;
  }

  async cancelOrder(orderId: string, reason: string): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
      return data;
    }
    return { success: true, message: 'Order cancelled locally' };
  }

  async getInvoice(orderId: string): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invoice not found');
      return data.invoice;
    }
    return null;
  }

  // --- Payments API ---

  async createPaymentOrder(orderId: string, idempotencyKey?: string, customer?: any): Promise<ApiPaymentOrderResult> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
        body: JSON.stringify({ orderId, idempotencyKey, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment order');
      return data;
    }

    // Local fallback
    const gatewayOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      gatewayOrderId,
      amountInPaise: 100000,
      currency: 'INR',
      keyId: 'rzp_test_karigaar_mock_key',
      paymentAttemptId: `att_${Date.now()}`,
    };
  }

  async verifyPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
    paymentMethod?: string;
    paymentDetails?: any;
  }): Promise<ApiPaymentVerifyResult> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment signature verification failed');
      return data;
    }

    // Local fallback
    return {
      success: true,
      message: 'Payment verified successfully (local test mode)',
      order: { id: payload.orderId, paymentStatus: 'Paid', status: 'Processing' },
      paymentId: payload.razorpayPaymentId,
    };
  }

  async retryPayment(orderId: string, previousAttemptId?: string): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/payments/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, previousAttemptId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retry payment');
      return data;
    }
    return this.createPaymentOrder(orderId);
  }

  async confirmCod(orderId: string, otp: string): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/payments/cod-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm COD');
      return data;
    }
    return { success: true, message: 'Cash on delivery confirmed' };
  }

  // --- Seller API ---

  async getSellerDashboard(sellerId: string): Promise<ApiSellerDashboard> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/sellers/${sellerId}/dashboard`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load seller dashboard');
      return data;
    }

    // Local fallback
    return {
      success: true,
      sellerId,
      metrics: {
        grossOrderValue: 24850,
        totalSalesCount: 14,
        platformCommission: 2485,
        gatewayFees: 497,
        refundAdjustments: 0,
        totalNetEarnings: 21868,
        paidOutEarnings: 15400,
        availableBalance: 3268,
        pendingSettlement: 3200,
      },
      payoutAccount: {
        accountHolderName: 'Sanket Joshi',
        accountNumberMasked: '•••• •••• •••• 2910',
        ifscCode: 'ICIC0000341',
        bankName: 'ICICI Bank, Deccan Gymkhana Pune',
        upiVpa: 'sanket.craft@okicici',
        verificationStatus: 'verified',
      },
    };
  }

  async getSellerOrders(sellerId: string): Promise<any[]> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/sellers/${sellerId}/orders`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load seller orders');
      return data.orders || [];
    }
    return [];
  }

  async saveSellerPayoutAccount(sellerId: string, accountData: any): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/sellers/${sellerId}/payout-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save payout account');
      return data;
    }
    return { success: true, message: 'Bank account saved locally', account: accountData };
  }

  async requestSellerPayout(sellerId: string, orderIds?: string[]): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/sellers/${sellerId}/request-payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process payout');
      return data;
    }
    return {
      success: true,
      settlement: {
        settlementReference: `SETTL-PUN-${Date.now().toString().slice(-6)}`,
        amount: 3268,
        payoutStatus: 'completed',
        utrNumber: `HDFCR${Date.now()}`,
      },
    };
  }

  async getSellerSettlements(sellerId: string): Promise<any[]> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/sellers/${sellerId}/settlements`);
      const data = await res.json();
      if (!res.ok) return [];
      return data.settlements || [];
    }
    return [];
  }

  // --- Admin API ---

  async getAdminCommissionRules(): Promise<any[]> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/admin/commission-rules`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch rules');
      return data.rules || [];
    }
    return [];
  }

  async saveAdminCommissionRule(rule: any): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/admin/commission-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save rule');
      return data;
    }
    return { success: true, rule };
  }

  async getAdminReconciliation(): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/admin/reconciliation`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reconciliation');
      return data.reconciliation;
    }
    return null;
  }

  async getAdminRefunds(): Promise<any[]> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/admin/refunds`);
      const data = await res.json();
      if (!res.ok) return [];
      return data.refunds || [];
    }
    return [];
  }

  async processAdminRefund(refundId: string, action: 'approve' | 'reject', adminNotes?: string): Promise<any> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/admin/refunds/${refundId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process refund action');
      return data;
    }
    return { success: true, message: `Refund ${action}d locally` };
  }

  async getAdminAuditLogs(): Promise<any[]> {
    const online = await this.checkHealth();
    if (online) {
      const res = await fetch(`${API_BASE_URL}/admin/audit-logs`);
      const data = await res.json();
      if (!res.ok) return [];
      return data.logs || [];
    }
    return [];
  }

  // --- Local Fallback implementation ---
  private localCreateOrder(payload: any): ApiOrderResult {
    const { items, deliveryAddress, deliveryType = 'standard', couponCode = '', paymentMethod = 'UPI' } = payload;
    let subtotal = 0;
    const validatedItems = items.map((it: any) => {
      const qty = it.quantity || 1;
      const price = it.product?.price || it.unitPrice || 499;
      const customExtra = it.customization?.extraPrice || 0;
      const lineTotal = (price + customExtra) * qty;
      subtotal += lineTotal;
      return {
        productId: it.product?.id || it.productId || `prod_${Date.now()}`,
        productName: it.product?.name || it.productName || 'Handmade Creation',
        quantity: qty,
        unitPrice: price,
        customization: it.customization || null,
        totalPrice: lineTotal,
      };
    });

    const deliveryFee = deliveryType === 'express' ? 79 : subtotal >= 499 ? 0 : 49;
    let discount = 0;
    const code = (couponCode || '').trim().toUpperCase();
    if (code === 'KARIGAAR100') discount = Math.min(100, subtotal);
    else if (code === 'FIRSTCRAFT') discount = Math.round(subtotal * 0.1);
    else if (code === 'FESTIVE15') discount = Math.round(subtotal * 0.15);

    const totalAmount = Math.max(0, subtotal + deliveryFee - discount);
    const orderId = `kg_ord_${Date.now()}`;
    const orderNumber = `KG-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = {
      id: orderId,
      orderNumber,
      deliveryAddress,
      deliveryType,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      currency: 'INR',
      status: paymentMethod === 'COD' ? 'Processing' : 'Pending Payment',
      paymentStatus: paymentMethod === 'COD' ? 'COD Confirmed' : 'Pending',
      paymentMethod,
      trackingNumber: `DEL-PUN-${Math.floor(100000 + Math.random() * 900000)}`,
      courierPartner: deliveryType === 'express' ? 'Pune Artisan Priority Courier' : 'Pune Artisan Express Delivery',
      estimatedDelivery: deliveryType === 'express' ? '1 to 2 business days' : '3 to 5 business days',
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      order,
      pricing: {
        validatedItems,
        subtotal,
        deliveryFee,
        discount,
        taxGst: Math.round(subtotal * 0.05 * 100) / 100,
        totalAmount,
        currency: 'INR',
      },
    };
  }
}

export const api = new ApiClient();
