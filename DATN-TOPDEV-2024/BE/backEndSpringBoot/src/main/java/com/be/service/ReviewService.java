package com.be.service;
import com.be.entity.OrderDetail;
import com.be.entity.Review;
import com.be.entity.User;
import com.be.rep.OrderDetailRepository;
import com.be.rep.ReviewRepository;
import com.be.rep.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

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
}
