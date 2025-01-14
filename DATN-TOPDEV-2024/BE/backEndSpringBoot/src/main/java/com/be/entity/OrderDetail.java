package com.be.entity;

import lombok.Data;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "OrderDetail")
@Data // Lombok generates getters, setters, toString, equals, and hashCode methods
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Orders order;

    @ManyToOne
    @JoinColumn(name = "product_variant_id")
    private ProductVariant product_variant_id;

    private int quantity;

    private BigDecimal price;
}
