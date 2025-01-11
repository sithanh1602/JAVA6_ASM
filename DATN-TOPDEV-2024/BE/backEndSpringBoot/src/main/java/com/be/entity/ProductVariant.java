package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Product_Variants")
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = true)
    private Integer quantity; // Cột quantity, kiểu int, cho phép null

    @Column(columnDefinition = "NVARCHAR(255)", nullable = true)
    private String image; // Cột image, kiểu NVARCHAR(255), cho phép null

    @Column(columnDefinition = "NVARCHAR(255)", nullable = true)
    private String status; // Cột status, kiểu NVARCHAR(255), cho phép null

    @Column(nullable = true)
    private Integer price; // Cột price, kiểu int, cho phép null

}
