<?php
session_start();
function init_data() {
    if (!isset($_SESSION['pos_menu'])) {
        $_SESSION['pos_menu'] = [
            [
                'id' => 1,
                'name' => 'Signature Espresso',
                'category' => 'Coffee',
                'price' => 3.25,
                'stock' => 50,
                'description' => 'Rich, full-bodied espresso shot with a sweet, golden crema.',
                'image' => 'espresso.jpg'
            ],
            [
                'id' => 2,
                'name' => 'Velvet Cappuccino',
                'category' => 'Coffee',
                'price' => 4.50,
                'stock' => 30,
                'description' => 'Espresso blended with steamed milk and topped with deep foam.',
                'image' => 'cappuccino.jpg'
            ],
            [
                'id' => 3,
                'name' => 'Caramel Macchiato',
                'category' => 'Coffee',
                'price' => 5.25,
                'stock' => 20,
                'description' => 'Espresso with vanilla syrup, steamed milk, and caramel drizzle.',
                'image' => 'caramel_macchiato.jpg'
            ],
            [
                'id' => 4,
                'name' => 'Ceremonial Matcha Latte',
                'category' => 'Tea',
                'price' => 4.95,
                'stock' => 25,
                'description' => 'Stone-ground green tea whisked with creamy steamed milk.',
                'image' => 'matcha_latte.jpg'
            ],
            [
                'id' => 5,
                'name' => 'Iced Peach Oolong',
                'category' => 'Tea',
                'price' => 4.25,
                'stock' => 35,
                'description' => 'Refreshing oolong tea infused with sweet peach nectar.',
                'image' => 'peach_oolong.jpg'
            ],
            [
                'id' => 6,
                'name' => 'Butter Croissant',
                'category' => 'Bakery',
                'price' => 3.50,
                'stock' => 15,
                'description' => 'Flaky, buttery French pastry baked to a golden crisp.',
                'image' => 'croissant.jpg'
            ],
            [
                'id' => 7,
                'name' => 'Blueberry Crumble Muffin',
                'category' => 'Bakery',
                'price' => 3.75,
                'stock' => 12,
                'description' => 'Moist muffin packed with wild blueberries, finished with crumble.',
                'image' => 'blueberry_muffin.jpg'
            ],
            [
                'id' => 8,
                'name' => 'Artisanal Avocado Toast',
                'category' => 'Savory',
                'price' => 7.95,
                'stock' => 10,
                'description' => 'Smashed avocado, cherry tomatoes, and microgreens on sourdough.',
                'image' => 'avocado_toast.jpg'
            ],
            [
                'id' => 9,
                'name' => 'Truffle Mushroom Toast',
                'category' => 'Savory',
                'price' => 8.50,
                'stock' => 8,
                'description' => 'Sautéed wild mushrooms with truffle oil on toasted brioche.',
                'image' => 'mushroom_toast.jpg'
            ]
        ];
    }
    if (!isset($_SESSION['pos_orders'])) {
        $_SESSION['pos_orders'] = [];
    }
    if (!isset($_SESSION['pos_order_counter'])) {
        $_SESSION['pos_order_counter'] = 1000;
    }
}
init_data();
function get_menu() {
    return $_SESSION['pos_menu'];
}
function get_orders() {
    return $_SESSION['pos_orders'];
}
function get_order($id) {
    foreach ($_SESSION['pos_orders'] as $order) {
        if ($order['id'] == $id) {
            return $order;
        }
    }
    return null;
}
function place_order($customer_name, $table_number, $items, $notes = '') {
    if (empty($customer_name)) {
        return ['success' => false, 'message' => 'Customer name is required.'];
    }
    if (empty($table_number)) {
        return ['success' => false, 'message' => 'Table number is required.'];
    }
    if (empty($items)) {
        return ['success' => false, 'message' => 'Cart is empty.'];
    }
    $menu = &$_SESSION['pos_menu'];
    $order_items = [];
    $subtotal = 0;
    foreach ($items as $cart_item) {
        $found = false;
        foreach ($menu as &$menu_item) {
            if ($menu_item['id'] == $cart_item['id']) {
                $found = true;
                if ($menu_item['stock'] < $cart_item['quantity']) {
                    return ['success' => false, 'message' => "Insufficient stock for {$menu_item['name']}. Only {$menu_item['stock']} available."];
                }
                $menu_item['stock'] -= $cart_item['quantity'];
                
                $item_subtotal = $menu_item['price'] * $cart_item['quantity'];
                $subtotal += $item_subtotal;
                
                $order_items[] = [
                    'id' => $menu_item['id'],
                    'name' => $menu_item['name'],
                    'price' => $menu_item['price'],
                    'quantity' => $cart_item['quantity'],
                    'subtotal' => round($item_subtotal, 2)
                ];
                break;
            }
        }
        if (!$found) {
            return ['success' => false, 'message' => "Item ID {$cart_item['id']} not found in menu."];
        }
    }
    $vat = $subtotal * 0.12;
    $total = $subtotal + $vat;
    $_SESSION['pos_order_counter']++;
    $order_id = $_SESSION['pos_order_counter'];
    $new_order = [
        'id' => $order_id,
        'customer_name' => $customer_name,
        'table_number' => $table_number,
        'items' => $order_items,
        'subtotal' => round($subtotal, 2),
        'vat' => round($vat, 2),
        'total' => round($total, 2),
        'notes' => htmlspecialchars($notes),
        'status' => 'Pending',
        'created_at' => date('Y-m-d H:i:s')
    ];
    $_SESSION['pos_orders'][] = $new_order;
    return ['success' => true, 'order_id' => $order_id];
}
function update_order_status($order_id, $status) {
    $allowed = ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];
    if (!in_array($status, $allowed)) {
        return ['success' => false, 'message' => 'Invalid status.'];
    }
    foreach ($_SESSION['pos_orders'] as &$order) {
        if ($order['id'] == $order_id) {
            $order['status'] = $status;
            return ['success' => true];
        }
    }
    return ['success' => false, 'message' => 'Order not found.'];
}
function update_item_stock($item_id, $stock) {
    if ($stock < 0) {
        return ['success' => false, 'message' => 'Stock cannot be negative.'];
    }
    foreach ($_SESSION['pos_menu'] as &$item) {
        if ($item['id'] == $item_id) {
            $item['stock'] = intval($stock);
            return ['success' => true];
        }
    }
    return ['success' => false, 'message' => 'Item not found.'];
}
function update_item_price($item_id, $price) {
    if ($price < 0) {
        return ['success' => false, 'message' => 'Price cannot be negative.'];
    }
    foreach ($_SESSION['pos_menu'] as &$item) {
        if ($item['id'] == $item_id) {
            $item['price'] = floatval($price);
            return ['success' => true];
        }
    }
    return ['success' => false, 'message' => 'Item not found.'];
}

