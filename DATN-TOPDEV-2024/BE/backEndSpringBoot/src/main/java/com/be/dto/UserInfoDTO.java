package com.be.dto;

import lombok.Data;

@Data
public class UserInfoDTO {
    private String fullName;
    private String phone;
    private String fullAddress;
    private Long idaddress;
    private String email;
    private String ward;
    private String district;
    private String province;

    public UserInfoDTO(String fullName, String phone, String fullAddress, Long idAddress,
                       String email, String ward, String district, String province) {
        this.fullName = fullName;
        this.phone = phone;
        this.fullAddress = fullAddress;
        this.idaddress = idAddress;
        this.email = email;
        this.ward = ward;
        this.district = district;
        this.province = province;
    }


    public UserInfoDTO() {
        this.fullName = "";
        this.phone = "";
        this.fullAddress = "";
        this.idaddress = null;
        this.email = "";
        this.ward = "";
        this.district = "";
        this.province = "";
    }
}

