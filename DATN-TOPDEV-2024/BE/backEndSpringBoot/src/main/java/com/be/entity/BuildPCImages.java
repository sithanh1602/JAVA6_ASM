package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Build_PC_Images")
public class BuildPCImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "build_id", nullable = false)
    private BuildPC buildPC;

    @Column(name = "image_url")
    private String imageUrl;
}