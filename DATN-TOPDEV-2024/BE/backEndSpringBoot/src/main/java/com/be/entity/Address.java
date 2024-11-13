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
    @JoinColumn(name = "id_user")
    private User user;
    
    private String address;
    
    private String wardCode;
    
    private String districtId;
    
    private String provinceId;
    
    private String phone;
    
    private Boolean defaults;
    
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String fullAddress;
    
    // Getters and Setters
}
