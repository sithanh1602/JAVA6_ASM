package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Build_PC_Product_Variants")
public class BuildPCProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "build_id", nullable = false)
    private BuildPC buildPC;

    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "variant_quantity")
    private Integer variantQuantity;
}