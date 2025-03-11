package com.be.controller;

import com.be.entity.Address;
import com.be.dto.AddressDTO;
import com.be.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping("/{id}")
    public ResponseEntity<Address> getAddressByIdAddress(@PathVariable Long id) {
        Address address = addressService.findByIdAddress(id);
        if (address != null) {
            return ResponseEntity.ok(address);
        }
        return ResponseEntity.notFound().build();
    }

    // API lấy danh sách địa chỉ của người dùng
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAddressesByUserId(@PathVariable Long userId) {
        try {
            List<Address> addresses = addressService.getAddressesByUserId(userId);
            if (addresses.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi lấy danh sách địa chỉ.");
        }
    }

    // API thêm địa chỉ mới
    @PostMapping("/save")
    public ResponseEntity<?> createAddress(@RequestBody AddressDTO addressDTO) {
        try {
            Address savedAddress = addressService.createAddress(addressDTO);
            return ResponseEntity.status(201).body(savedAddress);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Dữ liệu địa chỉ không hợp lệ.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi tạo địa chỉ mới.");
        }
    }

    // API cập nhật địa chỉ
    @PutMapping("/{idAddress}")
    public ResponseEntity<?> updateAddress(@PathVariable Long idAddress, @RequestBody AddressDTO addressDTO) {
        try {
            // Kiểm tra địa chỉ có tồn tại không
            Address existingAddress = addressService.findById(idAddress);
            if (existingAddress == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy địa chỉ cần cập nhật.");
            }

            // Cập nhật địa chỉ
            Address updatedAddress = addressService.updateAddress(idAddress, addressDTO);

            return ResponseEntity.ok(updatedAddress); // Trả về địa chỉ đã cập nhật

        } catch (Exception e) {
            // Log lỗi chi tiết
            e.printStackTrace(); // In lỗi chi tiết ra console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi cập nhật địa chỉ.");
        }
    }


    // API xóa địa chỉ
    @DeleteMapping("/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long addressId) {
        try {
            addressService.deleteAddress(addressId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Không tìm thấy địa chỉ cần xóa.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi xóa địa chỉ.");
        }
    }



//    // API lấy địa chỉ theo ID
//    @GetMapping("/{addressId}")
//    public ResponseEntity<?> getAddressById(@PathVariable Long addressId) {
//        try {
//            Address address = addressService.getAddressById(addressId);
//            return ResponseEntity.ok(address);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(404).body("Không tìm thấy địa chỉ.");
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Lỗi khi lấy địa chỉ.");
//        }
//    }
}