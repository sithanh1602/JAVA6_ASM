package com.be.dto.login;

import lombok.Data;

@Data
public class Auth0CallbackRequest {
    private String getAccessToken;
}
