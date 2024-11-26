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

    // API to retrieve CartDetail list with product information by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CartDetailResponseDTO>> getCartDetailsByUserId(@PathVariable Long userId) {
        List<CartDetailResponseDTO> responseDTOs = cartDetailService.getCartItemsWithProductInfo(userId);

        // Check if the cart is empty
        if (responseDTOs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(responseDTOs);
    }

    // API to add product to the cart
    @PostMapping("/add")
    public ResponseEntity<CartDetail> addProductToCart(@RequestParam Long userId, @RequestParam Long productId, @RequestParam Integer quantity) {
        try {
            // Add product to the cart
            CartDetail cartDetail = cartDetailService.addProductToCart(userId, productId, quantity);
            return ResponseEntity.ok(cartDetail);
        } catch (RuntimeException e) {
            // Handle cases where user or product is not found
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeProduct(@RequestParam Long userId, @RequestParam Long productId) {
        try {
            // Gọi service để xóa sản phẩm khỏi giỏ hàng
            cartDetailService.removeProduct(userId, productId);
            return ResponseEntity.ok().body("Sản phẩm đã được xóa khỏi giỏ hàng");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể xóa sản phẩm khỏi giỏ hàng");
        }
    }

}
