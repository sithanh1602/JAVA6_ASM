package com.be.rep;


import com.be.entity.PostCategories;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostCateRep extends JpaRepository<PostCategories, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Integer id);}
