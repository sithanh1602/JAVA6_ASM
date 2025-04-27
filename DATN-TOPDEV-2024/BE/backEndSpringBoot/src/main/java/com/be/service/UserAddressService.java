package com.be.service;

import com.be.entity.Address;
import com.be.entity.User;
import com.be.rep.AddressRepository;
import com.be.rep.UserRepository;
import com.be.dto.UserInfoDTO;
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
            return Optional.of(new UserInfoDTO());
        }

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return Optional.of(new UserInfoDTO());
        }

        User user = userOptional.get();
        Optional<Address> addressOptional = addressRepository.findByUserIdAndDefaultsTrue(userId);
        if (addressOptional.isEmpty()) {
            return Optional.of(new UserInfoDTO(
                    user.getFullName(),
                    null,
                    null,
                    null,
                    user.getEmail(),
                    null,
                    null,
                    null
            ));
        }

        Address address = addressOptional.get();
        return Optional.of(new UserInfoDTO(
                user.getFullName(),
                address.getPhone(),
                address.getFullAddress(),
                address.getIdAddress(),
                user.getEmail(),
                address.getWard(),
                address.getDistrict(),
                address.getProvince()
        ));
    }

    // Phương thức để lấy tất cả địa chỉ của người dùng
    public List<Address> getAllAddresses(Long userId) {
        if (userId == null || userId <= 0) {
            return List.of();
        }

        // Tìm tất cả các địa chỉ của người dùng theo userId
        return addressRepository.findByUserId(userId);
    }
}
