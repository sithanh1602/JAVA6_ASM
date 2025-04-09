package com.be.controller;

import com.be.service.RecommendationService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/variants/{userId}")
    public Mono<String> getRecommendedVariants(@PathVariable int userId) {
        return recommendationService.getRecommendedVariants(userId);
    }
}
