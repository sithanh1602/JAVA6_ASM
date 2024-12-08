package com.be.service;

import com.be.entity.*;
import com.be.rep.BrandRepository;
import com.be.rep.CategoryRepository;
import com.be.rep.ProductRepository;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    // Phương thức chung để kiểm tra validate các sản phẩm
    private void validateProductCreate(Product product) {
        // Kiểm tra các trường không được để trống
        if (product.getName() == null || product.getName().isEmpty()) {
            throw new ValidationException("Name must not be empty");
        }
        if (product.getDescription() == null || product.getDescription().isEmpty()) {
            throw new ValidationException("Description must not be empty");
        }
        if (product.getStock() <= 0) {
            throw new ValidationException("Stock must be a positive number");
        }
        if (product.getPrice() <= 0) {
            throw new ValidationException("Price must be a positive number");
        }

        // Kiểm tra trùng tên sản phẩm (không cho phép tên sản phẩm trùng)
        if (productRepository.existsByName(product.getName())) {
            throw new ValidationException("Product name must be unique");
        }
    }

    private void validateProductUpdate(Product product, Long id) {
        // Kiểm tra các trường không được để trống
        if (product.getName() == null) {
            throw new ValidationException("Name must not be empty");
        }
        if (product.getDescription() == null) {
            throw new ValidationException("Description must not be empty");
        }
        if (product.getStock() < 0) {
            throw new ValidationException("Stock must be a positive number");
        }
        if (product.getPrice() <= 0) {
            throw new ValidationException("Price must be a positive number");
        }
        // Kiểm tra trùng tên sản phẩm (bỏ qua sản phẩm hiện tại)
        if (productRepository.existsByNameAndIdNot(product.getName(), (long) product.getId())) {
            throw new ValidationException("Product name must be unique");
        }
    }
    
    // Method to retrieve all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Method to retrieve a product by its ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        // Kiểm tra các validation trước khi tiếp tục
        validateProductCreate(product);  // false vì đây là create, không phải update

        // Kiểm tra xem danh mục có tồn tại không
        Category category = categoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Kiểm tra xem thương hiệu có tồn tại không
        Brand brand = brandRepository.findById(product.getBrand().getBrandsId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        // Set category và brand cho sản phẩm
        product.setCategory(category);
        product.setBrand(brand);

        // Set giá trị mặc định cho createdAt và status nếu không được cung cấp
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(new Date());
        }
        if (product.getStatus() == null) {
            product.setStatus("Available");
        }

        // Lưu sản phẩm vào cơ sở dữ liệu
        return productRepository.save(product);
    }


    // Method to update an existing product
    public Product updateProduct(Long id, Product product) {
        // Kiểm tra nếu sản phẩm tồn tại
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        // Xử lý logic trạng thái
        if (product.getStock() == 0) {
            product.setStatus("Out of Stock");
        } else if (product.getStock() > 0 && "Out of Stock".equals(product.getStatus())) {
            product.setStatus("Available");
        }

        validateProductUpdate(product,id);  // Validate cho việc cập nhật sản phẩm
        // Cập nhật thông tin sản phẩm
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setStock(product.getStock());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setStatus(product.getStatus());
        existingProduct.setImageUrl(product.getImageUrl());

        return productRepository.save(existingProduct);
    }

    // Method to delete a product by its ID
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // Phương thức này trả về thông tin thương hiệu của sản phẩm dựa trên ID
    public Brand getBrandByProductId(Long productId) {
        // Lấy sản phẩm theo ID
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Trả về thương hiệu của sản phẩm
        return product.getBrand(); // Giả sử Product có mối quan hệ với Brand
    }
    // Service method to fetch the top 3 best-selling products
    public List<Product> getTop3BestSellingProducts() {
        // Fetch the top 3 best-selling products directly from the repository
        List<Product> topProducts = productRepository.findTop3BestSellingProducts();
        return topProducts;  // Return the list of top 3 products
    }


}