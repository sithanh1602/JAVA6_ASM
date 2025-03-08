package com.be.service;

import com.be.entity.Post;
import com.be.entity.User;
import com.be.rep.PostRepository;
import com.be.rep.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;


    // Lấy tất cả bài viết
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // Lấy bài viết theo ID
    public Optional<Post> getPostById(Integer id) {
        return postRepository.findById(id);
    }

    // Tạo bài viết mới
    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    // Cập nhật bài viết
    public Post updatePost(Integer id, Post postDetails) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại với ID: " + id));

        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setStatus(postDetails.getStatus());
        post.setImage(postDetails.getImage());

        return postRepository.save(post);
    }

    // Xóa bài viết
    public void deletePost(Integer id) {
        postRepository.deleteById(id);
    }

    // Lấy bài viết đã đăng (status = true)
    public List<Post> getPublishedPosts() {
        return postRepository.findPublishedPosts();
    }

    // Lấy bài viết mới nhất theo giới hạn
    public List<Post> getLatestPosts(int limit) {
        return postRepository.findAll(PageRequest.of(0, limit)).getContent();
    }
}
