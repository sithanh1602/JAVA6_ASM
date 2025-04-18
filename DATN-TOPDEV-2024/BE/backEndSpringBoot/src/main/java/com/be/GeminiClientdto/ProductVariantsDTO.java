package com.be.GeminiClientdto;

import lombok.Data;

import java.util.List;

@Data
public class ProductVariantsDTO {
    private Long variantId;
    private String nameVariants;
    private Integer quantity;
    private String description;
    private String status;
    private Double price;
    private List<ImageDTO> images;
    private List<AttributeDTO> attributes;
}