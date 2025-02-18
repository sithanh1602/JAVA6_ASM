package com.be.service;

import com.be.DTO.ProductVariantDTO;
import com.be.DTO.ProductVariantHomeDTO;
import com.be.DTO.ProductVariantRequest;
import com.be.entity.Attribute;
import com.be.entity.Image;
import com.be.entity.Product;
import com.be.entity.ProductVariant;
import com.be.rep.AttributeRepository;
import com.be.rep.ImageRepository;
import com.be.rep.ProductRepository;
import com.be.rep.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductVariantService {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AttributeRepository attributeRepository;

    @Autowired
    private ImageRepository imageRepository;

    public List<ProductVariant> getAllProductVariants() {
        List<ProductVariant> productVariants = productVariantRepository.findAll();
        return productVariants;
    }
    public List<ProductVariantHomeDTO> getAllProductVariantsWithFirstImage() {
        List<Object[]> results = productVariantRepository.findAllWithFirstImage();

        return results.stream().map(row -> {
            ProductVariantHomeDTO dto = new ProductVariantHomeDTO();
            dto.setId(row[0] != null ? ((Number) row[0]).longValue() : null);  // id
            dto.setImage(row[1] != null ? (String) row[1] : "default.jpg");    // image (tránh lỗi null)
            dto.setNameVariants(row[2] != null ? (String) row[2] : "");        // nameVariants
            dto.setPrice(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0); // price
            dto.setProductId(row[4] != null ? ((Number) row[4]).longValue() : null); // productId
            dto.setQuantity(row[5] != null ? ((Number) row[5]).intValue() : 0); // quantity
            dto.setStatus(row[6] != null ? (String) row[6] : "unknown");      // status
            dto.setBrandName(row[7] != null ? (String) row[7] : "Unknown");   // ✅ brand_name
            dto.setCategoryName(row[8] != null ? (String) row[8] : "Unknown"); // ✅ category_name
            return dto;
        }).collect(Collectors.toList());
    }

    public List<ProductVariantDTO> searchProductVariantsByName(String keyword) {
        return productVariantRepository.findByNameVariantsContainingIgnoreCase(keyword)
                .stream()
                .map(product -> new ProductVariantDTO(product))
                .collect(Collectors.toList());
    }

    public ProductVariant addProductVariant(ProductVariantRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Attribute> attributes = new ArrayList<>(attributeRepository.findAllById(request.getAttributeIds()));

        String attributeNames = attributes.stream()
                .map(Attribute::getValue)
                .collect(Collectors.joining("/"));

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setQuantity(request.getQuantity());
        variant.setPrice(request.getPrice());
        variant.setStatus(request.getStatus());
        variant.setAttributes(attributes);
        variant.setNameVariants(product.getName() + " (" + attributeNames + ")");

        ProductVariant savedVariant = productVariantRepository.save(variant);

        // ✅ Lưu tất cả ảnh vào bảng Image
        for (String imageUrl : request.getImageUrls()) {
            Image image = new Image();
            image.setProductVariant(savedVariant);
            image.setImage(imageUrl);
            imageRepository.save(image);
        }

        return savedVariant;
    }
}
