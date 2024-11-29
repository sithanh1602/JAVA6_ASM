package com.be.service;

import com.be.entity.Contact;
import com.be.rep.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    // Fetch contact by email
    public Contact getContactByIdAndEmail(Long id, String email) {
        Optional<Contact> optionalContact = contactRepository.findByIdAndEmail(id, email);
        return optionalContact.orElse(null); // Trả về null nếu không tìm thấy hoặc trả về contact nếu tìm thấy
    }

    public Iterable<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    public Contact getContactById(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact không tồn tại với ID: " + id));
    }

    public Contact createContact(Contact contact) {
        contact.setCreatedAt(new java.util.Date());
        contact.setStatus(false); // Default status is "Not Processed"
        return contactRepository.save(contact);
    }

    public Contact updateContact(Contact contact) {
        return contactRepository.save(contact);
    }

    public void deleteContactsByIds(Iterable<Long> ids) {
        contactRepository.deleteAllById(ids); // Xóa nhiều liên hệ dựa trên danh sách ID
    }
}
