    package com.be.dto;

    import lombok.Data;
    import java.time.LocalDateTime;
    import java.util.List;

    @Data
    public class BuildPCResponseDTO {
        private Long buildId; // 🔥 Thêm buildId vào DTO
        private String buildName;
        private Double totalPrice;
        private String usagePurpose;
        private String description;
        private String status;
        private LocalDateTime createdDate;
        private List<BuildPCProductVariantDTO> buildPCProductVariants;
        private List<String> imageUrls;
        private String image;
        private int totalProducts;
    }
