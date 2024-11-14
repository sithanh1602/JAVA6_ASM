package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cart_detail") // Ensure this matches the table name in the database
public class CartDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary key for CartDetail

    @ManyToOne
    @JoinColumn(name = "user_id") // Foreign key to the Users table
    private User userId; // User associated with the cart detail

    @ManyToOne
    @JoinColumn(name = "product_id") // Foreign key to the Products table
    private Product product; // Product associated with the cart detail

    private Integer quantity; // Quantity of the product in the cart

    // No need for explicit getters and setters due to @Data annotation from Lombok
}
