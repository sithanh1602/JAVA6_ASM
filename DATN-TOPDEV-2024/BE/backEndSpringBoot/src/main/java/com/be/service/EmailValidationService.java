package com.be.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
@Service
public class EmailValidationService {

        @Value("${api.key}")
        private String API_KEY;
        private static final String API_URL = "https://emailvalidation.abstractapi.com/v1/";

        public boolean isEmailValid(String email) {
            String url = API_URL + "?api_key=" + API_KEY + "&email=" + email;
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            // Log ra phản hồi từ API
            System.out.println("Response from API: " + response.getBody());

            return response.getBody().contains("\"deliverability\":\"DELIVERABLE\"");
        }
    }

