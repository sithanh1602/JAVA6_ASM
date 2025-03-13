package com.be.dto;

import lombok.Data;

@Data
public class BuildPCProductVariantDTO {
    private Long productVariantId;
    private Integer variantQuantity;
    private Integer quantity;
    private String nameVariants;
    private Double price;
    private String image;
    private String status;
    private Long categoryId;
    private String categoryName;
}
