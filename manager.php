<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard - L'Ambiance Café</title>
    <link rel="stylesheet" href="style-manager.css">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div class="dashboard-container">
        
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <h2>
                    <i data-lucide="terminal" style="width: 24px; height: 24px;"></i>
                    Staff Portal
                </h2>
                <p>L'Ambiance Control</p>
            </div>
            <nav class="sidebar-menu">
                <button class="menu-item active" data-tab="orders" id="menu-item-orders">
                    <span class="menu-item-left">
                        <i data-lucide="clipboard-list" style="width: 18px; height: 18px;"></i>
                        Orders
                    </span>
                    <span class="sidebar-badge" id="pending-badge" style="display: none;">0</span>
                </button>
                <button class="menu-item" data-tab="inventory">
                    <span class="menu-item-left">
                        <i data-lucide="package" style="width: 18px; height: 18px;"></i>
                        Inventory
                    </span>
                </button>
                <button class="menu-item" data-tab="reports">
                    <span class="menu-item-left">
                        <i data-lucide="bar-chart-3" style="width: 18px; height: 18px;"></i>
                        Reports
                    </span>
                </button>
            </nav>
            <div style="border-top: 1px solid var(--border-color); padding-top: 16px; font-size: 0.8rem; color: var(--text-muted);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #10b981;"></span>
                    <span>System Connected</span>
                </div>
                <div id="sidebar-time" style="margin-top: 8px; font-family: var(--font-mono);">00:00:00</div>
            </div>
        </aside>
        <!-- Main Workspace -->
        <main class="main-content">
            
            <header class="content-header">
                <h1 id="tab-title">Orders Dashboard</h1>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <a href="index.php" target="_blank" style="text-decoration: none; font-size: 0.88rem; color: var(--accent); font-weight: 500; display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
                        Customer View
                    </a>
                </div>
            </header>
            <!-- TAB 1: ORDERS LIST -->
            <section class="tab-panel active" id="tab-orders">
                <div class="orders-filter-container">
                    <div class="categories" id="orders-filter-bar">
                        <button class="category-btn active" data-filter="all">All Orders</button>
                        <button class="category-btn" data-filter="Pending">Pending</button>
                        <button class="category-btn" data-filter="Preparing">Preparing</button>
                        <button class="category-btn" data-filter="Ready">Ready</button>
                        <button class="category-btn" data-filter="Served">Served</button>
                        <button class="category-btn" data-filter="Cancelled">Cancelled</button>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--accent); animation: pulse 1.5s infinite;"></span>
                        Auto-refreshing (10s)...
                    </div>
                </div>
                <div class="orders-grid" id="orders-list-grid">
                    <!-- Dynamic orders card grid loaded by manager.js -->
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                        Loading orders...
                    </div>
                </div>
            </section>
            <!-- TAB 2: INVENTORY inline editing -->
            <section class="tab-panel" id="tab-inventory">
                <div class="table-responsive">
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th style="width: 80px;">ID</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th style="text-align: right; width: 140px;">Price ($)</th>
                                <th style="text-align: right; width: 140px;">Stock Count</th>
                                <th style="text-align: center; width: 120px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-table-rows">
                            <!-- Dynamic rows loaded by manager.js -->
                            <tr>
                                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
                                    Loading inventory data...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <!-- TAB 3: REPORTS & ANALYTICS -->
            <section class="tab-panel" id="tab-reports">
                <!-- KPIs Grid -->
                <div class="reports-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon"><i data-lucide="dollar-sign"></i></div>
                        <div class="kpi-info">
                            <h3>Total Revenue</h3>
                            <div class="kpi-value" id="kpi-revenue">$0.00</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon"><i data-lucide="shopping-cart"></i></div>
                        <div class="kpi-info">
                            <h3>Total Orders</h3>
                            <div class="kpi-value" id="kpi-order-count">0</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon"><i data-lucide="trending-up"></i></div>
                        <div class="kpi-info">
                            <h3>Avg Order Value</h3>
                            <div class="kpi-value" id="kpi-avg-value">$0.00</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon"><i data-lucide="check-square"></i></div>
                        <div class="kpi-info">
                            <h3>Served Rate</h3>
                            <div class="kpi-value" id="kpi-served-rate">0%</div>
                        </div>
                    </div>
                </div>
                <!-- Graphs & Distribution breakdown -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <h3 class="chart-title">Top-Selling Creations (Sales Vol)</h3>
                        <div class="bar-chart-container" id="reports-top-selling">
                            <!-- Custom Horizontal Bar elements built dynamically -->
                            <div style="text-align: center; color: var(--text-muted); padding: 40px 0;">No sales recorded yet.</div>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3 class="chart-title">Order Status Breakdown</h3>
                        <div class="status-dist-container" id="reports-status-breakdown">
                            <!-- Status rows loaded dynamically -->
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
    <!-- Manager Script -->
    <script src="manager.js"></script>
</body>
</html>
