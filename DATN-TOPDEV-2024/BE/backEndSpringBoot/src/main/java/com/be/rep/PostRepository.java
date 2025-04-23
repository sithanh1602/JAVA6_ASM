package com.be.rep;

import com.be.dto.PostDTO;
import com.be.entity.Post;
import com.be.entity.PostCategories;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query(value = "SELECT p.id, p.title, p.content, p.status, p.create_at, " +
            "p.slug, pi.image_url, c.name, STRING_AGG(t.tag_name, ', ') AS tags, p.user_id " +
            "FROM Posts p " +
            "LEFT JOIN post_images pi ON p.id = pi.post_id " +
            "LEFT JOIN post_categories c ON p.post_categories_id = c.id " +
            "LEFT JOIN post_tags pt ON p.id = pt.post_id " +
            "LEFT JOIN tags t ON pt.tag_id = t.id " +
            "WHERE p.status = 1 " +
            "GROUP BY p.id, p.title, p.content, p.status, p.create_at, p.slug, pi.image_url, c.name, p.user_id",
            nativeQuery = true)
    List<Object[]> findByStatusTrueWithTags();

//    List<Post> findByPostCategoriesId(Long categoryId);
    void deleteById(Long id);
    List<Post> findByPostCategories(PostCategories postCategories);}


