package com.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "Posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @NotBlank(message = "Title is required")
    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @NotBlank(message = "Content is required")
    @Column(name = "content", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @Column(name = "status", nullable = false)
    private Boolean status = true; // Mặc định là bài viết đã được đăng

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "create_at", updatable = false)
    private Date createAt;

    @Column(name = "image", columnDefinition = "NVARCHAR(255)")
    private String image;

    // Set thời gian mặc định khi tạo bài viết
    @PrePersist
    protected void onCreate() {
        this.createAt = new Date();
    }
}
