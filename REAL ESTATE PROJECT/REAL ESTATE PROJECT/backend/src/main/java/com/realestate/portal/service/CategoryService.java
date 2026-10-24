package com.realestate.portal.service;

import com.realestate.portal.dto.CategoryRequest;
import com.realestate.portal.model.Category;

import java.util.List;

/**
 * Category Service Interface - Member 5 Responsibility
 * Demonstrates OOP Abstraction.
 */
public interface CategoryService {
    Category createCategory(CategoryRequest request);
    List<Category> getAllCategories();
    Category getCategoryById(String id);
    Category updateCategory(String id, CategoryRequest request);
    boolean deleteCategory(String id);
}
