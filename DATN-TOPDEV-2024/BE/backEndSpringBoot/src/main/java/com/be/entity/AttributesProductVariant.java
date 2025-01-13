package com.be.entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Attributes_Product_Variants")
public class AttributesProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @ManyToOne
    @JoinColumn(name = "attribute_id", nullable = false)
    private Attribute attribute;



}

