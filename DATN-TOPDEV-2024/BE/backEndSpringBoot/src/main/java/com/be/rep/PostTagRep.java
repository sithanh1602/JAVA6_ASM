package com.be.rep;


import com.be.entity.*;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostTagRep extends JpaRepository<PostTag, Long> {
        @org.springframework.data.jpa.repository.Modifying
        @Transactional
        @Query("DELETE FROM PostTag pt WHERE pt.post.id = :postId")
        void deleteByPostId(@Param("postId") Long postId);
    }


