package com.be.service;

import com.be.entity.CartDetail;
import com.be.entity.Product;
import com.be.entity.User;
import com.be.rep.CartDetailRepository;
import com.be.rep.ProductRepository;
import com.be.rep.UserRepository;
import com.be.DTO.CartDetailResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    private UserRepository userRepository;

    public List<CartDetail> findCartItemsByUserId(Long userId) {
        return cartDetailRepository.findByUserId(userId);
    }

//    public List<CartDetailResponseDTO> getCartItemsWithProductInfo(Long userId) {
//        List<CartDetail> cartDetails = cartDetailRepository.findByUserId(userId);
//
//        return cartDetails.stream().map(cartDetail -> {
//            CartDetailResponseDTO dto = new CartDetailResponseDTO();
//            dto.setId(cartDetail.getId());
//
//            // Set user ID if present
//            if (cartDetail.getUserId() != null) {
//                dto.setUserId(cartDetail.getUserId().getUserId());
//            } else {
//                dto.setUserId(null);
//            }
//
//            // Set product details if present
//            Optional<Product> productOpt = Optional.ofNullable(cartDetail.getProduct());
//            if (productOpt.isPresent()) {
//                Product product = productOpt.get();
//                dto.setProductId((long) product.getId());
//                dto.setProductName(product.getName());
//                dto.setProductDescription(product.getDescription());
//                dto.setProductStock(product.getStock());
//                dto.setProductImageUrl(product.getImageUrl());
//                dto.setProductCreatedAt(product.getCreatedAt());
//                dto.setProductPrice(product.getPrice());
//                dto.setProductStatus(product.getStatus());
//            } else {
//                dto.setProductId(null);
//                dto.setProductName(null);
//                dto.setProductDescription(null);
//                dto.setProductStock(0);
//                dto.setProductImageUrl(null);
//                dto.setProductCreatedAt(null);
//                dto.setProductPrice(0);
//                dto.setProductStatus(null);
//            }
//
//            dto.setQuantity(cartDetail.getQuantity());
//            return dto;
//        }).collect(Collectors.toList());
//    }
//
//    public CartDetail addProductToCart(Long userId, Long productId, Integer quantity) {
//        // Validate user and product existence
//        User user = userRepository.findById(userId).orElseThrow(() ->
//                new RuntimeException("User không tồn tại với ID: " + userId));
//        Product product = productRepository.findById(productId).orElseThrow(() ->
//                new RuntimeException("Product không tồn tại với ID: " + productId));
//
//        // Find existing cart detail or create a new one
//        CartDetail cartDetail = cartDetailRepository.findByUserIdAndProductId(userId, productId)
//                .orElseGet(CartDetail::new);
//
//        // Set properties for CartDetail
//        cartDetail.setUserId(user);
//        cartDetail.setProduct(product);
//        cartDetail.setQuantity(cartDetail.getQuantity() == null ? quantity : cartDetail.getQuantity() + quantity);
//
//        return cartDetailRepository.save(cartDetail);
//    }

    public void removeProduct(Long userId, Long productId) {
        // Xóa sản phẩm khỏi giỏ hàng của người dùng
        cartDetailRepository.deleteByUserIdAndProductId(userId, productId);
    }

}
