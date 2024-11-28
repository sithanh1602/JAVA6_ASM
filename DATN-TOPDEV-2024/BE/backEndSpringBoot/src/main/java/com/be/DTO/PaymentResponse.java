package com.be.DTO;

public class PaymentResponse {
    private String paymentUrl;

    // Constructor
    public PaymentResponse(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }

    // Getter
    public String getPaymentUrl() {
        return paymentUrl;
    }

    // Setter (nếu cần)
    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }
}
