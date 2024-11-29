package com.be.service;

import com.be.entity.Role;
import com.be.entity.User;
import com.be.rep.RoleRepository;
import com.be.rep.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Phương thức đăng ký người dùng với mật khẩu mặc định "123"
    public User register(User user) {
        // Kiểm tra xem người dùng đã tồn tại chưa
        if (userRepository.findByUserName(user.getUserName()).isPresent()) {
            throw new RuntimeException("Tên tài khoản đã tồn tại");
        }

        // Gán mật khẩu mặc định là "123" và mã hóa mật khẩu đó
        String defaultPassword = "123";
        user.setPassword(passwordEncoder.encode(defaultPassword));

        // Lưu người dùng với mật khẩu đã mã hóa
        return userRepository.save(user);
    }

    // Phương thức lưu người dùng với mật khẩu mã hóa
    public void saveUser(User user) {
        // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public List<User> getTopCustomers(int limit) {
        return userRepository.findTopCustomers(PageRequest.of(0, limit));
    }

    // Phương thức lấy tất cả người dùng
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Phương thức lấy người dùng theo ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // Phương thức tạo một người dùng mới
    public User createUser(User user) {
        // Kiểm tra nếu mật khẩu là null hoặc trống, gán mật khẩu mặc định
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword("123");  // Gán mật khẩu mặc định
        }

        // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Gán role mặc định là USER
        Role userRole = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new RuntimeException("Role USER not found"));

        user.setRoles(Set.of(userRole));

        // Gán ngày tạo là ngày hiện tại nếu chưa có
        if (user.getRegistrationDate() == null) {
            user.setRegistrationDate(new Date());
        }
        if (user.getStatus() == null) {
            user.setStatus("Active");
        }

        return userRepository.save(user);
    }

    // Phương thức cập nhật người dùng
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        user.setUserName(userDetails.getUserName());
        user.setEmail(userDetails.getEmail());
        user.setFullName(userDetails.getFullName());
        user.setPhone(userDetails.getPhone());
        user.setStatus(userDetails.getStatus());
        user.setImage(userDetails.getImage());
        // Cập nhật các trường khác nếu cần

        return userRepository.save(user);
    }

    // Phương thức xóa người dùng theo ID
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword, String confirmPassword) {
        // Lấy thông tin người dùng từ cơ sở dữ liệu
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }

        // Kiểm tra mật khẩu mới và xác nhận
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        // Cập nhật mật khẩu mới (mã hóa)
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}



