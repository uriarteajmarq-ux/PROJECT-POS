let menuItems = [];
let cart = [];
let selectedCategory = 'all';
let searchQuery = '';
// DOM Elements
const menuGrid = document.getElementById('menu-grid');
const searchInput = document.getElementById('search-input');
const categoriesContainer = document.getElementById('categories-container');
const cartItemsContainer = document.getElementById('cart-items');
const cartPanel = document.getElementById('cart-panel');
const mobileCartToggle = document.getElementById('mobile-cart-toggle');
const mobileCartCount = document.getElementById('mobile-cart-count');
const closeCartBtn = document.getElementById('close-cart');
const customerNameInput = document.getElementById('customer-name');
const tableNumberInput = document.getElementById('table-number');
const specialNotesInput = document.getElementById('special-notes');
const summarySubtotal = document.getElementById('summary-subtotal');
const summaryVat = document.getElementById('summary-vat');
const summaryTotal = document.getElementById('summary-total');
const checkoutBtn = document.getElementById('checkout-btn');
// Modal Elements
const successModal = document.getElementById('success-modal');
const modalOrderId = document.getElementById('modal-order-id');
const modalTrackingUrl = document.getElementById('modal-tracking-url');
const copyLinkBtn = document.getElementById('copy-link-btn');
const modalTrackBtn = document.getElementById('modal-track-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
// Payment & Thank You Modals
const paymentModal = document.getElementById('payment-modal');
const thankYouModal = document.getElementById('thank-you-modal');
let currentOrderData = null;
// Category icons & gradients mapping
const categoryDesign = {
    'Coffee': {
        icon: 'coffee',
        gradient: 'linear-gradient(135deg, #8b5a2b, #4a2c11)'
    },
    'Tea': {
        icon: 'leaf',
        gradient: 'linear-gradient(135deg, #8eb897, #3b6043)'
    },
    'Bakery': {
        icon: 'cake',
        gradient: 'linear-gradient(135deg, #f3c192, #9a6538)'
    },
    'Savory': {
        icon: 'utensils',
        gradient: 'linear-gradient(135deg, #e48d75, #933f2a)'
    }
};
// Initialize
window.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    setupEventListeners();
    showWelcomeModal();
});
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderMenu();
    });
    // Category pills
    categoriesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            // Update active state
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            selectedCategory = e.target.getAttribute('data-category');
            renderMenu();
        }
    });
    // Mobile cart drawer toggle
    mobileCartToggle.addEventListener('click', () => {
        cartPanel.classList.add('active');
    });
    closeCartBtn.addEventListener('click', () => {
        cartPanel.classList.remove('active');
    });
    // Inputs for validation check
    customerNameInput.addEventListener('input', validateForm);
    tableNumberInput.addEventListener('input', validateForm);
    // Checkout Action
    checkoutBtn.addEventListener('click', placeOrder);
    // Welcome modal close (click anywhere) → show dine-in/take-out choice
    const welcomeModal = document.getElementById('welcome-modal');
    welcomeModal.addEventListener('click', () => {
        welcomeModal.classList.remove('active');
        document.getElementById('dine-modal').classList.add('active');
        lucide.createIcons();
    });
    // Modal close
    modalCloseBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
    });
    // Thank you modal close (tap to continue) → show dine-in/take-out choice
    thankYouModal.addEventListener('click', () => {
        thankYouModal.classList.remove('active');
        document.getElementById('dine-modal').classList.add('active');
        lucide.createIcons();
    });
    // Copy tracking link
    copyLinkBtn.addEventListener('click', () => {
        const text = modalTrackingUrl.innerText;
        // Build absolute URL for sharing
        const fullUrl = window.location.origin + window.location.pathname.replace('index.php', '') + text;
        
        navigator.clipboard.writeText(fullUrl).then(() => {
            copyLinkBtn.innerHTML = '<i data-lucide="check" style="width: 16px; height: 16px; color: #10b981;"></i>';
            lucide.createIcons();
            setTimeout(() => {
                copyLinkBtn.innerHTML = '<i data-lucide="copy" style="width: 16px; height: 16px;"></i>';
                lucide.createIcons();
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
}
function fetchMenu() {
    fetch('api/index.php?action=get_menu')
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                menuItems = res.data;
                renderMenu();
            } else {
                console.error('Failed to fetch menu:', res.message);
            }
        })
        .catch(err => console.error('Error fetching menu:', err));
}
function renderMenu() {
    // Filter items
    const filtered = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery) || 
                              item.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });
    if (filtered.length === 0) {
        menuGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">
                <i data-lucide="info" style="width: 48px; height: 48px; margin: 0 auto 12px auto; stroke-width: 1.5; color: var(--secondary);"></i>
                <p style="font-weight: 500;">No items found matching your filters.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    menuGrid.innerHTML = filtered.map(item => {
        const design = categoryDesign[item.category] || { icon: 'coffee', gradient: 'linear-gradient(135deg, #a1785c, #593e2a)' };
        
        // Stock status
        let stockClass = 'stock-ok';
        let stockText = 'In Stock';
        let isOutOfStock = false;
        
        if (item.stock === 0) {
            stockClass = 'stock-out';
            stockText = 'Out of Stock';
            isOutOfStock = true;
        } else if (item.stock <= 5) {
            stockClass = 'stock-low';
            stockText = `Only ${item.stock} left`;
        }
        return `
            <div class="menu-card" data-id="${item.id}">
                <div class="menu-card-visual" style="background: ${design.gradient};">
                    <span class="menu-card-category-badge">${item.category}</span>
                    <span class="menu-card-stock-badge ${stockClass}">${stockText}</span>
                    <div class="menu-card-icon-container">
                        <i data-lucide="${design.icon}" style="width: 32px; height: 32px;"></i>
                    </div>
                </div>
                <div class="menu-card-body">
                    <h3 class="menu-card-title">${item.name}</h3>
                    <p class="menu-card-desc">${item.description}</p>
                    <div class="menu-card-footer">
                        <span class="menu-card-price">$${parseFloat(item.price).toFixed(2)}</span>
                        <button class="add-to-cart-btn" onclick="addToCart(${item.id})" ${isOutOfStock ? 'disabled' : ''} aria-label="Add to Cart">
                            <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    // Check if item is already in cart
    const cartItemIndex = cart.findIndex(c => c.id === itemId);
    if (cartItemIndex > -1) {
        // Check stock limit
        if (cart[cartItemIndex].quantity < item.stock) {
            cart[cartItemIndex].quantity++;
        } else {
            alert(`Sorry, only ${item.stock} items of ${item.name} are available in stock.`);
            return;
        }
    } else {
        if (item.stock > 0) {
            cart.push({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                quantity: 1,
                category: item.category
            });
        } else {
            alert("This item is currently out of stock.");
            return;
        }
    }
    renderCart();
    // Open drawer on mobile for visual feedback
    if (window.innerWidth <= 1024) {
        cartPanel.classList.add('active');
    }
}
function updateCartQuantity(itemId, delta) {
    const cartItemIndex = cart.findIndex(c => c.id === itemId);
    if (cartItemIndex === -1) return;
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    const newQty = cart[cartItemIndex].quantity + delta;
    if (newQty <= 0) {
        cart.splice(cartItemIndex, 1);
    } else if (newQty <= item.stock) {
        cart[cartItemIndex].quantity = newQty;
    } else {
        alert(`Sorry, only ${item.stock} items of ${item.name} are available in stock.`);
        return;
    }
    renderCart();
}
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-state">
                <i data-lucide="shopping-cart"></i>
                <p>Your basket is empty</p>
                <span style="font-size: 0.8rem;">Select some artisanal delights to get started.</span>
            </div>
        `;
        mobileCartCount.innerText = '0';
        summarySubtotal.innerText = '$0.00';
        summaryVat.innerText = '$0.00';
        summaryTotal.innerText = '$0.00';
        checkoutBtn.disabled = true;
        lucide.createIcons();
        return;
    }
    cartItemsContainer.innerHTML = cart.map(item => {
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${(item.price * item.quantity).toFixed(2)} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">($${item.price.toFixed(2)} each)</span></p>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">
                        <i data-lucide="minus" style="width: 12px; height: 12px;"></i>
                    </button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">
                        <i data-lucide="plus" style="width: 12px; height: 12px;"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
    // Calculations
    const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const vat = subtotal * 0.12;
    const total = subtotal + vat;
    summarySubtotal.innerText = `$${subtotal.toFixed(2)}`;
    summaryVat.innerText = `$${vat.toFixed(2)}`;
    summaryTotal.innerText = `$${total.toFixed(2)}`;
    // Update mobile cart badge count
    const totalQty = cart.reduce((acc, curr) => acc + curr.quantity, 0);
    mobileCartCount.innerText = totalQty;
    validateForm();
}
function validateForm() {
    const nameVal = customerNameInput.value.trim();
    const tableVal = tableNumberInput.value.trim();
    
    // Enable checkout if form valid and cart is not empty
    if (cart.length > 0 && nameVal.length > 0 && tableVal.length > 0) {
        checkoutBtn.disabled = false;
    } else {
        checkoutBtn.disabled = true;
    }
}
function placeOrder() {
    const customerName = customerNameInput.value.trim();
    const tableNumber = tableNumberInput.value.trim();
    const notes = specialNotesInput.value.trim();
    if (!customerName || !tableNumber || cart.length === 0) {
        return;
    }
    checkoutBtn.disabled = true;
    checkoutBtn.innerText = 'Processing...';
    const payload = {
        customer_name: customerName,
        table_number: tableNumber,
        notes: notes,
        items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        }))
    };
    fetch('api/index.php?action=place_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            // Store order data for receipt generation
            currentOrderData = {
                order_id: res.order_id,
                customer_name: customerName,
                table_number: tableNumber,
                items: cart,
                notes: notes,
                subtotal: cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
                vat: cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) * 0.12,
                total: (cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) * 1.12)
            };
            
            // Hide Mobile Drawer if open
            cartPanel.classList.remove('active');
            // Show Payment Modal
            paymentModal.classList.add('active');
        } else {
            alert(`Order placement failed: ${res.message}`);
            checkoutBtn.disabled = false;
            checkoutBtn.innerText = 'Place Order';
        }
    })
    .catch(err => {
        console.error('Error placing order:', err);
        alert('An error occurred. Please try again.');
        checkoutBtn.disabled = false;
        checkoutBtn.innerText = 'Place Order';
    });
}
// Payment Method Selection
window.selectPaymentMethod = function(method) {
    console.log('[v0] Payment method selected:', method);
    if (!currentOrderData) return;
    
    paymentModal.classList.remove('active');
    
    if (method === 'cash') {
        // For cash, directly generate receipt and show thank you
        generateAndDownloadReceipt(method);
        thankYouModal.classList.add('active');
    } else if (method === 'qr') {
        // Show QR code modal
        document.getElementById('qr-modal').classList.add('active');
        generateSampleQRCode();
    } else if (method === 'card') {
        // Show card payment modal
        document.getElementById('card-modal').classList.add('active');
    }
};
// Close QR Modal
window.closeQRModal = function() {
    document.getElementById('qr-modal').classList.remove('active');
    paymentModal.classList.add('active');
};
// Confirm QR Payment
window.confirmQRPayment = function() {
    if (!currentOrderData) return;
    generateAndDownloadReceipt('qr');
    document.getElementById('qr-modal').classList.remove('active');
    thankYouModal.classList.add('active');
};
// Close Card Modal
window.closeCardModal = function() {
    document.getElementById('card-modal').classList.remove('active');
    paymentModal.classList.add('active');
};
// Confirm Card Payment
window.confirmCardPayment = function() {
    if (!currentOrderData) return;
    generateAndDownloadReceipt('card');
    document.getElementById('card-modal').classList.remove('active');
    thankYouModal.classList.add('active');
};
// Generate Sample QR Code
function generateSampleQRCode() {
    const qrSvg = document.getElementById('qr-code');
    if (!qrSvg) return;
    
    // Clear previous content
    qrSvg.innerHTML = '';
    
    // Create a simple sample QR code pattern (9x9 grid)
    const size = 9;
    const cellSize = 200 / size;
    
    // Sample QR code pattern (simplified)
    const pattern = [
        [1,1,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,1,0,1],
        [1,0,1,1,1,0,1,0,1],
        [1,0,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,1,0,0],
        [1,1,1,1,1,1,1,0,1],
        [0,0,0,0,0,0,0,0,1],
        [1,1,0,1,0,1,1,1,0]
    ];
    
    pattern.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 1) {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x * cellSize);
                rect.setAttribute('y', y * cellSize);
                rect.setAttribute('width', cellSize);
                rect.setAttribute('height', cellSize);
                rect.setAttribute('fill', '#2e1e1c');
                qrSvg.appendChild(rect);
            }
        });
    });
}
// Close Payment Modal
window.closePaymentModal = function() {
    paymentModal.classList.remove('active');
    checkoutBtn.disabled = false;
    checkoutBtn.innerText = 'Place Order';
};
// Generate Receipt and Download
function generateAndDownloadReceipt(paymentMethod) {
    if (!currentOrderData) return;
    
    const { order_id, customer_name, table_number, items, notes, subtotal, vat, total } = currentOrderData;
    const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Create receipt HTML
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Receipt #${order_id}</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    width: 80mm;
                    margin: 0;
                    padding: 10mm;
                    background: white;
                }
                .receipt {
                    text-align: center;
                    border: 1px solid #000;
                    padding: 10mm;
                }
                .header {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .order-id {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .timestamp {
                    font-size: 10px;
                    color: #666;
                    margin-bottom: 10px;
                }
                .customer-info {
                    text-align: left;
                    margin: 10px 0;
                    font-size: 11px;
                    border-bottom: 1px solid #000;
                    padding-bottom: 5px;
                }
                .items-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    font-weight: bold;
                    margin-top: 10px;
                    margin-bottom: 5px;
                    text-align: left;
                }
                .item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    margin-bottom: 3px;
                    text-align: left;
                }
                .qty {
                    margin-right: 10px;
                }
                .price {
                    text-align: right;
                }
                .totals {
                    border-top: 1px solid #000;
                    margin-top: 10px;
                    padding-top: 5px;
                    font-size: 11px;
                    text-align: left;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 3px;
                }
                .grand-total {
                    font-weight: bold;
                    font-size: 14px;
                    margin-top: 5px;
                    border-top: 1px solid #000;
                    padding-top: 5px;
                }
                .payment-method {
                    margin-top: 10px;
                    font-size: 11px;
                    text-align: left;
                }
                .footer {
                    margin-top: 15px;
                    font-size: 10px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">L'AMBIANCE CAFÉ</div>
                <div class="timestamp">${timestamp}</div>
                
                <div class="order-id">ORDER #${order_id}</div>
                
                <div class="customer-info">
                    <div>Customer: ${customer_name}</div>
                    <div>Table: T-${table_number}</div>
                </div>
                
                <div class="items-header">
                    <span>Item</span>
                    <span>Qty x Price</span>
                    <span>Total</span>
                </div>
                
                ${items.map(item => `
                    <div class="item">
                        <span style="flex: 1;">${item.name}</span>
                        <span class="qty">${item.quantity}x</span>
                        <span class="price">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>VAT (12%):</span>
                        <span>$${vat.toFixed(2)}</span>
                    </div>
                    <div class="grand-total total-row">
                        <span>TOTAL:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="payment-method">
                    <strong>Payment:</strong> ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                </div>
                
                ${notes ? `<div class="payment-method"><strong>Notes:</strong> ${notes}</div>` : ''}
                
                <div class="footer">
                    Thank you for your order!<br>
                    Enjoy your meal!
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_Order_${order_id}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
// Dine In / Take Out Selection
window.selectDineOption = function(option) {
    document.getElementById('dine-modal').classList.remove('active');
    resetOrderFlow();
};
// Reset order flow
function resetOrderFlow() {
    // Clear cart & forms
    cart = [];
    customerNameInput.value = '';
    tableNumberInput.value = '';
    specialNotesInput.value = '';
    
    renderCart();
    fetchMenu(); // Re-fetch menu to update stocks
    currentOrderData = null;
    checkoutBtn.disabled = false;
    checkoutBtn.innerText = 'Place Order';
}
// Show Welcome Modal on page load
function showWelcomeModal() {
    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) {
        welcomeModal.classList.add('active');
        lucide.createIcons();
    }
}
