package com.be.service;

import com.be.entity.Category;
import com.be.rep.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Lấy tất cả các danh mục
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Lấy danh mục theo ID
    public Optional<Category> getCategoryById(int id) {
        return categoryRepository.findById(id);
    }

    // Tạo mới một danh mục
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Cập nhật danh mục
    public Optional<Category> updateCategory(int id, Category category) {
        Optional<Category> existingCategory = categoryRepository.findById(id);
        if (existingCategory.isPresent()) {
            category.setId(id); // Đảm bảo ID của category được cập nhật
            return Optional.of(categoryRepository.save(category)); // Lưu lại danh mục đã cập nhật
        }
        return Optional.empty(); // Trả về Optional.empty nếu danh mục không tồn tại
    }

    // Xóa một danh mục
    public boolean deleteCategory(int id) {
        Optional<Category> existingCategory = categoryRepository.findById(id);
        if (existingCategory.isPresent()) {
            categoryRepository.deleteById(id);
            return true; // Trả về true nếu xóa thành công
        }
        return false; // Trả về false nếu danh mục không tồn tại
    }
}
