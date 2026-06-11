<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../data.php';
$action = $_GET['action'] ?? '';
function get_post_data() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}
switch ($action) {
    case 'get_menu':
        echo json_encode(['success' => true, 'data' => get_menu()]);
        break;
    case 'get_orders':
        echo json_encode(['success' => true, 'data' => get_orders()]);
        break;
    case 'place_order':
        $data = get_post_data();
        $name = $data['customer_name'] ?? '';
        $table = $data['table_number'] ?? '';
        $items = $data['items'] ?? [];
        $notes = $data['notes'] ?? '';
        
        $res = place_order($name, $table, $items, $notes);
        echo json_encode($res);
        break;
    case 'update_status':
        $data = get_post_data();
        $order_id = $data['order_id'] ?? null;
        $status = $data['status'] ?? '';
        
        if (!$order_id) {
            echo json_encode(['success' => false, 'message' => 'Missing order ID.']);
            break;
        }
        $res = update_order_status($order_id, $status);
        echo json_encode($res);
        break;
    case 'update_stock':
        $data = get_post_data();
        $item_id = $data['item_id'] ?? null;
        $stock = $data['stock'] ?? null;
        
        if ($item_id === null || $stock === null) {
            echo json_encode(['success' => false, 'message' => 'Missing item ID or stock value.']);
            break;
        }
        $res = update_item_stock($item_id, $stock);
        echo json_encode($res);
        break;
    case 'update_price':
        $data = get_post_data();
        $item_id = $data['item_id'] ?? null;
        $price = $data['price'] ?? null;
        
        if ($item_id === null || $price === null) {
            echo json_encode(['success' => false, 'message' => 'Missing item ID or price value.']);
            break;
        }
        $res = update_item_price($item_id, $price);
        echo json_encode($res);
        break;
    case 'order_status':
        $order_id = $_GET['id'] ?? null;
        if (!$order_id) {
            echo json_encode(['success' => false, 'message' => 'Missing order ID.']);
            break;
        }
        $order = get_order($order_id);
        if ($order) {
            echo json_encode(['success' => true, 'data' => $order]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Order not found.']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
        break;
}
