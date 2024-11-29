package com.be.controller;

import com.be.entity.Contact;
import com.be.service.ContactService;
import com.be.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @Autowired
    private EmailService emailService;

    private String generateEmailContent(String message, String feedback) {
        return "<html>" +
                "<body>" +
                "<h2>Phản hồi từ Admin</h2>" +
                "<p><strong>Thông điệp từ liên hệ:</strong></p>" +
                "<p>" + message + "</p>" +
                "<hr>" +
                "<p><strong>Phản hồi của Admin:</strong></p>" +
                "<p>" + feedback + "</p>" +
                "</body>" +
                "</html>";
    }


    @GetMapping
    public ResponseEntity<Iterable<Contact>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @PostMapping
    public ResponseEntity<Contact> createContact(@RequestBody Contact contact) {
        Contact createdContact = contactService.createContact(contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdContact);
    }

    @PostMapping("/delete-multiple")
    public ResponseEntity<String> deleteMultipleContacts(@RequestBody Iterable<Long> ids) {
        try {
            contactService.deleteContactsByIds(ids); // Gọi Service để xóa
            return ResponseEntity.ok("Selected contacts have been deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting contacts");
        }
    }

    /**
     * Gửi phản hồi qua email và đánh dấu liên hệ là đã xử lý
     */
    @PutMapping("/feedback/{id}/{email}")
    public ResponseEntity<Contact> sendFeedback(@PathVariable Long id, @PathVariable String email, @RequestBody String feedback) {
        try {
            // Bước 1: Tìm kiếm contact theo cả id và email
            Contact contact = contactService.getContactByIdAndEmail(id, email);

            if (contact == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            // Lấy id và email từ contact
            Long contactId = contact.getId();
            String contactEmail = contact.getEmail();

            // Bước 2: Gửi phản hồi qua email (với HTML content)
            String emailContent = generateEmailContent(contact.getMessage(), feedback);  // HTML content

            try {
                emailService.sendEmail(contactEmail, "Phản hồi từ Admin", emailContent);
            } catch (MessagingException e) {
                e.printStackTrace(); // Log the error
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null);
            }

            // Bước 3: Cập nhật trạng thái của contact
            contact.setStatus(true);
            Contact updatedContact = contactService.updateContact(contact);

            // Trả về contact đã cập nhật
            return ResponseEntity.ok(updatedContact);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


}
