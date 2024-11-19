package com.be.seurity;

public class UserInfoDTO {
    private String fullName;
    private String phone;
    private String fullAddress;

    public UserInfoDTO(String fullName, String phone, String fullAddress) {
        this.fullName = fullName;
        this.phone = phone;
        this.fullAddress = fullAddress;
    }

    // Getters và Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getFullAddress() {
        return fullAddress;
    }

    public void setFullAddress(String fullAddress) {
        this.fullAddress = fullAddress;
    }
}

