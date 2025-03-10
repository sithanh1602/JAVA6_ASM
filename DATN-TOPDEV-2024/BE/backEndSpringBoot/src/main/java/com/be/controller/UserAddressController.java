package com.be.controller;

import com.be.service.UserAddressService;
import com.be.dto.UserInfoDTO;  // DTO cho thông tin người dùng
import com.be.entity.Address;      // Import đối tượng Address nếu cần trả về danh sách địa chỉ chi tiết
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/UserAddress")
public class UserAddressController {

    @Autowired
    private UserAddressService userAddressService;

    // API để lấy thông tin user mặc định (fullName, phone, fullAddress) theo userId
    @GetMapping("/default-user-info")
    public ResponseEntity<?> getDefaultUserInfo(@RequestHeader Long userId) {
        try {
            // Kiểm tra xem userId có hợp lệ không
            if (userId == null || userId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("UserId không hợp lệ"));
            }

            // Lấy thông tin người dùng từ service
            Optional<UserInfoDTO> userInfo = userAddressService.getDefaultUserInfo(userId);

            if (userInfo.isPresent()) {
                return ResponseEntity.ok(userInfo.get());  // Trả về thông tin người dùng nếu có
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Không tìm thấy thông tin người dùng hoặc địa chỉ mặc định"));
            }
        } catch (Exception e) {
            // Xử lý trường hợp lỗi
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Đã xảy ra lỗi khi lấy thông tin người dùng: " + e.getMessage()));
        }
    }

    // API để lấy danh sách địa chỉ của người dùng
    @GetMapping("/addresses")
    public ResponseEntity<?> getAllAddresses(@RequestHeader Long userId) {
        try {
            // Kiểm tra xem userId có hợp lệ không
            if (userId == null || userId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("UserId không hợp lệ"));
            }

            // Lấy danh sách địa chỉ của người dùng từ service
            List<Address> addresses = userAddressService.getAllAddresses(userId);

            if (addresses.isEmpty()) {
                return ResponseEntity.noContent().build();  // Trả về mã 204 nếu không có địa chỉ
            }
            return ResponseEntity.ok(addresses);  // Trả về danh sách địa chỉ
        } catch (Exception e) {
            // Xử lý lỗi khi lấy địa chỉ
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
