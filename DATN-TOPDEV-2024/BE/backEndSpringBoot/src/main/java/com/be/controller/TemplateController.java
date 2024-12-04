package com.be.controller;

import com.be.entity.Template;
import com.be.rep.TemplateRepository;
import com.be.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    @Autowired
    private TemplateService templateService;

    @Autowired
    private TemplateRepository templateRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadExcelTemplate(@RequestParam("file") MultipartFile file) {
        try {
            templateService.saveTemplate(file);
            return ResponseEntity.ok("Template uploaded successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while uploading template: " + e.getMessage());
        }
    }

    // Endpoint để tải xuống tệp Excel
    @GetMapping("/{id}")
    public ResponseEntity<ByteArrayResource> downloadTemplate(@PathVariable Long id) {
        Optional<Template> templateOptional = templateService.getTemplateById(id);

        if (templateOptional.isPresent()) {
            Template template = templateOptional.get();
            ByteArrayResource resource = new ByteArrayResource(template.getFileContent());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "Tập tin=" + template.getName())
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint to get all templates
    @GetMapping
    public ResponseEntity<List<Template>> getAllTemplates() {
        List<Template> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    // Phương thức để xoá template
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }
}
