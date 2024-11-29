package com.be.controller;

import com.be.config.AuthResponse;
import com.be.entity.Role;
import com.be.entity.User;
import com.be.rep.RoleRepository;
import com.be.rep.UserRepository;
import com.be.service.UserService;
import com.be.utills.JwtUtil;
import com.vonage.client.VonageClient;
import com.vonage.client.sms.MessageStatus;
import com.vonage.client.sms.SmsSubmissionResponse;
import com.vonage.client.sms.messages.TextMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.GrantedAuthority;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;



    // Thêm các thông tin API của Vonage
    @Value("${vonage.api_key}")
    private String vonageApiKey;

    @Value("${vonage.api_secret}")
    private String vonageApiSecret;

    // Tạm thời lưu trữ người dùng trước khi xác minh OTP
    private Map<String, User> temporaryUsers = new HashMap<>();
    // Khai báo Map lưu trữ OTP tạm thời
    private Map<String, String> temporaryOtpMap = new HashMap<>();
    @Autowired
    private UserService userService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            // Find the user by username
            Optional<User> existingUser = userRepository.findByUserName(user.getUserName());
            if (!existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc mật khẩu không đúng");
            }

            // Get the user from the database
            User storedUser = existingUser.get();

            // Check if the user status is "Inactive"
            if ("Inactive".equalsIgnoreCase(storedUser.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản của bạn đang bị khóa");
            }

            String rawPassword = new String(Base64.getDecoder().decode(user.getPassword()));

            // Compare the password in the database with the raw password
            if (!passwordEncoder.matches(rawPassword, storedUser.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc mật khẩu không đúng");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(), rawPassword)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUserName());

            // Get the list of roles for the user
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            // Generate the token with username, roles, and userId
            final String jwt = jwtUtil.generateToken(userDetails.getUsername(), roles, storedUser.getUserId());
            return ResponseEntity.ok(new AuthResponse(jwt, storedUser.getUserId()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc mật khẩu không đúng");
        }
    }




    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        try {
            // Kiểm tra xem tên tài khoản đã tồn tại hay chưa
            if (userRepository.findByUserName(user.getUserName()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên tài khoản đã tồn tại");
            }

            // Kiểm tra xem email đã tồn tại hay chưa
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email đã được sử dụng");
            }

            // Mã hóa mật khẩu
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRegistrationDate(new Date());

            // Thiết lập vai trò mặc định là USER
            Role userRole = roleRepository.findByRoleName("USER")
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò USER"));
            user.setRoles(Collections.singleton(userRole));

            // Tạo mã OTP ngẫu nhiên
            String otpCode = String.format("%06d", new Random().nextInt(999999));
            user.setOtpSms(otpCode); // Lưu mã OTP vào đối tượng User

            // Định dạng số điện thoại cho Việt Nam
            String formattedPhone = user.getPhone().startsWith("0") ?
                    "+84" + user.getPhone().substring(1) : user.getPhone();

            // Gửi mã OTP đến số điện thoại người dùng
            VonageClient client = VonageClient.builder().apiKey(vonageApiKey).apiSecret(vonageApiSecret).build();
            TextMessage message = new TextMessage("Vonage", formattedPhone, "Mã OTP của bạn là: " + otpCode);
            SmsSubmissionResponse response = client.getSmsClient().submitMessage(message);

            if (response.getMessages().get(0).getStatus() == MessageStatus.OK) {
                System.out.println("Tin nhắn đã được gửi thành công!");
            } else {
                System.out.println("Lỗi: " + response.getMessages().get(0).getErrorText());
            }

            // Lưu người dùng tạm thời trong bộ nhớ
            temporaryUsers.put(user.getUserName(), user);

            return ResponseEntity.ok("Đăng ký thành công! Vui lòng kiểm tra điện thoại để xác nhận mã OTP.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam String userName, @RequestParam String otpCode) {
        User user = temporaryUsers.get(userName);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Người dùng không tồn tại hoặc đã hết hạn");
        }

        // Kiểm tra mã OTP
        if (user.getOtpSms().equals(otpCode)) {
            user.setOtpSms(null); // Xóa mã OTP sau khi xác minh thành công

            // Lưu người dùng vào cơ sở dữ liệu
            userRepository.save(user);
            temporaryUsers.remove(userName); // Xóa người dùng khỏi bộ nhớ tạm thời

            return ResponseEntity.ok("Xác minh thành công! Tài khoản đã được tạo.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã OTP không chính xác");
        }
    }

    // Phương thức gửi email OTP khi người dùng quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email"); // Lấy email từ body

        if (email == null || email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email không được để trống.");
        }

        try {
            // Kiểm tra email có tồn tại trong hệ thống
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (!userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email không tồn tại.");
            }

            // Tạo mã OTP ngẫu nhiên
            String otpCode = String.format("%06d", new Random().nextInt(999999));

            // Lưu mã OTP tạm thời cho email này
            temporaryOtpMap.put(email, otpCode);

            // Gửi email chứa OTP
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Mã OTP lấy lại mật khẩu");
            message.setText("Mã OTP của bạn là: " + otpCode);
            mailSender.send(message);

            return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }



    // Phương thức xác minh OTP
    @PostMapping("/verify-otp-for-password")
    public ResponseEntity<String> verifyOtpForPassword(@RequestParam String email, @RequestParam String otpCode) {
        // Kiểm tra mã OTP có hợp lệ không
        String storedOtp = temporaryOtpMap.get(email);
        if (storedOtp == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã OTP đã hết hạn hoặc không hợp lệ.");
        }

        if (storedOtp.equals(otpCode)) {
            // Xóa mã OTP sau khi xác minh thành công
            temporaryOtpMap.remove(email);

            return ResponseEntity.ok("Mã OTP chính xác! Bạn có thể đặt lại mật khẩu mới.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã OTP không chính xác.");
        }
    }

    // Phương thức cập nhật mật khẩu mới sau khi xác minh OTP
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (!userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email không tồn tại.");
            }

            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword)); // Mã hóa mật khẩu mới
            userRepository.save(user); // Lưu mật khẩu mới vào cơ sở dữ liệu

            return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/google-success")
    public Map<String, Object> currentUser(OAuth2AuthenticationToken oAuth2AuthenticationToken){
        return oAuth2AuthenticationToken.getPrincipal().getAttributes();
    }

}
