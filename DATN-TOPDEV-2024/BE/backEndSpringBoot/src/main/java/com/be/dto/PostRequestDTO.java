package com.be.dto;

import com.be.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PostRequestDTO {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Category is required")
    private Long postCategoriesId;

    @NotNull(message = "User is required")
    private User user;

    private List<Long> tagIds;
    private List<String> imageUrls;
    private Boolean status;
}