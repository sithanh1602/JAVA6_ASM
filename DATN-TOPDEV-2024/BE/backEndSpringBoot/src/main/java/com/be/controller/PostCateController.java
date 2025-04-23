package com.be.controller;

import com.be.entity.PostCategories;
import com.be.service.PostCateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/post-categories")
@CrossOrigin("*") // Cho phép gọi API từ các domain khác nhau (CORS)
public class PostCateController {

    @Autowired
    private PostCateService postCateService;

    // 1. Lấy danh sách tất cả danh mục bài viết
    @GetMapping
    public ResponseEntity<List<PostCategories>> getAllPostCategories() {
        List<PostCategories> categories = postCateService.getAllPostCategories();
        return ResponseEntity.ok(categories);
    }

    // 2. Lấy danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<PostCategories> getPostCategoryById(@PathVariable Long id) {
        Optional<PostCategories> postCategory = postCateService.getPostCategoriesById(id);
        return postCategory.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 3. Thêm danh mục bài viết mới
    @PostMapping
    public ResponseEntity<PostCategories> addPostCategory(@RequestBody PostCategories postCategory) {
        PostCategories savedCategory = postCateService.addPostCategories(postCategory);
        return ResponseEntity.ok(savedCategory);
    }

    // 4. Cập nhật danh mục bài viết
    @PutMapping("/{id}")
    public ResponseEntity<PostCategories> updatePostCategory(
            @PathVariable Long id,
            @RequestBody PostCategories postCategory) {
        PostCategories updatedCategory = postCateService.updatePostCategories(id, postCategory);
        return ResponseEntity.ok(updatedCategory);
    }

    // 5. Xóa danh mục bài viết (nếu không có bài viết liên quan)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePostCategory(@PathVariable Long id) {
        try {
            postCateService.deletePostCategories(id);
            return ResponseEntity.ok("Post category deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
