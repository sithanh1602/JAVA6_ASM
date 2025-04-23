package com.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name="post_images")
public class PostImages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id" )
    @JsonIgnore
    private Post post;

    @Column(name="image_url")
    private String imageUrl;

    public PostImages(Post post, String imageUrl) {
        this.post = post;
        this.imageUrl = imageUrl;
    }

    public PostImages() {

    }
}
