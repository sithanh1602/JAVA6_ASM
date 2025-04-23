package com.be.service;

import com.be.entity.Tag;
import com.be.rep.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TagService {
    private final TagRepository tagRepository;


    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<Tag> getAllTag() {
        return tagRepository.findAll();
    }

    public Optional<Tag> getTagById(Long id) {
        return tagRepository.findById(id);
    }

    public Tag addTag(Tag tag) {
        return tagRepository.save(tag);
    }

    public Tag updateTag(Long id, Tag updateTag) {
        return tagRepository.findById(id).map(tag -> {
            tag.setTagName(updateTag.getTagName());
            tag.setDescription(updateTag.getDescription());
            return tagRepository.save(tag);
        }).orElseThrow(() -> new RuntimeException("Attribute not found"));
    }
    public void deleteTag(Long id) {
        tagRepository.deleteById(id);
    }
}
