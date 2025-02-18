package com.be.controller;

import com.be.entity.Brand;
import com.be.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandService brandService;

    // Lấy danh sách tất cả thương hiệu
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        return new ResponseEntity<>(brands, HttpStatus.OK);
    }

    // Lấy thương hiệu theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id);
        return new ResponseEntity<>(brand, HttpStatus.OK);
    }

    // Thêm mới thương hiệu
    @PostMapping
    public ResponseEntity<Object> createBrand(@Valid @RequestBody Brand brand, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors().stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
        }
        Brand createdBrand = brandService.createBrand(brand);
        return new ResponseEntity<>(createdBrand, HttpStatus.CREATED);
    }

    // Cập nhật thương hiệu
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateBrand(@PathVariable Long id, @Valid @RequestBody Brand brand, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors().stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
        }
        Brand updatedBrand = brandService.updateBrand(id, brand);
        return new ResponseEntity<>(updatedBrand, HttpStatus.OK);
    }

    // Xóa thương hiệu
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Xử lý lỗi khi không tìm thấy thương hiệu
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleNotFoundException(RuntimeException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    // Xử lý lỗi khi có trường hợp dữ liệu không hợp lệ
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<Brand>> getBrandsByCategory(@PathVariable("categoryId") Long categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("categoryId không được null!");
        }
        System.out.println("Nhận categoryId: " + categoryId); // Debug log
        List<Brand> brands = brandService.getBrandsByCategory(categoryId);
        return ResponseEntity.ok(brands);
    }

}
