package com.be.controller;

import com.be.entity.CartDetail;
import com.be.dto.CartDetailResponseDTO;
import com.be.service.CartDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartDetailControllerBE {

    @Autowired
    private CartDetailService cartDetailService;

//     API to retrieve CartDetail list with product information by userId
@GetMapping("/user/{userId}")
public ResponseEntity<List<CartDetailResponseDTO>> getCartDetailsByUserId(@PathVariable Long userId) {
    // Lấy thông tin giỏ hàng của người dùng theo userId
    List<CartDetailResponseDTO> responseDTOs = cartDetailService.getCartDetailsByUserId(userId);

    // Kiểm tra nếu giỏ hàng rỗng
    if (responseDTOs.isEmpty()) {
        return ResponseEntity.noContent().build(); // Trả về mã 204 nếu giỏ hàng không có sản phẩm
    }

    // Trả về mã 200 với danh sách giỏ hàng
    return ResponseEntity.ok(responseDTOs);
}

//     API to add product to the cart
    @PostMapping("/add")
    public ResponseEntity<CartDetail> addProductToCart(@RequestParam Long userId, @RequestParam Long productVariantId, @RequestParam Integer quantity) {
        try {
            // Add product to the cart
            CartDetail cartDetail = cartDetailService.addProductVariantToCart(userId, productVariantId, quantity);
            return ResponseEntity.ok(cartDetail);
        } catch (RuntimeException e) {
            // Handle cases where user or product is not found
            return ResponseEntity.badRequest().body(null);
        }
    }
    @PostMapping("/add_pc")
    public ResponseEntity<CartDetail> addPcToCart(@RequestParam Long userId,
                                                  @RequestParam Long buildId,
                                                  @RequestParam Integer quantity) {
        try {
            CartDetail cartDetail = cartDetailService.addPcToCart(userId, buildId, quantity);
            return ResponseEntity.ok(cartDetail);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeProduct(@RequestParam Long userId,
                                           @RequestParam(required = false) Long productVariantId,
                                           @RequestParam(required = false) Long buildId) {
        try {
            cartDetailService.removeProduct(userId, productVariantId, buildId);
            return ResponseEntity.ok().body("Mục đã được xóa khỏi giỏ hàng");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể xóa mục khỏi giỏ hàng: " + e.getMessage());
        }
    }

}
