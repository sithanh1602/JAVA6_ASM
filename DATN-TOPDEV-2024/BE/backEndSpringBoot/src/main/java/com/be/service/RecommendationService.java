package com.be.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class RecommendationService {
    private final WebClient webClient;

    public RecommendationService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://127.0.0.1:5000").build(); // URL của Flask
    }

    public Mono<String> getRecommendedVariants(int userId) {
        return webClient.get()
                .uri("/recommend/" + userId) // Gọi API Flask
                .retrieve()
                .bodyToMono(String.class);
    }
}
