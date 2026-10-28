import { useState, useId } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useAuth } from '../context/AuthContext';
import { useMarketplace, type SavedDeliveryAddress, type Order } from '../context/MarketplaceContext';
import { api } from '../services/apiClient';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type CheckoutStep = 'address' | 'review' | 'payment';

const POPULAR_BANKS = [
  { code: 'HDFC', name: 'HDFC Bank', icon: 'business-outline' },
  { code: 'SBIN', name: 'State Bank of India', icon: 'business-outline' },
  { code: 'ICIC', name: 'ICICI Bank', icon: 'business-outline' },
  { code: 'UTIB', name: 'Axis Bank', icon: 'business-outline' },
  { code: 'KKBK', name: 'Kotak Mahindra', icon: 'business-outline' },
  { code: 'PUNB', name: 'Punjab National Bank', icon: 'business-outline' },
];

const WALLET_PROVIDERS = [
  { id: 'paytm', name: 'Paytm Wallet', icon: 'wallet-outline' },
  { id: 'phonepe', name: 'PhonePe Wallet', icon: 'wallet-outline' },
  { id: 'mobikwik', name: 'MobiKwik', icon: 'wallet-outline' },
  { id: 'amazonpay', name: 'Amazon Pay', icon: 'wallet-outline' },
];

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { user } = useAuth();
  const {
    cart,
    getCartSubtotal,
    savedAddresses,
    addSavedAddress,
    updateSavedAddress,
    setDefaultAddress,
    createBackendOrder,
    verifyPaymentAndConfirm,
    retryOrderPayment,
    confirmCodOrder,
  } = useMarketplace();

  // Multi-step Checkout Stepper
  const [activeStep, setActiveStep] = useState<CheckoutStep>('address');

  // Address Selection
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || 'addr_1');

  // Add / Edit Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState(user?.profile?.name || 'Sanket Joshi');
  const [addrPhone, setAddrPhone] = useState(user?.profile?.phone || '+91 98220 45678');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLocality, setAddrLocality] = useState(user?.profile?.locality || 'Kothrud');
  const [addrCity, setAddrCity] = useState('Pune');
  const [addrPincode, setAddrPincode] = useState('411038');
  const [addrTag, setAddrTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrError, setAddrError] = useState('');

  // Delivery Speed
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment Options
  const [paymentCategory, setPaymentCategory] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('upi');
  const [upiMethod, setUpiMethod] = useState<'app' | 'vpa' | 'qr'>('app');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [upiVpa, setUpiVpa] = useState('sanket@okhdfcbank');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.profile?.name || 'Sanket Joshi');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardType, setCardType] = useState<'rupay' | 'visa' | 'mastercard'>('rupay');

  // Netbanking & Wallet Selection
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Processing & Verification Modals
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);

  // 3D Secure / OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [pendingOtpAction, setPendingOtpAction] = useState<(() => Promise<void>) | null>(null);

  // COD Confirmation Modal
  const [showCodModal, setShowCodModal] = useState(false);
  const [codOtp, setCodOtp] = useState('');

  // Confirmation Celebration
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Active Selected Address Object
  const currentAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) ||
    savedAddresses[0] || {
      id: 'addr_fallback',
      name: addrName,
      phone: addrPhone,
      address: 'Flat 402, Mayur Heights, Paud Road',
      locality: 'Kothrud',
      city: 'Pune',
      pincode: '411038',
      tag: 'Home',
      isDefault: true,
    };

  // Pricing calculations
  const subtotal = getCartSubtotal();
  const deliveryCost = deliveryType === 'express' ? 79 : subtotal >= 499 ? 0 : 49;
  const taxableBase = Math.max(0, subtotal - appliedDiscount);
  const taxGst = Math.round(taxableBase * 0.05 * 100) / 100;
  const grandTotal = Math.max(0, subtotal + deliveryCost - appliedDiscount);

  // Apply Coupon
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (code === 'KARIGAAR100') {
      const discount = Math.min(100, subtotal);
      setAppliedDiscount(discount);
      setCouponCode('KARIGAAR100');
      setCouponMsg({ type: 'success', text: '₹100 artisan discount applied!' });
    } else if (code === 'FIRSTCRAFT') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponCode('FIRSTCRAFT');
      setCouponMsg({ type: 'success', text: '10% welcome craft discount applied!' });
    } else if (code === 'FESTIVE15') {
      const discount = Math.round(subtotal * 0.15);
      setAppliedDiscount(discount);
      setCouponCode('FESTIVE15');
      setCouponMsg({ type: 'success', text: '15% festive handmade discount applied!' });
    } else {
      setCouponMsg({ type: 'error', text: 'Invalid code. Try KARIGAAR100 or FESTIVE15' });
    }
  };

  // Card Number Auto-formatting & detection
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 16);
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    setCardNumber(formatted);

    if (clean.startsWith('4')) setCardType('visa');
    else if (clean.startsWith('5')) setCardType('mastercard');
    else setCardType('rupay');
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length > 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  // Save Address Modal Form
  const handleSaveAddress = () => {
    if (!addrName.trim()) return setAddrError('Please enter recipient name');
    if (!addrPhone.trim() || addrPhone.replace(/\D/g, '').length < 10) {
      return setAddrError('Please enter a valid 10-digit mobile number');
    }
    if (!addrStreet.trim()) return setAddrError('Please enter street address / apartment');
    if (!addrLocality.trim()) return setAddrError('Please enter locality / area in Pune');
    if (!addrPincode.trim() || addrPincode.replace(/\D/g, '').length !== 6) {
      return setAddrError('Please enter a valid 6-digit Indian PIN code');
    }

    setAddrError('');
    if (editingAddressId) {
      updateSavedAddress(editingAddressId, {
        name: addrName,
        phone: addrPhone,
        address: addrStreet,
        locality: addrLocality,
        city: addrCity,
        pincode: addrPincode,
        tag: addrTag,
        isDefault: addrIsDefault,
      });
      setSelectedAddressId(editingAddressId);
    } else {
      const created = addSavedAddress({
        name: addrName,
        phone: addrPhone,
        address: addrStreet,
        locality: addrLocality,
        city: addrCity,
        pincode: addrPincode,
        tag: addrTag,
        isDefault: addrIsDefault,
      });
      setSelectedAddressId(created.id);
    }

    setShowAddressModal(false);
    setEditingAddressId(null);
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddrStreet('');
    setAddrLocality('Kothrud');
    setAddrPincode('411038');
    setAddrTag('Home');
    setAddrIsDefault(false);
    setAddrError('');
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr: SavedDeliveryAddress) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrStreet(addr.address);
    setAddrLocality(addr.locality);
    setAddrCity(addr.city);
    setAddrPincode(addr.pincode);
    setAddrTag(addr.tag);
    setAddrIsDefault(addr.isDefault);
    setAddrError('');
    setShowAddressModal(true);
  };

  // --- Main Checkout & Payment Execution ---
  const handleInitiatePayment = async () => {
    if (cart.length === 0) return;
    setPaymentError(null);

    // If COD selected, open COD confirmation
    if (paymentCategory === 'cod') {
      setShowCodModal(true);
      return;
    }

    // If Card selected, trigger simulated 3D Secure OTP verification
    if (paymentCategory === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 15) {
        setPaymentError('Please enter a valid 16-digit card number');
        return;
      }
      if (cardExpiry.length < 5) {
        setPaymentError('Please enter valid expiry date (MM/YY)');
        return;
      }
      if (cardCvv.length < 3) {
        setPaymentError('Please enter valid 3-digit CVV');
        return;
      }

      setPendingOtpAction(() => async () => {
        await executeGatewayFlow('Card (Visa/RuPay/Mastercard)');
      });
      setShowOtpModal(true);
      return;
    }

    // UPI or Netbanking or Wallet
    let paymentMethodLabel = 'UPI';
    if (paymentCategory === 'upi') {
      paymentMethodLabel = upiMethod === 'vpa' ? `UPI (${upiVpa})` : `UPI (${selectedUpiApp.toUpperCase()})`;
    } else if (paymentCategory === 'netbanking') {
      paymentMethodLabel = `Net Banking (${selectedBank})`;
    } else if (paymentCategory === 'wallet') {
      paymentMethodLabel = `Wallet (${WALLET_PROVIDERS.find((w) => w.id === selectedWallet)?.name})`;
    }

    await executeGatewayFlow(paymentMethodLabel);
  };

  // Helper: Dynamically load Razorpay standard checkout script on web
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
        resolve(false);
        return;
      }
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleVerifySignature = async (
    orderId: string,
    orderNumber: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    methodLabel: string,
    orderResult: any
  ) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('4/4 Confirming order with trusted server verification…');

      const verifyResult = await verifyPaymentAndConfirm({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod: methodLabel,
        paymentDetails: {
          cardType: paymentCategory === 'card' ? cardType : undefined,
          bank: paymentCategory === 'netbanking' ? selectedBank : undefined,
          vpa: paymentCategory === 'upi' ? upiVpa : undefined,
        },
      });

      setIsProcessing(false);

      if (verifyResult.success) {
        setConfirmedOrder({
          id: orderId,
          orderNumber,
          date: 'Today',
          items: [...cart],
          totalAmount: orderResult.totalAmount,
          subtotal,
          deliveryFee: deliveryCost,
          discount: appliedDiscount,
          status: 'Processing',
          paymentStatus: 'Paid',
          deliveryAddress: currentAddress,
          paymentMethod: methodLabel,
          estimatedDelivery: deliveryType === 'express' ? '1 to 2 business days' : '3 to 5 business days',
          trackingNumber: `DEL-PUN-${Math.floor(100000 + Math.random() * 900000)}`,
          courierPartner:
            deliveryType === 'express'
              ? 'Pune Artisan Priority Courier'
              : 'Pune Artisan Express Delivery',
          timeline: [],
        });
      } else {
        setFailedOrderId(orderId);
        setPaymentError('Payment verification was rejected by server. You can retry safely.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setFailedOrderId(orderId);
      setPaymentError(err.message || 'Payment verification failed. Please retry.');
    }
  };

  const executeGatewayFlow = async (methodLabel: string) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('1/4 Validating cart & creating order on server…');

      // 1. Create order on server (price & stock calculated on server)
      const orderResult = await createBackendOrder({
        address: {
          name: currentAddress.name,
          phone: currentAddress.phone,
          address: currentAddress.address,
          locality: currentAddress.locality,
          city: currentAddress.city,
          pincode: currentAddress.pincode,
        },
        deliveryType,
        paymentMethod: methodLabel,
        couponCode: appliedDiscount > 0 ? couponCode : undefined,
      });

      const orderId = orderResult.orderId;
      setProcessingStatus('2/4 Initializing Razorpay gateway order…');

      // 2. Initialize Gateway Order
      const idempotencyKey = `idemp_chk_${orderId}_${Date.now()}`;
      const gatewayOrder = await api.createPaymentOrder(orderId, idempotencyKey);

      // 3. Try to open Razorpay Standard Checkout hosted popup on Web
      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && typeof (window as any).Razorpay === 'function') {
        setIsProcessing(false);
        const options = {
          key: gatewayOrder.keyId || 'rzp_test_mockKeyId12345',
          amount: gatewayOrder.amountInPaise,
          currency: gatewayOrder.currency || 'INR',
          name: 'KARIGAAR Handmade',
          description: `Order #${orderResult.orderNumber}`,
          image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=120',
          order_id: gatewayOrder.gatewayOrderId,
          prefill: {
            name: currentAddress.name,
            email: 'customer@kaarigaar.com',
            contact: currentAddress.phone,
          },
          theme: {
            color: '#C59341',
          },
          handler: async function (response: any) {
            await handleVerifySignature(
              orderId,
              orderResult.orderNumber,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              methodLabel,
              orderResult
            );
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              setPaymentError(
                'Checkout window was closed. Your cart is preserved and you can retry payment anytime.'
              );
            },
          },
        };

        const rzpInstance = new (window as any).Razorpay(options);
        rzpInstance.on('payment.failed', function (resp: any) {
          setIsProcessing(false);
          setFailedOrderId(orderId);
          setPaymentError(
            resp.error?.description || 'Payment was declined by payment provider. You can retry safely.'
          );
        });
        rzpInstance.open();
        return;
      }

      // Fallback for native simulators / offline mode: Verify directly with server-generated signature
      setProcessingStatus('3/4 Verifying HMAC SHA256 payment signature with server…');
      const gatewayPaymentId = `pay_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      let signature = '';
      try {
        const sigRes = await fetch('http://localhost:5000/api/payments/mock-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: gatewayOrder.gatewayOrderId,
            paymentId: gatewayPaymentId,
          }),
        });
        const sigData = await sigRes.json();
        signature = sigData.signature || 'sandbox_sig_verified';
      } catch {
        signature = 'sandbox_local_verified_sig';
      }

      await handleVerifySignature(
        orderId,
        orderResult.orderNumber,
        gatewayOrder.gatewayOrderId,
        gatewayPaymentId,
        signature,
        methodLabel,
        orderResult
      );
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || 'Payment initiation failed. Please retry.');
    }
  };

  // Retry Payment for Failed Order without creating duplicate orders
  const handleRetryPayment = async () => {
    if (!failedOrderId) return;
    try {
      setIsProcessing(true);
      setProcessingStatus('Retrying payment on existing order without duplicate charges…');
      await retryOrderPayment(failedOrderId);
      await executeGatewayFlow('UPI (Retry)');
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || 'Retry failed');
    }
  };

  // COD Confirmation with OTP
  const handleConfirmCod = async () => {
    try {
      setIsProcessing(true);
      setShowCodModal(false);

      const orderResult = await createBackendOrder({
        address: currentAddress,
        deliveryType,
        paymentMethod: 'Cash on Delivery',
        couponCode: appliedDiscount > 0 ? couponCode : undefined,
      });

      await confirmCodOrder(orderResult.orderId, codOtp || '1234');
      setIsProcessing(false);

      setConfirmedOrder({
        id: orderResult.orderId,
        orderNumber: orderResult.orderNumber,
        date: 'Today',
        items: [...cart],
        totalAmount: orderResult.totalAmount,
        subtotal,
        deliveryFee: deliveryCost,
        discount: appliedDiscount,
        status: 'Processing',
        paymentStatus: 'COD — Payment Pending',
        deliveryAddress: currentAddress,
        paymentMethod: 'Cash on Delivery',
        estimatedDelivery: deliveryType === 'express' ? '1 to 2 business days' : '3 to 5 business days',
        trackingNumber: `DEL-PUN-${Math.floor(100000 + Math.random() * 900000)}`,
        courierPartner: 'Pune Artisan Express Delivery',
        timeline: [],
      });
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || 'COD confirmation failed');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Nav */}
          <View style={styles.backRow}>
            <BackButton label="Back to Cart" fallbackRoute="Cart" />
          </View>

          {/* Stepper Header */}
          <View style={styles.stepperCard}>
            <View style={styles.stepperRow}>
              <Pressable
                onPress={() => setActiveStep('address')}
                style={[styles.stepItem, activeStep === 'address' && styles.stepItemActive]}
              >
                <View style={[styles.stepNumberBadge, activeStep === 'address' && styles.stepNumberBadgeActive]}>
                  <Text style={[styles.stepNumberText, activeStep === 'address' && styles.stepNumberTextActive]}>1</Text>
                </View>
                <Text style={[styles.stepLabel, activeStep === 'address' && styles.stepLabelActive]}>Delivery Address</Text>
              </Pressable>

              <View style={styles.stepConnector} />

              <Pressable
                onPress={() => setActiveStep('review')}
                style={[styles.stepItem, activeStep === 'review' && styles.stepItemActive]}
              >
                <View style={[styles.stepNumberBadge, activeStep === 'review' && styles.stepNumberBadgeActive]}>
                  <Text style={[styles.stepNumberText, activeStep === 'review' && styles.stepNumberTextActive]}>2</Text>
                </View>
                <Text style={[styles.stepLabel, activeStep === 'review' && styles.stepLabelActive]}>Order Review</Text>
              </Pressable>

              <View style={styles.stepConnector} />

              <Pressable
                onPress={() => setActiveStep('payment')}
                style={[styles.stepItem, activeStep === 'payment' && styles.stepItemActive]}
              >
                <View style={[styles.stepNumberBadge, activeStep === 'payment' && styles.stepNumberBadgeActive]}>
                  <Text style={[styles.stepNumberText, activeStep === 'payment' && styles.stepNumberTextActive]}>3</Text>
                </View>
                <Text style={[styles.stepLabel, activeStep === 'payment' && styles.stepLabelActive]}>Payment & Security</Text>
              </Pressable>
            </View>
          </View>

          {/* Error Banner */}
          {paymentError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.errorTitle}>Payment Alert</Text>
                <Text style={styles.errorText}>{paymentError}</Text>
              </View>
              {failedOrderId && (
                <Pressable onPress={handleRetryPayment} style={styles.retryBtn}>
                  <Text style={styles.retryBtnText}>Retry</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Main Layout Grid */}
          <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
            {/* Left Steps Column */}
            <View style={[styles.formColumn, isDesktop && { width: '63%' }]}>
              {/* STEP 1: DELIVERY ADDRESS & SPEED */}
              {activeStep === 'address' && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.stepBadgeMini}>
                      <Text style={styles.stepBadgeMiniText}>1</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>Select Delivery Address in Pune</Text>
                      <Text style={styles.cardSubtitle}>Makers ship directly from workshops across Pune</Text>
                    </View>
                    <Pressable onPress={openAddAddressModal} style={styles.addAddrHeaderBtn}>
                      <Ionicons name="add" size={16} color={colors.charcoal} />
                      <Text style={styles.addAddrHeaderBtnText}>+ Add New</Text>
                    </Pressable>
                  </View>

                  <View style={styles.addressesList}>
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <Pressable
                          key={addr.id}
                          onPress={() => setSelectedAddressId(addr.id)}
                          style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                        >
                          <View style={styles.addressCardTop}>
                            <View style={styles.radioDotRow}>
                              <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                              <Text style={styles.addressName}>{addr.name}</Text>
                              <View style={styles.tagBadge}>
                                <Text style={styles.tagBadgeText}>{addr.tag}</Text>
                              </View>
                              {addr.isDefault && (
                                <View style={styles.defaultBadge}>
                                  <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                </View>
                              )}
                            </View>

                            <Pressable onPress={() => openEditAddressModal(addr)} hitSlop={8}>
                              <Text style={styles.editLink}>Edit</Text>
                            </Pressable>
                          </View>

                          <Text style={styles.addressText}>{addr.address}</Text>
                          <Text style={styles.addressText}>
                            {addr.locality}, {addr.city} - {addr.pincode}
                          </Text>
                          <Text style={styles.addressPhone}>📞 {addr.phone}</Text>

                          {isSelected && (
                            <View style={styles.selectedAddrIndicator}>
                              <Ionicons name="checkmark-circle" size={16} color={colors.goldDeep} />
                              <Text style={styles.selectedAddrIndicatorText}>Delivering to this address</Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Delivery Speed Options */}
                  <View style={styles.deliverySpeedBox}>
                    <Text style={styles.sectionMiniTitle}>Choose Delivery Speed</Text>

                    <Pressable
                      onPress={() => setDeliveryType('standard')}
                      style={[styles.speedOption, deliveryType === 'standard' && styles.speedOptionSelected]}
                    >
                      <View style={[styles.radioDot, deliveryType === 'standard' && styles.radioDotSelected]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.speedTitle}>
                          Standard Artisan Delivery ({subtotal >= 499 ? 'FREE' : '₹49'})
                        </Text>
                        <Text style={styles.speedSub}>Handcrafted and safely dispatched in 3 to 5 business days.</Text>
                      </View>
                      <Ionicons name="leaf-outline" size={18} color={colors.ecoGreen} />
                    </Pressable>

                    <Pressable
                      onPress={() => setDeliveryType('express')}
                      style={[styles.speedOption, deliveryType === 'express' && styles.speedOptionSelected]}
                    >
                      <View style={[styles.radioDot, deliveryType === 'express' && styles.radioDotSelected]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.speedTitle}>Express Pune Artisan Courier (+₹79)</Text>
                        <Text style={styles.speedSub}>Priority studio packaging & dispatch in 1 to 2 business days.</Text>
                      </View>
                      <Ionicons name="flash-outline" size={18} color={colors.goldDeep} />
                    </Pressable>
                  </View>

                  <Pressable onPress={() => setActiveStep('review')} style={styles.primaryActionBtn}>
                    <Text style={styles.primaryActionBtnText}>Proceed to Order Review →</Text>
                  </Pressable>
                </View>
              )}

              {/* STEP 2: ORDER REVIEW & COUPONS */}
              {activeStep === 'review' && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.stepBadgeMini}>
                      <Text style={styles.stepBadgeMiniText}>2</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>Review Creations & Customization</Text>
                      <Text style={styles.cardSubtitle}>Confirm specs before payment is initiated</Text>
                    </View>
                  </View>

                  {/* Cart Items List */}
                  <View style={styles.reviewItemsList}>
                    {cart.map((item) => {
                      const itemTotal = (item.product.price + (item.customization?.extraPrice || 0)) * item.quantity;
                      return (
                        <View key={item.id} style={styles.reviewItemCard}>
                          <Image source={{ uri: item.product.images[0] }} style={styles.reviewItemThumb} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.reviewItemName}>{item.product.name}</Text>
                            <Text style={styles.reviewItemMaker}>Crafted by: {item.product.creatorName}</Text>
                            {item.customization && (
                              <View style={styles.customSpecsBadge}>
                                <Ionicons name="sparkles" size={12} color={colors.goldDeep} />
                                <Text style={styles.customSpecsText}>
                                  Bespoke:{' '}
                                  {item.customization.customerName ||
                                    item.customization.initials ||
                                    item.customization.color ||
                                    'Personalized'}
                                </Text>
                              </View>
                            )}
                            <Text style={styles.reviewItemPriceQty}>
                              Qty: {item.quantity} × ₹{item.product.price} = ₹{itemTotal}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Coupon Application */}
                  <View style={styles.couponCard}>
                    <Text style={styles.sectionMiniTitle}>Artisan Discount Coupon</Text>
                    <View style={styles.couponInputRow}>
                      <TextInput
                        style={styles.couponInput}
                        placeholder="Enter coupon code (e.g. KARIGAAR100)"
                        placeholderTextColor={colors.textMuted}
                        value={couponCode}
                        onChangeText={setCouponCode}
                        autoCapitalize="characters"
                      />
                      <Pressable onPress={() => handleApplyCoupon()} style={styles.applyCouponBtn}>
                        <Text style={styles.applyCouponBtnText}>Apply</Text>
                      </Pressable>
                    </View>

                    {couponMsg && (
                      <Text
                        style={[
                          styles.couponFeedback,
                          { color: couponMsg.type === 'success' ? colors.ecoGreen : colors.danger },
                        ]}
                      >
                        {couponMsg.text}
                      </Text>
                    )}

                    <View style={styles.couponPillsRow}>
                      <Pressable onPress={() => handleApplyCoupon('KARIGAAR100')} style={styles.couponPill}>
                        <Text style={styles.couponPillCode}>KARIGAAR100</Text>
                        <Text style={styles.couponPillDesc}>₹100 Off</Text>
                      </Pressable>
                      <Pressable onPress={() => handleApplyCoupon('FIRSTCRAFT')} style={styles.couponPill}>
                        <Text style={styles.couponPillCode}>FIRSTCRAFT</Text>
                        <Text style={styles.couponPillDesc}>10% Off</Text>
                      </Pressable>
                      <Pressable onPress={() => handleApplyCoupon('FESTIVE15')} style={styles.couponPill}>
                        <Text style={styles.couponPillCode}>FESTIVE15</Text>
                        <Text style={styles.couponPillDesc}>15% Off</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.stepNavRow}>
                    <Pressable onPress={() => setActiveStep('address')} style={styles.secondaryStepBtn}>
                      <Text style={styles.secondaryStepBtnText}>← Back to Address</Text>
                    </Pressable>
                    <Pressable onPress={() => setActiveStep('payment')} style={styles.primaryActionBtn}>
                      <Text style={styles.primaryActionBtnText}>Proceed to Payment →</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* STEP 3: PAYMENT METHOD SELECTION */}
              {activeStep === 'payment' && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.stepBadgeMini}>
                      <Text style={styles.stepBadgeMiniText}>3</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>Choose Payment Method</Text>
                      <Text style={styles.cardSubtitle}>
                        Secured with 256-bit encryption • Razorpay / Cashfree Sandbox
                      </Text>
                    </View>
                    <Ionicons name="shield-checkmark" size={22} color={colors.ecoGreen} />
                  </View>

                  {/* Payment Category Selector Tabs */}
                  <View style={styles.paymentCategoryTabs}>
                    <Pressable
                      onPress={() => setPaymentCategory('upi')}
                      style={[styles.paymentCatTab, paymentCategory === 'upi' && styles.paymentCatTabActive]}
                    >
                      <Ionicons
                        name="phone-portrait-outline"
                        size={17}
                        color={paymentCategory === 'upi' ? colors.goldDeep : colors.charcoal}
                      />
                      <Text style={[styles.paymentCatTabText, paymentCategory === 'upi' && styles.paymentCatTabTextActive]}>
                        UPI Instant
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setPaymentCategory('card')}
                      style={[styles.paymentCatTab, paymentCategory === 'card' && styles.paymentCatTabActive]}
                    >
                      <Ionicons
                        name="card-outline"
                        size={17}
                        color={paymentCategory === 'card' ? colors.goldDeep : colors.charcoal}
                      />
                      <Text style={[styles.paymentCatTabText, paymentCategory === 'card' && styles.paymentCatTabTextActive]}>
                        Cards
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setPaymentCategory('netbanking')}
                      style={[styles.paymentCatTab, paymentCategory === 'netbanking' && styles.paymentCatTabActive]}
                    >
                      <Ionicons
                        name="business-outline"
                        size={17}
                        color={paymentCategory === 'netbanking' ? colors.goldDeep : colors.charcoal}
                      />
                      <Text
                        style={[
                          styles.paymentCatTabText,
                          paymentCategory === 'netbanking' && styles.paymentCatTabTextActive,
                        ]}
                      >
                        Net Banking
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setPaymentCategory('wallet')}
                      style={[styles.paymentCatTab, paymentCategory === 'wallet' && styles.paymentCatTabActive]}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={17}
                        color={paymentCategory === 'wallet' ? colors.goldDeep : colors.charcoal}
                      />
                      <Text style={[styles.paymentCatTabText, paymentCategory === 'wallet' && styles.paymentCatTabTextActive]}>
                        Wallets
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setPaymentCategory('cod')}
                      style={[styles.paymentCatTab, paymentCategory === 'cod' && styles.paymentCatTabActive]}
                    >
                      <Ionicons
                        name="cash-outline"
                        size={17}
                        color={paymentCategory === 'cod' ? colors.goldDeep : colors.charcoal}
                      />
                      <Text style={[styles.paymentCatTabText, paymentCategory === 'cod' && styles.paymentCatTabTextActive]}>
                        Cash on Delivery
                      </Text>
                    </Pressable>
                  </View>

                  {/* 1. UPI Payment Interface */}
                  {paymentCategory === 'upi' && (
                    <View style={styles.paymentMethodBody}>
                      <View style={styles.upiSubChoiceRow}>
                        <Pressable
                          onPress={() => setUpiMethod('app')}
                          style={[styles.upiSubChoiceBtn, upiMethod === 'app' && styles.upiSubChoiceBtnActive]}
                        >
                          <Text style={[styles.upiSubChoiceText, upiMethod === 'app' && styles.upiSubChoiceTextActive]}>
                            UPI Apps
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setUpiMethod('vpa')}
                          style={[styles.upiSubChoiceBtn, upiMethod === 'vpa' && styles.upiSubChoiceBtnActive]}
                        >
                          <Text style={[styles.upiSubChoiceText, upiMethod === 'vpa' && styles.upiSubChoiceTextActive]}>
                            Enter UPI ID
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setUpiMethod('qr')}
                          style={[styles.upiSubChoiceBtn, upiMethod === 'qr' && styles.upiSubChoiceBtnActive]}
                        >
                          <Text style={[styles.upiSubChoiceText, upiMethod === 'qr' && styles.upiSubChoiceTextActive]}>
                            Scan QR Code
                          </Text>
                        </Pressable>
                      </View>

                      {upiMethod === 'app' && (
                        <View style={styles.upiAppsGrid}>
                          {[
                            { id: 'gpay', name: 'Google Pay', icon: 'logo-google' },
                            { id: 'phonepe', name: 'PhonePe', icon: 'phone-portrait-outline' },
                            { id: 'paytm', name: 'Paytm UPI', icon: 'wallet-outline' },
                            { id: 'bhim', name: 'BHIM UPI', icon: 'flash-outline' },
                          ].map((app) => (
                            <Pressable
                              key={app.id}
                              onPress={() => setSelectedUpiApp(app.id as any)}
                              style={[styles.upiAppTile, selectedUpiApp === app.id && styles.upiAppTileActive]}
                            >
                              <Ionicons name={app.icon as any} size={22} color={colors.charcoal} />
                              <Text style={styles.upiAppName}>{app.name}</Text>
                              {selectedUpiApp === app.id && (
                                <Ionicons name="checkmark-circle" size={14} color={colors.goldDeep} />
                              )}
                            </Pressable>
                          ))}
                        </View>
                      )}

                      {upiMethod === 'vpa' && (
                        <View style={{ marginTop: 12 }}>
                          <Text style={styles.fieldLabel}>Enter your UPI ID / VPA</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="e.g. mobileNumber@upi or name@okhdfcbank"
                            placeholderTextColor={colors.textMuted}
                            value={upiVpa}
                            onChangeText={setUpiVpa}
                            autoCapitalize="none"
                          />
                          <Text style={styles.fieldHint}>
                            Supported handles: @okhdfcbank, @oksbi, @okaxis, @okicici, @ybl, @paytm
                          </Text>
                        </View>
                      )}

                      {upiMethod === 'qr' && (
                        <View style={styles.qrSimulatorBox}>
                          <View style={styles.mockQrCode}>
                            <Ionicons name="qr-code-outline" size={90} color={colors.charcoal} />
                          </View>
                          <Text style={styles.qrInstructions}>
                            Scan this dynamic QR with any UPI app to pay ₹{grandTotal}
                          </Text>
                          <Text style={styles.qrTimer}>⏱ Valid for 04:59 minutes</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 2. Card Payment Interface */}
                  {paymentCategory === 'card' && (
                    <View style={styles.paymentMethodBody}>
                      {/* Realistic Card Preview */}
                      <View style={styles.cardPreview}>
                        <View style={styles.cardPreviewTop}>
                          <Text style={styles.cardChipIcon}>💳 CHIP</Text>
                          <Text style={styles.cardBrandBadge}>{cardType.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.cardPreviewNumber}>
                          {cardNumber || '•••• •••• •••• ••••'}
                        </Text>
                        <View style={styles.cardPreviewBottom}>
                          <View>
                            <Text style={styles.cardPreviewMiniLabel}>CARD HOLDER</Text>
                            <Text style={styles.cardPreviewName}>{cardHolder || 'YOUR NAME'}</Text>
                          </View>
                          <View>
                            <Text style={styles.cardPreviewMiniLabel}>EXPIRES</Text>
                            <Text style={styles.cardPreviewExpiry}>{cardExpiry || 'MM/YY'}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Card Inputs */}
                      <View style={{ marginTop: 16 }}>
                        <Text style={styles.fieldLabel}>Card Number</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="4111 2222 3333 4444"
                          placeholderTextColor={colors.textMuted}
                          value={cardNumber}
                          onChangeText={handleCardNumberChange}
                          keyboardType="number-pad"
                          maxLength={19}
                        />
                      </View>

                      <View style={styles.formRow}>
                        <View style={{ flex: 1.2 }}>
                          <Text style={styles.fieldLabel}>Name on Card</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="Sanket Joshi"
                            placeholderTextColor={colors.textMuted}
                            value={cardHolder}
                            onChangeText={setCardHolder}
                          />
                        </View>

                        <View style={{ flex: 0.8 }}>
                          <Text style={styles.fieldLabel}>Expiry Date</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="MM/YY"
                            placeholderTextColor={colors.textMuted}
                            value={cardExpiry}
                            onChangeText={handleExpiryChange}
                            keyboardType="number-pad"
                            maxLength={5}
                          />
                        </View>

                        <View style={{ flex: 0.7 }}>
                          <Text style={styles.fieldLabel}>CVV</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="•••"
                            placeholderTextColor={colors.textMuted}
                            value={cardCvv}
                            onChangeText={(t) => setCardCvv(t.replace(/\D/g, '').substring(0, 4))}
                            keyboardType="number-pad"
                            secureTextEntry
                            maxLength={4}
                          />
                        </View>
                      </View>
                      <Text style={styles.secureCardNote}>
                        🔒 Card details are tokenized according to RBI guidelines and never stored in plain text.
                      </Text>
                    </View>
                  )}

                  {/* 3. Net Banking Interface */}
                  {paymentCategory === 'netbanking' && (
                    <View style={styles.paymentMethodBody}>
                      <Text style={styles.fieldLabel}>Select Popular Indian Bank</Text>
                      <View style={styles.banksGrid}>
                        {POPULAR_BANKS.map((b) => (
                          <Pressable
                            key={b.code}
                            onPress={() => setSelectedBank(b.code)}
                            style={[styles.bankTile, selectedBank === b.code && styles.bankTileActive]}
                          >
                            <Ionicons name="business-outline" size={20} color={colors.charcoal} />
                            <Text style={styles.bankName}>{b.name}</Text>
                            {selectedBank === b.code && (
                              <Ionicons name="checkmark-circle" size={14} color={colors.goldDeep} />
                            )}
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* 4. Digital Wallets Interface */}
                  {paymentCategory === 'wallet' && (
                    <View style={styles.paymentMethodBody}>
                      <Text style={styles.fieldLabel}>Select Digital Wallet</Text>
                      <View style={styles.walletsList}>
                        {WALLET_PROVIDERS.map((w) => (
                          <Pressable
                            key={w.id}
                            onPress={() => setSelectedWallet(w.id)}
                            style={[styles.walletRow, selectedWallet === w.id && styles.walletRowActive]}
                          >
                            <View style={[styles.radioDot, selectedWallet === w.id && styles.radioDotSelected]} />
                            <Ionicons name="wallet-outline" size={18} color={colors.charcoal} />
                            <Text style={styles.walletName}>{w.name}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* 5. Cash on Delivery Interface */}
                  {paymentCategory === 'cod' && (
                    <View style={styles.paymentMethodBody}>
                      <View style={styles.codAlertBox}>
                        <Ionicons name="information-circle-outline" size={24} color={colors.goldDeep} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.codAlertTitle}>Cash on Artisan Delivery</Text>
                          <Text style={styles.codAlertText}>
                            Pay exact cash or scan the delivery executive's UPI QR code at your doorstep. To prevent
                            bogus bookings, an SMS verification step will be required.
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.codMaxNote}>
                        Eligible for orders under ₹5,000. Your order total is ₹{grandTotal}.
                      </Text>
                    </View>
                  )}

                  {/* Place Order CTA Button */}
                  <View style={{ marginTop: 24 }}>
                    <Pressable
                      onPress={handleInitiatePayment}
                      disabled={isProcessing}
                      style={({ pressed }) => [
                        styles.primaryActionBtn,
                        isProcessing && styles.primaryActionBtnDisabled,
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      {isProcessing ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text style={styles.primaryActionBtnText}>Processing Payment…</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="lock-closed" size={17} color="#FFFFFF" />
                          <Text style={styles.primaryActionBtnText}>
                            Pay ₹{grandTotal} & Confirm Order
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Right Summary Column */}
            <View style={[styles.summaryColumn, isDesktop && { width: '35%' }]}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>

                {/* Items preview */}
                <View style={styles.summaryItemsList}>
                  {cart.map((item) => (
                    <View key={item.id} style={styles.summaryItemRow}>
                      <Text style={styles.summaryItemName} numberOfLines={1}>
                        {item.quantity}× {item.product.name}
                      </Text>
                      <Text style={styles.summaryItemPrice}>
                        ₹{(item.product.price + (item.customization?.extraPrice || 0)) * item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.divider} />

                {/* Pricing Breakdown */}
                <View style={styles.summaryBreakdown}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Items Subtotal</Text>
                    <Text style={styles.breakdownVal}>₹{subtotal}</Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Delivery Charges</Text>
                    <Text style={styles.breakdownVal}>
                      {deliveryCost === 0 ? (
                        <Text style={{ color: colors.ecoGreen }}>FREE (Above ₹499)</Text>
                      ) : (
                        `₹${deliveryCost}`
                      )}
                    </Text>
                  </View>

                  {appliedDiscount > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Artisan Discount</Text>
                      <Text style={[styles.breakdownVal, { color: colors.ecoGreen }]}>
                        -₹{appliedDiscount}
                      </Text>
                    </View>
                  )}

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>GST (5% Handicraft tax)</Text>
                    <Text style={styles.breakdownVal}>₹{taxGst}</Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Carbon-Neutral Wrap</Text>
                    <Text style={[styles.breakdownVal, { color: colors.ecoGreen }]}>FREE</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Total Payable</Text>
                  <Text style={styles.grandTotalVal}>₹{grandTotal}</Text>
                </View>

                {/* Selected Address Preview */}
                <View style={styles.miniAddrPreview}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="location" size={14} color={colors.goldDeep} />
                    <Text style={styles.miniAddrTitle}>Delivering to {currentAddress.tag}:</Text>
                  </View>
                  <Text style={styles.miniAddrText} numberOfLines={2}>
                    {currentAddress.name}, {currentAddress.address}, {currentAddress.locality}, Pune
                  </Text>
                </View>

                <View style={styles.trustBadgesBox}>
                  <View style={styles.trustBadgeItem}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={colors.goldDeep} />
                    <Text style={styles.trustBadgeText}>100% Genuine Handcrafted</Text>
                  </View>
                  <View style={styles.trustBadgeItem}>
                    <Ionicons name="refresh-outline" size={16} color={colors.goldDeep} />
                    <Text style={styles.trustBadgeText}>7-Day Artisan Satisfaction</Text>
                  </View>
                  <View style={styles.trustBadgeItem}>
                    <Ionicons name="lock-closed-outline" size={16} color={colors.goldDeep} />
                    <Text style={styles.trustBadgeText}>RBI & PCI-DSS Verified</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- ADD / EDIT ADDRESS MODAL --- */}
      <Modal visible={showAddressModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.addressModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address in Pune'}
              </Text>
              <Pressable onPress={() => setShowAddressModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.charcoal} />
              </Pressable>
            </View>

            {addrError ? <Text style={styles.modalError}>{addrError}</Text> : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Recipient Name *</Text>
                  <TextInput style={styles.textInput} value={addrName} onChangeText={setAddrName} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={addrPhone}
                    onChangeText={setAddrPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Flat / House / Street Address *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Flat 402, Mayur Heights, Paud Road"
                  placeholderTextColor={colors.textMuted}
                  value={addrStreet}
                  onChangeText={setAddrStreet}
                />
              </View>

              <View style={[styles.formRow, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Locality / Area in Pune *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Kothrud, Aundh, Baner"
                    placeholderTextColor={colors.textMuted}
                    value={addrLocality}
                    onChangeText={setAddrLocality}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput style={[styles.textInput, styles.disabledInput]} value={addrCity} editable={false} />
                </View>
                <View style={{ flex: 0.9 }}>
                  <Text style={styles.fieldLabel}>PIN Code *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="411038"
                    placeholderTextColor={colors.textMuted}
                    value={addrPincode}
                    onChangeText={setAddrPincode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              {/* Tag selector */}
              <View style={{ marginTop: 14 }}>
                <Text style={styles.fieldLabel}>Address Type</Text>
                <View style={styles.tagSelectorRow}>
                  {(['Home', 'Work', 'Other'] as const).map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setAddrTag(t)}
                      style={[styles.tagSelectorChip, addrTag === t && styles.tagSelectorChipActive]}
                    >
                      <Text style={[styles.tagSelectorText, addrTag === t && styles.tagSelectorTextActive]}>
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable onPress={handleSaveAddress} style={[styles.primaryActionBtn, { marginTop: 20 }]}>
                <Text style={styles.primaryActionBtnText}>Save Address & Use</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- SIMULATED 3D SECURE / BANK OTP MODAL --- */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.otpModalCard}>
            <View style={styles.bankHeaderRow}>
              <Ionicons name="shield-checkmark" size={28} color={colors.goldDeep} />
              <View>
                <Text style={styles.bankOtpTitle}>Bank 3D Secure Verification</Text>
                <Text style={styles.bankOtpSub}>Verifying with {cardType.toUpperCase()} SecureCode</Text>
              </View>
            </View>

            <View style={styles.otpDetailBox}>
              <Text style={styles.otpDetailText}>Merchant: KARIGAAR Marketplace Pune</Text>
              <Text style={styles.otpDetailText}>Amount: ₹{grandTotal}</Text>
              <Text style={styles.otpDetailText}>Card: •••• {cardNumber.slice(-4) || '8812'}</Text>
            </View>

            <Text style={styles.otpInstructions}>
              Enter 6-digit OTP sent to your registered mobile number:
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="123456"
              placeholderTextColor={colors.textMuted}
              value={otpValue}
              onChangeText={setOtpValue}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Pressable
              onPress={() => setOtpValue('123456')}
              style={styles.autofillOtpBtn}
            >
              <Text style={styles.autofillOtpText}>⚡ Autofill Test OTP (123456)</Text>
            </Pressable>

            <View style={styles.otpActionsRow}>
              <Pressable
                onPress={() => {
                  setShowOtpModal(false);
                  setIsProcessing(false);
                }}
                style={styles.cancelOtpBtn}
              >
                <Text style={styles.cancelOtpText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  setShowOtpModal(false);
                  if (pendingOtpAction) {
                    await pendingOtpAction();
                  }
                }}
                style={styles.submitOtpBtn}
              >
                <Text style={styles.submitOtpText}>Authorize & Pay</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- CASH ON DELIVERY OTP MODAL --- */}
      <Modal visible={showCodModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.otpModalCard}>
            <Ionicons name="cash-outline" size={36} color={colors.goldDeep} style={{ alignSelf: 'center' }} />
            <Text style={[styles.bankOtpTitle, { textAlign: 'center', marginTop: 8 }]}>
              Confirm Cash on Delivery
            </Text>
            <Text style={styles.otpInstructions}>
              We sent a verification SMS to {currentAddress.phone}. Please enter code to confirm genuine artisan order:
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="1234"
              placeholderTextColor={colors.textMuted}
              value={codOtp}
              onChangeText={setCodOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Pressable onPress={() => setCodOtp('1234')} style={styles.autofillOtpBtn}>
              <Text style={styles.autofillOtpText}>⚡ Autofill Test Code (1234)</Text>
            </Pressable>

            <View style={styles.otpActionsRow}>
              <Pressable onPress={() => setShowCodModal(false)} style={styles.cancelOtpBtn}>
                <Text style={styles.cancelOtpText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={handleConfirmCod} style={styles.submitOtpBtn}>
                <Text style={styles.submitOtpText}>Confirm COD Booking</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- PAYMENT PROCESSING SPINNER OVERLAY --- */}
      <Modal visible={isProcessing && !showOtpModal && !showCodModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={styles.processingTitle}>Securing Payment</Text>
            <Text style={styles.processingStatus}>{processingStatus}</Text>
            <Text style={styles.processingSafe}>
              🔒 Please do not refresh or close. Communicating with payment gateway.
            </Text>
          </View>
        </View>
      </Modal>

      {/* --- CONFIRMATION CELEBRATION MODAL --- */}
      <Modal visible={confirmedOrder !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="checkmark-done" size={42} color={colors.goldBright} />
            </View>

            <Text style={styles.confirmHeading}>Order Confirmed & Payment Verified!</Text>
            <Text style={styles.confirmId}>
              Order #{confirmedOrder?.orderNumber || confirmedOrder?.id}
            </Text>
            <Text style={styles.confirmBody}>
              Thank you for supporting authentic Karigaars in Pune. Your maker has received your order and payment via{' '}
              {confirmedOrder?.paymentMethod}!
            </Text>

            <View style={styles.confirmDetailsBox}>
              <Text style={styles.confirmDetailLine}>
                Total Paid: <Text style={{ fontWeight: '700' }}>₹{confirmedOrder?.totalAmount}</Text>
              </Text>
              <Text style={styles.confirmDetailLine}>
                Estimated Delivery: {confirmedOrder?.estimatedDelivery}
              </Text>
              <Text style={styles.confirmDetailLine}>
                Delivery Partner: {confirmedOrder?.courierPartner}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                const id = confirmedOrder?.id || confirmedOrder?.orderNumber;
                setConfirmedOrder(null);
                navigation.navigate('OrderDetail', { orderId: id! });
              }}
              style={styles.trackOrderBtn}
            >
              <Text style={styles.trackOrderBtnText}>Track Order Status & View Tax Invoice →</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setConfirmedOrder(null);
                navigation.navigate('CustomerHome');
              }}
              style={styles.continueShopBtn}
            >
              <Text style={styles.continueShopBtnText}>Continue Shopping Handmade</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.marketplaceBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 48,
  },
  container: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  stepperCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    ...shadow.sm,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepItemActive: {},
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberBadgeActive: {
    backgroundColor: colors.goldDeep,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepNumberTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  stepLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FDEDED',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
  },
  retryBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  layout: {
    flexDirection: 'column',
    gap: 16,
  },
  layoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  formColumn: {
    width: '100%',
  },
  summaryColumn: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
  },
  stepBadgeMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.goldDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeMiniText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.serif.bold,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  addAddrHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  addAddrHeaderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
  },
  addressesList: {
    gap: 10,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  addressCardSelected: {
    borderColor: colors.goldDeep,
    backgroundColor: `${colors.goldFaint}`,
  },
  addressCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  radioDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  radioDotSelected: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldDeep,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tagBadge: {
    backgroundColor: colors.cardBgAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: colors.ecoGreenFaint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ecoGreen,
  },
  editLink: {
    fontSize: 12,
    color: colors.goldDeep,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 24,
    lineHeight: 18,
  },
  addressPhone: {
    fontSize: 13,
    color: colors.charcoal,
    fontWeight: '600',
    marginLeft: 24,
    marginTop: 4,
  },
  selectedAddrIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 24,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
  },
  selectedAddrIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.goldDeep,
  },
  deliverySpeedBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
  },
  sectionMiniTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  speedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  speedOptionSelected: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldFaint,
  },
  speedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  speedSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  primaryActionBtn: {
    backgroundColor: colors.chocolate,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...shadow.sm,
  },
  primaryActionBtnDisabled: {
    opacity: 0.7,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stepNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryStepBtn: {
    flex: 0.6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryStepBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  reviewItemsList: {
    gap: 10,
    marginBottom: 16,
  },
  reviewItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  reviewItemThumb: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.cardBgAlt,
  },
  reviewItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewItemMaker: {
    fontSize: 12,
    color: colors.textMuted,
  },
  customSpecsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.goldFaint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginVertical: 2,
  },
  customSpecsText: {
    fontSize: 11,
    color: colors.goldDeep,
    fontWeight: '600',
  },
  reviewItemPriceQty: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  couponCard: {
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.md,
    padding: 12,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  applyCouponBtn: {
    backgroundColor: colors.charcoal,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  applyCouponBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  couponFeedback: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  couponPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  couponPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  couponPillCode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldDeep,
  },
  couponPillDesc: {
    fontSize: 9,
    color: colors.textMuted,
  },
  paymentCategoryTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  paymentCatTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  paymentCatTabActive: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldFaint,
  },
  paymentCatTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  paymentCatTabTextActive: {
    color: colors.charcoal,
    fontWeight: '700',
  },
  paymentMethodBody: {
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.md,
    padding: 14,
  },
  upiSubChoiceRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    padding: 4,
    marginBottom: 12,
  },
  upiSubChoiceBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 4,
  },
  upiSubChoiceBtnActive: {
    backgroundColor: colors.goldDim,
  },
  upiSubChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  upiSubChoiceTextActive: {
    color: colors.charcoal,
    fontWeight: '700',
  },
  upiAppsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  upiAppTile: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: 10,
  },
  upiAppTileActive: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldFaint,
  },
  upiAppName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
    flex: 1,
  },
  qrSimulatorBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  mockQrCode: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  qrInstructions: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 10,
    fontWeight: '600',
  },
  qrTimer: {
    fontSize: 11,
    color: colors.terracotta,
    fontWeight: '700',
    marginTop: 4,
  },
  cardPreview: {
    backgroundColor: '#1E140E',
    borderRadius: radius.md,
    padding: 16,
    ...shadow.md,
  },
  cardPreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardChipIcon: {
    color: colors.goldBright,
    fontWeight: '700',
    fontSize: 11,
  },
  cardBrandBadge: {
    backgroundColor: colors.goldDeep,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardPreviewNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FAF7F2',
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewMiniLabel: {
    fontSize: 8,
    color: colors.textMuted,
  },
  cardPreviewName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardPreviewExpiry: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankTile: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: 10,
  },
  bankTileActive: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldFaint,
  },
  bankName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
    flex: 1,
  },
  walletsList: {
    gap: 8,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: 10,
  },
  walletRowActive: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldFaint,
  },
  walletName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
  },
  codAlertBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  codAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  codAlertText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  codMaxNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },
  secureCardNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  disabledInput: {
    backgroundColor: colors.cardBgAlt,
    color: colors.textMuted,
  },
  summaryCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    ...shadow.sm,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.serif.bold,
    marginBottom: 12,
  },
  summaryItemsList: {
    gap: 8,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemName: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    paddingRight: 8,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  summaryBreakdown: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: fonts.serif.bold,
  },
  grandTotalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.chocolate,
  },
  miniAddrPreview: {
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.sm,
    padding: 8,
    marginBottom: 12,
  },
  miniAddrTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
  },
  miniAddrText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trustBadgesBox: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
  },
  trustBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  addressModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 20,
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    ...shadow.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.serif.bold,
  },
  modalError: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  tagSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagSelectorChip: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  tagSelectorChipActive: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldFaint,
  },
  tagSelectorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tagSelectorTextActive: {
    color: colors.charcoal,
    fontWeight: '700',
  },
  otpModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    ...shadow.lg,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bankOtpTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.charcoal,
  },
  bankOtpSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  otpDetailBox: {
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 12,
    gap: 4,
  },
  otpDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  otpInstructions: {
    fontSize: 12,
    color: colors.charcoal,
    marginBottom: 8,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: colors.goldDim,
    borderRadius: radius.sm,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
    paddingVertical: 10,
    marginBottom: 8,
  },
  autofillOtpBtn: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  autofillOtpText: {
    fontSize: 12,
    color: colors.goldDeep,
    fontWeight: '600',
  },
  otpActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelOtpBtn: {
    flex: 0.8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelOtpText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  submitOtpBtn: {
    flex: 1.2,
    backgroundColor: colors.chocolate,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitOtpText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    ...shadow.lg,
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 14,
  },
  processingStatus: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  processingSafe: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 14,
    textAlign: 'center',
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    ...shadow.lg,
  },
  confirmIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadow.glow,
  },
  confirmHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: fonts.serif.bold,
    textAlign: 'center',
  },
  confirmId: {
    fontSize: 13,
    color: colors.goldDeep,
    fontWeight: '700',
    marginTop: 6,
  },
  confirmBody: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },
  confirmDetailsBox: {
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.md,
    padding: 12,
    width: '100%',
    marginVertical: 16,
    gap: 4,
  },
  confirmDetailLine: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  trackOrderBtn: {
    backgroundColor: colors.chocolate,
    borderRadius: radius.md,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackOrderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  continueShopBtn: {
    paddingVertical: 10,
  },
  continueShopBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
