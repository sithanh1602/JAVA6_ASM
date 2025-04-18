package com.be.dto;

import lombok.Data;

@Data
public class ProductDto {
    private String name;
    private String description;
    private double price;
    private String image;
    private String attributes; // Đây là nơi chứa giá trị từ GROUP_CONCAT
    private Long variantId;
    private Integer quantity;


    // Getters và setters (đã được tạo tự động bởi @Data của Lombok)
}