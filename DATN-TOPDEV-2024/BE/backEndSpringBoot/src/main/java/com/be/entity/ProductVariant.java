package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Data
@Entity
@Table(name = "Product_Variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Sử dụng đối tượng Product thay vì kiểu int cho khóa ngoại
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name="name_variants")
    private String nameVariants;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "image")
    private String image;

    @Column(name = "status")
    private String status;

    @Column(name = "Price")
    private Double price;

    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Image> images;

    @OneToMany
    @JoinTable(
            name = "Attributes_Product_Variants",
            joinColumns = @JoinColumn(name = "product_variant_id"),
            inverseJoinColumns = @JoinColumn(name = "attribute_id")
    )
    @JsonIgnore
    private List<Attribute> attributes;
}

