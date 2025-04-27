package com.be.service;

import com.be.dto.Response;
import com.be.dto.login.AuthResponse;
import com.be.dto.login.GoogleLoginRequest;
import com.be.dto.login.LoginRequest;
import com.be.dto.register.RegisterRequest;
import com.be.dto.register.RegisterResponse;
import com.be.entity.Role;
import com.be.entity.User;
import com.be.rep.RoleRepository;
import com.be.rep.UserRepository;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.mail.MessagingException;

import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    @Autowired
    private  AuthenticationManager authenticationManager;
    @Autowired
    private  UserDetailsService userDetailsService;
    @Autowired
    private  UserRepository userRepository;
    @Autowired
    private  JwtTokenService jwtTokenService;
    @Autowired
    private  EmailValidationService emailValidationService;
    @Autowired
    private  PasswordEncoder passwordEncoder;
    @Autowired
    private  OtpService otpService;
    @Autowired
    private  EmailService emailService;
    @Autowired
    private  RoleRepository roleRepository;
    @Autowired
    private  GoogleIdTokenVerifier verifier;
    @Autowired
    private  HttpSession httpSession;

    @Value("${google.client-id}")
    private String googleClientId;


    public AuthResponse login(LoginRequest request ) {

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
            String refreshToken = request.isRememberMe() ? jwtTokenService.generateRefreshToken(user) : null;
            logger.info("User {} logged in successfully", request.getUsername());
            return new AuthResponse(token, user.getUserId().toString(), user.getUserName(), user.getFullName(), user.getPhone(), roles, refreshToken);
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

    // Xử lý refresh token
    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtTokenService.validateRefreshToken(refreshToken);
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        List<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toList());

        String newAccessToken = jwtTokenService.generateToken(user, roles);

        return new AuthResponse(newAccessToken, user.getUserId().toString(), user.getUserName(), user.getFullName(), user.getPhone(), roles, refreshToken);
    }
    // Xử lý đăng ký
    public Response<RegisterResponse> handleRegister(RegisterRequest request) {
        // Kiểm tra email hợp lệ
        if (!emailValidationService.isEmailValid(request.getEmail())) {
            throw new IllegalArgumentException("Email không hợp lệ hoặc không thể gửi được!");
        }
        // Validate password and confirmPassword match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu và xác nhận mật khẩu không khớp.");
        }
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();

            // Nếu tài khoản chưa xác thực (PENDING)
            if ("Pending".equalsIgnoreCase(existingUser.getStatus())) {

                // Nếu email và username trùng, cho phép gửi lại OTP
                if (existingUser.getUserName().equals(request.getUserName())) {
                    updateUnverifiedUser(existingUser, request); // Cập nhật lại thông tin và gửi lại OTP
                    return ResponseEntity.ok(Response.success(new RegisterResponse(request.getUserName(), request.getEmail(), "Tài khoản đã tồn tại nhưng chưa xác thực. Đã gửi lại OTP."), "Tài khoản đã tồn tại nhưng chưa xác thực.")).getBody();
                } else {
                    // Nếu email trùng nhưng username khác, báo lỗi trùng username
                    throw new IllegalArgumentException("Username đã tồn tại với email khác, vui lòng chọn tên khác.");
                }

            } else if ("Active".equalsIgnoreCase(existingUser.getStatus())) {
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
        if ("Pending".equalsIgnoreCase(user.getStatus())) {
            user.setFullName(req.getFullName());
            user.setPhone(req.getPhone());
            user.setStatus("Pending");
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
        user.setStatus("Pending");
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

        user.setStatus("Active");
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

        if ("Active".equalsIgnoreCase(user.getStatus())) {
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

    public Response<AuthResponse> googleLogin(GoogleLoginRequest request) {
        try {
            // Kiểm tra clientId từ frontend
            if (!request.getClientId().equals(googleClientId)) {
                logger.warn("Client ID không hợp lệ: {}", request.getClientId());
                return Response.error("Client ID không hợp lệ");
            }

            // Xác minh token Google, sử dụng googleClientId từ cấu hình
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken == null) {
                logger.warn("Token Google không hợp lệ");
                return Response.error("Token Google không hợp lệ");
            }

            // Lấy thông tin người dùng từ payload
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String fullName = (String) payload.get("name");
            String googleId = payload.getSubject(); // ID duy nhất của Google

            // Tìm người dùng theo email
            Optional<User> optionalUser = userRepository.findByEmail(email);
            User user;
            List<String> roles;

            if (optionalUser.isPresent()) {
                user = optionalUser.get();
                // Kiểm tra tài khoản bị khóa
                if ("Inactive".equalsIgnoreCase(user.getStatus())) {
                    logger.warn("Tài khoản {} bị khóa", email);
                    return Response.error("Account is locked");
                }
                // Cập nhật googleId nếu chưa có
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    userRepository.save(user);
                }
                // Lấy vai trò
                roles = user.getRoles().stream()
                        .map(Role::getRoleName)
                        .collect(Collectors.toList());
                if (roles.contains("ADMIN")) {
                    logger.warn("Tài khoản {} có vai trò ADMIN, không được phép đăng nhập bằng Google", email);
                    return Response.error("Tài khoản admin không được phép đăng nhập bằng Google");
                }
            } else {
                // Tạo người dùng mới
                user = new User();
                user.setEmail(email);
                user.setUserName(email); // Hoặc tạo username từ email
                user.setFullName(fullName);
                user.setGoogleId(googleId);
                user.setStatus("Active"); // Kích hoạt ngay, không cần OTP
                user.setRegistrationDate(new Date());
                // Gán vai trò USER
                Role role = roleRepository.findByRoleName("USER");
                if (role == null) {
                    logger.error("Vai trò USER không tồn tại");
                    return Response.error("Không thể gán vai trò cho người dùng");
                }
                user.getRoles().add(role);
                userRepository.save(user);
                roles = Collections.singletonList("USER");
            }

            // Tạo token JWT nội bộ
            String token = jwtTokenService.generateToken(user, roles);
            logger.info("token: {}", token);
            // Tạo phản hồi
            AuthResponse authResponse = new AuthResponse(
                    token,
                    user.getUserId().toString(),
                    user.getUserName(),
                    user.getFullName(),
                    user.getPhone(),
                    roles);

            logger.info("Đăng nhập Google thành công cho email: {}", email);

            logger.info("authResponse: {}", authResponse);
            return Response.success(authResponse, "Google login successful");
        } catch (Exception e) {
            logger.error("Lỗi khi xử lý đăng nhập Google: {}", e.getMessage(), e);
            return Response.error("Đăng nhập Google thất bại: " + e.getMessage());
        }
    }


}
