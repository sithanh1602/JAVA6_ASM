package com.be.controller;

import com.be.entity.Review;
import com.be.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @PostMapping
    public Review createReview(@RequestBody Review reviewRequest) {
        return reviewService.createReview(reviewRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable long id, @RequestBody Review review) {
        return ResponseEntity.ok(reviewService.updateReview(id, review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
