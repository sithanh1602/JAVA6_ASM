package com.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
@Table(name="post_categories")
public class PostCategories {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name="name")
    @NotBlank(message = "name is required")
    private String name;

    @Column(name = "description")
    @NotBlank(message = "description is required")
    private String description;
}
