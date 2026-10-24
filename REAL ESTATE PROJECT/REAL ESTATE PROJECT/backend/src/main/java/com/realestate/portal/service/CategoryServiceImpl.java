package com.realestate.portal.service;

import com.realestate.portal.dto.CategoryRequest;
import com.realestate.portal.exception.ConflictException;
import com.realestate.portal.exception.ResourceNotFoundException;
import com.realestate.portal.model.Category;
import com.realestate.portal.repository.CategoryRepository;
import com.realestate.portal.repository.PropertyRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Category Service Implementation - Member 5 Responsibility
 * Handles property category CRUD with referential integrity protection.
 */
@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final PropertyRepository propertyRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository,
                               @Lazy PropertyRepository propertyRepository) {
        this.categoryRepository = categoryRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public Category createCategory(CategoryRequest request) {
        if (categoryRepository.findByName(request.getName().trim()).isPresent()) {
            throw new ConflictException("Category with name '" + request.getName().trim() + "' already exists.");
        }

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription().trim());
        category.setIcon(request.getIcon() != null && !request.getIcon().isBlank() ? request.getIcon().trim() : "home");

        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Override
    public Category updateCategory(String id, CategoryRequest request) {
        Category category = getCategoryById(id);

        categoryRepository.findByName(request.getName().trim())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> {
                    throw new ConflictException("Category name '" + request.getName().trim() + "' is already in use.");
                });

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription().trim());
        if (request.getIcon() != null && !request.getIcon().isBlank()) {
            category.setIcon(request.getIcon().trim());
        }

        return categoryRepository.save(category);
    }

    @Override
    public boolean deleteCategory(String id) {
        getCategoryById(id); // Ensure exists

        // Referential integrity check: prevent deleting categories linked to properties
        boolean isLinkedToProperties = propertyRepository.findAll().stream()
                .anyMatch(p -> id.equalsIgnoreCase(p.getCategoryId()));

        if (isLinkedToProperties) {
            throw new ConflictException("Cannot delete category: Category is linked to active property listings.");
        }

        return categoryRepository.deleteById(id);
    }
}
