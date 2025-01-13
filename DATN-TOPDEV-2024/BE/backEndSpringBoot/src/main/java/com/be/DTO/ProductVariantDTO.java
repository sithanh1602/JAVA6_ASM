package com.be.DTO;

import lombok.Data;

@Data
public class ProductVariantDTO {
    private String name;
    private String imageUrl;
    private double price;
    private int stock;
    private String description;
    private Long idVariants;

    public ProductVariantDTO(String name, String imageUrl, double price, int stock, String description, Long idVariants) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.price = price;
        this.stock = stock;
        this.description = description;
        this.idVariants = idVariants;
    }



}
