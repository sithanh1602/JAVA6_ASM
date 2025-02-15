package com.be.controller;

import com.be.DTO.ProductVariantDTO;
import com.be.DTO.ProductVariantHomeDTO;
import com.be.DTO.ProductVariantRequest;
import com.be.entity.ProductVariant;
import com.be.service.ProductVariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-variants")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductVariantController {

    @Autowired
    private ProductVariantService productVariantService;

//    @GetMapping
//    public List<ProductVariant> getAllProductVariants() {
//                return productVariantService.getAllProductVariants();
//    }

    @GetMapping
    public ResponseEntity<List<ProductVariantHomeDTO>> getAllProductVariantsWithFirstImage() {
        List<ProductVariantHomeDTO> variants = productVariantService.getAllProductVariantsWithFirstImage();
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/search")
    public List<ProductVariantDTO> searchProductVariants(@RequestParam String keyword) {
        return productVariantService.searchProductVariantsByName(keyword);
    }

    @PostMapping("/add")
    public ResponseEntity<ProductVariant> addProductVariant(@RequestBody ProductVariantRequest request) {
        ProductVariant savedVariant = productVariantService.addProductVariant(request);
        return ResponseEntity.ok(savedVariant);
    }
}
