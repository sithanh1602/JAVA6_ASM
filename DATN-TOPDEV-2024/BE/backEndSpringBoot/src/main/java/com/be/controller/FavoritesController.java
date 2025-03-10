package com.be.controller;

import com.be.dto.ProductVariantDTO;
import com.be.entity.Favorite;
import org.springframework.http.HttpStatus;
import com.be.service.FavoritesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoritesController {

    private final FavoritesService favoritesService;

    public FavoritesController(FavoritesService favoritesService) {
        this.favoritesService = favoritesService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ProductVariantDTO>> getFavoriteProductDetails(@PathVariable Long userId) {
        try {
            List<ProductVariantDTO> favoriteProducts = favoritesService.getFavoriteProductDetailsByUserId(userId);
            return ResponseEntity.ok(favoriteProducts);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@RequestParam Long userId, @RequestParam Long productVariantId) {
        try {
            Favorite favorite = favoritesService.addFavorite(userId, productVariantId);
            return new ResponseEntity<>(favorite, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}/{productVariantId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long userId, @PathVariable Long productVariantId) {
        try {
            favoritesService.removeFavorite(userId, productVariantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/check/{productVariantId}")
    public ResponseEntity<Boolean> isFavorited(@PathVariable Long userId, @PathVariable Long productVariantId) {
        boolean isFavorited = favoritesService.isProductFavorited(userId, productVariantId);
        return ResponseEntity.ok(isFavorited);
    }
}