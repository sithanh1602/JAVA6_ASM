package com.be.dto;

public class OrderItem {
    private Long productVariantId;  // ID của biến thể sản phẩm
    private int quantity;           // Số lượng của sản phẩm trong giỏ
    private double productPrice;    // Giá của sản phẩm
    private String productName;     // Tên của sản phẩm

    // Getter và Setter cho productVariantId
    public Long getProductVariantId() {
        return productVariantId;
    }

    public void setProductVariantId(Long productVariantId) {
        this.productVariantId = productVariantId;
    }

    // Getter và Setter cho quantity
    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    // Getter và Setter cho productPrice
    public double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(double productPrice) {
        this.productPrice = productPrice;
    }

    // Getter và Setter cho productName
    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }
}
