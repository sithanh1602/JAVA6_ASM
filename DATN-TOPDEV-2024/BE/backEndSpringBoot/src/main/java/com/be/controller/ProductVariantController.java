package com.be.controller;

import com.be.entity.AttributesProductVariant;
import com.be.service.ProductVariantService;
import com.be.service.VariantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-variants")
public class ProductVariantController {

    @Autowired
    private ProductVariantService productVariantService;

    @GetMapping("/{id}/attribute-ids")
    public List<Integer> getAttributeProductVariantIds(@PathVariable int id) {
        return productVariantService.getAttributeProductVariantIds(id);
    }

    @Autowired
    private VariantService variantService;

    @GetMapping("/{variantId}/attributes")
    public ResponseEntity<List<AttributesProductVariant>> getAttributesByVariantId(@PathVariable int variantId) {
        List<AttributesProductVariant> attributes = variantService.getAttributesByVariantId(variantId);
        return ResponseEntity.ok(attributes);
    }
}
