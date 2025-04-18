package com.be.dto.login;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token; // Token JWT trả về
    private Long userId;
    private String userName;
    private String fullName;
    private String phone;
    List<String> roles;


    public AuthResponse(String token, Long userId, @NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String userName, String password) {
    }
}
