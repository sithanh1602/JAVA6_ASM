package com.be.controller;

import com.be.dto.login.LoginRequest;
import com.be.dto.login.AuthResponse;
import com.be.dto.Response;
import com.be.dto.register.RegisterRequest;
import com.be.dto.register.RegisterResponse;
import com.be.entity.Role;
import com.be.entity.User;
import com.be.service.AuthService;

import com.be.service.JwtTokenService;
import com.be.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;


import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private  AuthService authService;


    @PostMapping("/login")
    public Response<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return Response.success(authResponse,"login success");
    }

    // Endpoint để đăng ký tài khoản
    @PostMapping("/register")
    public Response<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
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
