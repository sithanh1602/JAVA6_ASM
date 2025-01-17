package com.be.service;

import com.be.entity.CartDetail;
import com.be.entity.Product;
import com.be.entity.ProductVariant;
import com.be.entity.User;
import com.be.rep.CartDetailRepository;
import com.be.rep.ProductRepository;
import com.be.rep.ProductVariantRepository;
import com.be.rep.UserRepository;
import com.be.DTO.CartDetailResponseDTO;
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
    private UserRepository userRepository;

    public List<CartDetail> findCartItemsByUserId(Long userId) {
        return cartDetailRepository.findByUserId(userId);
    }

    public List<CartDetailResponseDTO> getCartDetailsWithProductInfo(Long userId) {
        List<Object[]> results = cartDetailRepository.findCartDetailsWithProductInfo(userId);

        return results.stream().map(result -> {
            CartDetailResponseDTO dto = new CartDetailResponseDTO();

            dto.setId(((Number) result[0]).longValue());
            dto.setUserId(((Number) result[1]).longValue());
            dto.setProduct_variant_id(((Number) result[2]).longValue());
            dto.setQuantity(((Number) result[3]).intValue());
            dto.setProductName((String) result[4]);
            dto.setProductDescription((String) result[5]);
            dto.setProductQuantity(((Number) result[6]).intValue());
            dto.setProductImageUrl((String) result[7]);
            dto.setProductCreatedAt((Date) result[8]);
            dto.setProductPrice(((Number) result[9]).intValue());
            dto.setProductStatus((String) result[10]);

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

            // Find existing cart detail or create a new one
            CartDetail cartDetail = cartDetailRepository.findByUserIdAndProductVariantId(userId, productVariantId)
                    .orElseGet(CartDetail::new);

            // Set properties for CartDetail
            cartDetail.setUserId(user);
            cartDetail.setProduct_variant_id(productVariant);
            cartDetail.setQuantity(cartDetail.getQuantity() == null ? quantity : cartDetail.getQuantity() + quantity);

            // Save the updated cart detail
            return cartDetailRepository.save(cartDetail);
        }

    public void removeProduct(Long userId, Long productVariantId) {
        // Xóa sản phẩm khỏi giỏ hàng của người dùng
        cartDetailRepository.deleteByUserIdAndproductVariantId(userId, productVariantId);
    }

}
