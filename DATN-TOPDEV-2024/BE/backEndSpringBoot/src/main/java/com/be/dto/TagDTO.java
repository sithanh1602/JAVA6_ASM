package com.be.dto;

import lombok.Data;

@Data
public class TagDTO {
    private Long id;
    private String name;
    private String description;




    public TagDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}
