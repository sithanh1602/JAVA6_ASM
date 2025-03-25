package com.be.dto;

import lombok.Data;

import java.util.Date;

@Data
public class CartDetailResponseDTO {

    private Long id; // ID của CartDetail
    private Long userId; // ID của người dùng (user)
    private Long product_variant_id; // ID của sản phẩm biến thể (product)
    private Integer quantity; // Số lượng sản phẩm trong giỏ

    // Các thông tin về sản phẩm
    private String productName; // Tên sản phẩm
    private String productDescription; // Mô tả sản phẩm
    private Integer productQuantity; // Số lượng còn lại của sản phẩm trong kho
    private String productImageUrl; // URL hình ảnh của sản phẩm
    private Integer productPrice; // Giá của sản phẩm
    private String productStatus; // Trạng thái sản phẩm (ví dụ: "Còn hàng", "Hết hàng")
    private BuildPCResponseDTO buildPC;


}
