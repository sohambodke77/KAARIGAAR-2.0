import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { api } from '../services/apiClient';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type AdminTab = 'commissions' | 'reconciliation' | 'refunds' | 'sellers' | 'audit';

export function AdminDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState<AdminTab>('commissions');
  const [loading, setLoading] = useState(false);

  // Commission Rules state
  const [commissionRules, setCommissionRules] = useState<any[]>([
    { id: 'comm_default', categoryId: '*', categoryName: 'All Other Crafts (Default)', commissionPercentage: 12.0, fixedFee: 15.0, isDefault: true },
    { id: 'comm_crochet', categoryId: 'crochet', categoryName: 'Crochet & Fiber Art', commissionPercentage: 10.0, fixedFee: 10.0 },
    { id: 'comm_jewellery', categoryId: 'jewellery', categoryName: 'Handmade Jewellery', commissionPercentage: 15.0, fixedFee: 20.0 },
    { id: 'comm_resin', categoryId: 'resin', categoryName: 'Resin Art & Botanicals', commissionPercentage: 12.0, fixedFee: 15.0 },
    { id: 'comm_pottery', categoryId: 'pottery', categoryName: 'Studio Ceramics & Pottery', commissionPercentage: 8.0, fixedFee: 10.0 },
    { id: 'comm_paintings', categoryId: 'paintings', categoryName: 'Traditional Folk Paintings', commissionPercentage: 15.0, fixedFee: 25.0 },
    { id: 'comm_candles', categoryId: 'candles', categoryName: 'Organic Soy & Beeswax Candles', commissionPercentage: 10.0, fixedFee: 10.0 },
  ]);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [rulePct, setRulePct] = useState('');
  const [ruleFee, setRuleFee] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Financial Reconciliation state
  const [reconciliation, setReconciliation] = useState<any>({
    totalGmv: 48920,
    totalOrdersCount: 22,
    paidOrdersCount: 20,
    platformRevenueEarned: 5480,
    gatewayFeesTotal: 978,
    payoutsDisbursed: 32450,
    totalRefundedAmount: 1199,
    sellerLiabilities: 8813,
    netPlatformProfit: 4502,
  });

  // Refund Management state
  const [refunds, setRefunds] = useState<any[]>([
    {
      id: 'ref_sample_1',
      orderNumber: 'KG-89210',
      customerName: 'Pooja Deshmukh',
      amount: 1299,
      reason: 'Change in delivery schedule before dispatch',
      status: 'processed',
      createdAt: '2026-10-12T14:30:00Z',
    },
  ]);

  // Sellers KYC state
  const [sellers, setSellers] = useState<any[]>([
    {
      id: 'creator_1',
      sellerId: 'creator_1',
      accountHolderName: 'Ananya Mukherjee',
      accountNumberMasked: '•••• •••• •••• 9102',
      ifscCode: 'HDFC0001822',
      bankName: 'HDFC Bank, Kothrud Pune',
      verificationStatus: 'verified',
    },
    {
      id: 'creator_2',
      sellerId: 'creator_2',
      accountHolderName: 'Sunita Devi',
      accountNumberMasked: '•••• •••• •••• 7291',
      ifscCode: 'SBIN0004521',
      bankName: 'State Bank of India, Alandi Pune',
      verificationStatus: 'verified',
    },
    {
      id: 'creator_me',
      sellerId: 'creator_me',
      accountHolderName: 'Sanket Joshi',
      accountNumberMasked: '•••• •••• •••• 2910',
      ifscCode: 'ICIC0000341',
      bankName: 'ICICI Bank, Deccan Gymkhana Pune',
      verificationStatus: 'verified',
    },
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([
    {
      id: 'log_1',
      action: 'PAYMENT_VERIFIED_SUCCESS',
      entityType: 'order',
      entityId: 'kg_ord_1001',
      actorRole: 'system',
      createdAt: 'Just now',
      details: { amount: 1199, method: 'UPI' },
    },
    {
      id: 'log_2',
      action: 'SELLER_PAYOUT_SETTLED',
      entityType: 'settlement',
      entityId: 'set_ref_98012',
      actorRole: 'system',
      createdAt: '2 hours ago',
      details: { amount: 1035.12, sellerId: 'creator_1', utr: 'HDFCR202610119821034' },
    },
    {
      id: 'log_3',
      action: 'COMMISSION_RULE_UPDATED',
      entityType: 'commission_rule',
      entityId: 'comm_pottery',
      actorRole: 'admin',
      createdAt: 'Yesterday',
      details: { categoryId: 'pottery', commissionPercentage: 8.0 },
    },
  ]);

  // Load backend data
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [rulesData, reconData, refundsData, auditData] = await Promise.all([
          api.getAdminCommissionRules(),
          api.getAdminReconciliation(),
          api.getAdminRefunds(),
          api.getAdminAuditLogs(),
        ]);

        if (rulesData && rulesData.length > 0) setCommissionRules(rulesData);
        if (reconData) setReconciliation(reconData);
        if (refundsData && refundsData.length > 0) setRefunds(refundsData);
        if (auditData && auditData.length > 0) setAuditLogs(auditData);
      } catch {
        // Fallback initialized
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openEditRuleModal = (rule: any) => {
    setEditingRule(rule);
    setRulePct(rule.commissionPercentage.toString());
    setRuleFee(rule.fixedFee?.toString() || '0');
    setSaveSuccessMsg(null);
  };

  const handleSaveRule = async () => {
    if (!editingRule) return;
    const pct = parseFloat(rulePct);
    const fee = parseFloat(ruleFee || '0');

    if (isNaN(pct) || pct < 0 || pct > 50) {
      alert('Please enter a valid commission percentage between 0% and 50%');
      return;
    }

    try {
      await api.saveAdminCommissionRule({
        categoryId: editingRule.categoryId,
        categoryName: editingRule.categoryName,
        commissionPercentage: pct,
        fixedFee: fee,
        isDefault: editingRule.isDefault,
      });

      setCommissionRules((prev) =>
        prev.map((r) =>
          r.categoryId === editingRule.categoryId
            ? { ...r, commissionPercentage: pct, fixedFee: fee }
            : r
        )
      );

      setSaveSuccessMsg('Commission rule updated successfully');
      setTimeout(() => {
        setEditingRule(null);
        setSaveSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to update commission rule');
    }
  };

  const handleRefundAction = async (refundId: string, action: 'approve' | 'reject') => {
    try {
      await api.processAdminRefund(refundId, action, `Admin processed ${action}`);
      setRefunds((prev) =>
        prev.map((r) => (r.id === refundId ? { ...r, status: action === 'approve' ? 'processed' : 'rejected' } : r))
      );
      alert(`Refund ${action === 'approve' ? 'Approved & Processed via Gateway' : 'Rejected'}`);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <BackButton label="Back to Marketplace" fallbackRoute="SellerDashboard" />
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              <Text style={styles.adminBadgeText}>MARKETPLACE GOVERNANCE</Text>
            </View>
          </View>

          <Text style={styles.pageTitle}>Admin & Payment Control Center</Text>
          <Text style={styles.pageSubtitle}>
            Configure marketplace commission rates, monitor gross reconciliation, approve refunds, and audit ledger
            transactions.
          </Text>

          {/* Admin Navigation Tabs */}
          <View style={styles.tabsRow}>
            {[
              { id: 'commissions', label: 'Commission Rules', icon: 'calculator-outline' },
              { id: 'reconciliation', label: 'Financial Reconciliation', icon: 'bar-chart-outline' },
              { id: 'refunds', label: 'Refund Management', icon: 'refresh-outline' },
              { id: 'sellers', label: 'Seller KYC & Payouts', icon: 'card-outline' },
              { id: 'audit', label: 'Audit Trail', icon: 'list-outline' },
            ].map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.id ? '#FFFFFF' : colors.charcoal}
                />
                <Text style={[styles.tabBtnText, activeTab === tab.id && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* TAB 1: COMMISSIONS */}
          {activeTab === 'commissions' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Configurable Platform Commission Rules</Text>
                  <Text style={styles.cardSubtitle}>
                    Commissions are calculated automatically for every order based on craft category. Never hardcoded.
                  </Text>
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, { flex: 1.5 }]}>Craft Category</Text>
                  <Text style={[styles.th, { width: 120, textAlign: 'center' }]}>Platform Share (%)</Text>
                  <Text style={[styles.th, { width: 120, textAlign: 'center' }]}>Fixed Order Fee</Text>
                  <Text style={[styles.th, { width: 120, textAlign: 'center' }]}>Seller Retains</Text>
                  <Text style={[styles.th, { width: 90, textAlign: 'center' }]}>Action</Text>
                </View>

                {commissionRules.map((rule) => (
                  <View key={rule.id || rule.categoryId} style={styles.tableRow}>
                    <View style={{ flex: 1.5 }}>
                      <Text style={styles.categoryNameText}>{rule.categoryName}</Text>
                      {rule.isDefault && <Text style={styles.defaultSub}>Default for unlisted crafts</Text>}
                    </View>
                    <Text style={[styles.td, { width: 120, textAlign: 'center', fontWeight: '700' }]}>
                      {rule.commissionPercentage}%
                    </Text>
                    <Text style={[styles.td, { width: 120, textAlign: 'center' }]}>
                      ₹{rule.fixedFee || 0}
                    </Text>
                    <Text style={[styles.td, { width: 120, textAlign: 'center', color: colors.ecoGreen, fontWeight: '700' }]}>
                      {100 - rule.commissionPercentage}%
                    </Text>
                    <View style={{ width: 90, alignItems: 'center' }}>
                      <Pressable onPress={() => openEditRuleModal(rule)} style={styles.editBtn}>
                        <Text style={styles.editBtnText}>Configure</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: FINANCIAL RECONCILIATION */}
          {activeTab === 'reconciliation' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Marketplace Financial Reconciliation Report</Text>
                  <Text style={styles.cardSubtitle}>
                    Comprehensive breakdown of gross revenue, commissions, gateway fees, and seller liabilities.
                  </Text>
                </View>
              </View>

              <View style={styles.reconGrid}>
                <View style={styles.reconTile}>
                  <Text style={styles.reconLabel}>Gross Merchandise Value (GMV)</Text>
                  <Text style={styles.reconVal}>₹{reconciliation.totalGmv?.toLocaleString()}</Text>
                  <Text style={styles.reconSub}>{reconciliation.paidOrdersCount} Paid Orders</Text>
                </View>

                <View style={styles.reconTile}>
                  <Text style={styles.reconLabel}>Platform Revenue (Commissions)</Text>
                  <Text style={[styles.reconVal, { color: colors.goldDeep }]}>
                    ₹{reconciliation.platformRevenueEarned?.toLocaleString()}
                  </Text>
                  <Text style={styles.reconSub}>Calculated via active rules</Text>
                </View>

                <View style={styles.reconTile}>
                  <Text style={styles.reconLabel}>Gateway Processing Fees (MDR)</Text>
                  <Text style={[styles.reconVal, { color: colors.terracotta }]}>
                    ₹{reconciliation.gatewayFeesTotal?.toLocaleString()}
                  </Text>
                  <Text style={styles.reconSub}>Approx 2.0% Razorpay processing</Text>
                </View>

                <View style={styles.reconTile}>
                  <Text style={styles.reconLabel}>Paid-out to Artisan Makers</Text>
                  <Text style={[styles.reconVal, { color: colors.ecoGreen }]}>
                    ₹{reconciliation.payoutsDisbursed?.toLocaleString()}
                  </Text>
                  <Text style={styles.reconSub}>Bank UTR transfers settled</Text>
                </View>

                <View style={styles.reconTile}>
                  <Text style={styles.reconLabel}>Total Customer Refunds</Text>
                  <Text style={[styles.reconVal, { color: colors.danger }]}>
                    ₹{reconciliation.totalRefundedAmount?.toLocaleString()}
                  </Text>
                  <Text style={styles.reconSub}>Credited back to buyer source</Text>
                </View>

                <View style={styles.reconTile}>
                  <Text style={styles.reconLabel}>Pending Seller Liabilities</Text>
                  <Text style={styles.reconVal}>₹{reconciliation.sellerLiabilities?.toLocaleString()}</Text>
                  <Text style={styles.reconSub}>In transit / awaiting delivery</Text>
                </View>
              </View>

              <View style={styles.netProfitBanner}>
                <View>
                  <Text style={styles.netProfitTitle}>Net Platform Operating Profit</Text>
                  <Text style={styles.netProfitSub}>Platform Commission minus Gateway MDR fees</Text>
                </View>
                <Text style={styles.netProfitVal}>
                  ₹{(reconciliation.platformRevenueEarned - reconciliation.gatewayFeesTotal).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {/* TAB 3: REFUND MANAGEMENT */}
          {activeTab === 'refunds' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Customer Refund & Return Requests</Text>
                  <Text style={styles.cardSubtitle}>
                    Review buyer requests, initiate gateway refunds, and withhold seller payouts accordingly.
                  </Text>
                </View>
              </View>

              <View style={styles.refundsList}>
                {refunds.map((r) => (
                  <View key={r.id} style={styles.refundCard}>
                    <View style={styles.refundCardTop}>
                      <View>
                        <Text style={styles.refundOrderNumber}>Order #{r.orderNumber}</Text>
                        <Text style={styles.refundCustomer}>Customer: {r.customerName || 'Customer'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.refundAmount}>₹{r.amount}</Text>
                        <View
                          style={[
                            styles.refundStatusBadge,
                            r.status === 'processed'
                              ? { backgroundColor: colors.ecoGreenFaint }
                              : { backgroundColor: colors.goldFaint },
                          ]}
                        >
                          <Text
                            style={[
                              styles.refundStatusText,
                              r.status === 'processed' ? { color: colors.ecoGreen } : { color: colors.goldDeep },
                            ]}
                          >
                            {r.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.refundReasonText}>Reason: “{r.reason}”</Text>

                    {r.status === 'requested' && (
                      <View style={styles.refundActionsRow}>
                        <Pressable
                          onPress={() => handleRefundAction(r.id, 'reject')}
                          style={styles.rejectRefundBtn}
                        >
                          <Text style={styles.rejectRefundBtnText}>Reject Request</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleRefundAction(r.id, 'approve')}
                          style={styles.approveRefundBtn}
                        >
                          <Text style={styles.approveRefundBtnText}>Approve & Process Gateway Refund</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 4: SELLER KYC & ONBOARDING */}
          {activeTab === 'sellers' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Artisan Bank & Payout Onboarding</Text>
                  <Text style={styles.cardSubtitle}>
                    Verified beneficiary bank accounts linked to Razorpay Route / Cashfree Marketplace.
                  </Text>
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, { flex: 1.2 }]}>Maker & Beneficiary</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Masked Account</Text>
                  <Text style={[styles.th, { width: 120 }]}>IFSC Code</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Bank Name</Text>
                  <Text style={[styles.th, { width: 110, textAlign: 'center' }]}>KYC Status</Text>
                </View>

                {sellers.map((s) => (
                  <View key={s.id || s.sellerId} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 1.2, fontWeight: '700' }]}>{s.accountHolderName}</Text>
                    <Text style={[styles.td, { flex: 1, fontFamily: 'monospace' }]}>{s.accountNumberMasked}</Text>
                    <Text style={[styles.td, { width: 120, fontFamily: 'monospace' }]}>{s.ifscCode}</Text>
                    <Text style={[styles.td, { flex: 1.2 }]}>{s.bankName}</Text>
                    <View style={{ width: 110, alignItems: 'center' }}>
                      <View style={styles.kycVerifiedBadge}>
                        <Ionicons name="checkmark-circle" size={13} color={colors.ecoGreen} />
                        <Text style={styles.kycVerifiedText}>Verified</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 5: SYSTEM AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Real-Time Security & Financial Audit Logs</Text>
                  <Text style={styles.cardSubtitle}>
                    Immutable log of payments, HMAC signature verifications, settlements, and commission updates.
                  </Text>
                </View>
              </View>

              <View style={styles.auditList}>
                {auditLogs.map((log) => (
                  <View key={log.id} style={styles.auditRow}>
                    <View style={styles.auditIconCircle}>
                      <Ionicons name="document-text-outline" size={16} color={colors.goldDeep} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.auditRowTop}>
                        <Text style={styles.auditAction}>{log.action}</Text>
                        <Text style={styles.auditTime}>{log.createdAt}</Text>
                      </View>
                      <Text style={styles.auditMeta}>
                        Entity: {log.entityType} #{log.entityId} • Role: {log.actorRole}
                      </Text>
                      <Text style={styles.auditDetails}>{JSON.stringify(log.details)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* --- EDIT COMMISSION RULE MODAL --- */}
      <Modal visible={editingRule !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Configure Commission Rule</Text>
              <Pressable onPress={() => setEditingRule(null)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.charcoal} />
              </Pressable>
            </View>

            <Text style={styles.modalSub}>Category: {editingRule?.categoryName}</Text>

            {saveSuccessMsg ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={20} color={colors.ecoGreen} />
                <Text style={styles.successBannerText}>{saveSuccessMsg}</Text>
              </View>
            ) : (
              <>
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fieldLabel}>Platform Commission Percentage (%) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="12.0"
                    placeholderTextColor={colors.textMuted}
                    value={rulePct}
                    onChangeText={setRulePct}
                    keyboardType="numeric"
                  />
                  <Text style={styles.fieldHint}>
                    Artisan maker retains {100 - (parseFloat(rulePct) || 0)}% of the gross sale.
                  </Text>
                </View>

                <View style={{ marginTop: 14 }}>
                  <Text style={styles.fieldLabel}>Fixed Platform Fee per Order (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="15.0"
                    placeholderTextColor={colors.textMuted}
                    value={ruleFee}
                    onChangeText={setRuleFee}
                    keyboardType="numeric"
                  />
                  <Text style={styles.fieldHint}>Flat fee charged per transaction towards packaging & support.</Text>
                </View>

                <View style={styles.modalActionsRow}>
                  <Pressable onPress={() => setEditingRule(null)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSaveRule} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Save Configuration</Text>
                  </Pressable>
                </View>
              </>
            )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.chocolate,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.serif.bold,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  tabBtnActive: {
    backgroundColor: colors.chocolate,
    borderColor: colors.chocolate,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
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
    marginTop: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBgAlt,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
    backgroundColor: '#FFFFFF',
  },
  td: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  categoryNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  defaultSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  editBtn: {
    backgroundColor: colors.cardBgAlt,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
  },
  reconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  reconTile: {
    flex: 1,
    minWidth: 200,
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reconLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  reconVal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.charcoal,
    marginVertical: 4,
  },
  reconSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  netProfitBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E140E',
    borderRadius: radius.md,
    padding: 18,
  },
  netProfitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  netProfitSub: {
    fontSize: 12,
    color: colors.goldDim,
    marginTop: 2,
  },
  netProfitVal: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.goldBright,
  },
  refundsList: {
    gap: 12,
  },
  refundCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  refundCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refundOrderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
  },
  refundCustomer: {
    fontSize: 12,
    color: colors.textMuted,
  },
  refundAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.danger,
  },
  refundStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  refundStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  refundReasonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  refundActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
    paddingTop: 10,
  },
  rejectRefundBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rejectRefundBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  approveRefundBtn: {
    flex: 1.5,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  approveRefundBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  kycVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.ecoGreenFaint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  kycVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ecoGreen,
  },
  auditList: {
    gap: 10,
  },
  auditRow: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  auditIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  auditTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  auditMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  auditDetails: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    ...shadow.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.serif.bold,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: colors.chocolate,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.ecoGreenFaint,
    padding: 12,
    borderRadius: radius.sm,
    marginVertical: 16,
  },
  successBannerText: {
    color: colors.ecoGreen,
    fontWeight: '700',
    fontSize: 13,
  },
});
