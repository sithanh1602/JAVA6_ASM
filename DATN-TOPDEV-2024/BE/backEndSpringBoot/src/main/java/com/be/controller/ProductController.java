package com.be.controller;

import com.be.dto.ProductDto;
import com.be.dto.ProductVariantDTO;
import com.be.entity.*;
import com.be.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product createdProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product productDetails) {
        Optional<Product> existingProduct = productService.getProductById(id);
        if (existingProduct.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.status(HttpStatus.OK).body(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        if (product.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{productId}/brand")
    public ResponseEntity<Brand> getBrandByProductId(@PathVariable Long productId) {
        Brand brand = productService.getBrandByProductId(productId);
        return brand != null ? ResponseEntity.ok(brand) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/{productId}/category")
    public ResponseEntity<Category> getCategoryByProductId(@PathVariable Long productId) {
        Category category = productService.getCategoryByProductId(productId);
        return category != null ? ResponseEntity.ok(category) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/{productId}/productdetail")
    public ResponseEntity<List<ProductDto>> getProductDetail(@PathVariable("productId") Long id) {
        List<ProductDto> product = productService.ProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/{productId}/product")
    public ResponseEntity<List<ProductVariantDTO>> getProduct(@PathVariable("productId") Long id) {
        List<ProductVariantDTO> variants = productService.getProductVariants(id);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("{VariantId}/image")
    public List<Image> getImagesByProductVariantId(@PathVariable("VariantId") Long productVariantId) {
        return productService.getImagesByProductVariantId(productVariantId);
    }


    @GetMapping("/variants/{id}")
    public ResponseEntity<ProductVariant> getProductVariantById(@PathVariable Long id) {
        Optional<ProductVariant> variant = productService.getProductVariantById(id);
        return variant.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategoryId(@PathVariable int categoryId) {
        List<Product> products = productService.getProductsByCategoryId(categoryId);
        return products.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(products);
    }

    @GetMapping("/check-quantity/{variantId}")
    public ResponseEntity<Integer> checkVariantQuantity(@PathVariable Long variantId) {
        try {
            Integer quantity = productService.checkVariantQuantity(variantId);
            return ResponseEntity.ok(quantity);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Lấy danh sách sản phẩm giảm giá
    @GetMapping("/discounted")
    public ResponseEntity<List<ProductVariant>> getDiscountedProducts() {
        List<ProductVariant> discountedProducts = productService.getDiscountedProducts();
        return ResponseEntity.ok(discountedProducts);
    }

}
