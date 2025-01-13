package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Attributes")
public class Attribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "name", columnDefinition = "NVARCHAR(255)", nullable = false)
    private String name;
    @Column(name = "value", columnDefinition = "NVARCHAR(MAX)", nullable = true)
    private String value;
}
