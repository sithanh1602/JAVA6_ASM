package com.be.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ProductVariantDTO {
    private String name;
    private String imageUrl;
    private double price;
    private int stock;
    private String description;
    private Long idVariants;
    private String status;
    private List<AttributeDTO> attributes;
    private Long productId;
    private Double discountPrice;
    private Double discountPercentage; // Thêm discountPercentage

    // Constructor đầy đủ (bao gồm attributes)
    public ProductVariantDTO(String name, String imageUrl, double price, int stock, String description,
                             Long idVariants, String status, List<AttributeDTO> attributes,
                             Long productId, Double discountPrice, Double discountPercentage) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.price = price;
        this.stock = stock;
        this.description = description;
        this.idVariants = idVariants;
        this.status = status;
        this.attributes = attributes;
        this.productId = productId;
        this.discountPrice = discountPrice;
        this.discountPercentage = discountPercentage; // Thêm discountPercentage
    }

    // Constructor không có attributes (dùng trong ProductService)
    public ProductVariantDTO(String name, String imageUrl, double price, int stock, String description,
                             Long idVariants, String status, Long productId,
                             Double discountPrice, Double discountPercentage) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.price = price;
        this.stock = stock;
        this.description = description;
        this.idVariants = idVariants;
        this.status = status;
        this.attributes = new ArrayList<>();
        this.productId = productId;
        this.discountPrice = discountPrice;
        this.discountPercentage = discountPercentage; // Thêm discountPercentage
    }
}