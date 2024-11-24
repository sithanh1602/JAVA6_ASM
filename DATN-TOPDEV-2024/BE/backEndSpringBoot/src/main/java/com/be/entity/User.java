package com.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long userId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(name = "email", nullable = false)
    private String email;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @Column(name = "password", nullable = false)
    private String password;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    @Column(name = "phone")
    private String phone;

    @Column(name = "registration_date")
    private Date registrationDate;

    @PositiveOrZero(message = "Total spent cannot be negative")
    @Column(name = "total_spent")
    private Double totalSpent;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(name = "user_name", nullable = false)
    private String userName;

    @Size(max = 6, message = "OTP must not exceed 6 characters")
    @Column(name = "otp_sms", nullable = true)
    private String otpSms;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String image;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "User_Role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}