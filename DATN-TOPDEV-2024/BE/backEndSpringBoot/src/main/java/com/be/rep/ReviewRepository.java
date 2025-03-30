package com.be.rep;

import com.be.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;


public interface ReviewRepository extends JpaRepository<Review, Long> {
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.orderDetail.product_variant_id.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

}