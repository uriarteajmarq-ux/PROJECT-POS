document.addEventListener('DOMContentLoaded', () => {
    const trackingView = document.getElementById('tracking-view');
    if (!trackingView) return;
    const orderId = trackingView.getAttribute('data-order-id');
    if (!orderId) return;
    // UI Elements
    const customerInfo = document.getElementById('track-customer-info');
    const tableNo = document.getElementById('track-table-no');
    const orderTime = document.getElementById('track-time');
    const notesRow = document.getElementById('notes-row');
    const trackNotes = document.getElementById('track-notes');
    const itemsList = document.getElementById('track-items-list');
    
    const subtotalEl = document.getElementById('track-subtotal');
    const vatEl = document.getElementById('track-vat');
    const totalEl = document.getElementById('track-total');
    
    const stepperFill = document.getElementById('stepper-fill');
    const stepPending = document.getElementById('step-pending');
    const stepPreparing = document.getElementById('step-preparing');
    const stepReady = document.getElementById('step-ready');
    const stepServed = document.getElementById('step-served');
    
    const stepperContainer = document.getElementById('stepper');
    const cancelledView = document.getElementById('cancelled-view');
    const pollingIndicator = document.getElementById('polling-indicator');
    let pollInterval = null;
    // Initial load
    fetchStatus();
    // Start 5-second polling
    pollInterval = setInterval(fetchStatus, 5000);
    function fetchStatus() {
        fetch(`api/index.php?action=order_status&id=${orderId}`)
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    renderOrderDetails(res.data);
                } else {
                    showError(res.message || 'Order not found.');
                    clearInterval(pollInterval);
                    if (pollingIndicator) pollingIndicator.style.display = 'none';
                }
            })
            .catch(err => {
                console.error('Error fetching order status:', err);
            });
    }
    function renderOrderDetails(order) {
        // Customer and Table info
        customerInfo.innerText = `For ${order.customer_name} • Order details below`;
        tableNo.innerText = order.table_number;
        
        // Format creation time
        const date = new Date(order.created_at);
        orderTime.innerText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
        // Notes
        if (order.notes && order.notes.trim() !== '') {
            trackNotes.innerText = order.notes;
            notesRow.style.display = 'flex';
        } else {
            notesRow.style.display = 'none';
        }
        // Totals
        subtotalEl.innerText = `$${parseFloat(order.subtotal).toFixed(2)}`;
        vatEl.innerText = `$${parseFloat(order.vat).toFixed(2)}`;
        totalEl.innerText = `$${parseFloat(order.total).toFixed(2)}`;
        // Items List
        itemsList.innerHTML = order.items.map(item => `
            <div class="tracking-item-row">
                <span class="tracking-item-name">${item.name} <span style="font-weight: 300; color: var(--text-muted);">x${item.quantity}</span></span>
                <span class="tracking-item-total">$${parseFloat(item.subtotal).toFixed(2)}</span>
            </div>
        `).join('');
        // Progress bar updates
        const status = order.status; // 'Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'
        
        // Reset steps
        document.querySelectorAll('.step-node').forEach(node => {
            node.classList.remove('active', 'completed');
        });
        if (status === 'Cancelled') {
            // Hide stepper, show cancelled banner
            stepperContainer.style.display = 'none';
            cancelledView.style.display = 'block';
            if (pollingIndicator) pollingIndicator.style.display = 'none';
            clearInterval(pollInterval); // Stop polling
        } else {
            stepperContainer.style.display = 'flex';
            cancelledView.style.display = 'none';
            if (status === 'Pending') {
                stepperFill.style.width = '0%';
                stepPending.classList.add('active');
            } else if (status === 'Preparing') {
                stepperFill.style.width = '33.3%';
                stepPending.classList.add('completed');
                stepPreparing.classList.add('active');
            } else if (status === 'Ready') {
                stepperFill.style.width = '66.6%';
                stepPending.classList.add('completed');
                stepPreparing.classList.add('completed');
                stepReady.classList.add('active');
            } else if (status === 'Served') {
                stepperFill.style.width = '100%';
                stepPending.classList.add('completed');
                stepPreparing.classList.add('completed');
                stepReady.classList.add('completed');
                stepServed.classList.add('completed');
                
                // Stop polling since order has reached its final state
                if (pollingIndicator) pollingIndicator.style.display = 'none';
                clearInterval(pollInterval);
            }
        }
        lucide.createIcons();
    }
    function showError(msg) {
        customerInfo.innerText = msg;
        customerInfo.style.color = '#dc2626';
        customerInfo.style.fontWeight = 'bold';
        
        stepperContainer.style.display = 'none';
        cancelledView.style.display = 'none';
        
        itemsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Unable to display order items.</div>`;
    }
});