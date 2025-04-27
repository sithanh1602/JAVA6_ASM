package com.be.controller;

import com.be.dto.login.GoogleLoginRequest;
import com.be.dto.login.LoginRequest;
import com.be.dto.login.AuthResponse;
import com.be.dto.Response;
import com.be.dto.register.RegisterRequest;
import com.be.dto.register.RegisterResponse;
import com.be.service.AuthService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

    @RestController
    @RequestMapping("/api/auth")
    public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

        @PostMapping("/login")
        public Response<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response  ) {

            AuthResponse authResponse = authService.login(request);
            if (request.isRememberMe() && authResponse.getRefreshToken() != null) {
                Cookie refreshTokenCookie = new Cookie("refreshToken", authResponse.getRefreshToken());
                refreshTokenCookie.setHttpOnly(true);
                refreshTokenCookie.setSecure(true);
                refreshTokenCookie.setPath("/");
                refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);
                response.addCookie(refreshTokenCookie);
            }
            return Response.success(authResponse, "login success");
        }
        @PostMapping("/refresh-token")
        public Response<AuthResponse> refreshToken(HttpServletRequest request) {
            String refreshToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> "refreshToken".equals(cookie.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElseThrow(() -> new RuntimeException("Refresh token not found"));

            AuthResponse authResponse = authService.refreshToken(refreshToken);
            return Response.success(authResponse, "token refreshed");
        }

        @PostMapping("/logout")
        public Response<String> logout(HttpServletRequest request, HttpServletResponse response) {
            String refreshToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> "refreshToken".equals(cookie.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);

            if (refreshToken != null) {
                Cookie refreshTokenCookie = new Cookie("refreshToken", null);
                refreshTokenCookie.setHttpOnly(true);
                refreshTokenCookie.setSecure(true);
                refreshTokenCookie.setPath("/");
                refreshTokenCookie.setMaxAge(0);
                response.addCookie(refreshTokenCookie);
            }

            return Response.success("Logout successful", "logout success");
        }
    @PostMapping("/google")
    public Response<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        return authService.googleLogin(request);
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
