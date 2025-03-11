package com.be.dto;

import lombok.Data;

@Data
public class AttributeDTO {
    private Long id;
    private String name;
    private String value;

    public AttributeDTO(Long id, String name, String value) {
        this.id = id;
        this.name = name;
        this.value = value;
    }
}
