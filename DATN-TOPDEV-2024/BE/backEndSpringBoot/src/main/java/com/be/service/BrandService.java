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
        return brandRepository.findById(id).orElse(null);
    }

    public Brand createBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    public Brand updateBrand(Long id, Brand brand) {
        if (brandRepository.existsById(id)) {
            brand.setBrandsId(id);
            return brandRepository.save(brand);
        }
        return null;
    }

    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }
}
