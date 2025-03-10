package com.be.dto;


import lombok.Data;

import java.util.List;

@Data
public class ProductVariantRequest {
    private Long productId;
    private int quantity;
    private String status;
    private Double price;
    private List<String> imageUrls;
    private List<Long> attributeIds;
    private String description;
}
