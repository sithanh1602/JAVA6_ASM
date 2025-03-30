package com.be.service;
import com.be.dto.ReviewDTO;
import com.be.entity.*;
import com.be.rep.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id).orElse(null);
    }

    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }
    public Review updateReview(long id, Review review) {
        Optional<Review> existingReview = reviewRepository.findById(id);
        if (existingReview.isPresent()) {
            Review updatedReview = existingReview.get();
            updatedReview.setUser(review.getUser());
//            updatedReview.setOrderDetail(review.getOrderDetail());
            updatedReview.setRating(review.getRating());
            updatedReview.setComment(review.getComment());
            updatedReview.setCreateAt(review.getCreateAt());
            return reviewRepository.save(updatedReview);
        }
        return null;
    }

    public void deleteReview(long id) {
        reviewRepository.deleteById(id);
    }

    public Double getAverageRatingByProductId(Long productId) {
        return reviewRepository.getAverageRatingByProductId(productId);
    }
}
