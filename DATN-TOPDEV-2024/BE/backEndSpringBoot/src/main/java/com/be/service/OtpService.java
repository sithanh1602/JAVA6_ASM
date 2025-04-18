package com.be.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {
    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_LENGTH = 6;

    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        String otpValue = otp.toString();
        logger.info("Tạo OTP: {}", otpValue);
        return otpValue;
    }

    public LocalDateTime getOtpExpiredTime() {
        return LocalDateTime.now().plusMinutes(1); // OTP hiệu lực 1 phút
    }
}
