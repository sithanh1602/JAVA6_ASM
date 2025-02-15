package com.be.controller;

import com.be.entity.Attribute;
import com.be.service.AttributeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attributes")
public class AttributeController {
    private final AttributeService attributeService;

    @Autowired
    public AttributeController(AttributeService attributeService) {
        this.attributeService = attributeService;
    }

    @GetMapping
    public ResponseEntity<List<Attribute>> getAllAttributes() {
        return ResponseEntity.ok(attributeService.getAllAttributes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attribute> getAttributeById(@PathVariable Long id) {
        Optional<Attribute> attribute = attributeService.getAttributeById(id);
        return attribute.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Attribute> addAttribute(@RequestBody Attribute attribute) {
        return ResponseEntity.ok(attributeService.addAttribute(attribute));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attribute> updateAttribute(@PathVariable Long id, @RequestBody Attribute updatedAttribute) {
        return ResponseEntity.ok(attributeService.updateAttribute(id, updatedAttribute));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttribute(@PathVariable Long id) {
        attributeService.deleteAttribute(id);
        return ResponseEntity.noContent().build();
    }
}
