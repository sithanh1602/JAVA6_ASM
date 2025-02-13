package com.be.controller;

import com.be.DTO.ProductVariantDTO;
import com.be.entity.ProductVariant;
import com.be.service.ProductVariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-variants")
@CrossOrigin(origins = "http://localhost:3000") // Cho phép React FE truy cập
public class ProductVariantController {

    @Autowired
    private ProductVariantService productVariantService;

    @GetMapping
    public List<ProductVariant> getAllProductVariants() {
        return productVariantService.getAllProductVariants();
    }

    // API tìm kiếm sản phẩm theo tên
    @GetMapping("/search")
    public List<ProductVariantDTO> searchProductVariants(@RequestParam String keyword) {
        return productVariantService.searchProductVariantsByName(keyword);
    }
}
