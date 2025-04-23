package com.be.rep;

import com.be.entity.*;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostFavoriteRep extends JpaRepository<PostFavorite, Long> {
//    Page<PostFavorite> findByUser_UserId(Long userId, Pageable pageable);
//    boolean existsByUser_UserIdAndPost_Id(Long userId, Long postId);
//    void deleteByUserIdAndPostId(Long userId, Long postId);
@Modifying
@Transactional
@Query("DELETE FROM PostFavorite pf WHERE pf.post = :post")
void deleteByPost(Post post);

}