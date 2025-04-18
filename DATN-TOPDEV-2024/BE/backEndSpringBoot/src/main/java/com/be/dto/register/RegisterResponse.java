package com.be.dto.register;

import lombok.Data;

@Data
public class RegisterResponse {

    private String userName;
    private String email;
    private String message;

    public RegisterResponse(String userName, String email, String message) {
        this.userName = userName;
        this.email = email;
        this.message = message;
    }
}
