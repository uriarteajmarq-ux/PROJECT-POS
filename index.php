<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>L'Ambiance Café - Artisanal Ordering</title>
    <meta name="description" content="Welcome to L'Ambiance Café. Browse our menu of signature espresso, herbal teas, fresh bakery items, and savory toast, and order directly to your table.">
    <link rel="stylesheet" href="style-customer.css">
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div class="app-container">
        <main>
            <header>
                <div class="brand">
                    <h1>L'Ambiance Café</h1>
                    <p>Artisanal Coffee & Slow-Baked Pastries</p>
                </div>
                <div class="header-actions">
                    <a href="track.php" class="category-btn" style="text-decoration: none; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="compass" style="width: 18px; height: 18px;"></i>
                        Track Order
                    </a>
                </div>
            </header>
            <div class="controls">
                <div class="search-bar">
                    <i data-lucide="search" style="width: 20px; height: 20px;"></i>
                    <input type="text" id="search-input" class="search-input" placeholder="Search our creations...">
                </div>
                <div class="categories" id="categories-container">
                    <button class="category-btn active" data-category="all">All Items</button>
                    <button class="category-btn" data-category="Coffee">Coffee</button>
                    <button class="category-btn" data-category="Tea">Tea</button>
                    <button class="category-btn" data-category="Bakery">Bakery</button>
                    <button class="category-btn" data-category="Savory">Savory</button>
                </div>
            </div>
            <div class="menu-grid" id="menu-grid">
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>Preparing menu...</p>
                </div>
            </div>
        </main>
        <aside class="cart-panel" id="cart-panel">
            <div class="cart-header">
                <h2>
                    <i data-lucide="shopping-bag" style="width: 22px; height: 22px;"></i>
                    Your Cart
                </h2>
                <button class="close-cart-btn" id="close-cart" aria-label="Close Cart">
                    <i data-lucide="x" style="width: 24px; height: 24px;"></i>
                </button>
            </div>
            <div class="cart-items-container" id="cart-items">
                <div class="empty-cart-state">
                    <i data-lucide="shopping-cart"></i>
                    <p>Your basket is empty</p>
                    <span style="font-size: 0.8rem;">Select some artisanal delights to get started.</span>
                </div>
            </div>
            <div class="cart-form-section">
                <div class="form-group-row">
                    <div>
                        <label for="customer-name" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Name</label>
                        <input type="text" id="customer-name" class="cart-input" placeholder="Your name" required>
                    </div>
                    <div>
                        <label for="table-number" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Table</label>
                        <input type="text" id="table-number" class="cart-input" placeholder="T-01" required>
                    </div>
                </div>
                <div>
                    <label for="special-notes" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">Special Notes</label>
                    <textarea id="special-notes" class="cart-input" placeholder="Allergies, extra ice, milk preferences..."></textarea>
                </div>
            </div>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span id="summary-subtotal">$0.00</span>
                </div>
                <div class="summary-row">
                    <span>VAT (12%)</span>
                    <span id="summary-vat">$0.00</span>
                </div>
                <div class="summary-row total-row">
                    <span>Total</span>
                    <span id="summary-total">$0.00</span>
                </div>
                <button id="checkout-btn" class="checkout-btn" disabled>Place Order</button>
            </div>
        </aside>
    </div>
    <button class="mobile-cart-toggle" id="mobile-cart-toggle">
        <i data-lucide="shopping-bag" style="width: 20px; height: 20px;"></i>
        <span>Cart</span>
        <span id="mobile-cart-count" style="background-color: white; color: var(--primary); padding: 2px 8px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-left: 4px;">0</span>
    </button>
    
    <!-- Welcome Modal -->
    <div class="modal-overlay" id="welcome-modal">
        <div class="modal-content welcome-modal-content">
            <div class="welcome-icon-wrap">
                <i data-lucide="coffee" style="width: 48px; height: 48px; color: var(--primary);"></i>
            </div>
            <h2 class="modal-title">Welcome to L'Ambiance Café</h2>
            <p class="modal-text">Discover our artisanal coffee, fresh pastries, and savory delights</p>
            <p class="modal-text" style="font-size: 0.95rem; color: var(--text-muted); margin-top: 8px;">Click anywhere to continue</p>
        </div>
    </div>
    
    <!-- Payment Method Modal -->
    <div class="modal-overlay" id="payment-modal">
        <div class="modal-content payment-modal-content">
            <div class="payment-header">
                <h2 class="modal-title">Select Payment Method</h2>
                <p class="modal-text">Choose how you'd like to pay</p>
            </div>
            <div class="payment-methods">
                <button class="payment-method-btn" onclick="selectPaymentMethod('cash')">
                    <i data-lucide="banknote" style="width: 32px; height: 32px;"></i>
                    <span>Cash</span>
                </button>
                <button class="payment-method-btn" onclick="selectPaymentMethod('card')">
                    <i data-lucide="credit-card" style="width: 32px; height: 32px;"></i>
                    <span>Card</span>
                </button>
                <button class="payment-method-btn" onclick="selectPaymentMethod('qr')">
                    <i data-lucide="qr-code" style="width: 32px; height: 32px;"></i>
                    <span>QR Code</span>
                </button>
            </div>
            <button class="close-modal-btn" onclick="closePaymentModal()" style="width: 100%; margin-top: 16px;">Cancel</button>
        </div>
    </div>
    <!-- QR Code Modal -->
    <div class="modal-overlay" id="qr-modal">
        <div class="modal-content qr-modal-content">
            <h2 class="modal-title">Scan to Pay</h2>
            <div class="qr-code-container">
                <svg id="qr-code" width="200" height="200"></svg>
            </div>
            <p class="modal-text" style="font-size: 0.9rem; margin-top: 20px;">Scan this QR code with your phone to complete payment</p>
            <div style="display: flex; gap: 12px; margin-top: 20px;">
                <button class="close-modal-btn" onclick="closeQRModal()" style="flex: 1;">Back</button>
                <button class="checkout-btn" onclick="confirmQRPayment()" style="flex: 1; background-color: var(--primary);">Payment Done</button>
            </div>
        </div>
    </div>
    <!-- Card Payment Modal -->
    <div class="modal-overlay" id="card-modal">
        <div class="modal-content card-modal-content">
            <h2 class="modal-title">Card Payment</h2>
            <div class="card-reader-container">
                <i data-lucide="credit-card" style="width: 64px; height: 64px; color: var(--primary); margin-bottom: 20px;"></i>
                <p class="modal-text" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 16px;">Please Swipe or Tap Your Card</p>
                <p class="modal-text" style="color: var(--text-muted);">Waiting for card...</p>
                <div class="card-loading-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 20px;">
                <button class="close-modal-btn" onclick="closeCardModal()" style="flex: 1;">Back</button>
                <button class="checkout-btn" onclick="confirmCardPayment()" style="flex: 1; background-color: var(--primary);">Payment Done</button>
            </div>
        </div>
    </div>
    <!-- Thank You Modal -->
    <div class="modal-overlay" id="thank-you-modal">
        <div class="modal-content thank-you-modal-content">
            <div class="success-icon-wrap">
                <i data-lucide="heart" style="width: 48px; height: 48px; color: var(--primary);"></i>
            </div>
            <h2 class="modal-title">Thank You!</h2>
            <p class="modal-text">Your order has been placed successfully</p>
            <p class="modal-text" style="font-size: 0.95rem; color: var(--text-muted); margin-top: 8px;">Tap anywhere to continue</p>
        </div>
    </div>
    <!-- Dine In / Take Out Modal -->
    <div class="modal-overlay" id="dine-modal">
        <div class="modal-content dine-modal-content">
            <div class="dine-header">
                <h2 class="modal-title">Where will you be enjoying this?</h2>
                <p class="modal-text" style="color: var(--text-muted); margin-top: 4px;">Let us know so we can serve you better</p>
            </div>
            <div class="dine-options">
                <button class="dine-option-btn" onclick="selectDineOption('dine-in')">
                    <div class="dine-option-icon">
                        <i data-lucide="utensils" style="width: 36px; height: 36px;"></i>
                    </div>
                    <span class="dine-option-label">Dine In</span>
                    <span class="dine-option-sub">Enjoy at your table</span>
                </button>
                <button class="dine-option-btn" onclick="selectDineOption('take-out')">
                    <div class="dine-option-icon">
                        <i data-lucide="shopping-bag" style="width: 36px; height: 36px;"></i>
                    </div>
                    <span class="dine-option-label">Take Out</span>
                    <span class="dine-option-sub">We'll pack it for you</span>
                </button>
            </div>
        </div>
    </div>
    <!-- Success Modal popup -->
    <div class="modal-overlay" id="success-modal">
        <div class="modal-content">
            <div class="success-icon-wrap">
                <i data-lucide="check-circle-2" style="width: 32px; height: 32px;"></i>
            </div>
            <h2 class="modal-title">Order Received!</h2>
            <p class="modal-text">Your artisanal selection is being prepared with care.</p>
            <div class="order-badge" id="modal-order-id">#1001</div>
            <div class="tracking-link-container">
                <div class="tracking-label">Live Tracker Link</div>
                <div class="tracking-link-row">
                    <span class="tracking-url" id="modal-tracking-url">track.php?id=1001</span>
                    <button class="copy-btn" id="copy-link-btn" title="Copy tracking link">
                        <i data-lucide="copy" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </div>
            <div class="modal-actions">
                <a href="#" id="modal-track-btn" class="track-btn">Track Progress</a>
                <button id="modal-close-btn" class="close-modal-btn">Order Something Else</button>
            </div>
        </div>
    </div>
    <script src="customer.js"></script>
</body>
</html>
