package com.be.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private Boolean status;
    private LocalDateTime createAt;
    private String slug;
    private String tags;
    private String categoryName;

    private UserInfoDTO user;
    private List<ImageDTO> images;

    public PostDTO(Long id, String title, String content, Boolean status,
                   LocalDateTime createAt, String slug, String tags,
                   String categoryName, UserInfoDTO user, List<ImageDTO> images) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.status = status;
        this.createAt = createAt;
        this.slug = slug;
        this.tags = tags;
        this.categoryName = categoryName;
        this.user = user;
        this.images = images;
    }

}
