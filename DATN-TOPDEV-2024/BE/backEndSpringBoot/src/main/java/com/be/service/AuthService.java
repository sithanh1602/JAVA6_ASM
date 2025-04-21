package com.be.service;

import com.be.dto.Response;
import com.be.dto.login.AuthResponse;
import com.be.dto.login.LoginRequest;
import com.be.dto.register.RegisterRequest;
import com.be.dto.register.RegisterResponse;
import com.be.entity.Role;
import com.be.entity.User;
import com.be.rep.RoleRepository;
import com.be.rep.UserRepository;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service

public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtTokenService jwtTokenService;
    private final EmailValidationService emailValidationService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final RoleRepository roleRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService,
                       UserRepository userRepository,
                       JwtTokenService jwtTokenService, EmailValidationService emailValidationService, PasswordEncoder passwordEncoder, OtpService otpService, EmailService emailService, RoleRepository roleRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.jwtTokenService = jwtTokenService;
        this.emailValidationService = emailValidationService;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
        this.roleRepository = roleRepository;
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            Optional<User> userOptional = userRepository.findByUserName(request.getUsername());
            User user = userOptional.orElseThrow(() ->
                    new BadCredentialsException("User not found"));
            if ("Inactive".equalsIgnoreCase(user.getStatus())) {
                throw new IllegalStateException("Account is locked");
            }
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            String token = jwtTokenService.generateToken(user, roles);
            logger.info("User {} logged in successfully", request.getUsername());
            return new AuthResponse(token, user.getUserId(), user.getUserName(), user.getFullName(), user.getPhone(), roles);
        } catch (BadCredentialsException e) {
            logger.warn("Invalid login attempt for username: {}", request.getUsername());
            throw e;
        } catch (IllegalStateException e) {
            logger.warn("Login failed for username: {}. Reason: {}", request.getUsername(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during login for username: {}", request.getUsername(), e);
            throw new RuntimeException("An error occurred during login");
        }
    }

    // Xử lý đăng ký
    public Response<RegisterResponse> handleRegister(RegisterRequest request) {
        // Kiểm tra email hợp lệ
        if (!emailValidationService.isEmailValid(request.getEmail())) {
            throw new IllegalArgumentException("Email không hợp lệ hoặc không thể gửi được!");
        }
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();

            // Nếu tài khoản chưa xác thực (PENDING)
            if ("PENDING".equalsIgnoreCase(existingUser.getStatus())) {

                // Nếu email và username trùng, cho phép gửi lại OTP
                if (existingUser.getUserName().equals(request.getUserName())) {
                    updateUnverifiedUser(existingUser, request); // Cập nhật lại thông tin và gửi lại OTP
                    return ResponseEntity.ok(Response.success(new RegisterResponse(request.getUserName(), request.getEmail(), "Tài khoản đã tồn tại nhưng chưa xác thực. Đã gửi lại OTP."), "Tài khoản đã tồn tại nhưng chưa xác thực.")).getBody();
                } else {
                    // Nếu email trùng nhưng username khác, báo lỗi trùng username
                    throw new IllegalArgumentException("Username đã tồn tại với email khác, vui lòng chọn tên khác.");
                }

            } else if ("ACTIVE".equalsIgnoreCase(existingUser.getStatus())) {
                // Nếu email đã xác thực (ACTIVE), không cho phép đăng ký lại
                throw new IllegalArgumentException("Email đã được xác thực, không thể đăng ký lại.");
            }
        }

        // Nếu email chưa tồn tại trong hệ thống, tạo mới tài khoản
        createNewUser(request);
        return ResponseEntity.ok(Response.success(new RegisterResponse(request.getUserName(), request.getEmail(), "Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP."), "Đăng ký thành công.")).getBody();
    }

    private void updateUnverifiedUser(User user, RegisterRequest req) {
        // Không cho phép cập nhật username và password khi trạng thái là PENDING
        if ("PENDING".equalsIgnoreCase(user.getStatus())) {
            user.setFullName(req.getFullName());
            user.setPhone(req.getPhone());
            user.setStatus("PENDING");
            user.setRegistrationDate(new Date());

            // Tạo OTP mới và thời gian hết hạn
            String otp = otpService.generateOtp();
            user.setOtpSms(otp);
            user.setOtpExpiredAt(otpService.getOtpExpiredTime());

            // Lưu lại và gửi OTP
            userRepository.save(user);
            try {
                emailService.sendOtpEmail(user.getEmail(), otp);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }
    }


    // Tạo mới tài khoản người dùng
    private void createNewUser(RegisterRequest req) {
        User user = new User();
        user.setEmail(req.getEmail());
        user.setUserName(req.getUserName());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        user.setStatus("PENDING");
        user.setRegistrationDate(new Date());

        String otp = otpService.generateOtp();
        user.setOtpSms(otp);
        user.setOtpExpiredAt(otpService.getOtpExpiredTime());

        // Gán role mặc định
        Role role = roleRepository.findByRoleName("USER");
        user.getRoles().add(role);

        userRepository.save(user);
        try {
            emailService.sendOtpEmail(user.getEmail(), otp);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    // Xác thực OTP
    public ResponseEntity<Response<String>> verifyOtp(String email, String otp) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Response.error("Không tìm thấy tài khoản với email này."));
        }

        User user = optionalUser.get();

        if (!user.getOtpSms().equals(otp)) {
            return ResponseEntity.badRequest().body(Response.error("OTP không đúng."));
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiredAt())) {
            user.setOtpSms(null);
            user.setOtpExpiredAt(null);
            userRepository.save(user);
            return ResponseEntity.badRequest().body(Response.error("Mã OTP đã hết hạn. Vui lòng gửi lại."));
        }

        user.setStatus("ACTIVE");
        user.setOtpSms(null); // Xóa OTP sau khi dùng
        user.setOtpExpiredAt(null);
        userRepository.save(user);

        return ResponseEntity.ok(Response.success("Xác thực email thành công. Tài khoản đã được kích hoạt.", "Xác thực thành công."));
    }

    // Gửi lại OTP
    public ResponseEntity<Response<String>> resendOtp(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Response.error("Không tìm thấy tài khoản với email này."));
        }

        User user = optionalUser.get();

        if ("ACTIVE".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.badRequest().body(Response.error("Tài khoản đã xác thực."));
        }

        // Gửi lại OTP mới
        String otp = otpService.generateOtp();
        user.setOtpSms(otp);
        user.setOtpExpiredAt(otpService.getOtpExpiredTime());
        userRepository.save(user);
        try {
            emailService.sendOtpEmail(user.getEmail(), otp);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }

        return ResponseEntity.ok(Response.success("Đã gửi lại mã OTP. Vui lòng kiểm tra email.", "Gửi lại OTP thành công."));
    }

    // Trong AuthService.java

    // Phương thức xử lý quên mật khẩu (gửi OTP)
    public ResponseEntity<Response<String>> forgotPassword(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Response.error("Không tìm thấy tài khoản với email này."));
        }

        User user = optionalUser.get();

        // Tạo OTP mới
        String otp = otpService.generateOtp();
        user.setOtpSms(otp);
        user.setOtpExpiredAt(otpService.getOtpExpiredTime());
        userRepository.save(user);

        // Gửi OTP qua email
        try {
            emailService.sendOtpEmail(email, otp);
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body(Response.error("Không thể gửi email. Vui lòng thử lại sau."));
        }

        return ResponseEntity.ok(Response.success("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.", "Gửi OTP thành công."));
    }

    // Phương thức xác minh OTP cho quên mật khẩu
    public ResponseEntity<Response<String>> verifyOtpForPassword(String email, String otpCode) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Response.error("Không tìm thấy tài khoản với email này."));
        }

        User user = optionalUser.get();

        if (!user.getOtpSms().equals(otpCode)) {
            return ResponseEntity.badRequest().body(Response.error("Mã OTP không chính xác."));
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiredAt())) {
            user.setOtpSms(null);
            user.setOtpExpiredAt(null);
            userRepository.save(user);
            return ResponseEntity.badRequest().body(Response.error("Mã OTP đã hết hạn. Vui lòng gửi lại."));
        }

        // Không xóa OTP ngay lập tức, vì cần để người dùng đặt lại mật khẩu
        // Chỉ đánh dấu là đã xác minh thành công
        return ResponseEntity.ok(Response.success("Xác minh OTP thành công. Vui lòng đặt lại mật khẩu mới.", "Xác minh thành công."));
    }

    // Phương thức đặt lại mật khẩu sau khi xác minh OTP
    public ResponseEntity<Response<String>> resetPassword(String email, String newPassword) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Response.error("Không tìm thấy tài khoản với email này."));
        }

        User user = optionalUser.get();

        // Kiểm tra xem người dùng đã xác minh OTP chưa
        if (user.getOtpSms() == null || user.getOtpExpiredAt() == null) {
            return ResponseEntity.badRequest().body(Response.error("Bạn cần xác minh OTP trước khi đặt lại mật khẩu."));
        }

        // Kiểm tra OTP còn hiệu lực
        if (LocalDateTime.now().isAfter(user.getOtpExpiredAt())) {
            user.setOtpSms(null);
            user.setOtpExpiredAt(null);
            userRepository.save(user);
            return ResponseEntity.badRequest().body(Response.error("Phiên làm việc đã hết hạn. Vui lòng bắt đầu lại quy trình quên mật khẩu."));
        }

        // Đặt lại mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        // Xóa OTP sau khi đã đặt lại mật khẩu thành công
        user.setOtpSms(null);
        user.setOtpExpiredAt(null);
        userRepository.save(user);

        return ResponseEntity.ok(Response.success("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.", "Đặt lại mật khẩu thành công."));
    }


}
