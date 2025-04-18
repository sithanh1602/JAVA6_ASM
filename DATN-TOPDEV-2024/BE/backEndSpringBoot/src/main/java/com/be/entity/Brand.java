package com.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Entity
@Table(name = "Brands", uniqueConstraints = {
        @UniqueConstraint(columnNames = "name", name = "UK_brand_name")
})
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long brandsId;

    @NotBlank(message = "Tên thương hiệu không được để trống")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Thông tin liên lạc không được để trống")
    @Column(nullable = false)
    private String contactInfo;

    @NotBlank(message = "Hình ảnh không được để trống")
    @Column(nullable = false)
    private String image;


}
