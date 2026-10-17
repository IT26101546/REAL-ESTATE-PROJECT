package com.realestate.portal.repository;

import com.realestate.portal.model.BaseEntity;

import java.util.List;
import java.util.Optional;

/**
 * Generic File Repository Interface.
 * Demonstrates:
 * - OOP Abstraction: Specifies CRUD operations without binding to storage details.
 * - Generics: Type safety for any domain entity extending BaseEntity.
 */
public interface FileRepository<T extends BaseEntity, ID> {
    List<T> findAll();
    Optional<T> findById(ID id);
    T save(T entity);
    boolean deleteById(ID id);
    boolean existsById(ID id);
    long count();
}
