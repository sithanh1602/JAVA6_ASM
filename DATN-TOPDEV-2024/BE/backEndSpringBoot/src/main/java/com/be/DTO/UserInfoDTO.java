package com.be.DTO;

public class UserInfoDTO {
    private String fullName;
    private String phone;
    private String fullAddress;
    private Long idaddress;

    public UserInfoDTO(String fullName, String phone, String fullAddress, Long idaddress) {
        this.fullName = fullName;
        this.phone = phone;
        this.fullAddress = fullAddress;
        this.idaddress = idaddress;
    }

    // Getters và Setters
    public String getFullName() {return fullName;}
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

    public Long getIdaddress() {return idaddress;}
}

