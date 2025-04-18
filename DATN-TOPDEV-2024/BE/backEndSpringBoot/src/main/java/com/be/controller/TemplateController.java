package com.be.controller;

import com.be.entity.Template;
import com.be.rep.TemplateRepository;
import com.be.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    @Autowired
    private TemplateService templateService;

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

    @PostMapping("/update")
    public ResponseEntity<String> updateTemplate(@RequestParam("file") MultipartFile file) {
        try {
            templateService.updateTemplate(file);
            return ResponseEntity.ok("Template updated successfully");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update template");
        }
    }

    @GetMapping("/download-updated")
    public ResponseEntity<byte[]> downloadUpdatedTemplate(@RequestParam("templateName") String templateName) {
        try {
            byte[] updatedFile = templateService.getUpdatedTemplate(templateName);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "template-updated.xlsx");
            return new ResponseEntity<>(updatedFile, headers, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Endpoint to delete a template by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTemplate(@PathVariable Long id) {
        Optional<Template> templateOptional = templateService.getTemplateById(id);

        if (templateOptional.isPresent()) {
            templateService.deleteTemplate(id);  // Call the service to delete the template
            return ResponseEntity.ok("Template deleted successfully");
        } else {
            return ResponseEntity.status(404).body("Template not found");
        }
    }
}
