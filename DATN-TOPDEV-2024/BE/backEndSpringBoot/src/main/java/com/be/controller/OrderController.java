package com.be.controller;

import com.be.DTO.OrderRequest;
import com.be.entity.*;
import com.be.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Endpoint to place an order
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest) {
        try {
            // Validate input
            if (orderRequest == null || orderRequest.getCartItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Order data is invalid.");
            }

            // Call the service to save the order
            Orders savedOrder = orderService.saveOrder(orderRequest);

            // Return the created order with status 201 Created
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);

        } catch (Exception e) {
            // Log the exception and send an error response
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing the order.");
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable Long userId) {
        try {
            List<Orders> orders = orderService.getOrdersByUserId(userId);
            if (orders.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy đơn hàng cho người dùng với ID: " + userId);
            }
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi lấy danh sách đơn hàng: " + e.getMessage());
        }
    }

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


}
