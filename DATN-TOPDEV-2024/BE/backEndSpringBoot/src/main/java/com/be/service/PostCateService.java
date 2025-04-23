package com.be.service;

import com.be.entity.PostCategories;
import com.be.rep.PostCateRep;
import com.be.rep.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class PostCateService {
    @Autowired
    private PostCateRep postCateRep;

    @Autowired
    private PostRepository postRep;


    public List<PostCategories> getAllPostCategories() {
        return postCateRep.findAll();
    }

    public Optional<PostCategories> getPostCategoriesById(Long id) {
        return postCateRep.findById(id);
    }

    public PostCategories addPostCategories(PostCategories postCategories) {
        if (postCateRep.existsByName(postCategories.getName())) {
            throw new RuntimeException("Post category already exists with name: " + postCategories.getName());
        }
        return postCateRep.save(postCategories);
    }

    public PostCategories updatePostCategories(Long id, PostCategories updatePostCategories) {
        return postCateRep.findById(id).map(postCate -> {
            // Kiểm tra xem có danh mục nào khác trùng tên không
            if (postCateRep.existsByName(updatePostCategories.getName()) && !postCate.getName().equals(updatePostCategories.getName())) {
                throw new RuntimeException("Post category already exists with name: " + updatePostCategories.getName());
            }

            postCate.setName(updatePostCategories.getName());
            postCate.setDescription(updatePostCategories.getDescription());
            return postCateRep.save(postCate);
        }).orElseThrow(() -> new RuntimeException("Post category not found with id: " + id));
    }


    public void deletePostCategories(Long id) {
        PostCategories postCategories = postCateRep.findById(id)
                .orElseThrow(() -> new RuntimeException("Post category not found with id: " + id));

        // Kiểm tra xem danh mục có bài viết nào không
        if (!postRep.findByPostCategories(postCategories).isEmpty()) {
            throw new RuntimeException("Cannot delete category because it has related posts.");
        }

        postCateRep.deleteById(id);
    }


}
