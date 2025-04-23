package com.be.controller;

import com.be.dto.PostDTO;
import com.be.dto.PostRequestDTO;
import com.be.entity.Post;
import com.be.rep.PostCateRep;
import com.be.rep.UserRepository;
import com.be.service.PostFavoriteService;
import com.be.service.PostService;
import com.be.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/posts") // Base URL cho các API liên quan đến bài viết
public class PostController {

    private final PostService postService;
    private final PostFavoriteService postFavoriteService;
    private  UserRepository userRepository;
    private PostCateRep postCateRep;

    @Autowired
    public PostController(PostService postService, PostFavoriteService postFavoriteService) {
        this.postService = postService;
        this.postFavoriteService = postFavoriteService;
    }

    // Lấy danh sách tất cả bài viết
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts(); // Giả sử PostService có phương thức này
        return ResponseEntity.ok(posts);
    }

//    @GetMapping("/published")
//    public ResponseEntity<List<PostDTO>> getPublishedPosts() {
//        List<PostDTO> posts = postService.getPublishedPosts();
//        return ResponseEntity.ok(posts);
//    }

    @PostMapping
    public ResponseEntity<Post> createPost(@Valid @RequestBody PostRequestDTO postDTO) {
        Post createdPost = postService.createPost(postDTO);
        return ResponseEntity.ok(createdPost);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostRequestDTO postDTO) {
        Post updatedPost = postService.updatePost(postId, postDTO);
        return ResponseEntity.ok(updatedPost);
    }

    // Delete post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Post> togglePostStatus(@PathVariable Long id) {
        try {
            Post updatedPost = postService.toggleStatus(id);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Trả về 404 nếu không tìm thấy bài viết
        }
    }



//Favorite
//
//    @PostMapping("/favorites/add")
//        public ResponseEntity<Void> addPostFavorite(@RequestBody PostFavoriteDTO request) {
//        postFavoriteService.addPostFavorite(request.getUserId(), request.getPostId());
//        return ResponseEntity.ok().build();
//    }
//    @GetMapping("/favorites/{userId}")
//    public ResponseEntity<Page<Post>> getFavoritePosts(
//            @PathVariable Long userId,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//
//        Page<Post> favoritePosts = postFavoriteService.getPostFavorites(userId, page, size);
//        return ResponseEntity.ok(favoritePosts);
//    }

}