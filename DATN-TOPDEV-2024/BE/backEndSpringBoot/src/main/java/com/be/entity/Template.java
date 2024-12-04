package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "templates")
public class Template {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private byte[] fileContent;

}
