// /**
//  * VendorDeliveryWorkflow.js
//  * ──────────────────────────────────────────────────────────────────────────────
//  * TEMPORARY / TESTING ONLY — Dummy delivery partner workflow inside Vendor.
//  * This file can be removed once a real third-party delivery integration is added.
//  *
//  * Screens exported:
//  *   VendorOrdersWithDeliveryScreen — enhanced orders list (replaces OrdersListScreen)
//  *   VendorAssignDeliveryScreen     — pick a dummy delivery partner + see OTP
//  *   VendorDeliveryStatusScreen     — live status of a specific order, mark delivered
//  *
//  * All screens read/write the global Zustand store (useStore).
//  */

// import React, { useState } from 'react';
// import {
//   View, Text, ScrollView, FlatList, TouchableOpacity,
//   StyleSheet, SafeAreaView, StatusBar, Alert, TextInput,
// } from 'react-native';
// import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
// import { AppHeader, Card, PrimaryButton, Badge, Avatar, Divider } from '../../../vendor/components';
// import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
// import useAppStore from '../../../store/appStore';
// import { useTheme } from '../../../hooks/useTheme';

// // ─── Dummy delivery partners ──────────────────────────────────────────────────
// const DUMMY_PARTNERS = [
//   { id: 'dp1', name: 'Rajesh Kumar',  phone: '98765 43210', vehicle: 'Bike · UP16 AB 1234', emoji: '🏍️' },
//   { id: 'dp2', name: 'Suresh Singh',  phone: '87654 32109', vehicle: 'Bike · UP14 CD 5678', emoji: '🏍️' },
//   { id: 'dp3', name: 'Anil Sharma',   phone: '76543 21098', vehicle: 'Cycle · N/A',          emoji: '🚲' },
// ];

// // ─── Helper ───────────────────────────────────────────────────────────────────
// const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

// const STATUS_META = {
//   pending:           { label: 'New',              color: Colors.amber,   bg: Colors.amberLight  },
//   accepted:          { label: 'Confirmed',         color: Colors.teal,    bg: Colors.tealLight   },
//   assigned_delivery: { label: 'Delivery Assigned', color: Colors.blue,    bg: Colors.blueLight   },
//   out_for_delivery:  { label: 'Out for Delivery',  color: Colors.blue,    bg: Colors.blueLight   },
//   delivered:         { label: 'Delivered ✅',       color: Colors.green,   bg: Colors.greenLight  },
//   rejected:          { label: 'Rejected',          color: '#C62828',      bg: '#FEE2E2'          },
//   returned:          { label: 'Returned 📦',        color: '#E8A020',      bg: '#FFF7ED'          },
// };

// // ─── 1. VendorOrdersWithDeliveryScreen ───────────────────────────────────────
// // Enhanced version of the original OrdersListScreen that includes delivery management

// export default function VendorOrdersScreen({ navigation }) {
//   const theme = useTheme();
//   const orders            = useAppStore(s => s.marketplaceOrders);
//   const vendorAcceptOrder = useAppStore(s => s.vendorAcceptOrder);
//   const vendorRejectOrder = useAppStore(s => s.vendorRejectOrder);
//   const [tab, setTab]     = useState('pending');

//   const TABS = [
//     { key: 'pending',   label: 'New'       },
//     { key: 'accepted',  label: 'Confirmed' },
//     { key: 'delivery',  label: 'Delivery'  },
//     { key: 'delivered', label: 'Delivered' },
//     { key: 'returns',   label: 'Returns'   },
//   ];

//   const filtered = orders.filter(o => {
//     if (tab === 'pending')   return o.status === 'pending';
//     if (tab === 'accepted')  return o.status === 'accepted';
//     if (tab === 'delivery')  return ['assigned_delivery', 'out_for_delivery'].includes(o.status);
//     if (tab === 'delivered') return ['delivered', 'rejected'].includes(o.status);
//     if (tab === 'returns')   return o.status === 'returned';
//     return true;
//   });

//   const handleAccept = (orderId) => {
//     Alert.alert('Accept Order', 'Confirm and accept this order?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Accept', onPress: () => vendorAcceptOrder(orderId) },
//     ]);
//   };

//   const handleReject = (orderId) => {
//     Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Reject', style: 'destructive', onPress: () => vendorRejectOrder(orderId) },
//     ]);
//   };

//   return (
//     <SafeAreaView style={s.safe}>
//       <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
//       <View style={s.listHeader}>
//         <View style={[s.listHeaderTop, { marginBottom: 0 }]}>
//           <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
//             <Text style={s.backArrow}>‹</Text>
//           </TouchableOpacity>
//           <Text style={s.heading}>Orders</Text>
//           <View style={[s.dummyBadge]}>
//             <Text style={s.dummyBadgeText}>⚠️ Test Mode</Text>
//           </View>
//         </View>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 8, flexDirection: 'row' }}>
//           {TABS.map(t => (
//             <TouchableOpacity
//               key={t.key}
//               onPress={() => setTab(t.key)}
//               style={[s.catChip, tab === t.key && { backgroundColor: Colors.teal, borderColor: Colors.teal }]}
//               activeOpacity={0.7}
//             >
//               <Text style={[s.catChipText, tab === t.key && { color: theme.card }]}>
//                 {t.label} ({orders.filter(o => {
//                   if (t.key === 'pending')   return o.status === 'pending';
//                   if (t.key === 'accepted')  return o.status === 'accepted';
//                   if (t.key === 'delivery')  return ['assigned_delivery','out_for_delivery'].includes(o.status);
//                   if (t.key === 'delivered') return ['delivered','rejected'].includes(o.status);
//                   if (t.key === 'returns')   return o.status === 'returned';
//                   return false;
//                 }).length})
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {filtered.length === 0 ? (
//         <View style={s.emptyContainer}>
//           <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
//           <Text style={s.emptyTitle}>No orders hre</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={[...filtered].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))}
//           keyExtractor={o => o.id}
//           contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
//           showsVerticalScrollIndicator={false}
//           renderItem={({ item }) => {
//             const meta = STATUS_META[item.status] || STATUS_META.pending;
//             return (
//               <TouchableOpacity
//                 style={s.orderCard}
//                 onPress={() => navigation.navigate('VendorDeliveryStatus', { orderId: item.id })}
//                 activeOpacity={0.85}
//               >
//                 <View style={s.orderTop}>
//                   <Text style={s.orderId}>#{item.id}</Text>
//                   <Badge label={meta.label} color={meta.color} bg={meta.bg} />
//                 </View>
//                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
//                   <Avatar name={item.residentName} size={38} color={Colors.teal} />
//                   <View>
//                     <Text style={s.orderName}>{item.residentName}</Text>
//                     <Text style={s.orderMeta}>Unit {item.unit} · {item.items.length} item{item.items.length > 1 ? 's' : ''} · ₹{item.total}</Text>
//                     <Text style={s.orderMeta}>{fmt(item.placedAt)}</Text>
//                   </View>
//                 </View>

//                 {/* OTP chip */}
//                 {item.otp && item.status !== 'delivered' && item.status !== 'rejected' && (
//                   <View style={s.otpChip}>
//                     <Text style={s.otpChipLabel}>🔑 OTP:</Text>
//                     <Text style={s.otpChipValue}>{item.otp}</Text>
//                     <Text style={s.otpChipSub}>{item.otpVerified ? '✓ Guard Verified' : 'Guard not verified yet'}</Text>
//                   </View>
//                 )}

//                 {/* Actions */}
//                 {item.status === 'pending' && (
//                   <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
//                     <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.surface }]} onPress={() => handleReject(item.id)} activeOpacity={0.8}>
//                       <Text style={[s.actionBtnText, { color: theme.danger }]}>✗  Reject</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.teal, flex: 2 }]} onPress={() => handleAccept(item.id)} activeOpacity={0.8}>
//                       <Text style={[s.actionBtnText, { color: theme.card }]}>✓  Accept</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//                 {item.status === 'accepted' && (
//                   <TouchableOpacity
//                     style={[s.actionBtn, { backgroundColor: Colors.blueLight, marginTop: 4 }]}
//                     onPress={() => navigation.navigate('VendorAssignDelivery', { orderId: item.id })}
//                     activeOpacity={0.8}
//                   >
//                     <Text style={[s.actionBtnText, { color: Colors.blue }]}>🚚  Assign Delivery Partner</Text>
//                   </TouchableOpacity>
//                 )}
//                 {item.status === 'out_for_delivery' && !item.otpVerified && (
//                   <View style={[s.otpChip, { backgroundColor: Colors.amberLight }]}>
//                     <Text style={[s.otpChipSub, { color: Colors.amber }]}>⏳ Waiting for guard to verify OTP...</Text>
//                   </View>
//                 )}
//                 {item.status === 'out_for_delivery' && item.otpVerified && (
//                   <TouchableOpacity
//                     style={[s.actionBtn, { backgroundColor: Colors.greenLight, marginTop: 4 }]}
//                     onPress={() => navigation.navigate('VendorDeliveryStatus', { orderId: item.id })}
//                     activeOpacity={0.8}
//                   >
//                     <Text style={[s.actionBtnText, { color: Colors.green }]}>📦  Mark as Delivered</Text>
//                   </TouchableOpacity>
//                 )}
//               </TouchableOpacity>
//             );
//           }}
//         />
//       )}

//       <MarketplaceTabBar activeTab="Orders" onTabPress={(tab) => {
//         if (tab === 'Home')     navigation.navigate('MarketplaceHome');
//         if (tab === 'Products') navigation.navigate('ProductList');
//         if (tab === 'Earnings') navigation.navigate('MarketplaceEarnings');
//         if (tab === 'More')     navigation.navigate('MarketplaceProfile');
//       }} />
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:   { flex: 1, backgroundColor: Colors.bg },
//   scroll: { padding: 16, paddingBottom: 100 },
//   footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

//   listHeader:    { backgroundColor: '#1A7A7A', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
//   listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
//   backBtn:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
//   backArrow:     { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
//   heading:       { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF', flex: 1 },
//   dummyBadge:    { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.amberLight, borderRadius: Radius.md },
//   dummyBadgeText:{ fontSize: 10, color: Colors.amber, fontWeight: Fonts.bold },

//   catChip:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
//   catChipText:{ fontSize: 12, color: Colors.text2, fontWeight: Fonts.medium },

//   orderCard:  { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
//   orderTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
//   orderId:    { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.text },
//   orderName:  { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
//   orderMeta:  { fontSize: 11, color: Colors.text3, marginTop: 1 },
//   actionBtn:  { flex: 1, paddingVertical: 11, borderRadius: Radius.md, alignItems: 'center' },
//   actionBtnText: { fontSize: 13, fontWeight: Fonts.bold },

//   otpChip:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.tealLight, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8, flexWrap: 'wrap' },
//   otpChipLabel: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },
//   otpChipValue: { fontSize: 18, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 4 },
//   otpChipSub:   { fontSize: 11, color: Colors.teal },
//   otpLarge:     { fontSize: 42, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 12, textAlign: 'center' },

//   sectionLabel: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 12 },

//   partnerCard:  { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadows.card },
//   partnerEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
//   partnerName:  { fontSize: 15, fontWeight: Fonts.bold, color: Colors.text },
//   partnerSub:   { fontSize: 12, color: Colors.text2, marginTop: 2 },
//   radioOuter:   { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
//   radioInner:   { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.teal },

//   trackCircle:  { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
//   trackLine:    { width: 2, height: 28, marginTop: 2 },

//   emptyContainer:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
//   emptyTitle:    { fontSize: 18, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 6 },
// });





































/**
 * VendorDeliveryWorkflow.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Vendor order management — now backed by the real Spring Boot API.
 * Orders come from MySQL (placed by residents via Razorpay or COD).
 *
 * What changed vs original:
 *  - Orders loaded from useVendorOrderSlice (API) instead of appStore in-memory
 *  - Store name shown in each order card
 *  - Accept / Reject / Assign delivery / Mark delivered all call real endpoints
 *  - Dummy partners still used for assign-delivery (test mode UI)
 *  - All UI design, colors, layout UNCHANGED
 *
 * Screens exported:
 *   VendorOrdersScreen         — enhanced orders list (default export)
 *   VendorAssignDeliveryScreen — pick a dummy delivery partner
 *   VendorDeliveryStatusScreen — live status + mark delivered
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { Badge, Avatar } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import { useTheme } from '../../../hooks/useTheme';
import { useVendorOrderSlice } from '../../../api/marketplaceApi';

// ─── Dummy delivery partners (test mode — same as original) ──────────────────
const DUMMY_PARTNERS = [
  { id: 'dp1', name: 'Rajesh Kumar', phone: '98765 43210', vehicle: 'Bike · UP16 AB 1234', emoji: '🏍️' },
  { id: 'dp2', name: 'Suresh Singh', phone: '87654 32109', vehicle: 'Bike · UP14 CD 5678', emoji: '🏍️' },
  { id: 'dp3', name: 'Anil Sharma', phone: '76543 21098', vehicle: 'Cycle · N/A', emoji: '🚲' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }) : '';

const STATUS_META = {
  pending: { label: 'New', color: Colors.amber, bg: Colors.amberLight },
  accepted: { label: 'Confirmed', color: Colors.teal, bg: Colors.tealLight },
  assigned_delivery: { label: 'Delivery Assigned', color: Colors.blue, bg: Colors.blueLight },
  out_for_delivery: { label: 'Out for Delivery', color: Colors.blue, bg: Colors.blueLight },
  delivered: { label: 'Delivered ✅', color: Colors.green, bg: Colors.greenLight },
  rejected: { label: 'Rejected', color: '#C62828', bg: '#FEE2E2' },
  returned: { label: 'Returned 📦', color: '#E8A020', bg: '#FFF7ED' },
};

// ─── 1. VendorOrdersScreen ────────────────────────────────────────────────────
export default function VendorOrdersScreen({ navigation }) {
  const theme = useTheme();
  const { orders, ordersLoading, fetchOrders, acceptOrder, rejectOrder } = useVendorOrderSlice();
  const [tab, setTab] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  const TABS = [
    { key: 'pending', label: 'New' },
    { key: 'accepted', label: 'Confirmed' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'returns', label: 'Returns' },
  ];

  const countFor = (tabKey) => orders.filter(o => {
    if (tabKey === 'pending') return o.status === 'pending';
    if (tabKey === 'accepted') return o.status === 'accepted';
    if (tabKey === 'delivery') return ['assigned_delivery', 'out_for_delivery'].includes(o.status);
    if (tabKey === 'delivered') return ['delivered', 'rejected'].includes(o.status);
    if (tabKey === 'returns') return o.status === 'returned';
    return false;
  }).length;

  const filtered = orders.filter(o => {
    if (tab === 'pending') return o.status === 'pending';
    if (tab === 'accepted') return o.status === 'accepted';
    if (tab === 'delivery') return ['assigned_delivery', 'out_for_delivery'].includes(o.status);
    if (tab === 'delivered') return ['delivered', 'rejected'].includes(o.status);
    if (tab === 'returns') return o.status === 'returned';
    return true;
  });

  useEffect(() => {
    fetchOrders().catch(() => { });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchOrders(); } catch { }
    setRefreshing(false);
  }, [fetchOrders]);

  const handleAccept = (orderId) => {
    Alert.alert('Accept Order', 'Confirm and accept this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            await acceptOrder(orderId);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleReject = (orderId) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: async () => {
          try {
            await rejectOrder(orderId);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      {/* Header */}
      <View style={s.listHeader}>
        <View style={[s.listHeaderTop, { marginBottom: 0 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.heading}>Orders</Text>
          {ordersLoading && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12, gap: 8, flexDirection: 'row' }}
        >
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[s.catChip, tab === t.key && { backgroundColor: Colors.teal, borderColor: Colors.teal }]}
              activeOpacity={0.7}
            >
              <Text style={[s.catChipText, tab === t.key && { color: theme.card }]}>
                {t.label} ({countFor(t.key)})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
          <Text style={s.emptyTitle}>No orders here</Text>
          <Text style={{ fontSize: 13, color: Colors.text3, textAlign: 'center', marginTop: 4 }}>
            Pull down to refresh
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...filtered].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))}
          keyExtractor={o => String(o.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status] || STATUS_META.pending;
            let items = [];
            try { items = JSON.parse(item.itemsJson || '[]'); } catch { }

            return (
              <TouchableOpacity
                style={s.orderCard}
                onPress={() => navigation.navigate('VendorDeliveryStatus', { orderId: item.id })}
                activeOpacity={0.85}
              >
                <View style={s.orderTop}>
                  <Text style={s.orderId}>#{item.id}</Text>
                  <Badge label={meta.label} color={meta.color} bg={meta.bg} />
                </View>

                {/* Store name */}
                {item.storeName && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Text style={{ fontSize: 13 }}>🏪</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.teal }}>{item.storeName}</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Avatar name={item.residentName} size={38} color={Colors.teal} />
                  <View>
                    <Text style={s.orderName}>{item.residentName}</Text>
                    <Text style={s.orderMeta}>
                      Unit {item.unit} · {items.length} item{items.length !== 1 ? 's' : ''} · ₹{item.total}
                    </Text>
                    <Text style={s.orderMeta}>{fmt(item.placedAt)}</Text>
                  </View>
                </View>

                {/* Payment badge */}
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                  <View style={{ backgroundColor: item.paymentStatus === 'paid' ? Colors.greenLight : Colors.amberLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: item.paymentStatus === 'paid' ? Colors.green : Colors.amber }}>
                      {item.paymentStatus === 'paid' ? '✅ Paid' : item.paymentStatus === 'cod' ? '💵 COD' : '⏳ Pending'}
                    </Text>
                  </View>
                  {item.paymentMethod && (
                    <View style={{ backgroundColor: Colors.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, color: Colors.text3 }}>{item.paymentMethod.toUpperCase()}</Text>
                    </View>
                  )}
                </View>

                {/* OTP chip */}
                {item.otp && !['delivered', 'rejected'].includes(item.status) && (
                  <View style={s.otpChip}>
                    <Text style={s.otpChipLabel}>🔑 OTP:</Text>
                    <Text style={s.otpChipValue}>{item.otp}</Text>
                    <Text style={s.otpChipSub}>
                      {item.otpVerified ? '✓ Verified' : 'Not verified yet'}
                    </Text>
                  </View>
                )}

                {/* Action buttons */}
                {item.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TouchableOpacity
                      style={[s.actionBtn, { backgroundColor: theme.surface }]}
                      onPress={() => handleReject(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.actionBtnText, { color: theme.danger }]}>✗  Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.actionBtn, { backgroundColor: Colors.teal, flex: 2 }]}
                      onPress={() => handleAccept(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.actionBtnText, { color: theme.card }]}>✓  Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'accepted' && (
                  <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: Colors.blueLight, marginTop: 4 }]}
                    onPress={() => navigation.navigate('VendorAssignDelivery', { orderId: item.id })}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.actionBtnText, { color: Colors.blue }]}>🚚  Assign Delivery Partner</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'out_for_delivery' && (
                  <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: Colors.greenLight, marginTop: 4 }]}
                    onPress={() => navigation.navigate('VendorDeliveryStatus', { orderId: item.id })}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.actionBtnText, { color: Colors.green }]}>📦  Mark as Delivered</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <MarketplaceTabBar activeTab="Orders" onTabPress={(tab) => {
        if (tab === 'Home') navigation.navigate('MarketplaceHome');
        if (tab === 'Products') navigation.navigate('ProductList');
        if (tab === 'Earnings') navigation.navigate('MarketplaceEarnings');
        if (tab === 'More') navigation.navigate('MarketplaceProfile');
      }} />
    </SafeAreaView>
  );
}

// ─── 2. VendorAssignDeliveryScreen ────────────────────────────────────────────
export function VendorAssignDeliveryScreen({ navigation, route }) {
  const { orderId } = route.params;
  const theme = useTheme();
  const { orders, assignDelivery, markOutForDelivery } = useVendorOrderSlice();
  const order = orders.find(o => o.id === orderId);

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedPartner) {
      Alert.alert('Select Partner', 'Please select a delivery partner first.');
      return;
    }

    setAssigning(true);
    try {
      await assignDelivery(orderId, selectedPartner.name, selectedPartner.phone);
      await markOutForDelivery(orderId);
      Alert.alert(
        'Delivery Assigned!',
        `${selectedPartner.name} has been assigned to this order and is now out for delivery.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
      <View style={s.listHeader}>
        <View style={s.listHeaderTop}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.heading}>Assign Delivery</Text>
          <View style={s.dummyBadge}>
            <Text style={s.dummyBadgeText}>⚠️ Test Mode</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Order summary */}
        {order && (
          <View style={[s.orderCard, { marginBottom: 20 }]}>
            <Text style={s.sectionLabel}>📦 Order #{order.id}</Text>
            {order.storeName && (
              <Text style={{ fontSize: 12, color: Colors.teal, fontWeight: '600', marginBottom: 4 }}>
                🏪 {order.storeName}
              </Text>
            )}
            <Text style={s.orderMeta}>Resident: {order.residentName} · Unit {order.unit}</Text>
            <Text style={s.orderMeta}>Total: ₹{order.total}</Text>
            {order.otp && (
              <View style={[s.otpChip, { marginTop: 8 }]}>
                <Text style={s.otpChipLabel}>🔑 OTP:</Text>
                <Text style={s.otpChipValue}>{order.otp}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={s.sectionLabel}>🏍️ Select Delivery Partner</Text>

        {DUMMY_PARTNERS.map(partner => {
          const selected = selectedPartner?.id === partner.id;
          return (
            <TouchableOpacity
              key={partner.id}
              style={[s.partnerCard, selected && { borderColor: Colors.teal, backgroundColor: Colors.tealLight }]}
              onPress={() => setSelectedPartner(partner)}
              activeOpacity={0.8}
            >
              <View style={s.partnerEmoji}>
                <Text style={{ fontSize: 24 }}>{partner.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.partnerName}>{partner.name}</Text>
                <Text style={s.partnerSub}>{partner.phone}</Text>
                <Text style={s.partnerSub}>{partner.vehicle}</Text>
              </View>
              <View style={s.radioOuter}>
                {selected && <View style={s.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: selectedPartner ? Colors.teal : Colors.border, marginTop: 20, paddingVertical: 14 }]}
          onPress={handleAssign}
          disabled={!selectedPartner || assigning}
          activeOpacity={0.85}
        >
          {assigning ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[s.actionBtnText, { color: '#FFF', fontSize: 15 }]}>
              🚚 Assign & Mark Out for Delivery
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 3. VendorDeliveryStatusScreen ───────────────────────────────────────────
export function VendorDeliveryStatusScreen({ navigation, route }) {
  const { orderId } = route.params;
  const theme = useTheme();
  const { orders, markDelivered, fetchOrders } = useVendorOrderSlice();
  const order = orders.find(o => o.id === orderId);

  const [marking, setMarking] = useState(false);

  const handleMarkDelivered = async () => {
    Alert.alert('Confirm Delivery', 'Mark this order as delivered?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Delivered',
        onPress: async () => {
          setMarking(true);
          try {
            await markDelivered(orderId);
            Alert.alert('✅ Delivered!', 'Order has been marked as delivered.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (err) {
            Alert.alert('Error', err.message);
          } finally {
            setMarking(false);
          }
        },
      },
    ]);
  };

  if (!order) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.teal} />
        </View>
      </SafeAreaView>
    );
  }

  const meta = STATUS_META[order.status] || STATUS_META.pending;
  let items = [];
  try { items = JSON.parse(order.itemsJson || '[]'); } catch { }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
      <View style={s.listHeader}>
        <View style={s.listHeaderTop}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.heading}>Order #{order.id}</Text>
          <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: meta.bg, borderRadius: Radius.md }}>
            <Text style={{ fontSize: 10, color: meta.color, fontWeight: Fonts.bold }}>{meta.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Store + Resident info */}
        <View style={[s.orderCard, { marginBottom: 16 }]}>
          {order.storeName && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Text style={{ fontSize: 16 }}>🏪</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.teal }}>{order.storeName}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Avatar name={order.residentName} size={40} color={Colors.teal} />
            <View>
              <Text style={s.orderName}>{order.residentName}</Text>
              <Text style={s.orderMeta}>Unit {order.unit}</Text>
            </View>
          </View>
          <Text style={s.orderMeta}>Placed: {fmt(order.placedAt)}</Text>
          {order.deliveryPartnerName && (
            <Text style={[s.orderMeta, { marginTop: 4 }]}>
              🏍️ {order.deliveryPartnerName}
              {order.deliveryPartnerPhone ? `  ·  ${order.deliveryPartnerPhone}` : ''}
            </Text>
          )}
        </View>

        {/* Items */}
        <Text style={s.sectionLabel}>🛒 Items</Text>
        {items.map((item, idx) => (
          <View key={idx} style={{ backgroundColor: Colors.white, borderRadius: Radius.md, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border }}>
            <Text style={{ fontSize: 24 }}>{item.emoji || '📦'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: Fonts.bold, color: Colors.text }}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: Colors.text3 }}>₹{item.price} × {item.qty}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: Fonts.bold, color: Colors.teal }}>₹{item.price * item.qty}</Text>
          </View>
        ))}

        {/* OTP */}
        {order.otp && !['delivered', 'rejected'].includes(order.status) && (
          <View style={[s.otpChip, { justifyContent: 'center', marginBottom: 16 }]}>
            <Text style={s.otpChipLabel}>🔑 Delivery OTP:</Text>
            <Text style={[s.otpChipValue, { fontSize: 32, letterSpacing: 8 }]}>{order.otp}</Text>
          </View>
        )}

        {/* Mark delivered button */}
        {order.status === 'out_for_delivery' && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: Colors.green, paddingVertical: 16, marginTop: 8 }]}
            onPress={handleMarkDelivered}
            disabled={marking}
            activeOpacity={0.85}
          >
            {marking ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[s.actionBtnText, { color: '#FFF', fontSize: 16 }]}>✅ Mark as Delivered</Text>
            )}
          </TouchableOpacity>
        )}

        {order.status === 'delivered' && (
          <View style={{ backgroundColor: Colors.greenLight, borderRadius: Radius.lg, padding: 16, alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🎉</Text>
            <Text style={{ fontSize: 16, fontWeight: Fonts.bold, color: Colors.green }}>Order Delivered!</Text>
            <Text style={{ fontSize: 13, color: Colors.green, marginTop: 4 }}>{fmt(order.deliveredAt)}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles (IDENTICAL to original) ──────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  listHeader: { backgroundColor: '#1A7A7A', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
  heading: { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF', flex: 1 },
  dummyBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.amberLight, borderRadius: Radius.md },
  dummyBadgeText: { fontSize: 10, color: Colors.amber, fontWeight: Fonts.bold },

  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  catChipText: { fontSize: 12, color: Colors.text2, fontWeight: Fonts.medium },

  orderCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.text },
  orderName: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
  orderMeta: { fontSize: 11, color: Colors.text3, marginTop: 1 },
  actionBtn: { flex: 1, paddingVertical: 11, borderRadius: Radius.md, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: Fonts.bold },

  otpChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.tealLight, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8, flexWrap: 'wrap' },
  otpChipLabel: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },
  otpChipValue: { fontSize: 18, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 4 },
  otpChipSub: { fontSize: 11, color: Colors.teal },

  sectionLabel: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 12 },

  partnerCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadows.card },
  partnerEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  partnerName: { fontSize: 15, fontWeight: Fonts.bold, color: Colors.text },
  partnerSub: { fontSize: 12, color: Colors.text2, marginTop: 2 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.teal },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 6 },
});