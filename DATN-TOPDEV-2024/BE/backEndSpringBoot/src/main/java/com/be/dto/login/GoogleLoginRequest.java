package com.be.dto.login;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Credential is required")
    private String credential;

    @NotBlank(message = "Client ID is required")
    private String clientId;
}
