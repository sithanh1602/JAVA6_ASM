package com.be.service;

import com.be.DTO.ProductDto;
import com.be.DTO.ProductVariantDTO;
import com.be.entity.*;
import com.be.rep.*;
import jakarta.validation.ValidationException;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductService {

    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    BrandRepository brandRepository;
    ImageRepository imageRepository;
    CategoryService categoryService;
    ProductVariantRepository productVariantRepository;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository, ImageRepository imageRepository, CategoryService categoryService,ProductVariantRepository productVariantRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.imageRepository = imageRepository;
        this.categoryService = categoryService;
        this.productVariantRepository = productVariantRepository;
    }

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
        // Kiểm tra trùng tên sản phẩm (bỏ qua sản phẩm hiện tại)
        if (productRepository.existsByNameAndIdNot(product.getName(), (long) product.getId())) {
            throw new ValidationException("Product name must be unique");
        }
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<ProductVariant> getAllProductVariants() {
        return productVariantRepository.findAll();
    }

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
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setStock(product.getStock());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setStatus(product.getStatus());
        existingProduct.setImageUrl(product.getImageUrl());

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Brand getBrandByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return product.getBrand();
    }
    public Category getCategoryByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return product.getCategory();
    }

    public List<Product> getTop3BestSellingProducts() {
        // Fetch the top 3 best-selling products directly from the repository
        List<Product> topProducts = productRepository.findTop3BestSellingProducts();
        return topProducts;  // Return the list of top 3 products
    }

    public List<ProductDto> ProductById(Long productId) {
        List<Object[]> results = productRepository.findProductById(productId);

        return results.stream().map(result -> {
            ProductDto dto = new ProductDto();
            dto.setName((String) result[0]);  // product_name
            dto.setDescription((String) result[1]);  // product_description

            // Chuyển đổi từ BigDecimal sang Double
            BigDecimal price = (BigDecimal) result[2]; // product_price
            dto.setPrice(price != null ? price.doubleValue() : null);

            dto.setImage((String) result[3]);  // product_image
            dto.setAttributes((String) result[4]);  // attributes
            dto.setVariantId((Long) result[5]);  // variant_id
            dto.setQuantity((Integer) result[6]);  // variant_quantity

            return dto;
        }).collect(Collectors.toList());
    }


    public List<ProductVariantDTO> getProductVariants(Long productId) {
        List<Object[]> rawVariants = productRepository.getProductVariants(productId); // Lấy dữ liệu thô từ Repository
        List<ProductVariantDTO> variantDTOs = new ArrayList<>();

        for (Object[] rawVariant : rawVariants) {
            ProductVariantDTO dto = new ProductVariantDTO(
                    (String) rawVariant[0],  // name
                    (String) rawVariant[1],  // image_url
                    ((Number) rawVariant[2]).doubleValue(), // Chuyển đổi Number -> Double
                    ((Number) rawVariant[3]).intValue(),    // stock (Number -> int)
                    (String) rawVariant[4],                 // description
                    ((Number) rawVariant[5]).longValue()    // id_Variants (Number -> Long)
            );
            variantDTOs.add(dto);
        }

        return variantDTOs; // Trả về danh sách DTO
    }

    public List<Image> getImagesByProductVariantId(Long productVariantId) {
        return imageRepository.findByProductVariant_Id(productVariantId);
    }

    public Optional<ProductVariant> getProductVariantById(Long id) {
        return productVariantRepository.findById(id);}  // Giả sử có phương thức này trong repository

    public List<Product> getProductsByCategoryId(int categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }


}