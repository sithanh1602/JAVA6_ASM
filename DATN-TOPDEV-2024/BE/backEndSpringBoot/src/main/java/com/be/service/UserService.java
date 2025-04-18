package com.be.service;

import com.be.entity.Role;
import com.be.entity.User;
import com.be.rep.RoleRepository;
import com.be.rep.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private PasswordEncoder passwordEncoder;


    public List<User> getTopCustomers(int limit) {
        return userRepository.findTopCustomers(PageRequest.of(0, limit));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        // Kiểm tra nếu mật khẩu là null hoặc trống, gán mật khẩu mặc định
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword("123");  // Gán mật khẩu mặc định
        }

        // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Gán role mặc định là USER
        Role userRole = roleRepository.findByRoleName("USER");

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




