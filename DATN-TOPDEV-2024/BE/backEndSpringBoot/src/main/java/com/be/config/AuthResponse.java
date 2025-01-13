package com.be.config;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token; // Token JWT trả về
    private Long userId;
    List<String> roles;
}
