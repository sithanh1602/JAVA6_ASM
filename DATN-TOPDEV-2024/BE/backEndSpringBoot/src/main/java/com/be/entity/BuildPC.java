package com.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "Build_PC")
public class BuildPC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "build_id")
    private Long buildId;

    @Column(name = "build_name")
    private String buildName;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "usage_purpose")
    private String usagePurpose;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @OneToMany(mappedBy = "buildPC", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore  // 🔥 Thêm dòng này để tránh lỗi vòng lặp JSON
    private List<BuildPCProductVariant> buildPCProductVariants;

    @OneToMany(mappedBy = "buildPC", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore  // 🔥 Thêm dòng này để tránh lỗi vòng lặp JSON
    private List<BuildPCImages> buildPCImages;

}