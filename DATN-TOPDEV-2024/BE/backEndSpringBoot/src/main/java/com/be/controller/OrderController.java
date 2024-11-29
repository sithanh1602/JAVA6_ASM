package com.be.controller;

import com.be.DTO.OrderRequest;
import com.be.entity.*;
import com.be.service.OrderService;
import com.be.service.VNPayService;
import net.minidev.json.JSONUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;


    @GetMapping("/all")
    public List<Map<String, Object>> getAllOrders() throws Exception {
        return orderService.getAllOrdersWithDetails();
    }

    // Endpoint to place an order

    @Autowired
    private VNPayService vnPayService;

    // Endpoint để tạo đơn hàng (với thanh toán VNPay)

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest) {
        try {
            if (orderRequest == null || orderRequest.getCartItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Order data is invalid.");
            }

            Orders savedOrder = orderService.saveOrder(orderRequest);

            // Gửi thông báo đến admin về đơn hàng mới
            messagingTemplate.convertAndSend("/topic/orders", "Có đơn hàng mới với ID: " + savedOrder.getId());

            // Tạo URL thanh toán VNPay
            String urlPayment = vnPayService.createOrder(
                    savedOrder.getTotalPrice(),
                    "Thanh toán cho đơn hàng",
                    "http://localhost:3000/payment",
                    String.valueOf(savedOrder.getId())
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(urlPayment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing the order.");
        }
    }


//    @PutMapping("/{orderId}/status")
//    public ResponseEntity<Orders> updateOrderStatus(@PathVariable Long orderId, @RequestParam int status) {
//        try {
//            Orders updatedOrder = orderService.updateOrderStatus(orderId, status);
//            return ResponseEntity.ok(updatedOrder); // Respond with the updated order
//        } catch (Exception e) {
//            return ResponseEntity.status(404).body(null); // Return 404 if order not found or any error
//        }
//    }


    // Endpoint để tạo đơn hàng (không sử dụng VNPay, thanh toán COD)
    @PostMapping("/placecod")
    public ResponseEntity<?> placeOrderNoVnpay(@RequestBody OrderRequest orderRequest) {
        try {
            if (orderRequest == null || orderRequest.getCartItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Order data is invalid.");
            }

            Orders savedOrder = orderService.saveOrdernovnpay(orderRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing the order.");
        }
    }

    @PostMapping("/placeno")
    public ResponseEntity<?> placeOrderPreview(@RequestBody OrderRequest orderRequest) {
        try {

            // Tạo đơn hàng xem trước thông qua OrderService
            Orders orderPreview = orderService.createOrderPreview(orderRequest);

            // Tạo URL thanh toán (nếu cần) sử dụng vnPayService
            String urlPayment = vnPayService.createOrder(
                    orderPreview.getTotalPrice(),
                    "Thanh toán cho đơn hàng",
                    "http://localhost:3000/payment",  // URL quay lại sau khi thanh toán
                    String.valueOf(orderPreview.getId())
            );

            // Trả về URL thanh toán cho frontend
            return ResponseEntity.status(HttpStatus.OK).body(urlPayment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing the order.");
        }
    }


    // Endpoint lấy đơn hàng theo userId

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable Long userId) {
        try {
            List<Orders> orders = orderService.getOrdersByUserId(userId);
            if (orders.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Không tìm thấy đơn hàng cho người dùng với ID: " + userId);
            }
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi lấy danh sách đơn hàng.");
        }
    }

    // Endpoint lấy sản phẩm trong đơn hàng theo orderId
    @GetMapping("/products/{orderId}")
    public ResponseEntity<?> getProductsByOrderId(@PathVariable Long orderId) {
        try {
            List<Map<String, Object>> products = orderService.getProductsByOrderId(orderId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi lấy danh sách sản phẩm.");
        }
    }

    // Endpoint cập nhật trạng thái đơn hàng
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestParam int status) {
        try {
            orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(Map.of("message", "Order status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/statushuy")
    public ResponseEntity<Orders> updateOrderStatushuy(@PathVariable Long orderId, @RequestBody Integer status) {
        Orders updatedOrder = orderService.updateOrderStatushuy(orderId, status);
        return ResponseEntity.ok(updatedOrder); // Trả về trạng thái mã 200 và đơn hàng đã cập nhật
    }

}
