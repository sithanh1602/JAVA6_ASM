package com.be.service;

import com.be.dto.BuildPCProductVariantDTO;
import com.be.dto.BuildPCResponseDTO;
import com.be.entity.BuildPC;
import com.be.entity.BuildPCImages;
import com.be.entity.BuildPCProductVariant;
import com.be.entity.ProductVariant;
import com.be.entity.Category;
import com.be.rep.BuildPCRepository;
import com.be.rep.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class BuildPCService {

    @Autowired
    private BuildPCRepository buildPCRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    public void createBuildPC(BuildPCResponseDTO request) {
        // Tạo entity BuildPC từ DTO
        BuildPC buildPC = new BuildPC();
        buildPC.setBuildName(request.getBuildName());
        buildPC.setTotalPrice(request.getTotalPrice());
        buildPC.setUsagePurpose(request.getUsagePurpose());
        buildPC.setDescription(request.getDescription());
        buildPC.setStatus(request.getStatus());
        // Lấy ngày hiện tại
        buildPC.setCreatedDate(LocalDateTime.now());

        // Lưu BuildPC vào database trước để lấy ID
        buildPC = buildPCRepository.save(buildPC);

        // Tạo một biến final để sử dụng trong lambda
        final BuildPC finalBuildPC = buildPC;

        // Lưu danh sách Product Variants
        List<BuildPCProductVariant> productVariants = request.getBuildPCProductVariants().stream()
                .map(dto -> {
                    BuildPCProductVariant variant = new BuildPCProductVariant();
                    variant.setBuildPC(finalBuildPC);

                    ProductVariant productVariant = productVariantRepository.findById(dto.getProductVariantId())
                            .orElseThrow(() -> new RuntimeException("Product Variant not found"));

                    variant.setProductVariant(productVariant);
                    variant.setVariantQuantity(dto.getVariantQuantity());
                    return variant;
                }).collect(Collectors.toList());

        // Lưu danh sách hình ảnh
        List<BuildPCImages> images = request.getImageUrls().stream()
                .map(url -> {
                    BuildPCImages image = new BuildPCImages();
                    image.setBuildPC(finalBuildPC);
                    image.setImageUrl(url);
                    return image;
                }).collect(Collectors.toList());

        // Set vào entity BuildPC
        finalBuildPC.setBuildPCProductVariants(productVariants);
        finalBuildPC.setBuildPCImages(images);

        // Lưu vào database
        buildPCRepository.save(finalBuildPC);
    }


    public List<BuildPCResponseDTO> getAllBuildPC() {
        List<BuildPC> buildPCs = buildPCRepository.findAll();

        return buildPCs.stream().map(buildPC -> {
            BuildPCResponseDTO dto = new BuildPCResponseDTO();
            dto.setBuildId(buildPC.getBuildId());
            dto.setBuildName(buildPC.getBuildName());
            dto.setTotalPrice(buildPC.getTotalPrice());
            dto.setUsagePurpose(buildPC.getUsagePurpose());
            dto.setDescription(buildPC.getDescription());
            dto.setStatus(buildPC.getStatus());
            dto.setCreatedDate(buildPC.getCreatedDate());

            // Map danh sách ảnh
            List<String> imageUrls = buildPC.getBuildPCImages().stream()
                    .map(BuildPCImages::getImageUrl)
                    .collect(Collectors.toList());
            dto.setImageUrls(imageUrls);
            dto.setImage(imageUrls.isEmpty() ? null : imageUrls.get(0)); // Lấy ảnh đầu tiên

            // Map danh sách sản phẩm và tính tổng số lượng
            List<BuildPCProductVariantDTO> variantDTOs = buildPC.getBuildPCProductVariants().stream()
                    .map(variant -> {
                        BuildPCProductVariantDTO variantDTO = new BuildPCProductVariantDTO();
                        ProductVariant productVariant = variant.getProductVariant();

                        variantDTO.setProductVariantId(productVariant.getId());
                        variantDTO.setVariantQuantity(variant.getVariantQuantity());

                        // Add the product variant's own quantity
                        variantDTO.setQuantity(productVariant.getQuantity());

                        // Thêm các thông tin chi tiết của variant
                        variantDTO.setNameVariants(productVariant.getNameVariants());
                        variantDTO.setPrice(productVariant.getPrice());
                        variantDTO.setImage(productVariant.getImages() != null && !productVariant.getImages().isEmpty() ?
                                productVariant.getImages().get(0).getImage() : null);
                        variantDTO.setStatus(productVariant.getStatus());

                        // Lấy thông tin về danh mục
                        if (productVariant.getProduct() != null && productVariant.getProduct().getCategory() != null) {
                            variantDTO.setCategoryId((long) productVariant.getProduct().getCategory().getId());
                            variantDTO.setCategoryName(productVariant.getProduct().getCategory().getName());
                        }

                        return variantDTO;
                    }).collect(Collectors.toList());
            dto.setBuildPCProductVariants(variantDTOs);

            // Tính tổng số sản phẩm
            int totalProducts = variantDTOs.stream().mapToInt(BuildPCProductVariantDTO::getVariantQuantity).sum();
            dto.setTotalProducts(totalProducts);

            return dto;
        }).collect(Collectors.toList());
    }

    public void updateBuildPC(Long buildId, BuildPCResponseDTO request) {
        // Tìm BuildPC theo ID
        BuildPC buildPC = buildPCRepository.findById(buildId)
                .orElseThrow(() -> new RuntimeException("BuildPC not found with ID: " + buildId));

        // Cập nhật thông tin cơ bản
        buildPC.setBuildName(request.getBuildName());
        buildPC.setTotalPrice(request.getTotalPrice());
        buildPC.setUsagePurpose(request.getUsagePurpose());
        buildPC.setDescription(request.getDescription());
        buildPC.setStatus(request.getStatus());

        // Cập nhật danh sách Product Variants
        Set<Long> newVariantIds = request.getBuildPCProductVariants().stream()
                .map(BuildPCProductVariantDTO::getProductVariantId)
                .collect(Collectors.toSet());

        // Xóa các variant không còn trong DTO
        buildPC.getBuildPCProductVariants().removeIf(variant ->
                !newVariantIds.contains(variant.getProductVariant().getId()));

        // Cập nhật hoặc thêm mới các variant
        for (BuildPCProductVariantDTO dto : request.getBuildPCProductVariants()) {
            Optional<BuildPCProductVariant> existingVariant = buildPC.getBuildPCProductVariants().stream()
                    .filter(variant -> variant.getProductVariant().getId().equals(dto.getProductVariantId()))
                    .findFirst();

            if (existingVariant.isPresent()) {
                // Nếu variant đã tồn tại, cập nhật số lượng
                existingVariant.get().setVariantQuantity(dto.getVariantQuantity());
            } else {
                // Nếu variant chưa tồn tại, thêm mới
                BuildPCProductVariant newVariant = new BuildPCProductVariant();
                newVariant.setBuildPC(buildPC);
                ProductVariant productVariant = productVariantRepository.findById(dto.getProductVariantId())
                        .orElseThrow(() -> new RuntimeException("Product Variant not found with ID: " + dto.getProductVariantId()));
                newVariant.setProductVariant(productVariant);
                newVariant.setVariantQuantity(dto.getVariantQuantity());
                buildPC.getBuildPCProductVariants().add(newVariant);
            }
        }

        // Cập nhật danh sách hình ảnh mà không làm mất dữ liệu cũ
        Set<String> newImageUrls = new HashSet<>(request.getImageUrls());

        // Xóa ảnh không còn trong danh sách mới
        Iterator<BuildPCImages> iterator = buildPC.getBuildPCImages().iterator();
        while (iterator.hasNext()) {
            BuildPCImages image = iterator.next();
            if (!newImageUrls.contains(image.getImageUrl())) {
                iterator.remove();
            }
        }

        // Thêm ảnh mới nếu chưa có trong danh sách
        for (String url : newImageUrls) {
            boolean exists = buildPC.getBuildPCImages().stream()
                    .anyMatch(image -> image.getImageUrl().equals(url));
            if (!exists) {
                BuildPCImages newImage = new BuildPCImages();
                newImage.setBuildPC(buildPC);
                newImage.setImageUrl(url);
                buildPC.getBuildPCImages().add(newImage);
            }
        }

        // Lưu thay đổi vào database
        buildPCRepository.save(buildPC);
    }

    public void updateBuildPCStatus(Long buildId, String status) {
        BuildPC buildPC = buildPCRepository.findById(buildId)
                .orElseThrow(() -> new RuntimeException("BuildPC not found with ID: " + buildId));
        buildPC.setStatus(status);
        buildPCRepository.save(buildPC);
    }

    public BuildPCResponseDTO getBuildPCById(Long buildId) {
        // Tìm BuildPC theo ID
        BuildPC buildPC = buildPCRepository.findById(buildId)
                .orElseThrow(() -> new RuntimeException("BuildPC not found with ID: " + buildId));

        // Chuyển đổi sang BuildPCResponseDTO
        BuildPCResponseDTO dto = new BuildPCResponseDTO();
        dto.setBuildId(buildPC.getBuildId());
        dto.setBuildName(buildPC.getBuildName());
        dto.setTotalPrice(buildPC.getTotalPrice());
        dto.setUsagePurpose(buildPC.getUsagePurpose());
        dto.setDescription(buildPC.getDescription());
        dto.setStatus(buildPC.getStatus());
        dto.setCreatedDate(buildPC.getCreatedDate());

        // Map danh sách ảnh
        List<String> imageUrls = buildPC.getBuildPCImages().stream()
                .map(BuildPCImages::getImageUrl)
                .collect(Collectors.toList());
        dto.setImageUrls(imageUrls);
        dto.setImage(imageUrls.isEmpty() ? null : imageUrls.get(0)); // Lấy ảnh đầu tiên

        // Map danh sách sản phẩm và tính tổng số lượng
        List<BuildPCProductVariantDTO> variantDTOs = buildPC.getBuildPCProductVariants().stream()
                .map(variant -> {
                    BuildPCProductVariantDTO variantDTO = new BuildPCProductVariantDTO();
                    ProductVariant productVariant = variant.getProductVariant();

                    variantDTO.setProductVariantId(productVariant.getId());
                    variantDTO.setVariantQuantity(variant.getVariantQuantity());

                    // Add the product variant's own quantity
                    variantDTO.setQuantity(productVariant.getQuantity());

                    // Thêm các thông tin chi tiết của variant
                    variantDTO.setNameVariants(productVariant.getNameVariants());
                    variantDTO.setPrice(productVariant.getPrice());
                    variantDTO.setImage(productVariant.getImages() != null && !productVariant.getImages().isEmpty() ?
                            productVariant.getImages().get(0).getImage() : null);
                    variantDTO.setStatus(productVariant.getStatus());

                    // Lấy thông tin về danh mục
                    if (productVariant.getProduct() != null && productVariant.getProduct().getCategory() != null) {
                        variantDTO.setCategoryId((long) productVariant.getProduct().getCategory().getId());
                        variantDTO.setCategoryName(productVariant.getProduct().getCategory().getName());
                    }

                    return variantDTO;
                }).collect(Collectors.toList());
        dto.setBuildPCProductVariants(variantDTOs);

        // Tính tổng số sản phẩm
        int totalProducts = variantDTOs.stream().mapToInt(BuildPCProductVariantDTO::getVariantQuantity).sum();
        dto.setTotalProducts(totalProducts);

        return dto;
    }

}
