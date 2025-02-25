package com.be.rep;

import com.be.entity.Favorite;
import com.be.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritesRepository extends JpaRepository<Favorite, Long> {

    @Query("SELECT pv FROM Favorite f JOIN f.productVariant pv WHERE f.userId = :userId")
    List<ProductVariant> findProductVariantsByUserId(@Param("userId") Long userId);

    Optional<Favorite> findByUserIdAndProductVariantId(Long userId, Long productVariantId);

    boolean existsByUserIdAndProductVariantId(Long userId, Long productVariantId);

}