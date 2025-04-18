package com.be.service;

import com.be.entity.Template;
import com.be.rep.TemplateRepository;
import com.be.utills.FileStorageUtil;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
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


    // Method to delete template by ID
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);  // Deletes the template from the repository
    }


    public Optional<Template> getTemplateById(Long id) {
        return templateRepository.findById(id);
    }

    // Method to get all templates
    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Autowired
    private FileStorageUtil fileStorageUtil;

    public void updateTemplate(MultipartFile file) throws IOException {
        fileStorageUtil.saveFile(file);
    }

    public byte[] getUpdatedTemplate(String templateName) throws IOException {
        try (InputStream is = fileStorageUtil.loadFile(templateName)) {
            Workbook workbook = WorkbookFactory.create(is);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            return bos.toByteArray();
        }
    }
}

