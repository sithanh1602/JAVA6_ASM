package com.be.controller;

import com.be.dto.login.LoginRequest;
import com.be.dto.login.AuthResponse;
import com.be.dto.Response;
import com.be.dto.register.RegisterRequest;
import com.be.dto.register.RegisterResponse;
import com.be.service.AuthService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {


    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Response<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return Response.success(authResponse,"login success");
    }


    // Endpoint để đăng ký tài khoản
    @PostMapping("/register")
    public Response<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) throws MessagingException {
        return authService.handleRegister(request);
    }

    // Endpoint để xác thực OTP
    @PostMapping("/verifyOtp")
    public ResponseEntity<Response<String>> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        return authService.verifyOtp(email, otp);
    }

    // Endpoint để gửi lại OTP
    @PostMapping("/resendOtp")
    public ResponseEntity<Response<String>> resendOtp(@RequestParam String email) {
        return authService.resendOtp(email);
    }

}
