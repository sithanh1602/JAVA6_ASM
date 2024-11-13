package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "Products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "brands_id")
    private Brand brand;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String name;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;
    private int stock;
    private String imageUrl;
    private Date createdAt;
    private int price;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String status;


    // getters and setters
}
