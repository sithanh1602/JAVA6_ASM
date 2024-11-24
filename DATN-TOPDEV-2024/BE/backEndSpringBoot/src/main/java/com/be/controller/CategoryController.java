package com.be.controller;

import com.be.entity.Category;
import com.be.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Get all categories
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return categories.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(categories);
    }

    // Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable int id) {
        Optional<Category> category = categoryService.getCategoryById(id);
        return category.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Create a new category
    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        Category createdCategory = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    // Update an existing category
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@Valid @PathVariable int id, @RequestBody Category category) {
        Optional<Category> updatedCategory = categoryService.updateCategory(id, category);
        return updatedCategory.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Delete a category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable int id) {
        boolean isDeleted = categoryService.deleteCategory(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
