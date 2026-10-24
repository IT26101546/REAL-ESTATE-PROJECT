package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.CategoryRequest;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.model.Category;
import com.realestate.portal.service.CategoryService;
import com.realestate.portal.util.UserSecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Category Controller - Member 5 Responsibility
 * Handles property category CRUD and validations.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final UserSecurityContext securityContext;

    public CategoryController(CategoryService categoryService, UserSecurityContext securityContext) {
        this.categoryService = categoryService;
        this.securityContext = securityContext;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(
            HttpServletRequest request,
            @Valid @RequestBody CategoryRequest categoryRequest) {
        if (!securityContext.isAdmin(request)) {
            throw new UnauthorizedException("Only administrators can create categories.");
        }
        Category category = categoryService.createCategory(categoryRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Category created successfully.", category));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable String id) {
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.ok(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            HttpServletRequest request,
            @PathVariable String id,
            @Valid @RequestBody CategoryRequest categoryRequest) {
        if (!securityContext.isAdmin(request)) {
            throw new UnauthorizedException("Only administrators can edit categories.");
        }
        Category updated = categoryService.updateCategory(id, categoryRequest);
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            HttpServletRequest request,
            @PathVariable String id) {
        if (!securityContext.isAdmin(request)) {
            throw new UnauthorizedException("Only administrators can delete categories.");
        }
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted successfully.", null));
    }
}
