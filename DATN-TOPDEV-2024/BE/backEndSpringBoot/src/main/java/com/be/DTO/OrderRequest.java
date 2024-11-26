package com.be.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OrderRequest {
    private Long userId;  // userId từ FE
    @JsonProperty("fullAddress")
    private String fullAddress;
    private List<OrderItem> cartItems;  // Các sản phẩm trong giỏ hàng
    private int totalPrice;  // Tổng giá trị đơn hàng
    private String paymentMethod; // Phương thức thanh toán

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullAddress() {
        return fullAddress;
    }

    public void setFullAddress(String fullAddress) {
        this.fullAddress = fullAddress;
    }

    public List<OrderItem> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<OrderItem> cartItems) {
        this.cartItems = cartItems;
    }

    public int getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(int totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
