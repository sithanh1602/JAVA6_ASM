package com.be.dto;

import lombok.Data;

@Data
public class ImageDTO {
    private Long id;
    private String url;

    public ImageDTO(Long id, String url) {
        this.id = id;
        this.url = url;
    }
}
