package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "Contact")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID tự tăng

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName; // Họ tên

    @Column(name = "email", length = 100, nullable = false)
    private String email; // Email

    @Column(name = "phone", length = 11, nullable = false)
    private String phone; // Số điện thoại

    @Column(name = "subject", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String subject; // Chủ đề

    @Column(name = "message", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String message; // Nội dung

    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private Date createdAt; // Thời gian tạo

    @Column(name = "status", nullable = false)
    private boolean status = false; // Trạng thái (false = Chưa xử lý, true = Đã xử lý)
}
