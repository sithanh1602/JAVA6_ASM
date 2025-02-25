package com.be.service;

import com.be.DTO.AttributeDTO;
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
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
        variant.setDescription(request.getDescription());

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

    @Transactional
    public ProductVariant updateProductVariant(Long variantId, ProductVariantRequest request) {
        // Tìm variant cần cập nhật
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));

        // Lấy product từ request
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Lấy danh sách attributes mới
        List<Attribute> attributes = new ArrayList<>(attributeRepository.findAllById(request.getAttributeIds()));

        // Tạo tên variant mới từ attributes
        String attributeNames = attributes.stream()
                .map(Attribute::getValue)
                .collect(Collectors.joining("/"));

        // Cập nhật thông tin variant
        variant.setProduct(product);
        variant.setQuantity(request.getQuantity());
        variant.setPrice(request.getPrice());
        variant.setStatus(request.getStatus());
        variant.setAttributes(attributes);
        variant.setNameVariants(product.getName() + " (" + attributeNames + ")");
        variant.setDescription(request.getDescription());

        // Cập nhật ảnh
        imageRepository.deleteByProductVariant(variant);

        // Thêm ảnh mới
        for (String imageUrl : request.getImageUrls()) {
            Image image = new Image();
            image.setProductVariant(variant);
            image.setImage(imageUrl);
            imageRepository.save(image);
        }

        // Lưu và trả về variant đã cập nhật
        return productVariantRepository.save(variant);
    }


    public List<ProductVariantDTO> getProductVariantsByProductId(Long productId) {
        List<Object[]> results = productVariantRepository.findProductVariantsByProductId(productId);

        // Map để nhóm các thuộc tính theo id của ProductVariant
        Map<Long, ProductVariantDTO> variantMap = new LinkedHashMap<>();

        for (Object[] row : results) {
            Long idVariants = row[0] != null ? ((Number) row[0]).longValue() : null;

            // Nếu chưa có trong map, thêm mới ProductVariantDTO
            if (!variantMap.containsKey(idVariants)) {
                ProductVariantDTO variantDTO = new ProductVariantDTO(
                        row[1] != null ? (String) row[1] : "Unknown",  // name_variants
                        row[5] != null ? (String) row[5] : "default.jpg", // imageUrl
                        row[2] != null ? ((Number) row[2]).doubleValue() : 0.0, // price
                        row[3] != null ? ((Number) row[3]).intValue() : 0, // quantity
                        "Description here", // Nếu cần lấy từ SQL, bạn phải sửa lại câu query
                        idVariants,
                        row[4] != null ? (String) row[4] : "Unknown", // status
                        new ArrayList<>() // Khởi tạo danh sách attributes rỗng
                );
                variantMap.put(idVariants, variantDTO);
            }

            // Thêm thuộc tính vào danh sách
            if (row[6] != null) { // attributeId
                AttributeDTO attributeDTO = new AttributeDTO(
                        ((Number) row[6]).longValue(), // attributeId
                        (String) row[7], // attributeName
                        (String) row[8]  // attributeValue
                );
                variantMap.get(idVariants).getAttributes().add(attributeDTO);
            }
        }

        return new ArrayList<>(variantMap.values());
    }

}
