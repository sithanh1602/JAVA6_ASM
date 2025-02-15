package com.be.service;

import com.be.entity.Attribute;
import com.be.rep.AttributeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttributeService {
    private final AttributeRepository attributeRepository;

    @Autowired
    public AttributeService(AttributeRepository attributeRepository) {
        this.attributeRepository = attributeRepository;
    }

    public List<Attribute> getAllAttributes() {
        return attributeRepository.findAll();
    }

    public Optional<Attribute> getAttributeById(Long id) {
        return attributeRepository.findById(id);
    }

    public Attribute addAttribute(Attribute attribute) {
        return attributeRepository.save(attribute);
    }

    public Attribute updateAttribute(Long id, Attribute updatedAttribute) {
        return attributeRepository.findById(id).map(attribute -> {
            attribute.setName(updatedAttribute.getName());
            attribute.setValue(updatedAttribute.getValue());
            return attributeRepository.save(attribute);
        }).orElseThrow(() -> new RuntimeException("Attribute not found"));
    }

    public void deleteAttribute(Long id) {
        attributeRepository.deleteById(id);
    }
}
