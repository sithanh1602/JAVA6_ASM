package com.be.controller;

import com.be.service.UserAddressService;
import com.be.dto.UserInfoDTO;  // DTO cho thông tin người dùng
import com.be.entity.Address;      // Import đối tượng Address nếu cần trả về danh sách địa chỉ chi tiết
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/UserAddress")
public class UserAddressController {

    @Autowired
    private UserAddressService userAddressService;

    @GetMapping("/{userId}/default-info")
    public ResponseEntity<?> getDefaultUserInfo(@PathVariable Long userId) {
        try {
            Optional<UserInfoDTO> userInfo = userAddressService.getDefaultUserInfo(userId);
            return ResponseEntity.ok(userInfo.orElse(new UserInfoDTO()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Đã xảy ra lỗi khi lấy thông tin người dùng: " + e.getMessage()));
        }
    }

    // API để lấy danh sách địa chỉ của người dùng
    @GetMapping("/{userId}/addresses")
    public ResponseEntity<?> getAllAddresses(@PathVariable Long userId) {
        try {
            List<Address> addresses = userAddressService.getAllAddresses(userId);
            if (addresses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Không thể lấy danh sách địa chỉ người dùng: " + e.getMessage()));
        }
    }

    // DTO để trả về thông báo lỗi
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
