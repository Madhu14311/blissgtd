/**
 * vendorStore.js
 * 
 * Zustand store for Vendor (Business & Marketplace) role.
 * Tracks: notifications, job requests, marketplace orders, earnings, store config.
 */
import { create } from 'zustand';

const useVendorStore = create((set, get) => ({

  // ─── Notifications ─────────────────────────────────────────────────────────
  notifications: [],

  addNotification: (data) => {
    const notif = {
      id: `vn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      createdAt: new Date().toISOString(),
      read: false,
    };
    set(s => ({ notifications: [notif, ...s.notifications] }));
  },

  markNotificationRead: (id) =>
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    })),

  markAllNotificationsRead: () =>
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    })),

  // ─── Business Vendor: Job Requests ─────────────────────────────────────────
  jobRequests: [
    { id: 'jr-001', title: 'Electrical wiring repair', resident: 'A-101', status: 'pending',    date: '2026-05-08', amount: null   },
    { id: 'jr-002', title: 'Plumbing - pipe leak',     resident: 'B-204', status: 'quoted',     date: '2026-05-07', amount: 850    },
    { id: 'jr-003', title: 'AC servicing',             resident: 'C-310', status: 'in_progress',date: '2026-05-06', amount: 1200   },
    { id: 'jr-004', title: 'Door lock replacement',    resident: 'A-205', status: 'completed',  date: '2026-05-05', amount: 650    },
  ],

  submitQuote: (requestId, amount, note) =>
    set(s => ({
      jobRequests: s.jobRequests.map(r =>
        r.id === requestId
          ? { ...r, status: 'quoted', amount, note, quotedAt: new Date().toISOString() }
          : r
      ),
    })),

  updateJobStatus: (requestId, status) =>
    set(s => ({
      jobRequests: s.jobRequests.map(r =>
        r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
      ),
    })),

  getJobsByStatus: (status) => get().jobRequests.filter(r => r.status === status),

  // ─── Marketplace Vendor: Orders ────────────────────────────────────────────
  orders: [
    { id: '#ORD12345', customer: 'Ramesh Kumar',  items: 3, total: 580,  status: 'delivered',        placedAt: '2026-05-08T09:15:00Z' },
    { id: '#ORD12344', customer: 'Anita Sharma',  items: 2, total: 340,  status: 'out_for_delivery', placedAt: '2026-05-08T10:30:00Z' },
    { id: '#ORD12343', customer: 'Vikram Singh',  items: 5, total: 920,  status: 'preparing',        placedAt: '2026-05-08T11:00:00Z' },
    { id: '#ORD12342', customer: 'Priya Mehta',   items: 1, total: 120,  status: 'pending',          placedAt: '2026-05-08T11:20:00Z' },
  ],

  updateOrderStatus: (orderId, status) =>
    set(s => ({
      orders: s.orders.map(o =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      ),
    })),

  getOrdersByStatus: (status) => get().orders.filter(o => o.status === status),

  // ─── Products ──────────────────────────────────────────────────────────────
  products: [
    { id: 'p-001', name: 'Toor Dal 1kg',       price: 145, stock: 2,  category: 'Grocery',  active: true  },
    { id: 'p-002', name: 'Sunflower Oil 1L',   price: 180, stock: 3,  category: 'Grocery',  active: true  },
    { id: 'p-003', name: 'Amul Butter 500g',   price: 275, stock: 10, category: 'Dairy',    active: true  },
    { id: 'p-004', name: 'Whole Wheat Bread',  price: 55,  stock: 8,  category: 'Bakery',   active: true  },
    { id: 'p-005', name: 'Basmati Rice 5kg',   price: 420, stock: 0,  category: 'Grocery',  active: false },
  ],

  addProduct: (product) =>
    set(s => ({
      products: [
        { id: `p-${Date.now()}`, ...product, createdAt: new Date().toISOString(), active: true },
        ...s.products,
      ],
    })),

  updateProduct: (productId, updates) =>
    set(s => ({
      products: s.products.map(p => p.id === productId ? { ...p, ...updates } : p),
    })),

  removeProduct: (productId) =>
    set(s => ({ products: s.products.filter(p => p.id !== productId) })),

  // ─── Earnings ──────────────────────────────────────────────────────────────
  earnings: {
    today:    { amount: 2850, jobs: 3, orders: 12 },
    thisWeek: { amount: 14200, jobs: 18, orders: 67 },
    thisMonth:{ amount: 48500, jobs: 62, orders: 210 },
    pending:  { amount: 3400 },
    total:    { amount: 182000 },
  },

  // ─── Store Config (Marketplace) ────────────────────────────────────────────
  storeConfig: {
    name:           'Fresh Mart',
    category:       'Grocery & Dairy',
    isOpen:         true,
    openTime:       '08:00',
    closeTime:      '21:00',
    deliveryRadius: 5,
    minOrderAmount: 200,
    deliveryCharge: 30,
    freeDeliveryAbove: 500,
  },

  updateStoreConfig: (updates) =>
    set(s => ({ storeConfig: { ...s.storeConfig, ...updates } })),

  toggleStoreOpen: () =>
    set(s => ({ storeConfig: { ...s.storeConfig, isOpen: !s.storeConfig.isOpen } })),

  // ─── AMC / Service Contracts ───────────────────────────────────────────────
  amcContracts: [
    { id: 'amc-001', client: 'Green Valley Society', service: 'Annual Electrical Maintenance', value: 24000, status: 'active',  startDate: '2026-01-01', endDate: '2026-12-31' },
    { id: 'amc-002', client: 'Sunrise Apartments',   service: 'Plumbing AMC',                  value: 18000, status: 'pending', startDate: null,        endDate: null         },
  ],

  addAmcContract: (contract) =>
    set(s => ({
      amcContracts: [
        { id: `amc-${Date.now()}`, ...contract, createdAt: new Date().toISOString() },
        ...s.amcContracts,
      ],
    })),
}));

export default useVendorStore;
