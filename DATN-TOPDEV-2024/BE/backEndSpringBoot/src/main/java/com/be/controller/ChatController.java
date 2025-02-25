package com.be.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<String> chat(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        String flaskUrl = "http://localhost:5000/chat"; // Gọi Flask

        ResponseEntity<Map> response = restTemplate.postForEntity(flaskUrl, Map.of("message", userMessage), Map.class);
        return ResponseEntity.ok(response.getBody().get("reply").toString());
    }
}
