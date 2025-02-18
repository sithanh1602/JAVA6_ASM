package com.be.service;

import com.be.entity.Brand;
import com.be.rep.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
    }

    public Brand createBrand(Brand brand) {
        // Kiểm tra nếu tên thương hiệu đã tồn tại
        if (brandRepository.existsByName(brand.getName())) {
            throw new RuntimeException("Tên thương hiệu đã tồn tại");
        }
        return brandRepository.save(brand);
    }

    public Brand updateBrand(Long id, Brand brand) {
        Brand existingBrand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id)); 
    
        existingBrand.setName(brand.getName());
        existingBrand.setContactInfo(brand.getContactInfo());
        existingBrand.setImage(brand.getImage());

        return brandRepository.save(existingBrand);
    }

    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Brand not found with id: " + id);
        }
        brandRepository.deleteById(id);
    }

    public List<Brand> getBrandsByCategory(Long categoryId) {
        return brandRepository.findBrandsByCategoryId(categoryId);
    }
}
