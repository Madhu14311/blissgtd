// /**
//  * marketplaceApi.js
//  *
//  * All backend calls for vendor store management and resident marketplace browsing.
//  * Import these functions wherever you currently read from / write to appStore
//  * for marketplace data.
//  *
//  * Usage:
//  *   import { getMyStore, createStore, getMarketplaceProducts } from './marketplaceApi';
//  *
//  * Token:
//  *   Every call reads the token from AuthStore automatically.
//  *   If you call outside a React component, pass the token explicitly:
//  *   getMyStore(token)
//  */

// import { useAuthStore } from '../store/AuthStore';   // adjust path as needed

// // ─── Base config ──────────────────────────────────────────────────────────────
// const API_URL = 'http://192.168.10.33:8080/api';     // same as your existing api.js

// function getToken() {
//   // Works outside React via Zustand's getState()
//   return useAuthStore.getState().token || useAuthStore.getState().user?.token || null;
// }

// async function request(path, { method = 'GET', body, token } = {}) {
//   const tok = token || getToken();
//   const headers = {
//     'Content-Type': 'application/json',
//     ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
//   };

//   const res = await fetch(`${API_URL}${path}`, {
//     method,
//     headers,
//     ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
//   });

//   const text = await res.text();
//   const data = text ? JSON.parse(text) : null;

//   if (!res.ok) {
//     // Throw the backend error shape so callers can show proper messages
//     const msg = data?.message || data?.error || `Request failed (${res.status})`;
//     throw Object.assign(new Error(msg), { status: res.status, data });
//   }

//   return data;
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// //  VENDOR — Store management
// // ═══════════════════════════════════════════════════════════════════════════════

// /**
//  * Create a new store (once per vendor).
//  * @param {Object} storeData  — see VendorStoreRequest fields below
//  * @returns {Promise<VendorStore>}
//  *
//  * Required: storeName
//  * Optional (marketplace): deliveryRadiusKm, deliveryCharge, minOrderAmount,
//  *                          deliveryMode ("DELIVERY"|"PICKUP"|"BOTH"),
//  *                          estimatedDeliveryTime
//  * Optional (business):    serviceRadiusKm, serviceMode, appointmentSlotsJson
//  * Common optional:        description, category, subcategory, logoUrl,
//  *                          bannerUrl, contactPhone, address, timingsJson
//  *
//  * timingsJson example:
//  *   JSON.stringify([
//  *     { day: 'MON', open: '09:00', close: '21:00', closed: false },
//  *     { day: 'SUN', open: '10:00', close: '18:00', closed: false },
//  *   ])
//  */
// export async function createStore(storeData) {
//   return request('/vendor/store', { method: 'POST', body: storeData });
// }

// /**
//  * Get the currently logged-in vendor's store.
//  * @returns {Promise<VendorStore>}
//  */
// export async function getMyStore() {
//   return request('/vendor/store');
// }

// /**
//  * Update the vendor's store. Only send fields you want to change.
//  * @param {Object} updates  — any subset of VendorStoreUpdateRequest fields
//  * @returns {Promise<VendorStore>}
//  */
// export async function updateStore(updates) {
//   return request('/vendor/store', { method: 'PUT', body: updates });
// }

// /**
//  * Deactivate (soft-delete) the vendor's store.
//  * Products will disappear from the resident marketplace automatically.
//  * @returns {Promise<{message: string}>}
//  */
// export async function deactivateStore() {
//   return request('/vendor/store', { method: 'DELETE' });
// }

// /**
//  * Toggle vacation mode on/off.
//  * While on vacation, products won't appear to residents.
//  * @param {boolean} vacationMode
//  * @returns {Promise<VendorStore>}
//  */
// export async function setVacationMode(vacationMode) {
//   return request('/vendor/store', { method: 'PUT', body: { vacationMode } });
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// //  VENDOR — Product management
// // ═══════════════════════════════════════════════════════════════════════════════

// /**
//  * Add a product to the vendor's store.
//  * @param {Object} productData
//  *   Required: name, price, stock
//  *   Optional: description, emoji, imageUrl, originalPrice, category,
//  *             subcategory, unit, active (default true)
//  * @returns {Promise<ProductResponse>}
//  */
// export async function addProduct(productData) {
//   return request('/vendor/products', { method: 'POST', body: productData });
// }

// /**
//  * Get all products for the logged-in vendor (all statuses).
//  * @returns {Promise<ProductResponse[]>}
//  */
// export async function getMyProducts() {
//   return request('/vendor/products');
// }

// /**
//  * Update a product. Send only changed fields.
//  * @param {number|string} productId
//  * @param {Object} updates
//  * @returns {Promise<ProductResponse>}
//  */
// export async function updateProduct(productId, updates) {
//   return request(`/vendor/products/${productId}`, { method: 'PUT', body: updates });
// }

// /**
//  * Delete a product permanently.
//  * @param {number|string} productId
//  * @returns {Promise<{message: string}>}
//  */
// export async function deleteProduct(productId) {
//   return request(`/vendor/products/${productId}`, { method: 'DELETE' });
// }

// /**
//  * Toggle a product between active and paused.
//  * @param {number|string} productId
//  * @returns {Promise<ProductResponse>}
//  */
// export async function toggleProductActive(productId) {
//   return request(`/vendor/products/${productId}/toggle`, { method: 'PATCH' });
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// //  RESIDENT — Marketplace browsing
// // ═══════════════════════════════════════════════════════════════════════════════

// /**
//  * Get all products visible to residents.
//  * Only returns: active products, from active stores, not on vacation, stock > 0.
//  *
//  * @param {Object} [filters]
//  * @param {string} [filters.category]  — e.g. "Grocery"
//  * @param {string} [filters.search]    — searches name + category
//  * @returns {Promise<ProductResponse[]>}
//  *
//  * ProductResponse shape:
//  * {
//  *   id, vendorId, storeId, storeName, storeLogoUrl, vendorType,
//  *   name, description, emoji, imageUrl, price, originalPrice,
//  *   stock, category, subcategory, unit, active, createdAt, updatedAt
//  * }
//  */
// export async function getMarketplaceProducts(filters = {}) {
//   const params = new URLSearchParams();
//   if (filters.category) params.append('category', filters.category);
//   if (filters.search)   params.append('search',   filters.search);
//   const qs = params.toString();
//   return request(`/marketplace/products${qs ? `?${qs}` : ''}`);
// }

// /**
//  * Get a single product detail.
//  * @param {number|string} productId
//  * @returns {Promise<ProductResponse>}
//  */
// export async function getProduct(productId) {
//   return request(`/marketplace/products/${productId}`);
// }

// /**
//  * Get all active stores.
//  * @param {string} [type]  — "marketplace" | "business"
//  * @returns {Promise<VendorStore[]>}
//  */
// export async function getMarketplaceStores(type) {
//   const qs = type ? `?type=${type}` : '';
//   return request(`/marketplace/stores${qs}`);
// }

// /**
//  * Get a single store detail.
//  * @param {number|string} storeId
//  * @returns {Promise<VendorStore>}
//  */
// export async function getStore(storeId) {
//   return request(`/marketplace/stores/${storeId}`);
// }


















/**
 * marketplaceOrderApi.js
 *
 * Zustand slice for marketplace order placement, resident order tracking,
 * and vendor order management — all backed by Spring Boot MySQL.
 *
 * Drop at: src/api/marketplaceOrderApi.js
 */

import { create } from 'zustand';
import { useAuthStore } from '../store/AuthStore'; // adjust path if needed

const API_BASE_URL = 'http://192.168.10.33:8080/api';

async function apiFetch(path, { method = 'GET', body } = {}) {
  const token =
    useAuthStore.getState().token ||
    useAuthStore.getState().user?.token ||
    null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

  if (!res.ok) {
    const msg = data?.message || data?.error || `API error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  RESIDENT ORDER SLICE
// ═══════════════════════════════════════════════════════════════════════════════

export const useResidentOrderSlice = create((set) => ({
  orders: [],
  ordersLoading: false,
  ordersError: null,

  /**
   * Place a new order.
   * @param {{ storeId, itemsJson, subtotal, deliveryCharge, total,
   *           paymentMethod, razorpayPaymentId?, razorpayOrderId? }} req
   * @returns {Promise<MarketplaceOrder>}
   */
  placeOrder: async (req) => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const order = await apiFetch('/marketplace/orders', { method: 'POST', body: req });
      // Prepend to local list
      set(state => ({
        orders: [order, ...state.orders],
        ordersLoading: false,
      }));
      return order;
    } catch (err) {
      set({ ordersError: err.message, ordersLoading: false });
      throw err;
    }
  },

  /** Fetch all orders for the logged-in resident. */
  fetchMyOrders: async () => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const orders = await apiFetch('/marketplace/orders/my');
      set({ orders: orders || [], ordersLoading: false });
      return orders;
    } catch (err) {
      set({ ordersError: err.message, ordersLoading: false });
      throw err;
    }
  },

  reset: () => set({ orders: [], ordersLoading: false, ordersError: null }),
}));

// ═══════════════════════════════════════════════════════════════════════════════
//  VENDOR ORDER SLICE
// ═══════════════════════════════════════════════════════════════════════════════

export const useVendorOrderSlice = create((set, get) => ({
  orders: [],
  ordersLoading: false,
  ordersError: null,

  fetchOrders: async (status) => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      const orders = await apiFetch(`/vendor/orders${qs}`);
      set({ orders: orders || [], ordersLoading: false });
      return orders;
    } catch (err) {
      set({ ordersError: err.message, ordersLoading: false });
      throw err;
    }
  },

  acceptOrder: async (orderId) => {
    const order = await apiFetch(`/vendor/orders/${orderId}/accept`, { method: 'PUT' });
    set(state => ({ orders: state.orders.map(o => o.id === orderId ? order : o) }));
    return order;
  },

  rejectOrder: async (orderId) => {
    const order = await apiFetch(`/vendor/orders/${orderId}/reject`, { method: 'PUT' });
    set(state => ({ orders: state.orders.map(o => o.id === orderId ? order : o) }));
    return order;
  },

  assignDelivery: async (orderId, partnerName, partnerPhone) => {
    const order = await apiFetch(`/vendor/orders/${orderId}/assign-delivery`, {
      method: 'PUT',
      body: { partnerName, partnerPhone },
    });
    set(state => ({ orders: state.orders.map(o => o.id === orderId ? order : o) }));
    return order;
  },

  markOutForDelivery: async (orderId) => {
    const order = await apiFetch(`/vendor/orders/${orderId}/out-for-delivery`, { method: 'PUT' });
    set(state => ({ orders: state.orders.map(o => o.id === orderId ? order : o) }));
    return order;
  },

  markDelivered: async (orderId) => {
    const order = await apiFetch(`/vendor/orders/${orderId}/delivered`, { method: 'PUT' });
    set(state => ({ orders: state.orders.map(o => o.id === orderId ? order : o) }));
    return order;
  },

  reset: () => set({ orders: [], ordersLoading: false, ordersError: null }),
}));