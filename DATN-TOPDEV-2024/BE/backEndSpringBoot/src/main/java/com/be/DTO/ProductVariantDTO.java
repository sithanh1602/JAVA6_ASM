package com.be.DTO;

import com.be.entity.ProductVariant;
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

    public ProductVariantDTO(String name, String imageUrl, double price, int stock, String description, Long idVariants,String status, List<AttributeDTO> attributes) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.price = price;
        this.stock = stock;
        this.description = description;
        this.idVariants = idVariants;
        this.status = status;
        this.attributes = attributes;
    }

    // Constructor dùng trong `ProductService` (không có attributes)
    public ProductVariantDTO(String name, String imageUrl, double price, int stock, String description, Long idVariants, String status) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.price = price;
        this.stock = stock;
        this.description = description;
        this.idVariants = idVariants;
        this.status = status;
        this.attributes = new ArrayList<>(); // Khởi tạo danh sách attributes rỗng
    }
}
