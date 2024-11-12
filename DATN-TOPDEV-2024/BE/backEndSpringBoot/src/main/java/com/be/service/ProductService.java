package com.be.service;

import com.be.entity.*;
import com.be.rep.AttributesProductVariantRepository;
import com.be.rep.BrandRepository;
import com.be.rep.ProductRepository; // Import your Product repository
import com.be.rep.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Method to retrieve all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Method to retrieve a product by its ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // Method to create a new product
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // Method to update an existing product
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
//        product.setPrice(productDetails.getPrice());
        // Update other fields if necessary

        return productRepository.save(product);
    }

    // Method to delete a product by its ID
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Autowired
    private BrandRepository brandRepository; // Giả sử bạn có một BrandRepository

    // Phương thức này trả về thông tin thương hiệu của sản phẩm dựa trên ID
    public Brand getBrandByProductId(Long productId) {
        // Lấy sản phẩm theo ID
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Trả về thương hiệu của sản phẩm
        return product.getBrand(); // Giả sử Product có mối quan hệ với Brand
    }

    public List<ProductVariant> getVariantsByProductId(int productId) {
        return productVariantRepository.findByProductId(productId);
    }


    @Autowired
    private AttributesProductVariantRepository attributesProductVariantRepository;

    public List<Attribute> getAttributesByVariantId(int variantId) {
        return attributesProductVariantRepository.findByProductVariantId(variantId)
                .stream()
                .map(AttributesProductVariant::getAttribute)
                .collect(Collectors.toList());
    }
}
