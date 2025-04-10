package com.be.controller;

import com.be.dto.OrderRequest;
import com.be.entity.Orders;
import com.be.service.MomoService;
import com.be.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/momo")
@RestController
public class MomoController {

    @Autowired
    private MomoService momoService;

    @Autowired
    private OrderService orderService;


    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<?> testPayment(@RequestBody OrderRequest orderRequest) {
        try {
            if (orderRequest == null || orderRequest.getCartItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Dữ liệu đơn hàng không hợp lệ.");
            }

            // Lưu đơn hàng
            Orders savedOrder = orderService.saveOrder(orderRequest);

            // Gửi thông báo đến admin
            messagingTemplate.convertAndSend("/topic/orders", "Bạn có đơn hàng mới! Mã đơn hàng là: " + savedOrder.getOrderNum());

            // Gọi Momo service để tạo yêu cầu thanh toán
            String momoPaymentUrl = momoService.createPaymentRequest(savedOrder.getTotalPrice(), String.valueOf(savedOrder.getId()));

            return ResponseEntity.status(HttpStatus.CREATED).body(momoPaymentUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi xử lý đơn hàng.");
        }
    }


    @GetMapping("/order-status/{orderId}")
    public String checkPaymentStatus(@PathVariable String orderId) {
        String response = momoService.checkPaymentStatus(orderId);
        return response;
    }

}