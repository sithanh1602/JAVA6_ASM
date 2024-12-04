package com.be.service;

import com.be.entity.Template;
import com.be.rep.TemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class TemplateService {

    @Autowired
    private TemplateRepository templateRepository;

    public void saveTemplate(MultipartFile file) throws IOException {
        Template template = new Template();
        template.setName(file.getOriginalFilename());
        template.setFileContent(file.getBytes());
        templateRepository.save(template);
    }


    public Optional<Template> getTemplateById(Long id) {
        return templateRepository.findById(id);
    }

    // Method to get all templates
    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }
}
