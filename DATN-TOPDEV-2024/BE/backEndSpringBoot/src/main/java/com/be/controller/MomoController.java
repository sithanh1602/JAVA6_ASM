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

import java.util.Map;

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
            String momoPaymentUrl = momoService.createPaymentRequest(savedOrder.getTotalPrice(), String.valueOf(savedOrder.getOrderNum()));

            return ResponseEntity.status(HttpStatus.CREATED).body(momoPaymentUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Có lỗi xảy ra khi xử lý đơn hàng.");
        }
    }

    @PostMapping("/placeno-momo")
    public ResponseEntity<?> placeOrderWithMomoPreview(@RequestBody OrderRequest orderRequest) {
        try {
            System.out.println("Nhận yêu cầu thanh toán (MoMo): " + orderRequest); // Debug log

            // Tạo đơn hàng preview nhưng chưa lưu DB
            Orders orderPreview = orderService.createOrderPreview(orderRequest);

            // Tạo URL thanh toán MoMo
            String momoPayUrl = momoService.createPaymentRequest2(orderPreview.getTotalPrice(), String.valueOf(orderPreview.getOrderNum()));

            if (momoPayUrl == null || momoPayUrl.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Không thể tạo URL thanh toán MoMo.");
            }

            System.out.println("URL Thanh toán MoMo: " + momoPayUrl);
            return ResponseEntity.ok(Map.of(
                    "paymentUrl", momoPayUrl,
                    "orderId", orderPreview.getOrderNum(),
                    "amount", orderPreview.getTotalPrice()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo đơn hàng thanh toán MoMo: " + e.getMessage());
        }
    }

    @PostMapping("/refund-momo")
    public ResponseEntity<?> refundOrderMomo(@RequestParam String orderNum,
                                             @RequestParam String transId,
                                             @RequestParam int amount,
                                             @RequestParam(required = false, defaultValue = "Hủy đơn hàng") String description) {
        try {
            String response = momoService.refundOrder(orderNum, transId, amount, description);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hoàn tiền MoMo: " + e.getMessage());
        }
    }



    @GetMapping("/order-status/{orderId}")
    public String checkPaymentStatus(@PathVariable String orderId) {
        String response = momoService.checkPaymentStatus(orderId);
        return response;
    }

}