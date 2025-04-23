package com.be.service;

import com.be.entity.Post;
import com.be.entity.PostFavorite;
import com.be.rep.PostFavoriteRep;
import com.be.rep.PostRepository;
import com.be.rep.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostFavoriteService {
//
//    private final PostFavoriteRep postFavoriteRep;
//    private final PostRepository postRepository;
//    private final UserRepository userRepository;
//
//    // Constructor injection (preferred over field @Autowired)
//    public PostFavoriteService(PostFavoriteRep postFavoriteRep,
//                               PostRepository postRepository,
//                               UserRepository userRepository) {
//        this.postFavoriteRep = postFavoriteRep;
//        this.postRepository = postRepository;
//        this.userRepository = userRepository;
//    }
//
//    @Transactional
//    public void addPostFavorite(Long userId, Long postId) {
//        // Check if the favorite already exists
//        if (postFavoriteRep.existsByUser_UserIdAndPost_Id(userId, postId)) {
//            return; // Silently ignore if already favorited
//        }
//
//        PostFavorite favorite = new PostFavorite();
//        favorite.setUser(userRepository.findById(userId)
//                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId)));
//        favorite.setPost(postRepository.findById(postId)
//                .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + postId)));
//        postFavoriteRep.save(favorite);
//    }
//
//    @Transactional(readOnly = true)
//    public Page<Post> getPostFavorites(Long userId, int page, int size) {
//        if (page < 0 || size <= 0) {
//            throw new IllegalArgumentException("Page must be >= 0 and size must be > 0");
//        }
//
//        Pageable pageable = PageRequest.of(page, size);
//        return postFavoriteRep.findByUser_UserId(userId, pageable)
//                .map(PostFavorite::getPost);
//    }
}