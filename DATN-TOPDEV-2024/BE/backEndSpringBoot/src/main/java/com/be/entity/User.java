package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "users") // Ánh xạ tới bảng 'users'
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long userId;

        @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "phone")
    private String phone;

    @Column(name = "registration_date")
    private Date registrationDate;

    @Column(name = "total_spent")
    private Double totalSpent;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "otp_sms", nullable = true)
    private String otpSms;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String status;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String image;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "User_Role", // Bảng liên kết giữa user và roles
            joinColumns = @JoinColumn(name = "user_id"), // Khóa chính của bảng users
            inverseJoinColumns = @JoinColumn(name = "role_id") // Khóa chính của bảng roles
    )
    private Set<Role> roles = new HashSet<>();


}
