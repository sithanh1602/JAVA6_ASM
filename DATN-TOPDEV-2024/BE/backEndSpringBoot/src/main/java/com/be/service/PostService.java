package com.be.service;

import com.be.dto.ImageDTO;
import com.be.dto.PostDTO;
import com.be.dto.PostRequestDTO;
import com.be.dto.UserInfoDTO;
import com.be.entity.*;
import com.be.rep.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostImagesRep postImagesRep;
    private final TagRepository tagRepository;
    private final PostTagRep postTagRep;
    private final UserRepository userRepository;
    private final PostCateRep postCateRep;
    private final PostFavoriteRep postFavoriteRep;

    @Autowired
    public PostService(PostRepository postRepository, PostImagesRep postImagesRep,
                       TagRepository tagRepository, PostTagRep postTagRep,
                       UserRepository userRepository, PostCateRep postCateRep, PostFavoriteRep postFavoriteRep) {
        this.postRepository = postRepository;
        this.postImagesRep = postImagesRep;
        this.tagRepository = tagRepository;
        this.postTagRep = postTagRep;
        this.userRepository = userRepository;
        this.postCateRep = postCateRep;
        this.postFavoriteRep = postFavoriteRep;
    }

    // Get all posts
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }


    // Get post by ID (Fixed duplicate method)
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + id));
    }

    @Transactional
    public Post createPost(PostRequestDTO postDTO) {
        try {
            // Kiểm tra đầu vào
            if (postDTO.getTitle() == null || postDTO.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Post title cannot be empty");
            }

            if (postDTO.getContent() == null || postDTO.getContent().trim().isEmpty()) {
                throw new IllegalArgumentException("Post content cannot be empty");
            }

            // Tìm người dùng trong cơ sở dữ liệu dựa trên ID
            User user = userRepository.findById(postDTO.getUser().getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + postDTO.getUser().getUserId()));

            // Tìm danh mục
            PostCategories category = postCateRep.findById(postDTO.getPostCategoriesId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + postDTO.getPostCategoriesId()));

            // Tạo bài viết mới
            Post post = new Post();
            post.setTitle(postDTO.getTitle());
            post.setSlug(generateSlug(postDTO.getTitle()));
            post.setContent(postDTO.getContent());
            post.setUser(user);
            post.setPostCategories(category);
            post.setStatus(postDTO.getStatus() != null ? postDTO.getStatus() : true);
            post.setCreateAt(LocalDateTime.now());

            // Lưu post trước để có ID
            Post savedPost = postRepository.save(post);

            // Xử lý images
            if (postDTO.getImageUrls() != null && !postDTO.getImageUrls().isEmpty()) {
                List<PostImages> images = new ArrayList<>();

                for (String url : postDTO.getImageUrls()) {
                    // Sử dụng constructor phù hợp với lớp PostImages của bạn
                    PostImages image = new PostImages(savedPost, url);
                    images.add(image);
                }

                postImagesRep.saveAll(images);
            }

            // Xử lý tags
            if (postDTO.getTagIds() != null && !postDTO.getTagIds().isEmpty()) {
                List<Tag> tags = tagRepository.findAllById(postDTO.getTagIds());

                if (tags.size() != postDTO.getTagIds().size()) {
                    List<Long> foundTagIds = tags.stream()
                            .map(Tag::getId)
                            .collect(Collectors.toList());

                    List<Long> notFoundTagIds = postDTO.getTagIds().stream()
                            .filter(id -> !foundTagIds.contains(id))
                            .collect(Collectors.toList());

                    throw new EntityNotFoundException("Some tags not found with IDs: " + notFoundTagIds);
                }

                List<PostTag> postTags = new ArrayList<>();
                for (Tag tag : tags) {
                    PostTag postTag = new PostTag();
                    postTag.setPost(savedPost);
                    postTag.setTag(tag);
                    postTags.add(postTag);
                }

                postTagRep.saveAll(postTags);
                // Không thiết lập tags trực tiếp vào post để tránh vấn đề cascade
            }

            // Làm mới dữ liệu post từ database để lấy các mối quan hệ
            return postRepository.findById(savedPost.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Could not find newly created post"));
        } catch (Exception e) {
            throw new RuntimeException("Error creating post: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Post updatePost(Long postId, PostRequestDTO postDTO) {
        try {
            // Kiểm tra bài viết tồn tại
            Post existingPost = postRepository.findById(postId)
                    .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));

            // Kiểm tra đầu vào
            if (postDTO.getTitle() == null || postDTO.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Post title cannot be empty");
            }

            if (postDTO.getContent() == null || postDTO.getContent().trim().isEmpty()) {
                throw new IllegalArgumentException("Post content cannot be empty");
            }

            // Tìm người dùng
            User user = userRepository.findById(postDTO.getUser().getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + postDTO.getUser().getUserId()));

            // Tìm danh mục
            PostCategories category = postCateRep.findById(postDTO.getPostCategoriesId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + postDTO.getPostCategoriesId()));

            // Cập nhật thông tin bài viết
            existingPost.setTitle(postDTO.getTitle());
            existingPost.setSlug(generateSlug(postDTO.getTitle()));
            existingPost.setContent(postDTO.getContent());
            existingPost.setUser(user);
            existingPost.setPostCategories(category);
            existingPost.setStatus(postDTO.getStatus() != null ? postDTO.getStatus() : existingPost.getStatus());

            // Lưu bài viết để cập nhật
            Post updatedPost = postRepository.save(existingPost);

            // Xử lý images
            // Xóa các hình ảnh cũ
            postImagesRep.deleteByPostId(updatedPost.getId());
            if (postDTO.getImageUrls() != null && !postDTO.getImageUrls().isEmpty()) {
                List<PostImages> images = new ArrayList<>();
                for (String url : postDTO.getImageUrls()) {
                    PostImages image = new PostImages(updatedPost, url);
                    images.add(image);
                }
                postImagesRep.saveAll(images);
            }

            // Xử lý tags
            // Xóa các tag cũ
            postTagRep.deleteByPostId(updatedPost.getId());
            if (postDTO.getTagIds() != null && !postDTO.getTagIds().isEmpty()) {
                List<Tag> tags = tagRepository.findAllById(postDTO.getTagIds());

                if (tags.size() != postDTO.getTagIds().size()) {
                    List<Long> foundTagIds = tags.stream()
                            .map(Tag::getId)
                            .collect(Collectors.toList());

                    List<Long> notFoundTagIds = postDTO.getTagIds().stream()
                            .filter(id -> !foundTagIds.contains(id))
                            .collect(Collectors.toList());

                    throw new EntityNotFoundException("Some tags not found with IDs: " + notFoundTagIds);
                }

                List<PostTag> postTags = new ArrayList<>();
                for (Tag tag : tags) {
                    PostTag postTag = new PostTag();
                    postTag.setPost(updatedPost);
                    postTag.setTag(tag);
                    postTags.add(postTag);
                }

                postTagRep.saveAll(postTags);
            }

            // Làm mới dữ liệu post từ database để lấy các mối quan hệ
            return postRepository.findById(updatedPost.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Could not find updated post"));
        } catch (Exception e) {
            throw new RuntimeException("Error updating post: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deletePost(Long id) {
        Post post = getPostById(id);
        postImagesRep.deleteByPostId(id);
        postTagRep.deleteByPostId(id);
        postFavoriteRep.deleteByPost(post); // cần viết hàm này
        postRepository.delete(post);
    }

    @Transactional
    public Post toggleStatus(Long id) {
        Post post = getPostById(id);
        post.setStatus(!post.getStatus());
        return postRepository.save(post);
    }
//    private PostDTO convertToPostDTO(Post post) {
//        User user = post.getUser();
//        List<PostImages> imageEntities = post.getImages();
//
//        UserInfoDTO userDTO = new UserInfoDTO(user.getUserId(), user.getFullName(), user.getImage());
//        List<ImageDTO> images = imageEntities.stream()
//                .map(img -> new ImageDTO(img.getId(), img.getImageUrl()))
//                .toList();
//
//        return new PostDTO(
//                post.getId(),
//                post.getTitle(),
//                post.getContent(),
//                post.getStatus(),
//                post.getCreateAt(),
//                post.getSlug(),
//                post.getTagsAsString(), // Hàm custom trong Post để join tags thành chuỗi
//                post.getCategory().getName(),
//                userDTO,
//                images
//        );
//    }


    private String generateSlug(String title) {
        if (title == null || title.trim().isEmpty()) {
            return "post-" + System.currentTimeMillis();
        }

        String slug = Normalizer.normalize(title.toLowerCase(Locale.ENGLISH), Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");

        if (slug.startsWith("-")) slug = slug.substring(1);
        if (slug.endsWith("-")) slug = slug.substring(0, slug.length() - 1);
        return slug.isEmpty() ? "post-" + System.currentTimeMillis() : slug;
    }
}