package com.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "Categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Category name is required")
    @NotNull(message = "Category name cannot be null")
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    @NotBlank(message = "Description is required")
    @NotNull(message = "Description cannot be null")
    private String description;

    @NotBlank(message = "Image URL is required")
    @NotNull(message = "Image URL cannot be null")
    private String image;

    @Column(name = "id_build", nullable = false, columnDefinition = "int")
    private int id_build;
}