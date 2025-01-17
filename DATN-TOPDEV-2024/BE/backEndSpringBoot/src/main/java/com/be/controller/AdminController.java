package com.be.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final SimpMessagingTemplate messagingTemplate;

    public AdminController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Khi trạng thái người dùng thay đổi thành Inactive
    @PutMapping("/deactivate-user/{userId}")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        // Đổi trạng thái người dùng trong cơ sở dữ liệu (bạn cần thực hiện trong service)
        // userService.deactivateUser(userId);

        // Gửi thông báo đến WebSocket
        messagingTemplate.convertAndSend("/topic/user-status/" + userId, "Your account has been deactivated. You will be logged out.");

        return ResponseEntity.ok("User deactivated successfully");
    }
}


