package com.realestate.portal.repository;

import com.realestate.portal.exception.FileStorageException;
import com.realestate.portal.model.BaseEntity;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Abstract generic file repository.
 * Demonstrates:
 * - OOP Abstraction: Encapsulates file operations, thread synchronization, and atomic I/O.
 * - OOP Polymorphism: Subclasses implement serialize(), deserialize(), and generateId().
 * - OOP Information Hiding: Internal file handles and locks are hidden from upper layers.
 */
public abstract class AbstractFileRepository<T extends BaseEntity> implements FileRepository<T, String> {

    @Value("${app.data.dir:data}")
    private String configuredDataDir;

    private final String fileName;
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private Path filePath;

    public AbstractFileRepository(String fileName) {
        this.fileName = fileName;
    }

    @PostConstruct
    public void init() {
        try {
            Path dirPath = Paths.get(configuredDataDir).toAbsolutePath().normalize();
            if (!Files.exists(dirPath.resolve(fileName))) {
                Path backendDirPath = Paths.get("backend", configuredDataDir).toAbsolutePath().normalize();
                if (Files.exists(backendDirPath.resolve(fileName))) {
                    dirPath = backendDirPath;
                }
            }
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }
            this.filePath = dirPath.resolve(fileName);
            if (!Files.exists(filePath)) {
                Files.createFile(filePath);
            }
            System.out.println("Repository [" + fileName + "] persistence active at: " + filePath.toAbsolutePath());
        } catch (IOException e) {
            throw new FileStorageException("Failed to initialize storage file: " + fileName, e);
        }
    }

    protected abstract String serialize(T entity);

    protected abstract T deserialize(String line);

    protected abstract String generateId();

    @Override
    public List<T> findAll() {
        rwLock.readLock().lock();
        try {
            List<T> items = new ArrayList<>();
            if (!Files.exists(filePath)) {
                return items;
            }
            try (BufferedReader reader = Files.newBufferedReader(filePath, StandardCharsets.UTF_8)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (!line.isEmpty() && !line.startsWith("#")) {
                        try {
                            T entity = deserialize(line);
                            if (entity != null) {
                                items.add(entity);
                            }
                        } catch (Exception ex) {
                            System.err.println("Skipping malformed line in " + fileName + ": " + line);
                        }
                    }
                }
            } catch (IOException e) {
                throw new FileStorageException("Could not read file: " + fileName, e);
            }
            return items;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    @Override
    public Optional<T> findById(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return findAll().stream()
                .filter(item -> id.equals(item.getId()))
                .findFirst();
    }

    @Override
    public T save(T entity) {
        rwLock.writeLock().lock();
        try {
            List<T> all = findAll();
            if (entity.getId() == null || entity.getId().isBlank()) {
                entity.setId(generateId());
                entity.setCreatedAt(LocalDateTime.now());
                entity.setUpdatedAt(LocalDateTime.now());
                all.add(entity);
            } else {
                entity.markUpdated();
                int existingIndex = -1;
                for (int i = 0; i < all.size(); i++) {
                    if (entity.getId().equals(all.get(i).getId())) {
                        existingIndex = i;
                        break;
                    }
                }
                if (existingIndex >= 0) {
                    all.set(existingIndex, entity);
                } else {
                    all.add(entity);
                }
            }
            writeAll(all);
            return entity;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    @Override
    public boolean deleteById(String id) {
        rwLock.writeLock().lock();
        try {
            List<T> all = findAll();
            boolean removed = all.removeIf(item -> id.equals(item.getId()));
            if (removed) {
                writeAll(all);
            }
            return removed;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    @Override
    public boolean existsById(String id) {
        return findById(id).isPresent();
    }

    @Override
    public long count() {
        return findAll().size();
    }

    private void writeAll(List<T> items) {
        Path tempPath = filePath.resolveSibling(fileName + ".tmp");
        try (BufferedWriter writer = Files.newBufferedWriter(tempPath, StandardCharsets.UTF_8)) {
            for (T item : items) {
                String line = serialize(item);
                if (line != null && !line.isBlank()) {
                    writer.write(line);
                    writer.newLine();
                }
            }
            writer.flush();
        } catch (IOException e) {
            throw new FileStorageException("Failed to write temporary file for: " + fileName, e);
        }

        boolean moved = false;
        IOException lastEx = null;
        for (int attempt = 0; attempt < 5; attempt++) {
            try {
                Files.move(tempPath, filePath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
                moved = true;
                break;
            } catch (AtomicMoveNotSupportedException e) {
                try {
                    Files.move(tempPath, filePath, StandardCopyOption.REPLACE_EXISTING);
                    moved = true;
                    break;
                } catch (IOException ex) {
                    lastEx = ex;
                }
            } catch (IOException e) {
                lastEx = e;
            }
            try {
                Thread.sleep(50);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        if (!moved) {
            try (BufferedWriter writer = Files.newBufferedWriter(filePath, StandardCharsets.UTF_8, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE)) {
                for (T item : items) {
                    String line = serialize(item);
                    if (line != null && !line.isBlank()) {
                        writer.write(line);
                        writer.newLine();
                    }
                }
                writer.flush();
                Files.deleteIfExists(tempPath);
            } catch (IOException ex) {
                throw new FileStorageException("Failed to finalize storage file: " + fileName + " (error: " + (lastEx != null ? lastEx.getMessage() : ex.getMessage()) + ")", ex);
            }
        }
    }
}
