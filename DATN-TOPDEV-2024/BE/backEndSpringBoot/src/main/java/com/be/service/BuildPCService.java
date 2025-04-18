package com.be.service;
import com.be.dto.BuildPCProductVariantDTO;
import com.be.dto.BuildPCResponseDTO;
import com.be.entity.BuildPC;
import com.be.entity.BuildPCImages;
import com.be.entity.BuildPCProductVariant;
import com.be.entity.ProductVariant;
import com.be.rep.BuildPCRepository;
import com.be.rep.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
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
                        variantDTO.setProductVariantId(variant.getProductVariant().getId());
                        variantDTO.setVariantQuantity(variant.getVariantQuantity());
                        return variantDTO;
                    }).collect(Collectors.toList());
            dto.setBuildPCProductVariants(variantDTOs);

            // 🔥 Tính tổng số sản phẩm
            int totalProducts = variantDTOs.stream().mapToInt(BuildPCProductVariantDTO::getVariantQuantity).sum();
            dto.setTotalProducts(totalProducts);

            return dto;
        }).collect(Collectors.toList());
    }

    public void updateBuildPC(Long buildId, BuildPCResponseDTO request) {

        BuildPC buildPC = buildPCRepository.findById(buildId)
                .orElseThrow(() -> new RuntimeException("BuildPC not found with ID: " + buildId));

        buildPC.setBuildName(request.getBuildName());
        buildPC.setTotalPrice(request.getTotalPrice());
        buildPC.setUsagePurpose(request.getUsagePurpose());
        buildPC.setDescription(request.getDescription());
        buildPC.setStatus(request.getStatus());

        Set<Long> newVariantIds = request.getBuildPCProductVariants().stream()
                .map(BuildPCProductVariantDTO::getProductVariantId)
                .collect(Collectors.toSet());

        buildPC.getBuildPCProductVariants().removeIf(variant -> !newVariantIds.contains(variant.getProductVariant().getId()));

        for (BuildPCProductVariantDTO dto : request.getBuildPCProductVariants()) {
            boolean exists = buildPC.getBuildPCProductVariants().stream()
                    .anyMatch(variant -> variant.getProductVariant().getId().equals(dto.getProductVariantId()));

            if (!exists) {
                BuildPCProductVariant newVariant = new BuildPCProductVariant();
                newVariant.setBuildPC(buildPC);
                ProductVariant productVariant = productVariantRepository.findById(dto.getProductVariantId())
                        .orElseThrow(() -> new RuntimeException("Product Variant not found with ID: " + dto.getProductVariantId()));
                newVariant.setProductVariant(productVariant);
                newVariant.setVariantQuantity(dto.getVariantQuantity());
                buildPC.getBuildPCProductVariants().add(newVariant);
            }
        }

        Set<String> newImageUrls = new HashSet<>(request.getImageUrls());

        Iterator<BuildPCImages> iterator = buildPC.getBuildPCImages().iterator();
        while (iterator.hasNext()) {
            BuildPCImages image = iterator.next();  
            if (!newImageUrls.contains(image.getImageUrl())) {
                iterator.remove();
            }
        }
        
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


}
