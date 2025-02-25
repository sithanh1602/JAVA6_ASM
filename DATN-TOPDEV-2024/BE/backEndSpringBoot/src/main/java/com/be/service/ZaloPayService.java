package com.be.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class ZaloPayService {
    private static final Logger logger = LoggerFactory.getLogger(ZaloPayService.class);

    @Value("${zalopay.app-id}")
    private String appId;

    @Value("${zalopay.key1}")
    private String key1;

    @Value("${zalopay.key2}")
    private String key2;

    @Value("${zalopay.endpoint}")
    private String endpoint;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ZaloPayService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    private String generateMac(String data, String key) throws Exception {
        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSHA256.init(secretKey);
        byte[] hmacData = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder hexString = new StringBuilder();
        for (byte b : hmacData) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }

    public Map<String, Object> createZaloPayOrder(long amount, String description, String redirectUrl, String orderId) throws Exception {
        // Tạo app_trans_id theo định dạng yyMMdd_orderId
        String appTransId = new SimpleDateFormat("yyMMdd").format(new Date()) + "_" + orderId;
        long appTime = System.currentTimeMillis(); // Thời gian hiện tại tính bằng mili giây

        // Tạo embed_data và item
        Map<String, Object> embedData = new HashMap<>();
        String embedDataJson = objectMapper.writeValueAsString(embedData);
        String itemJson = "[]"; // Nếu không có sản phẩm cụ thể, gửi mảng rỗng

        // Tạo chuỗi dữ liệu để tạo MAC
        String data = String.format("%s|%s|%s|%d|%d|%s|%s",
                appId,
                appTransId,
                "defaultUser",
                amount,
                appTime,
                embedDataJson,
                itemJson
        );

        // Tạo MAC
        String mac = generateMac(data, key1);

        // Tạo yêu cầu đơn hàng
        Map<String, Object> orderRequest = new HashMap<>();
        orderRequest.put("app_id", appId);
        orderRequest.put("app_trans_id", appTransId);
        orderRequest.put("app_user", "defaultUser");
        orderRequest.put("app_time", appTime);
        orderRequest.put("amount", amount);
        orderRequest.put("description", description);
        orderRequest.put("bank_code", "zalopayapp");
        orderRequest.put("callback_url", "http://yourdomain.com/api/orders/zalopay-callback");
        orderRequest.put("redirect_url", redirectUrl);
        orderRequest.put("embed_data", embedDataJson);
        orderRequest.put("item", itemJson);
        orderRequest.put("mac", mac);

        // Gửi yêu cầu đến ZaloPay
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(orderRequest, headers);

        Map<String, Object> response = restTemplate.postForObject(endpoint, requestEntity, Map.class);

        // Xử lý phản hồi từ ZaloPay
        if (response != null && (Integer) response.get("returncode") == 1) {
            String orderUrl = (String) response.get("orderurl");
            // Sử dụng orderUrl để chuyển hướng người dùng đến trang thanh toán của ZaloPay
            logger.info("Order URL: {}", orderUrl);
        } else {
            // Xử lý khi tạo đơn hàng thất bại
            logger.error("Failed to create ZaloPay order: {}", response);
        }

        return response;
    }



public boolean verifyCallback(Map<String, String> callback) throws Exception {
        try {
            if (callback == null || callback.isEmpty()) {
                logger.error("Callback data is null or empty");
                return false;
            }

            // Ensure required fields are present
            String[] requiredFields = {"app_id", "app_trans_id", "app_user", "amount", "app_time", "mac"};
            for (String field : requiredFields) {
                if (!callback.containsKey(field) || callback.get(field) == null) {
                    logger.error("Missing required field: {}", field);
                    return false;
                }
            }

            // Get embed_data and item with default values
            String embedData = callback.getOrDefault("embed_data", "{}");
            String item = callback.getOrDefault("item", "[]");

            // Create data string for MAC verification
            String dataStr = String.format("%s|%s|%s|%s|%s|%s|%s",
                    callback.get("app_id"),
                    callback.get("app_trans_id"),
                    callback.get("app_user"),
                    callback.get("amount"),
                    callback.get("app_time"),
                    embedData,
                    item
            );

            // Generate MAC for verification
            String returnMac = generateMac(dataStr, key2);

            // Log verification details
            logger.info("Data for MAC verification: {}", dataStr);
            logger.info("Generated Callback MAC: {}", returnMac);
            logger.info("Received Callback MAC: {}", callback.get("mac"));

            // Verify MAC
            boolean isValid = returnMac.equals(callback.get("mac"));
            logger.info("MAC verification result: {}", isValid);

            return isValid;

        } catch (Exception e) {
            logger.error("Error verifying callback: {}", e.getMessage());
            throw new Exception("Failed to verify callback", e);
        }
    }
}

