package com.be.service;

import com.be.GeminiClientdto.*;
import com.be.dto.ProductDto;
import com.be.dto.ProductVariantDTO;
import com.be.entity.*;
import com.be.rep.*;
import jakarta.validation.ValidationException;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
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
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);
    private final RestTemplate restTemplate;
    public String GEMINI_API_KEY = "AIzaSyB6zel6RztndELsv2-0otD6Q0f53RP5HO8";
    @Autowired
    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository, ImageRepository imageRepository, CategoryService categoryService, ProductVariantRepository productVariantRepository, RestTemplate restTemplate) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.imageRepository = imageRepository;
        this.categoryService = categoryService;
        this.productVariantRepository = productVariantRepository;
        this.restTemplate = restTemplate;
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

            // Chuyển đổi từ BigDecimal sang Double cho price
            BigDecimal price = (BigDecimal) result[2]; // product_price
            dto.setPrice(price != null ? price.doubleValue() : null);

            // Chuyển đổi từ BigDecimal sang Double cho discount_price
            BigDecimal discountPrice = (BigDecimal) result[3]; // discount_price
            dto.setDiscountPrice(discountPrice != null ? discountPrice.doubleValue() : null);

            dto.setImage((String) result[4]);  // product_image
            dto.setAttributes((String) result[5]);  // attributes
            dto.setVariantId((Long) result[6]);  // variant_id
            dto.setQuantity((Integer) result[7]);  // variant_quantity
            dto.setStatus((String) result[8]);

            return dto;
        }).collect(Collectors.toList());
    }


    public List<ProductVariantDTO> getProductVariants(Long productId) {
        List<Object[]> rawVariants = productRepository.getProductVariants(productId);
        List<ProductVariantDTO> variantDTOs = new ArrayList<>();

        for (Object[] rawVariant : rawVariants) {
            ProductVariantDTO dto = new ProductVariantDTO(
                    (String) rawVariant[0],  // name
                    (String) rawVariant[1],  // image_url
                    ((Number) rawVariant[2]).doubleValue(), // price
                    ((Number) rawVariant[3]).intValue(),    // stock
                    (String) rawVariant[4],  // description
                    ((Number) rawVariant[5]).longValue(),   // idVariants
                    (String) rawVariant[6],  // status
                    productId,  // productId
                    rawVariant[7] != null ? ((Number) rawVariant[7]).doubleValue() : null, // discountPrice
                    rawVariant[8] != null ? ((Number) rawVariant[8]).doubleValue() : null  // discountPercentage
            );
            variantDTOs.add(dto);
        }

        return variantDTOs;
    }


    public List<Image> getImagesByProductVariantId(Long productVariantId) {
        return imageRepository.findByProductVariant_Id(productVariantId);
    }

    public Optional<ProductVariant> getProductVariantById(Long id) {
        return productVariantRepository.findById(id);}  // Giả sử có phương thức này trong repository

    public List<Product> getProductsByCategoryId(int categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public Integer checkVariantQuantity(Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
        return variant.getQuantity();
    }

    // Lấy danh sách sản phẩm đang giảm giá
    public List<ProductVariant> getDiscountedProducts() {
        return productVariantRepository.findByDiscountPriceLessThanOriginalPrice();
    }
    /// full product
    public List<FullProductDTO> getAllProductsWithFullDetails() {
        logger.info("Starting to fetch all products with full details");
        try {
            // Lấy products với category và brand
            List<Product> products = productRepository.findAllWithBasicDetails();
            if (products == null || products.isEmpty()) {
                logger.warn("No products found in the repository");
                return Collections.emptyList();
            }
            logger.info("Fetched {} products from repository", products.size());

            // Lấy tất cả product IDs
            List<Integer> productIds = products.stream()
                    .map(Product::getId)
                    .collect(Collectors.toList());

            // Lấy variants với images
            List<ProductVariant> variantsWithImages = productRepository.findVariantsWithImagesByProductIds(productIds);
            logger.info("Fetched {} product variants with images", variantsWithImages.size());

            // Lấy variants với attributes
            List<ProductVariant> variantsWithAttributes = productRepository.findVariantsWithAttributesByProductIds(productIds);
            logger.info("Fetched {} product variants with attributes", variantsWithAttributes.size());

            // Hợp nhất variants (images + attributes) dựa trên variant ID
            Map<Long, ProductVariant> variantMap = new HashMap<>();
            for (ProductVariant variant : variantsWithImages) {
                variantMap.put(variant.getId(), variant);
            }
            for (ProductVariant variant : variantsWithAttributes) {
                ProductVariant existingVariant = variantMap.get(variant.getId());
                if (existingVariant != null) {
                    existingVariant.setAttributes(variant.getAttributes());
                } else {
                    variantMap.put(variant.getId(), variant);
                }
            }

            // Nhóm variants theo product ID
            Map<Integer, Set<ProductVariant>> productVariantMap = variantMap.values().stream()
                    .collect(Collectors.groupingBy(v -> v.getProduct().getId(), Collectors.toSet()));

            // Gán variants vào products
            products.forEach(p -> p.setProductVariants(productVariantMap.getOrDefault(p.getId(), Collections.emptySet())));

            // Chuyển đổi sang DTO
            List<FullProductDTO> result = products.stream()
                    .map(this::mapToFullProductDTO)
                    .collect(Collectors.toList());

            logger.info("Successfully mapped {} products to FullProductDTO", result.size());
            return result;
        } catch (Exception e) {
            logger.error("Error while fetching products with full details: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch products with full details", e);
        }
    }

    private FullProductDTO mapToFullProductDTO(Product product) {
        logger.debug("Mapping product with ID: {} to FullProductDTO", product.getId());
        FullProductDTO dto = new FullProductDTO();
        dto.setProductId(product.getId());
        dto.setProductName(product.getName() != null ? product.getName() : "Unknown");

        if (product.getCategory() != null) {
            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setCategoryId(product.getCategory().getId());
            categoryDTO.setName(product.getCategory().getName() != null ? product.getCategory().getName() : "Unknown");
            dto.setCategory(categoryDTO);
            logger.debug("Mapped category for product ID: {}", product.getId());
        }

        if (product.getBrand() != null && product.getBrand().getBrandsId() != null) {
            BrandDTO brandDTO = new BrandDTO();
            brandDTO.setBrandId(product.getBrand().getBrandsId().intValue());
            brandDTO.setName(product.getBrand().getName() != null ? product.getBrand().getName() : "Unknown");
            dto.setBrand(brandDTO);
            logger.debug("Mapped brand for product ID: {}", product.getId());
        }

        dto.setDescription(product.getDescription());
        dto.setStock(product.getStock());
        dto.setImageUrl(product.getImageUrl());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setStatus(product.getStatus());
        dto.setPurchaseCount(product.getPurchaseCount());

        if (product.getProductVariants() != null && !product.getProductVariants().isEmpty()) {
            dto.setProductVariants(product.getProductVariants().stream()
                    .map(this::mapToProductVariantDTO)
                    .collect(Collectors.toSet()));
            logger.debug("Mapped {} product variants for product ID: {}", dto.getProductVariants().size(), product.getId());
        } else {
            dto.setProductVariants(Collections.emptySet());
        }

        return dto;
    }

    private ProductVariantsDTO mapToProductVariantDTO(ProductVariant variant) {
        logger.debug("Mapping product variant with ID: {} to ProductVariantsDTO", variant.getId());
        ProductVariantsDTO dto = new ProductVariantsDTO();
        dto.setVariantId(variant.getId());
        dto.setNameVariants(variant.getNameVariants() != null ? variant.getNameVariants() : "Unknown");
        dto.setQuantity(variant.getQuantity());
        dto.setDescription(variant.getDescription());
        dto.setStatus(variant.getStatus());
        dto.setPrice(variant.getPrice());

        if (variant.getImages() != null && !variant.getImages().isEmpty()) {
            dto.setImages(variant.getImages().stream()
                    .map(this::mapToImageDTO)
                    .collect(Collectors.toList()));
            logger.debug("Mapped {} images for variant ID: {}", dto.getImages().size(), variant.getId());
        } else {
            dto.setImages(Collections.emptyList());
        }

        if (variant.getAttributes() != null && !variant.getAttributes().isEmpty()) {
            dto.setAttributes(variant.getAttributes().stream()
                    .map(this::mapToAttributeDTO)
                    .collect(Collectors.toList()));
            logger.debug("Mapped {} attributes for variant ID: {}", dto.getAttributes().size(), variant.getId());
        } else {
            dto.setAttributes(Collections.emptyList());
        }

        return dto;
    }

    private ImageDTO mapToImageDTO(Image image) {
        logger.debug("Mapping image with ID: {} to ImageDTO", image.getId());
        ImageDTO dto = new ImageDTO();
        dto.setImageId(image.getId());
        dto.setImageUrl(image.getImage() != null ? image.getImage() : "Unknown");
        return dto;
    }

    private AttributeDTO mapToAttributeDTO(Attribute attribute) {
        logger.debug("Mapping attribute with ID: {} to AttributeDTO", attribute.getId());
        AttributeDTO dto = new AttributeDTO();
        dto.setAttributeId(attribute.getId());
        dto.setName(attribute.getName() != null ? attribute.getName() : "Unknown");
        dto.setValue(attribute.getValue());
        return dto;
    }



}