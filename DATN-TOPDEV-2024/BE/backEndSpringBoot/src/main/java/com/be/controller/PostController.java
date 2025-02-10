package com.be.controller;

import com.be.entity.Post;
import com.be.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts") // Base URL cho các API liên quan đến bài viết
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    // Lấy danh sách tất cả bài viết
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    // Lấy bài viết theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Integer id) {
        Optional<Post> post = postService.getPostById(id);
        return post.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Tạo bài viết mới
    @PostMapping
    public ResponseEntity<Post> createPost(@Valid @RequestBody Post post) {
        Post createdPost = postService.createPost(post);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    // Cập nhật bài viết theo ID
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Integer id, @RequestBody Post postDetails) {
        try {
            Post updatedPost = postService.updatePost(id, postDetails);
            return new ResponseEntity<>(updatedPost, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Xóa bài viết theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Integer id) {
        try {
            postService.deletePost(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Lấy bài viết đã đăng (status = true)
    @GetMapping("/published")
    public ResponseEntity<List<Post>> getPublishedPosts() {
        List<Post> posts = postService.getPublishedPosts();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    // Lấy bài viết mới nhất với số lượng giới hạn
    @GetMapping("/latest/{limit}")
    public ResponseEntity<List<Post>> getLatestPosts(@PathVariable int limit) {
        List<Post> posts = postService.getLatestPosts(limit);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }
}
