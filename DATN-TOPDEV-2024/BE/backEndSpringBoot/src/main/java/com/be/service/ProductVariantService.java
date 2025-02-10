package com.be.service;

import com.be.DTO.ProductVariantDTO;
import com.be.entity.ProductVariant;
import com.be.rep.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductVariantService {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    public List<ProductVariant> getAllProductVariants() {
        List<ProductVariant> productVariants = productVariantRepository.findAll();
        return productVariants;
    }
}
