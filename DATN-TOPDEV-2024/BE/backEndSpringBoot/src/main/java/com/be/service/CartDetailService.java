package com.be.service;

import com.be.entity.*;
import com.be.rep.*;
import com.be.dto.CartDetailResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartDetailService {

    @Autowired
    private CartDetailRepository cartDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private BuildPCRepository buildPCRepository;

    @Autowired
    private UserRepository userRepository;


    public List<CartDetailResponseDTO> getCartDetailsByUserId(Long userId) {
        List<CartDetail> cartDetails = cartDetailRepository.findByUserIdUserId(userId);

        return cartDetails.stream().map(cartDetail -> {
            CartDetailResponseDTO dto = new CartDetailResponseDTO();
            dto.setId(cartDetail.getId());
            dto.setUserId(cartDetail.getUserId().getUserId());
            dto.setQuantity(cartDetail.getQuantity());

            // Xử lý ProductVariant
            if (cartDetail.getProduct_variant_id() != null) {
                dto.setProduct_variant_id(cartDetail.getProduct_variant_id().getId());
                ProductVariant productVariant = productVariantRepository.findById(cartDetail.getProduct_variant_id().getId())
                        .orElse(null);
                if (productVariant != null) {
                    dto.setProductName(productVariant.getNameVariants());
                    dto.setProductDescription(productVariant.getDescription());
                    dto.setProductQuantity(productVariant.getQuantity());
                    dto.setProductPrice(productVariant.getPrice().intValue());
                    dto.setProductDiscountPrice(productVariant.getDiscountPrice() != null ? productVariant.getDiscountPrice().doubleValue() : null); // Thêm discountPrice
                    dto.setProductStatus(productVariant.getStatus());

                    // Get image URL from first image in the list if available
                    if (productVariant.getImages() != null && !productVariant.getImages().isEmpty()) {
                        dto.setProductImageUrl(productVariant.getImages().get(0).getImage());
                    }
                }
            }

            // Xử lý BuildPC (giữ nguyên, không thêm discountPrice)
            if (cartDetail.getBuildId() != null) {
                com.be.entity.BuildPC buildPC = buildPCRepository.findById(cartDetail.getBuildId().getBuildId()).orElse(null);
                if (buildPC != null) {
                    com.be.dto.BuildPCResponseDTO buildDTO = new com.be.dto.BuildPCResponseDTO();
                    buildDTO.setBuildId(buildPC.getBuildId());
                    buildDTO.setBuildName(buildPC.getBuildName());
                    buildDTO.setTotalPrice(buildPC.getTotalPrice());
                    buildDTO.setUsagePurpose(buildPC.getUsagePurpose());
                    buildDTO.setDescription(buildPC.getDescription());
                    buildDTO.setStatus(buildPC.getStatus());
                    buildDTO.setCreatedDate(buildPC.getCreatedDate());

                    // Get image from BuildPCImages if available
                    if (buildPC.getBuildPCImages() != null && !buildPC.getBuildPCImages().isEmpty()) {
                        buildDTO.setImage(buildPC.getBuildPCImages().get(0).getImageUrl());

                        List<String> imageUrls = buildPC.getBuildPCImages().stream()
                                .map(BuildPCImages::getImageUrl)
                                .collect(Collectors.toList());
                        buildDTO.setImageUrls(imageUrls);
                    }

                    // Lấy danh sách sản phẩm trong build
                    List<com.be.dto.BuildPCProductVariantDTO> variantDTOs = buildPC.getBuildPCProductVariants().stream()
                            .map(variant -> {
                                com.be.dto.BuildPCProductVariantDTO variantDTO = new com.be.dto.BuildPCProductVariantDTO();
                                ProductVariant pv = variant.getProductVariant();

                                variantDTO.setProductVariantId(pv.getId());
                                variantDTO.setVariantQuantity(variant.getVariantQuantity());
                                variantDTO.setQuantity(pv.getQuantity());
                                variantDTO.setNameVariants(pv.getNameVariants());
                                variantDTO.setPrice(pv.getPrice());
                                variantDTO.setStatus(pv.getStatus());

                                // Get image URL from first image in the list if available
                                if (pv.getImages() != null && !pv.getImages().isEmpty()) {
                                    variantDTO.setImage(pv.getImages().get(0).getImage());
                                }

                                // Lấy thông tin về danh mục
                                if (pv.getProduct() != null && pv.getProduct().getCategory() != null) {
                                    variantDTO.setCategoryId((long) pv.getProduct().getCategory().getId());
                                    variantDTO.setCategoryName(pv.getProduct().getCategory().getName());
                                }

                                return variantDTO;
                            }).collect(Collectors.toList());
                    buildDTO.setBuildPCProductVariants(variantDTOs);

                    // Tính tổng số sản phẩm
                    int totalProducts = variantDTOs.stream()
                            .mapToInt(com.be.dto.BuildPCProductVariantDTO::getVariantQuantity)
                            .sum();
                    buildDTO.setTotalProducts(totalProducts);

                    dto.setBuildPC(buildDTO);
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public CartDetail addProductVariantToCart(Long userId, Long productVariantId, Integer quantity) {
        // Validate user existence
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User không tồn tại với ID: " + userId));

        // Validate product variant existence
        ProductVariant productVariant = productVariantRepository.findById(productVariantId).orElseThrow(() ->
                new RuntimeException("ProductVariant không tồn tại với ID: " + productVariantId));

        // Kiểm tra số lượng tồn kho
        int availableStock = productVariant.getQuantity();
        Optional<CartDetail> existingCartDetailOpt = cartDetailRepository.findByUserIdAndProductVariantId(userId, productVariantId);
        int currentQuantityInCart = existingCartDetailOpt.map(CartDetail::getQuantity).orElse(0);

        if (quantity + currentQuantityInCart > availableStock) {
            throw new RuntimeException(String.format("Sản phẩm chỉ còn %d sản phẩm trong kho. Vui lòng giảm số lượng.", availableStock));
        }


        // Find existing cart detail or create a new one
        CartDetail cartDetail = existingCartDetailOpt.orElseGet(CartDetail::new);

        // Set properties for CartDetail
        cartDetail.setUserId(user);
        cartDetail.setProduct_variant_id(productVariant);
        cartDetail.setQuantity(currentQuantityInCart + quantity);

        // Save the updated cart detail
        return cartDetailRepository.save(cartDetail);
    }

    public CartDetail addPcToCart(Long userId, Long buildId, Integer quantity) {
        // Kiểm tra sự tồn tại của User
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User không tồn tại với ID: " + userId));

        // Kiểm tra sự tồn tại của BuildPC
        BuildPC buildPC = buildPCRepository.findById(buildId).orElseThrow(() ->
                new RuntimeException("BuildPC không tồn tại với ID: " + buildId));

        // Kiểm tra số lượng tồn kho của các sản phẩm trong BuildPC
        for (BuildPCProductVariant variant : buildPC.getBuildPCProductVariants()) {
            ProductVariant pv = variant.getProductVariant();
            int requiredQuantity = variant.getVariantQuantity() * quantity;
            if (pv.getQuantity() < requiredQuantity) {
                throw new RuntimeException(String.format(
                        "Sản phẩm %s trong BuildPC chỉ còn %d sản phẩm trong kho. Vui lòng giảm số lượng.",
                        pv.getNameVariants(), pv.getQuantity()));
            }
        }

        // Tìm CartDetail hiện có (sử dụng query mới)
        Optional<CartDetail> existingCartDetailOpt = cartDetailRepository.findByUserIdAndBuildId(userId, buildId);
        CartDetail cartDetail = existingCartDetailOpt.orElseGet(CartDetail::new);

        // Cập nhật thông tin CartDetail
        cartDetail.setUserId(user);
        cartDetail.setBuildId(buildPC);
        int currentQuantity = existingCartDetailOpt.map(CartDetail::getQuantity).orElse(0);
        cartDetail.setQuantity(currentQuantity + quantity);

        // Lưu CartDetail vào cơ sở dữ liệu
        return cartDetailRepository.save(cartDetail);
    }


    public void removeProduct(Long userId, Long productVariantId, Long buildId) {
        if (productVariantId != null) {
            cartDetailRepository.deleteByUserIdAndproductVariantId(userId, productVariantId);
        } else if (buildId != null) {
            cartDetailRepository.deleteByUserIdAndBuildId(userId, buildId);
        } else {
            throw new RuntimeException("Phải cung cấp productVariantId hoặc buildId để xóa mục khỏi giỏ hàng.");
        }
    }

}
