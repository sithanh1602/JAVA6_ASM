package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Address")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAddress;

    @ManyToOne
    @JoinColumn(name = "id_user") // Khóa ngoại đến bảng User
    private User user;

    @Column(name = "street") // Tên cột đổi từ 'address' thành 'street'
    private String street;

    @Column(name = "ward") // Tên cột đổi từ 'wardCode' thành 'ward'
    private String ward;

    @Column(name = "district") // Tên cột đổi từ 'districtId' thành 'district'
    private String district;

    @Column(name = "province") // Tên cột đổi từ 'provinceId' thành 'province'
    private String province;

    private String phone;

    private Boolean defaults;

    @Column(name = "full_address", columnDefinition = "NVARCHAR(MAX)")
    private String fullAddress;
}
