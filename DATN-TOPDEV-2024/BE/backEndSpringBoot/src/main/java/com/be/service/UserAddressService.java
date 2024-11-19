package com.be.service;

import com.be.entity.Address;
import com.be.entity.User;
import com.be.rep.AddressRepository;
import com.be.rep.UserRepository;
import com.be.seurity.UserInfoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserAddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    // Hàm để lấy thông tin user mặc định (fullName, phone và fullAddress)
    public Optional<UserInfoDTO> getDefaultUserInfo(Long userId) {
        if (userId == null || userId <= 0) {
            return Optional.empty();
        }

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();
        Optional<Address> addressOptional = addressRepository.findByUserIdAndDefaultsTrue(userId);
        if (addressOptional.isEmpty()) {
            return Optional.empty();
        }

        Address address = addressOptional.get();
        UserInfoDTO userInfoDTO = new UserInfoDTO(user.getFullName(), address.getPhone(), address.getFullAddress());

        return Optional.of(userInfoDTO);
    }

    // Phương thức để lấy tất cả địa chỉ của người dùng
    public List<Address> getAllAddresses(Long userId) {
        if (userId == null || userId <= 0) {
            return List.of(); // Trả về danh sách rỗng nếu userId không hợp lệ
        }

        // Tìm tất cả các địa chỉ của người dùng theo userId
        return addressRepository.findByUserId(userId);
    }
}
