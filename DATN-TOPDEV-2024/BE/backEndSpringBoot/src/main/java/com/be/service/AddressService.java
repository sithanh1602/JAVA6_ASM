package com.be.service;

import com.be.entity.Address;
import com.be.entity.User;
import com.be.rep.AddressRepository;
import com.be.rep.UserRepository;
import com.be.dto.AddressDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    public Address findById(Long id) {
        return addressRepository.findById(id).orElse(null);
    }

    // Thêm phương thức tìm địa chỉ theo id
    public Address findByIdAddress(Long idAddress) {
        return addressRepository.findById(idAddress).orElseThrow(() ->
                new IllegalArgumentException("Không tìm thấy địa chỉ với ID: " + idAddress));
    }

    // Lấy danh sách địa chỉ của người dùng
    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    // Tạo địa chỉ mới từ DTO
    public Address createAddress(AddressDTO addressDTO) {
        // Tìm người dùng
        User user = userRepository.findById(addressDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + addressDTO.getUserId()));

        // Tạo một đối tượng Address mới
        Address address = new Address();
        address.setUser(user);
        address.setStreetaddress(addressDTO.getStreetAddress());
        address.setPhone(addressDTO.getPhoneNumber());
        address.setProvince(addressDTO.getProvince());
        address.setDistrict(addressDTO.getDistrict());
        address.setWard(addressDTO.getWard());
        address.setFullAddress(addressDTO.getFullAddress());

        // Kiểm tra xem người dùng đã có địa chỉ nào chưa
        List<Address> existingAddresses = addressRepository.findByUserId(user.getUserId());

        if (existingAddresses.isEmpty()) {
            // Nếu chưa có địa chỉ nào, đặt địa chỉ này làm mặc định
            address.setDefaults(true);
        } else {
            // Nếu đã có địa chỉ, kiểm tra giá trị `isDefault` từ DTO
            if (addressDTO.getIsDefault() != null && addressDTO.getIsDefault()) {
                // Nếu địa chỉ này được đánh dấu là mặc định, cập nhật các địa chỉ khác thành không mặc định
                addressRepository.updateAllDefaultAddressesToFalse(user.getUserId(), null);
                address.setDefaults(true);
            } else {
                // Nếu không, đặt `isDefault` là false
                address.setDefaults(false);
            }
        }

        // Lưu địa chỉ
        return addressRepository.save(address);
    }


    @Transactional
    public Address updateAddress(Long addressId, AddressDTO addressDTO) {
        // Tìm địa chỉ hiện tại để cập nhật
        Address existingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy địa chỉ với ID: " + addressId));

        // Tìm người dùng tương ứng
        User user = userRepository.findById(addressDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + addressDTO.getUserId()));

        // Cập nhật các thông tin địa chỉ
        existingAddress.setUser(user);
        existingAddress.setStreetaddress(addressDTO.getStreetAddress());
        existingAddress.setPhone(addressDTO.getPhoneNumber());
        existingAddress.setProvince(addressDTO.getProvince());
        existingAddress.setDistrict(addressDTO.getDistrict());
        existingAddress.setWard(addressDTO.getWard());
        existingAddress.setFullAddress(addressDTO.getFullAddress());

        // Nếu địa chỉ được đánh dấu là mặc định (isDefault == true)
        if (addressDTO.getIsDefault() != null && addressDTO.getIsDefault()) {
            // Cập nhật tất cả địa chỉ thành không mặc định trừ chính địa chỉ này
            addressRepository.updateAllDefaultAddressesToFalse(user.getUserId(), addressId);
            existingAddress.setDefaults(true); // Đánh dấu địa chỉ này là mặc định
        } else {
            existingAddress.setDefaults(false); // Đặt isDefault = false nếu không có giá trị
        }

        // Lưu lại địa chỉ đã cập nhật
        return addressRepository.save(existingAddress);
    }

    // Lấy địa chỉ theo ID
    public Address getAddressById(Long addressId) {
        return addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy địa chỉ với ID: " + addressId));
    }

    // Cập nhật địa chỉ mặc định cho người dùng
    @Transactional
    public Address setDefaultAddress(Long userId, Long addressId) {
        // Cập nhật tất cả các địa chỉ thành không phải mặc định
        addressRepository.updateAllDefaultAddressesToFalse(userId, addressId);

        // Tìm và cập nhật địa chỉ cụ thể thành mặc định
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy địa chỉ với ID: " + addressId));

        address.setDefaults(true);
        return addressRepository.save(address);
    }

    // Xóa địa chỉ
    public void deleteAddress(Long addressId) {
        Address existingAddress = getAddressById(addressId);
        addressRepository.delete(existingAddress);
    }


}
