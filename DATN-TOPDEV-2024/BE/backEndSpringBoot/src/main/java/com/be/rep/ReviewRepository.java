package com.be.rep;

import com.be.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByUserUserIdAndOrderDetailId(Long userId, int orderDetailId);

}
