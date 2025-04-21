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

import java.util.Map;

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

    // Endpoint để xử lý quên mật khẩu (gửi OTP)
    @PostMapping("/forgot-password")
    public ResponseEntity<Response<String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        return authService.forgotPassword(email);
    }

    // Endpoint để xác minh OTP khi quên mật khẩu
    @PostMapping("/verify-otp-for-password")
    public ResponseEntity<Response<String>> verifyOtpForPassword(
            @RequestParam String email,
            @RequestParam String otpCode) {
        return authService.verifyOtpForPassword(email, otpCode);
    }

    // Endpoint để đặt lại mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<Response<String>> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword) {
        return authService.resetPassword(email, newPassword);
    }
}
