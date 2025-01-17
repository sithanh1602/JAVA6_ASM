package com.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;


import java.util.Date;
import java.util.Set;

@Data
@Entity
@Table(name = "Products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @NotNull(message = "Category must not be null")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "brands_id")
    @NotNull(message = "Brand must not be null")
    private Brand brand;

    @Column(columnDefinition = "NVARCHAR(255)")
    @NotBlank(message = "Name must not be blank")
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;
    @Column(columnDefinition = "NVARCHAR(255)")

    @Min(value = 0, message = "Stock must be greater than or equal to 0")
    private Integer stock;


    private String imageUrl;

    private Date createdAt;

    @Column(columnDefinition = "NVARCHAR(50)")
    @NotBlank(message = "Status must not be blank")
    private String status;

    // Add new column for purchase count
    @Column(name = "purchase_count", nullable = false)
    private int purchaseCount ; // Default value is 0
    // getters and setters

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ProductVariant> productVariants; // Đảm bảo bạn có thuộc tính này

}
