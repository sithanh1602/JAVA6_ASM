package com.be.service;

import com.be.entity.AttributesProductVariant;
import com.be.rep.AttributesProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VariantService {

    @Autowired
    private AttributesProductVariantRepository attributesProductVariantRepository;

    public List<AttributesProductVariant> getAttributesByVariantId(int variantId) {
        return attributesProductVariantRepository.findByProductVariantId(variantId);
    }
}
