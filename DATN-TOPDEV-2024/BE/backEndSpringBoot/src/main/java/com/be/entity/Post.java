package com.be.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
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
    @Column(name = "create_at", nullable = false)
    private LocalDateTime createAt;

    @Column(name = "image", columnDefinition = "NVARCHAR(255)")
    private String image;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        this.createAt = LocalDateTime.now();
    }

}
