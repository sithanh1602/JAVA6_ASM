package com.be.controller;

import com.be.dto.ProductVariantDTO;
import com.be.dto.ProductVariantHomeDTO;
import com.be.dto.ProductVariantRequest;
import com.be.entity.ProductVariant;
import com.be.rep.ProductVariantRepository;
import com.be.service.ProductVariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/product-variants")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductVariantController {

    @Autowired
    private ProductVariantService productVariantService;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @GetMapping("/all")
    public List<ProductVariant> getAllVariants() {
        return productVariantRepository.findAll();
    }

    @GetMapping
    public ResponseEntity<List<ProductVariantHomeDTO>> getAllProductVariantsWithFirstImage() {
        List<ProductVariantHomeDTO> variants = productVariantService.getAllProductVariantsWithFirstImage();
        return ResponseEntity.ok(variants);
    }

    @PostMapping("/add")
    public ResponseEntity<ProductVariant> addProductVariant(@RequestBody ProductVariantRequest request) {
        ProductVariant savedVariant = productVariantService.addProductVariant(request);
        return ResponseEntity.ok(savedVariant);
    }

    @GetMapping("/by-brand/{brandId}")
    public ResponseEntity<List<ProductVariantHomeDTO>> getVariantsByBrand(@PathVariable Long brandId) {
        List<Object[]> results = productVariantRepository.findProductVariantsWithImageByBrand(brandId);

        List<ProductVariantHomeDTO> variants = results.stream().map(row -> {
            ProductVariantHomeDTO dto = new ProductVariantHomeDTO();
            dto.setId(row[0] != null ? ((Number) row[0]).longValue() : null);  // id
            dto.setImage(row[1] != null ? (String) row[1] : "default.jpg");    // image (tránh lỗi null)
            dto.setNameVariants(row[2] != null ? (String) row[2] : "");        // nameVariants
            dto.setPrice(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0); // price
            dto.setProductId(row[4] != null ? ((Number) row[4]).longValue() : null); // productId
            dto.setQuantity(row[5] != null ? ((Number) row[5]).intValue() : 0); // quantity
            dto.setStatus(row[6] != null ? (String) row[6] : "unknown");      // status
            dto.setBrandName(row[7] != null ? (String) row[7] : "Unknown");   // brand_name
            return dto;
        }).collect(Collectors.toList());

        return variants.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(variants);
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<ProductVariantHomeDTO>> getVariantsByCategory(@PathVariable Long categoryId) {
        List<Object[]> results = productVariantRepository.findVariantsWithImageByCategory(categoryId);

        List<ProductVariantHomeDTO> variants = results.stream().map(row -> {
            ProductVariantHomeDTO dto = new ProductVariantHomeDTO();
            dto.setId(row[0] != null ? ((Number) row[0]).longValue() : null);  // id
            dto.setImage(row[1] != null ? (String) row[1] : "default.jpg");    // image (tránh lỗi null)
            dto.setNameVariants(row[2] != null ? (String) row[2] : "");        // nameVariants
            dto.setPrice(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0); // price
            dto.setProductId(row[4] != null ? ((Number) row[4]).longValue() : null); // productId
            dto.setQuantity(row[5] != null ? ((Number) row[5]).intValue() : 0); // quantity
            dto.setStatus(row[6] != null ? (String) row[6] : "unknown");      // status
            dto.setCategoryName(row[7] != null ? (String) row[7] : "Unknown"); // category_name
            return dto;
        }).collect(Collectors.toList());

        return variants.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(variants);
    }


    @PutMapping("/update/{variantId}")
    public ResponseEntity<ProductVariant> updateProductVariant(@PathVariable Long variantId,
                                                               @RequestBody ProductVariantRequest request) {
        ProductVariant updatedVariant = productVariantService.updateProductVariant(variantId, request);
        return ResponseEntity.ok(updatedVariant);
    }

    @GetMapping("/by-product/{productId}")
    public ResponseEntity<List<ProductVariantDTO>> getProductVariantsByProductId(@PathVariable Long productId) {
        List<ProductVariantDTO> variants = productVariantService.getProductVariantsByProductId(productId);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<ProductVariant>> getTopBestSellingVariants() {
        List<ProductVariant> variants = productVariantService.getBestSellingProductVariants();
        return ResponseEntity.ok(variants);
    }


    @GetMapping("/newest")
    public ResponseEntity<List<ProductVariant>> getTopNewestVariants() {
        List<ProductVariant> variants = productVariantService.getNewProductVariants();
        return ResponseEntity.ok(variants);
    }


    @GetMapping("/outstanding")
    public ResponseEntity<List<ProductVariant>> getTopRatedProductsVariants() {
        List<ProductVariant> variants = productVariantService.getTopRatedProductsVariants();
        return ResponseEntity.ok(variants);
    }

}
