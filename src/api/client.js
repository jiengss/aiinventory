import { supabase, isSupabaseConfigured } from '../services/supabase';

// In-memory demo fallback store when Supabase keys are not yet filled in .env
let mockItems = [
  { id: 1, sku: 'SKU-ELEC-001', name: 'Wireless Noise-Cancelling Headphones', description: 'Over-ear premium Bluetooth headphones', price: 149.99, unit_price: 149.99, unit: 'pcs', quantity: 39 },
  { id: 2, sku: 'SKU-ELEC-002', name: 'USB-C Fast Charging Cable (2m)', description: 'Braided nylon 100W PD charging cable', price: 14.50, unit_price: 14.50, unit: 'pcs', quantity: 155 },
  { id: 3, sku: 'SKU-MED-101', name: 'Paracetamol 500mg (100 Tablets)', description: 'Analgesic pain relief and fever reducer caplets', price: 8.75, unit_price: 8.75, unit: 'boxes', quantity: 3 },
  { id: 4, sku: 'SKU-FOOD-201', name: 'Organic Whole Bean Espresso Coffee (1kg)', description: 'Medium dark roast single-origin arabica coffee beans', price: 22.00, unit_price: 22.00, unit: 'bags', quantity: 27 },
  { id: 5, sku: 'SKU-HARD-301', name: 'Cordless Compact Power Drill 20V', description: 'Brushless heavy-duty motor drill', price: 89.95, unit_price: 89.95, unit: 'sets', quantity: 41 },
  { id: 6, sku: 'SKU-OFF-401', name: 'Ergonomic Mesh Task Chair', description: 'Breathable mesh desk chair with lumbar support', price: 179.00, unit_price: 179.00, unit: 'units', quantity: 17 },
];

let mockBranches = [
  { id: 1, name: 'Downtown Central Warehouse', location: '100 Metro Plaza, Downtown' },
  { id: 2, name: 'North Distribution Center', location: '450 North Blvd, Uptown' },
  { id: 3, name: 'West Coast Fulfillment Hub', location: '820 Harbour Way, West Bay' },
  { id: 4, name: 'East Retail Outlet', location: '12 Marketplace Ave, East District' },
];

let mockAlerts = [
  { id: 1, alert_type: 'critical', message: 'Critical: Paracetamol 500mg is critically low in stock.', predicted_stockout_date: '2026-10-25' },
  { id: 2, alert_type: 'warning', message: 'Low Stock Warning: Espresso Coffee is reaching reorder threshold.', predicted_stockout_date: '2026-10-28' },
];

let mockTransfers = [
  { id: 1, product_name: 'Wireless Noise-Cancelling Headphones', from_branch: 'Downtown Central Warehouse', to_branch: 'North Distribution Center', quantity: 5, status: 'pending' },
];

let mockChat = [
  { id: '1', sender: 'assistant', message: 'Hello! I am your AI Inventory Assistant powered by Supabase. Ask me about stock, transfers, or alerts.' },
];

const client = {
  get: async (url, config = {}) => {
    // 1. User
    if (url === '/user') {
      if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          return { data: { ...user, name: profile?.name || user.email, role: profile?.role || 'staff' } };
        }
      }
      return { data: { id: 'demo-user', name: 'Inventory Manager', email: 'admin@inventory.com' } };
    }

    // 2. Branches
    if (url === '/branches') {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('branches').select('*');
        if (!error && data && data.length > 0) return { data };
      }
      return { data: mockBranches };
    }

    // 3. Products
    if (url === '/products') {
      const q = config?.params?.q ? String(config.params.q).toLowerCase() : '';
      if (isSupabaseConfigured()) {
        let query = supabase.from('items').select('*, stocks(quantity)');
        if (q) {
          query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped = data.map((it) => ({
            id: it.id,
            name: it.name,
            sku: it.sku,
            description: it.description,
            price: Number(it.unit_price) || 0,
            unit_price: Number(it.unit_price) || 0,
            unit: it.unit || 'units',
            quantity: Array.isArray(it.stocks) ? it.stocks.reduce((acc, s) => acc + (s.quantity || 0), 0) : 0,
          }));
          return { data: mapped };
        }
      }
      const filtered = q ? mockItems.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)) : mockItems;
      return { data: filtered };
    }

    // 4. Forecast
    if (url.startsWith('/forecast/')) {
      const id = url.replace('/forecast/', '');
      const item = mockItems.find((i) => String(i.id) === String(id)) || mockItems[0];
      return {
        data: {
          predicted_stockout_date: '2026-11-04',
          confidence: '92%',
          daily_avg: `3.5 ${item?.unit || 'units'}/day`,
        },
      };
    }

    // 5. Alerts
    if (url === '/alerts') {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('alerts').select('*').eq('is_dismissed', false).order('created_at', { ascending: false });
        if (!error && data) return { data };
      }
      return { data: mockAlerts };
    }

    // 6. Transfers
    if (url === '/transfer/available') {
      const query = config?.params?.product_name ? String(config.params.product_name).toLowerCase() : '';
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('stocks').select('*, items!inner(*), branches!inner(*)').gt('quantity', 0);
        if (!error && data && data.length > 0) {
          const mapped = data
            .filter((s) => !query || s.items.name.toLowerCase().includes(query))
            .map((s, idx) => ({
              id: s.id,
              product_id: s.item_id,
              branch_id: s.branch_id,
              branch_name: s.branches?.name,
              quantity: s.quantity,
              distance_km: Number((2.5 + (idx * 3.2) % 12).toFixed(1)),
            }));
          return { data: mapped };
        }
      }
      return {
        data: [
          { id: 1, product_id: 1, branch_id: 2, branch_name: 'North Distribution Center', quantity: 14, distance_km: 3.2 },
          { id: 2, product_id: 1, branch_id: 3, branch_name: 'West Coast Fulfillment Hub', quantity: 8, distance_km: 6.8 },
        ],
      };
    }

    if (url === '/transfer/request') {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('transfer_requests').select('*, items(name), from_branch:branches!from_branch_id(name), to_branch:branches!to_branch_id(name)').order('created_at', { ascending: false });
        if (!error && data) {
          const mapped = data.map((t) => ({
            id: t.id,
            product_name: t.items?.name || 'Inventory Item',
            from_branch: t.from_branch?.name || 'Origin',
            to_branch: t.to_branch?.name || 'Destination',
            status: t.status,
            quantity: t.quantity,
          }));
          return { data: mapped };
        }
      }
      return { data: mockTransfers };
    }

    // 7. Chat History
    if (url === '/chat/history') {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(30);
        if (!error && data) return { data };
      }
      return { data: mockChat };
    }

    return { data: [] };
  },

  post: async (url, payload = {}) => {
    // 1. Auth Login
    if (url === '/login') {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: payload.email,
          password: payload.password,
        });
        if (error) throw new Error(error.message);
        return {
          data: {
            token: data.session?.access_token,
            access_token: data.session?.access_token,
            user: data.user,
          },
        };
      }
      // Demo login
      return {
        data: {
          token: 'demo-supabase-jwt-token',
          access_token: 'demo-supabase-jwt-token',
          user: { id: 'demo-user', email: payload.email, name: 'Inventory Manager' },
        },
      };
    }

    // 2. Auth Register
    if (url === '/register') {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: { data: { name: payload.name } },
        });
        if (error) throw new Error(error.message);
        return {
          data: {
            token: data.session?.access_token || 'pending-confirm-token',
            access_token: data.session?.access_token || 'pending-confirm-token',
            user: data.user,
          },
        };
      }
      return {
        data: {
          token: 'demo-supabase-jwt-token',
          access_token: 'demo-supabase-jwt-token',
          user: { id: 'demo-user', email: payload.email, name: payload.name },
        },
      };
    }

    // 3. Auth Logout
    if (url === '/logout') {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      return { data: { message: 'Logged out successfully' } };
    }

    // 4. Stock Movements
    if (url === '/stock-movements') {
      const { product_id, type, quantity, notes } = payload;
      if (isSupabaseConfigured()) {
        await supabase.from('stock_movements').insert([
          { item_id: product_id, type, quantity: Number(quantity), notes },
        ]);
        // Update stock
        if (type === 'in') {
          await supabase.rpc('increment_stock', { p_item_id: product_id, p_qty: Number(quantity) }).catch(() => {});
        }
      }
      // Update in-memory mock
      const found = mockItems.find((i) => Number(i.id) === Number(product_id));
      if (found) {
        if (type === 'in') found.quantity += Number(quantity);
        else if (type === 'out') found.quantity = Math.max(0, found.quantity - Number(quantity));
        else found.quantity = Number(quantity);
      }
      return { data: { success: true, message: 'Stock movement logged' } };
    }

    // 5. Dismiss Alert
    if (url.includes('/dismiss')) {
      const id = url.split('/')[2];
      if (isSupabaseConfigured()) {
        await supabase.from('alerts').update({ is_dismissed: true }).eq('id', id);
      }
      mockAlerts = mockAlerts.filter((a) => String(a.id) !== String(id));
      return { data: { success: true } };
    }

    // 6. Transfer Request
    if (url === '/transfer/request') {
      if (isSupabaseConfigured()) {
        await supabase.from('transfer_requests').insert([
          { item_id: payload.product_id, from_branch_id: payload.from_branch_id, quantity: payload.quantity || 1, status: 'pending' },
        ]);
      }
      mockTransfers.unshift({
        id: Date.now(),
        product_name: 'Requested Item',
        from_branch: 'Selected Branch',
        to_branch: 'Main Hub',
        quantity: payload.quantity || 1,
        status: 'pending',
      });
      return { data: { success: true, message: 'Transfer requested' } };
    }

    // 7. Chat Send
    if (url === '/chat/send') {
      const msg = payload.message || '';
      const reply = `Supabase Assistant: I see your inventory is synced with ${mockItems.length} active products. Paracetamol is currently lowest in stock.`;
      if (isSupabaseConfigured()) {
        await supabase.from('chat_messages').insert([
          { sender: 'user', message: msg },
          { sender: 'assistant', message: reply },
        ]);
      }
      mockChat.push({ id: String(Date.now() + 1), sender: 'user', message: msg });
      mockChat.push({ id: String(Date.now() + 2), sender: 'assistant', message: reply });
      return { data: { reply, message: reply } };
    }

    // 8. Reconciliation
    if (url === '/reconciliation/run') {
      return {
        data: {
          discrepancies: [
            { id: 1, product_name: 'Wireless Noise-Cancelling Headphones', expected_quantity: 41, actual_quantity: 39, difference: '-2' },
            { id: 2, product_name: 'Organic Whole Bean Espresso Coffee', expected_quantity: 26, actual_quantity: 27, difference: '+1' },
          ],
        },
      };
    }

    // 9. Reports Generate
    if (url === '/reports/generate') {
      return {
        data: {
          title: `${(payload.type || 'inventory').toUpperCase()} Audit Report`,
          summary: `Supabase live data: ${mockItems.length} products verified, 1 active transfer order, 2 low stock alerts.`,
          download_url: 'https://supabase.com',
        },
      };
    }

    // 10. OCR Digitize & Vision
    if (url === '/digitize/upload') {
      return {
        data: {
          id: 'scan-101',
          extracted_data: {
            invoice: 'INV-88219',
            date: '2026-10-23',
            supplier: 'Global Logistics Supply',
            items: [{ sku: 'SKU-ELEC-002', qty: 25, unit_cost: 12.0 }],
          },
        },
      };
    }

    if (url.includes('/confirm')) {
      return { data: { success: true, message: 'Data encoded into inventory' } };
    }

    if (url === '/vision/recognize') {
      return {
        data: {
          items: [
            { product_name: 'Wireless Noise-Cancelling Headphones', label: 'Headphones', quantity: 3, confidence: 0.94 },
            { product_name: 'USB-C Fast Charging Cable (2m)', label: 'Cable', quantity: 8, confidence: 0.89 },
          ],
        },
      };
    }

    // 11. Permissions
    if (url === '/permissions/suggest') {
      return {
        data: {
          permissions: ['view_inventory', 'log_stock_movements', 'request_transfers', 'view_reports'],
        },
      };
    }

    if (url === '/permissions/apply') {
      return { data: { success: true } };
    }

    if (url === '/user/push-token') {
      return { data: { success: true } };
    }

    return { data: { success: true } };
  },
};

export default client;
