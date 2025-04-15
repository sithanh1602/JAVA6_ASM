package com.be.service;

import com.be.dto.AttributeDTO;
import com.be.dto.ProductVariantDTO;
import com.be.entity.Favorite;
import com.be.entity.ProductVariant;
import com.be.entity.User;
import com.be.rep.FavoritesRepository;
import com.be.rep.ProductVariantRepository;
import com.be.rep.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoritesService {

    private final FavoritesRepository favoritesRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;

    /**
     * Lấy danh sách sản phẩm yêu thích của một user.
     */
    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getFavoriteProductDetailsByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User không tồn tại với ID: " + userId);
        }

        return favoritesRepository.findProductVariantsByUserId(userId).stream()
                .map(this::convertToProductVariantDTO)
                .collect(Collectors.toList());
    }

    private ProductVariantDTO convertToProductVariantDTO(ProductVariant variant) {
        String defaultImage = variant.getImages().isEmpty() ?
                "default.jpg" : variant.getImages().get(0).getImage();

        List<AttributeDTO> attributes = variant.getAttributes().stream()
                .map(attr -> new AttributeDTO(
                        attr.getId(),
                        attr.getName(),
                        attr.getValue()
                ))
                .collect(Collectors.toList());

        return new ProductVariantDTO(
                variant.getNameVariants(),
                defaultImage,
                variant.getPrice(),
                variant.getQuantity(),
                variant.getProduct().getDescription(),
                variant.getId(),
                variant.getStatus(),
                attributes,
                Long.valueOf(variant.getProduct().getId()),
                variant.getDiscountPrice(),
                variant.getDiscountPercentage()
        );
    }

    /**
     * Thêm sản phẩm vào danh sách yêu thích của user.
     */
    @Transactional
    public Favorite addFavorite(Long userId, Long productVariantId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại!"));

        ProductVariant productVariant = productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new RuntimeException("ProductVariant không tồn tại!"));

        if (favoritesRepository.existsByUserIdAndProductVariantId(userId, productVariantId)) {
            throw new RuntimeException("Sản phẩm này đã có trong danh sách yêu thích!");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(Math.toIntExact(user.getUserId()));
        favorite.setProductVariantId(productVariant.getId());
        favorite.setUser(user);
        favorite.setProductVariant(productVariant);

        return favoritesRepository.save(favorite);
    }

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích của user.
     */
    @Transactional
    public void removeFavorite(Long userId, Long productVariantId) {
        Favorite favorite = favoritesRepository.findByUserIdAndProductVariantId(userId, productVariantId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm này không có trong danh sách yêu thích!"));

        favoritesRepository.delete(favorite);
    }

    /**
     * Kiểm tra xem một sản phẩm có trong danh sách yêu thích của user hay không
     */
    @Transactional(readOnly = true)
    public boolean isProductFavorited(Long userId, Long productVariantId) {
        return favoritesRepository.existsByUserIdAndProductVariantId(userId, productVariantId);
    }
}