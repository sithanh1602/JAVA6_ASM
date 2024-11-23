package com.be.seurity;

import lombok.Data;

@Data
public class AddressDTO {
    private Long userId;
    private String streetAddress;
    private Long addressId;  // Sửa lại là Long cho phù hợp với ID
    private String phoneNumber;
    private Boolean isDefault;
    private String province;
    private String district;
    private String ward;
    private String fullAddress;
}
