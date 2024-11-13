package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "address_id")
    private Address address;
    
    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;
    
    private LocalDateTime orderDate;
    
    private Integer totalPrice;
    
    private Integer status;
    
    private Boolean paymentStatus;
    
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String fullAddress;
    
    // Getters and Setters
}
