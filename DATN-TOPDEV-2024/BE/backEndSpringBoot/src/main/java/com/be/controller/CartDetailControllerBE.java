package com.be.controller;

import com.be.entity.CartDetail;
import com.be.DTO.CartDetailResponseDTO;
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
    List<CartDetailResponseDTO> responseDTOs = cartDetailService.getCartDetailsWithProductInfo(userId);

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

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeProduct(@RequestParam Long userId, @RequestParam Long productVariantId) {
        try {
            // Gọi service để xóa sản phẩm khỏi giỏ hàng
            cartDetailService.removeProduct(userId, productVariantId);
            return ResponseEntity.ok().body("Sản phẩm đã được xóa khỏi giỏ hàng");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể xóa sản phẩm khỏi giỏ hàng");
        }
    }

}
