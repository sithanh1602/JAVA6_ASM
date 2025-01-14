package com.be.rep;

import com.be.entity.CartDetail;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartDetailRepository extends JpaRepository<CartDetail, Long> {

//    @Query("SELECT c FROM CartDetail c WHERE c.userId.userId = :userId AND c.product.id = :productId")
//    CartDetail findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT c FROM CartDetail c WHERE c.userId.userId = :userId")
    List<CartDetail> findByUserId(Long userId);

    @Query("SELECT cd FROM CartDetail cd WHERE cd.userId.userId = :userId AND cd.product_variant_id.id = :productId")
    Optional<CartDetail> findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);

    @Transactional
    @Modifying
    @Query("DELETE FROM CartDetail c WHERE c.userId.userId = :userId AND c.product_variant_id.id = :productId")
    void deleteByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}
