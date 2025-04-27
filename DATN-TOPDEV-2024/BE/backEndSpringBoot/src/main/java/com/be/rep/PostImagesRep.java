package com.be.rep;

import com.be.entity.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostImagesRep extends JpaRepository<PostImages, Long> {
    @Modifying
    @Query("DELETE FROM PostImages pi WHERE pi.post.id = :postId")
    void deleteByPostId(@Param("postId") Long postId);
}

