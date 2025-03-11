package com.be.controller;

import com.be.DTO.OrderRequest;
import com.be.entity.*;
import com.be.service.OrderService;
import com.be.service.VNPayService;
import com.be.service.ZaloPayService;
import jakarta.persistence.criteria.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ZaloPayService zaloPayService;


    @GetMapping("/all")
    public List<Map<String, Object>> getAllOrders() throws Exception {
        return orderService.getAllOrdersWithDetails();
    }

    // Endpoint to place an order

    @Autowired
    private VNPayService vnPayService;

    @GetMapping("/details")
    public List<Object[]> getOrderDetails(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        return orderService.getOrderDetails(startDate, endDate);
    }
    @GetMapping("/revenue")
    public Integer getRevenue(
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        return orderService.calculateRevenue(startDate, endDate);
    }


    @GetMapping("/completed")
    public Map<Date, Integer> getDailyRevenue(
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        return orderService.getRevenuePerDay(startDate, endDate);
    }

    // Endpoint to get daily revenue using custom query
    @GetMapping("/daily-revenue")
    public List<Object[]> getDailyRevenueQuery(
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        return orderService.getDailyRevenue(startDate, endDate);
    }


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
            messagingTemplate.convertAndSend("/topic/orders", "Bạn có đơn hàng mới! Mã đơn hàng là: " + savedOrder.getOrderNum());

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
            System.out.println("📥 Nhận request thanh toán: " + orderRequest); // Debug log
            Orders orderPreview = orderService.createOrderPreview(orderRequest);

            String urlPayment = vnPayService.createOrder(
                    orderPreview.getTotalPrice(),
                    "Thanh toán cho đơn hàng",
                    "http://localhost:3000/payment",
                    String.valueOf(orderPreview.getId())
            );

            System.out.println("✅ URL Thanh toán: " + urlPayment);
            return ResponseEntity.status(HttpStatus.OK).body(urlPayment);
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi BE
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("🔥 BE Error: " + e.getMessage());
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

    @GetMapping("/{orderId}")
    public ResponseEntity<Orders> getOrderById(@PathVariable Long orderId) {
        Orders order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    // Endpoint cập nhật trạng thái đơn hàng
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam int status) {
        try {
            Orders updatedOrder = orderService.updateOrderStatus(orderId, status);
            String statusDescription = orderService.getStatusDescription(status);
            Map<String, Object> response = Map.of(
                    "message", "Cập nhật trạng thái đơn hàng thành công",
                    "order", Map.of(
                            "orderId", updatedOrder.getId(),
                            "status", updatedOrder.getStatus(),
                            "statusDescription", statusDescription,
                            "userId", updatedOrder.getUser().getUserId()
                    )
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng"));
        }
    }


    @PutMapping("/{orderId}/statushuy")
    public ResponseEntity<Orders> updateOrderStatushuy(@PathVariable Long orderId, @RequestBody int status) {
        Orders updatedOrder = orderService.updateOrderStatushuy(orderId, status);
        return ResponseEntity.ok(updatedOrder); // Trả về trạng thái mã 200 và đơn hàng đã cập nhật
    }

    @PostMapping("/place-zalopay")
    public ResponseEntity<?> placeOrderZaloPay(@RequestBody OrderRequest orderRequest) {
        try {
            if (orderRequest == null || orderRequest.getCartItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Order data is invalid.");
            }

            Orders savedOrder = orderService.saveOrder(orderRequest);

            // Notify admin about new order
            messagingTemplate.convertAndSend("/topic/orders", "Bạn có đơn hàng mới! Mã đơn hàng là: " + savedOrder.getId());

            // Create ZaloPay payment URL
            String urlPayment = zaloPayService.createZaloPayOrder(
                    savedOrder.getTotalPrice(),
                    "Thanh toán đơn hàng qua ZaloPay",
                    "http://localhost:3000/payment",
                    String.valueOf(savedOrder.getId())
            ).toString();

            return ResponseEntity.status(HttpStatus.CREATED).body(urlPayment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing the order.");
        }
    }

    @PostMapping("/zalopay-callback")
    public ResponseEntity<?> zaloPayCallback(@RequestBody Map<String, String> callbackData) {
        try {
            if (zaloPayService.verifyCallback(callbackData)) {
                // Update order status based on callback data
                String appTransId = callbackData.get("app_trans_id");
                String orderId = appTransId.split("_")[0];
                int status = Integer.parseInt(callbackData.get("status"));

                // Update order status
                if (status == 1) { // Payment successful
                    orderService.updateOrderStatus(Long.parseLong(orderId), 1);
                    return ResponseEntity.ok().body("Payment processed successfully");
                } else {
                    orderService.updateOrderStatus(Long.parseLong(orderId), -1);
                    return ResponseEntity.ok().body("Payment failed");
                }
            }
            return ResponseEntity.badRequest().body("Invalid callback signature");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing callback");
        }
    }

    // Endpoint mới để gọi thủ công cleanupUnpaidOrders
    @PostMapping("/cleanup-unpaid")
    public ResponseEntity<?> cleanupUnpaidOrders() {
        try {
            orderService.cleanupUnpaidOrders();
            return ResponseEntity.ok(Map.of("message", "Đã xóa các đơn hàng chưa thanh toán quá 1 ngày."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Có lỗi xảy ra khi xóa đơn hàng chưa thanh toán: " + e.getMessage()));
        }
    }

}
