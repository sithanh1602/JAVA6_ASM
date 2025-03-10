package com.be.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OrderRequest {
    private Long userId;  // userId từ FE
    private Long orderId;  // orderId, có thể là null trong quá trình tạo đơn hàng mới
    @JsonProperty("fullAddress")
    private String fullAddress;  // Địa chỉ giao hàng
    private List<OrderItem> cartItems;  // Các sản phẩm trong giỏ hàng
    private int totalPrice;  // Tổng giá trị đơn hàng
    private String paymentMethod; // Phương thức thanh toán
    private String orderInfo; // Thông tin đơn hàng (có thể là ghi chú)
    private String urlReturn; // URL để trả về sau khi thanh toán
    private String phone; // Số điện thoại người dùng
    private Long voucherId; // ID của voucher (nếu có)
    private int shippingFee; // Phí vận chuyển
    private int voucherDiscount; // Giá trị giảm giá từ voucher (nếu có)
    private String voucherCode;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
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

    public String getOrderInfo() {
        return orderInfo;
    }

    public void setOrderInfo(String orderInfo) {
        this.orderInfo = orderInfo;
    }

    public String getUrlReturn() {
        return urlReturn;
    }

    public void setUrlReturn(String urlReturn) {
        this.urlReturn = urlReturn;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getVoucherId() {
        return voucherId;
    }

    public void setVoucherId(Long voucherId) {
        this.voucherId = voucherId;
    }

    public int getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(int shippingFee) {
        this.shippingFee = shippingFee;
    }

    public int getvoucherDiscount() {
        return voucherDiscount;
    }

    public void setvoucherDiscount(int discountPrice) {
        this.voucherDiscount = discountPrice;
    }

    public String getvoucherCode (){
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }


}
