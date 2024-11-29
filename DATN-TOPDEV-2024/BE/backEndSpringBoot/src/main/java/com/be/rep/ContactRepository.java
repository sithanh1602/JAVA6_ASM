package com.be.rep;

import com.be.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    // Custom method to find a Contact by email
    Optional<Contact> findByIdAndEmail(Long id, String email);
}
