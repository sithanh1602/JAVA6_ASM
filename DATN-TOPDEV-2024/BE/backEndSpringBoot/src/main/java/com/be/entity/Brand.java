package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Brands")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long brandsId;

    private String name;
    private String contactInfo;
    private String image;


}
