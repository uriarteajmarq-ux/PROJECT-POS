let menuItems = [];
let orders = [];
let activeTab = 'orders';
let ordersFilter = 'all';
// DOM Elements
const tabPanels = document.querySelectorAll('.tab-panel');
const menuBtns = document.querySelectorAll('.sidebar-menu .menu-item');
const tabTitleEl = document.getElementById('tab-title');
const pendingBadgeEl = document.getElementById('pending-badge');
const sidebarTimeEl = document.getElementById('sidebar-time');
// Orders Dashboard Elements
const ordersListGrid = document.getElementById('orders-list-grid');
const ordersFilterBar = document.getElementById('orders-filter-bar');
// Inventory Elements
const inventoryTableRows = document.getElementById('inventory-table-rows');
// Reports Elements
const kpiRevenue = document.getElementById('kpi-revenue');
const kpiOrderCount = document.getElementById('kpi-order-count');
const kpiAvgValue = document.getElementById('kpi-avg-value');
const kpiServedRate = document.getElementById('kpi-served-rate');
const reportsTopSelling = document.getElementById('reports-top-selling');
const reportsStatusBreakdown = document.getElementById('reports-status-breakdown');
// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Clock in sidebar
    updateClock();
    setInterval(updateClock, 1000);
    // Initial Data Fetches
    fetchMenuData();
    fetchOrdersData();
    // Auto refresh orders every 5 seconds (faster for status progression)
    setInterval(() => {
        fetchOrdersData(false); // Silent fetch without full UI flash
    }, 5000);
    setupEventListeners();
});
function updateClock() {
    const now = new Date();
    sidebarTimeEl.innerText = now.toLocaleTimeString();
}
function setupEventListeners() {
    // Tab switching
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            menuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.getAttribute('data-tab');
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `tab-${activeTab}`) {
                    panel.classList.add('active');
                }
            });
            // Update Header Title
            const tabNameMap = {
                'orders': 'Orders Dashboard',
                'inventory': 'Inventory Control',
                'reports': 'Reports & Analytics'
            };
            tabTitleEl.innerText = tabNameMap[activeTab];
            // Refresh tab specific data
            if (activeTab === 'orders') {
                renderOrdersList();
            } else if (activeTab === 'inventory') {
                renderInventoryTable();
            } else if (activeTab === 'reports') {
                renderReports();
            }
        });
    });
    // Orders Status Filtering
    ordersFilterBar.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            document.querySelectorAll('#orders-filter-bar .category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            ordersFilter = e.target.getAttribute('data-filter');
            renderOrdersList();
        }
    });
}
// Data Fetch Helpers
function fetchMenuData(callback) {
    fetch('api/index.php?action=get_menu')
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                menuItems = res.data;
                if (activeTab === 'inventory') renderInventoryTable();
                if (callback) callback();
            }
        })
        .catch(err => console.error('Error fetching menu:', err));
}
function fetchOrdersData(updateUI = true) {
    fetch('api/index.php?action=get_orders')
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                orders = res.data;
                syncAutomaticStatus();
                updatePendingBadge();
                if (updateUI) {
                    if (activeTab === 'orders') renderOrdersList();
                    if (activeTab === 'reports') renderReports();
                }
            }
        })
        .catch(err => console.error('Error fetching orders:', err));
}
function updatePendingBadge() {
    const pendingOrders = orders.filter(o => o.status === 'Pending');
    if (pendingOrders.length > 0) {
        pendingBadgeEl.innerText = pendingOrders.length;
        pendingBadgeEl.style.display = 'inline-block';
    } else {
        pendingBadgeEl.style.display = 'none';
    }
}
// Relative time helper
function getRelativeTime(dateTimeStr) {
    const orderTime = new Date(dateTimeStr.replace(/-/g, '/'));
    const now = new Date();
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
// ==========================================
// TAB 1: ORDERS DASHBOARD
// ==========================================
function renderOrdersList() {
    // Filter orders
    const filtered = orders.filter(o => 
        ordersFilter === 'all' || o.status === ordersFilter
    );
    // Sort: Pending/Preparing/Ready first (Chronologically: older orders first)
    const statusOrder = { 'Pending': 1, 'Preparing': 2, 'Ready': 3, 'Served': 4, 'Cancelled': 5 };
    filtered.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(a.created_at) - new Date(b.created_at);
    });
    if (filtered.length === 0) {
        ordersListGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted); background-color: var(--panel-bg); border-radius: 12px; border: 1px dashed var(--border-color);">
                <i data-lucide="inbox" style="width: 48px; height: 48px; margin: 0 auto 12px auto; color: var(--border-color);"></i>
                <p>No orders found under "${ordersFilter}".</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    ordersListGrid.innerHTML = filtered.map(order => {
        const notesHtml = order.notes && order.notes.trim() !== '' 
            ? `<div class="order-card-notes">${order.notes}</div>` 
            : '';
        const statusBadgeMap = {
            'Pending': '<span class="status-badge status-pending">Pending</span>',
            'Preparing': '<span class="status-badge status-preparing">Preparing</span>',
            'Ready': '<span class="status-badge status-ready">Ready</span>',
            'Served': '<span class="status-badge status-served">Served</span>',
            'Cancelled': '<span class="status-badge status-cancelled">Cancelled</span>'
        };
        const actionBtn = order.status === 'Ready' 
            ? `<button class="served-btn" onclick="markAsServed(${order.id})">Mark Served</button>`
            : '';
        return `
            <div class="order-card status-${order.status}" data-id="${order.id}">
                <div class="order-card-header">
                    <div>
                        <div class="order-card-id">#${order.id}</div>
                        <div class="order-card-time">${getRelativeTime(order.created_at)}</div>
                    </div>
                    <span class="order-card-meta">${order.customer_name} (T-${order.table_number})</span>
                </div>
                
                <div class="order-card-items">
                    ${order.items.map(item => `
                        <div class="order-card-item-row">
                            <span>${item.name} <span style="color: var(--text-muted);">x${item.quantity}</span></span>
                            <span style="font-family: var(--font-mono);">$${parseFloat(item.subtotal).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                ${notesHtml}
                <div class="order-card-footer">
                    <span class="order-card-total">$${parseFloat(order.total).toFixed(2)}</span>
                    ${statusBadgeMap[order.status]}
                </div>
                ${actionBtn}
            </div>
        `;
    }).join('');
    lucide.createIcons();
}
// Mark order as served manually
window.markAsServed = function(orderId) {
    fetch('api/index.php?action=update_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: 'Served' })
    })
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            const orderIdx = orders.findIndex(o => o.id === orderId);
            if (orderIdx > -1) {
                orders[orderIdx].status = 'Served';
                renderOrdersList();
                updatePendingBadge();
            }
        } else {
            alert(`Failed to mark as served: ${res.message}`);
        }
    })
    .catch(err => {
        console.error(err);
        alert('An error occurred marking order as served.');
    });
};
// Automatic status progression: Pending -> Preparing (after 2 mins) -> Ready (after 8 mins total) -> Served
function getAutomaticStatus(order) {
    if (order.status === 'Cancelled') return 'Cancelled';
    
    const createdTime = new Date(order.created_at.replace(/-/g, '/'));
    const now = new Date();
    const diffMins = (now - createdTime) / 60000;
    
    // 0-2 mins: Pending
    if (diffMins < 2) return 'Pending';
    // 2-8 mins: Preparing
    if (diffMins < 8) return 'Preparing';
    // 8+ mins: Ready
    return 'Ready';
}
// Update order status automatically when order progresses through stages
function syncAutomaticStatus() {
    let statusChanged = false;
    orders.forEach(order => {
        const newStatus = getAutomaticStatus(order);
        if (newStatus !== order.status) {
            order.status = newStatus;
            statusChanged = true;
            // Sync to backend (silent)
            fetch('api/index.php?action=update_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order.id, status: newStatus })
            }).catch(err => console.error('[v0] Status sync error:', err));
        }
    });
    if (statusChanged && activeTab === 'orders') {
        renderOrdersList();
    }
}
// ==========================================
// TAB 2: INVENTORY CONTROL
// ==========================================
function renderInventoryTable() {
    inventoryTableRows.innerHTML = menuItems.map(item => {
        return `
            <tr id="inventory-row-${item.id}">
                <td><span style="font-family: var(--font-mono); font-weight: bold; color: var(--text-muted);">#${item.id}</span></td>
                <td><strong style="color: var(--text-light);">${item.name}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${item.category}</span></td>
                <td><span style="background-color: rgba(255, 255, 255, 0.05); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${item.category}</span></td>
                <td style="text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                        <span style="color: var(--text-muted); font-size: 0.88rem;">$</span>
                        <input type="number" step="0.01" class="inventory-input" id="inv-price-${item.id}" value="${parseFloat(item.price).toFixed(2)}" oninput="enableInventorySave(${item.id})">
                    </div>
                </td>
                <td style="text-align: right;">
                    <input type="number" class="inventory-input" id="inv-stock-${item.id}" value="${item.stock}" oninput="enableInventorySave(${item.id})">
                </td>
                <td style="text-align: center;">
                    <button class="save-row-btn" id="inv-save-${item.id}" onclick="saveInventoryRow(${item.id})" disabled>
                        <i data-lucide="save" style="width: 14px; height: 14px;"></i>
                        Save
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    lucide.createIcons();
}
window.enableInventorySave = function(itemId) {
    const btn = document.getElementById(`inv-save-${itemId}`);
    if (btn) btn.disabled = false;
};
window.saveInventoryRow = function(itemId) {
    const priceInput = document.getElementById(`inv-price-${itemId}`);
    const stockInput = document.getElementById(`inv-stock-${itemId}`);
    const btn = document.getElementById(`inv-save-${itemId}`);
    if (!priceInput || !stockInput || !btn) return;
    const price = parseFloat(priceInput.value);
    const stock = parseInt(stockInput.value);
    if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
        alert('Please enter valid positive numbers for price and stock.');
        return;
    }
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" class="spin" style="width: 14px; height: 14px;"></i> Saving...';
    lucide.createIcons();
    // Call update stock API
    const stockPromise = fetch('api/index.php?action=update_stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, stock: stock })
    }).then(res => res.json());
    // Call update price API
    const pricePromise = fetch('api/index.php?action=update_price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, price: price })
    }).then(res => res.json());
    Promise.all([stockPromise, pricePromise])
        .then(([stockRes, priceRes]) => {
            if (stockRes.success && priceRes.success) {
                // Update local model
                const menuIdx = menuItems.findIndex(i => i.id === itemId);
                if (menuIdx > -1) {
                    menuItems[menuIdx].stock = stock;
                    menuItems[menuIdx].price = price;
                }
                
                // Visual feedback of success
                btn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px; color: #10b981;"></i> Saved';
                btn.style.backgroundColor = '#065f46';
                lucide.createIcons();
                
                setTimeout(() => {
                    btn.innerHTML = '<i data-lucide="save" style="width: 14px; height: 14px;"></i> Save';
                    btn.style.backgroundColor = '';
                    btn.disabled = true;
                    lucide.createIcons();
                }, 2000);
            } else {
                alert(`Error saving row: ${stockRes.message || priceRes.message}`);
                btn.innerHTML = '<i data-lucide="save" style="width: 14px; height: 14px;"></i> Save';
                btn.disabled = false;
                lucide.createIcons();
            }
        })
        .catch(err => {
            console.error(err);
            alert('An error occurred during save operations.');
            btn.innerHTML = '<i data-lucide="save" style="width: 14px; height: 14px;"></i> Save';
            btn.disabled = false;
            lucide.createIcons();
        });
};
// ==========================================
// TAB 3: REPORTS & ANALYTICS
// ==========================================
function renderReports() {
    const activeOrders = orders.filter(o => o.status !== 'Cancelled');
    const servedOrders = activeOrders.filter(o => o.status === 'Served');
    // KPI 1: Revenue
    const revenue = activeOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    kpiRevenue.innerText = `$${revenue.toFixed(2)}`;
    // KPI 2: Order Count
    kpiOrderCount.innerText = activeOrders.length;
    // KPI 3: Avg Order Value
    const avg = activeOrders.length > 0 ? revenue / activeOrders.length : 0;
    kpiAvgValue.innerText = `$${avg.toFixed(2)}`;
    // KPI 4: Served Rate
    const rate = activeOrders.length > 0 ? Math.round((servedOrders.length / activeOrders.length) * 100) : 0;
    kpiServedRate.innerText = `${rate}%`;
    // 1. Top Selling Creations CSS horizontal Bar Chart
    const salesVolume = {}; // Map of item_id -> quantity
    const itemNames = {};
    // Prep maps
    menuItems.forEach(item => {
        salesVolume[item.id] = 0;
        itemNames[item.id] = item.name;
    });
    // Count sales from non-cancelled orders
    activeOrders.forEach(o => {
        o.items.forEach(item => {
            if (salesVolume[item.id] !== undefined) {
                salesVolume[item.id] += parseInt(item.quantity);
            } else {
                salesVolume[item.id] = parseInt(item.quantity);
                itemNames[item.id] = item.name;
            }
        });
    });
    // Sort by volume
    const sortedSales = Object.entries(salesVolume)
        .map(([id, qty]) => ({ id: parseInt(id), name: itemNames[id] || `Item #${id}`, quantity: qty }))
        .sort((a, b) => b.quantity - a.quantity);
    const maxSales = sortedSales.length > 0 ? sortedSales[0].quantity : 0;
    if (maxSales === 0) {
        reportsTopSelling.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px 0;">
                <i data-lucide="bar-chart" style="width: 32px; height: 32px; margin: 0 auto 10px auto; color: var(--border-color);"></i>
                No sales recorded yet.
            </div>
        `;
    } else {
        reportsTopSelling.innerHTML = sortedSales.slice(0, 5).map(item => {
            const pct = maxSales > 0 ? (item.quantity / maxSales) * 100 : 0;
            return `
                <div class="bar-row">
                    <div class="bar-info">
                        <span class="bar-name">${item.name}</span>
                        <span class="bar-value">${item.quantity} sold</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: 0%;" data-width="${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
        // Trigger custom CSS bar animation trigger in microtask
        setTimeout(() => {
            document.querySelectorAll('.bar-fill').forEach(fill => {
                fill.style.width = fill.getAttribute('data-width');
            });
        }, 100);
    }
    // 2. Order Status Breakdown
    const statusCounts = { 'Pending': 0, 'Preparing': 0, 'Ready': 0, 'Served': 0, 'Cancelled': 0 };
    orders.forEach(o => {
        if (statusCounts[o.status] !== undefined) {
            statusCounts[o.status]++;
        }
    });
    const statusDotColors = {
        'Pending': 'var(--pending)',
        'Preparing': 'var(--preparing)',
        'Ready': 'var(--ready)',
        'Served': 'var(--served)',
        'Cancelled': 'var(--cancelled)'
    };
    reportsStatusBreakdown.innerHTML = Object.entries(statusCounts).map(([status, count]) => {
        const dotColor = statusDotColors[status];
        return `
            <div class="status-dist-item">
                <span class="status-dist-name">
                    <span class="status-indicator-dot" style="background-color: ${dotColor};"></span>
                    ${status}
                </span>
                <span class="status-dist-count">${count}</span>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}
