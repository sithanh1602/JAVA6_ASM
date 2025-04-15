package com.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantHomeDTO {
    private Long id;
    private String image;
    private String nameVariants;
    private Double price;
    private Double discountPrice;
    private Long productId;
    private Integer quantity;
    private String status;
    private String brandName;
    private String categoryName;
}
