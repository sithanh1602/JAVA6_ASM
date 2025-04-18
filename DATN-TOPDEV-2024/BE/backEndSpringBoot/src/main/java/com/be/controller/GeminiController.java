package com.be.controller;

import com.be.GeminiClientdto.BuildRequest;
import com.be.GeminiClientdto.CompatibleComponentRequest;
import com.be.GeminiClientdto.QuestionRequest;
import com.be.service.BuildPCGeminiService;
import com.be.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;
    @Autowired
    private BuildPCGeminiService buildPCGeminiService;

    @PostMapping("/ask")
    public ResponseEntity<String> consult(@RequestBody QuestionRequest request) {
        try {
            String response = geminiService.processUserQuery(request.getQuestion());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Đã xảy ra lỗi: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // API 1: Gợi ý cấu hình PC ban đầu
    @PostMapping("/suggest-build")
    public ResponseEntity<String> suggestBuild(@RequestBody BuildRequest request) {
        try {
            String jsonResponse = buildPCGeminiService.suggestBuildByUsage(request.getUsagePurpose(), request.getBudget());
            return new ResponseEntity<>(jsonResponse, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("{\"error\": \"Đã xảy ra lỗi: " + e.getMessage() + "\"}", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}