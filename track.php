<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Order - L'Ambiance Café</title>
    <link rel="stylesheet" href="style-customer.css">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div class="tracking-container">
        <div class="card-panel-track">
            
            <?php if (isset($_GET['id'])): ?>
                <!-- Order Detail & Tracking Page -->
                <div id="tracking-view" data-order-id="<?php echo htmlspecialchars($_GET['id']); ?>">
                    <div class="track-header-box">
                        <span style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--primary); letter-spacing: 1px;">Live Tracker</span>
                        <h2 id="track-order-title">Order #<?php echo htmlspecialchars($_GET['id']); ?></h2>
                        <p id="track-customer-info" style="color: var(--text-muted); font-size: 0.95rem; font-weight: 300;">Loading details...</p>
                    </div>
                    <!-- Visual Stepper Progress Bar -->
                    <div class="stepper-container" id="stepper">
                        <div class="stepper-bar-bg"></div>
                        <div class="stepper-bar-fill" id="stepper-fill"></div>
                        
                        <div class="step-node" id="step-pending">
                            <div class="step-circle"><i data-lucide="clock" style="width: 18px; height: 18px;"></i></div>
                            <span class="step-label">Pending</span>
                        </div>
                        <div class="step-node" id="step-preparing">
                            <div class="step-circle"><i data-lucide="cooking-pot" style="width: 18px; height: 18px;"></i></div>
                            <span class="step-label">Preparing</span>
                        </div>
                        <div class="step-node" id="step-ready">
                            <div class="step-circle"><i data-lucide="bell" style="width: 18px; height: 18px;"></i></div>
                            <span class="step-label">Ready</span>
                        </div>
                        <div class="step-node" id="step-served">
                            <div class="step-circle"><i data-lucide="check" style="width: 18px; height: 18px;"></i></div>
                            <span class="step-label">Served</span>
                        </div>
                    </div>
                    <div id="cancelled-view" class="cancelled-banner" style="display: none;">
                        <i data-lucide="alert-triangle" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 6px;"></i>
                        This order has been cancelled. Please ask staff for assistance.
                    </div>
                    <!-- Live Indicator -->
                    <div id="polling-indicator" style="text-align: center; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 24px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: var(--primary); animation: pulse 1.5s infinite;"></span>
                        Live status polling...
                    </div>
                    <!-- Receipt Breakdown -->
                    <div class="tracking-info-grid">
                        <div class="info-item-row">
                            <span class="info-item-label">Table Number</span>
                            <span class="info-item-value" id="track-table-no">-</span>
                        </div>
                        <div class="info-item-row">
                            <span class="info-item-label">Ordered Time</span>
                            <span class="info-item-value" id="track-time">-</span>
                        </div>
                        <div class="info-item-row" id="notes-row" style="flex-direction: column; gap: 4px; margin-top: 4px; display: none;">
                            <span class="info-item-label">Notes</span>
                            <span class="info-item-value" id="track-notes" style="font-weight: normal; font-style: italic; font-size: 0.88rem; background-color: #faf8f5; padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--secondary);"></span>
                        </div>
                    </div>
                    <h4 style="font-family: var(--font-serif); font-size: 1.1rem; margin-bottom: 12px;">Items Ordered</h4>
                    <div id="track-items-list" class="tracking-items-table">
                        <!-- Loaded dynamically -->
                    </div>
                    <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                        <div class="summary-row" style="margin-bottom: 6px; font-size: 0.9rem; color: var(--text-muted);">
                            <span>Subtotal</span>
                            <span id="track-subtotal">$0.00</span>
                        </div>
                        <div class="summary-row" style="margin-bottom: 6px; font-size: 0.9rem; color: var(--text-muted);">
                            <span>VAT (12%)</span>
                            <span id="track-vat">$0.00</span>
                        </div>
                        <div class="summary-row total-row" style="font-size: 1.2rem; font-weight: 700; border-top: 1px dashed var(--border-color); padding-top: 10px;">
                            <span>Total</span>
                            <span id="track-total">$0.00</span>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <!-- Order Lookup Page -->
                <div>
                    <div class="track-header-box">
                        <h2 style="font-family: var(--font-serif); font-size: 2rem;">Track Your Order</h2>
                        <p style="color: var(--text-muted); font-size: 0.95rem; font-weight: 300;">Enter your 4-digit order number from your receipt.</p>
                    </div>
                    <form action="track.php" method="GET" class="lookup-form">
                        <div class="search-bar">
                            <i data-lucide="hash" style="width: 20px; height: 20px;"></i>
                            <input type="number" name="id" class="search-input" placeholder="e.g. 1001" min="1" required>
                        </div>
                        <button type="submit" class="checkout-btn">Find Order</button>
                    </form>
                </div>
            <?php endif; ?>
            <div class="home-link-wrap">
                <a href="index.php" class="home-link">
                    <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                    Back to Coffee Menu
                </a>
            </div>
            
        </div>
    </div>
    <style>
        @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.5; }
        }
    </style>
    <?php if (isset($_GET['id'])): ?>
        <script src="track.js"></script>
    <?php else: ?>
        <script>lucide.createIcons();</script>
    <?php endif; ?>
</body>
</html>