package com.be.GeminiClientdto;


import lombok.Data;

import java.util.Date;
import java.util.Set;

@Data
public class FullProductDTO {
    private int productId;
    private String productName;
    private CategoryDTO category;
    private BrandDTO brand;
    private String description;
    private Integer stock;
    private String imageUrl;
    private Date createdAt;
    private String status;
    private int purchaseCount;
    private Set<ProductVariantsDTO> productVariants;
}