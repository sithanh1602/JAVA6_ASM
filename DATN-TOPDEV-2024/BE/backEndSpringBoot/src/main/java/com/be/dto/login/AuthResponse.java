package com.be.dto.login;



import lombok.Data;

import java.util.List;

@Data
public class  AuthResponse {
    private String token; // Token JWT trả về
    private String userId;
    private String userName;
    private String fullName;
    private String phone;
    List<String> roles;
    private String refreshToken; // Thêm refresh token


    public AuthResponse(String token, String userId, String userName, String fullName, String phone, List<String> roles, String refreshToken) {
        this.token = token;
        this.userId = userId;
        this.userName = userName;
        this.fullName = fullName;
        this.phone = phone;
        this.roles = roles;
        this.refreshToken = refreshToken;
    }

    public AuthResponse(String token, String userId, String userName, String fullName, String phone, List<String> roles ) {
        this.token = token;
        this.userId = userId;
        this.userName = userName;
        this.fullName = fullName;
        this.phone = phone;
        this.roles = roles;

    }

}
