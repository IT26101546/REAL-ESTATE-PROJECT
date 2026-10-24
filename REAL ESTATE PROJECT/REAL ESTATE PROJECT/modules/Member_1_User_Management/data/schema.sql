-- Member 1 ownership: users. Run the complete ../../database/mysql-schema.sql first.
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(40) PRIMARY KEY, name VARCHAR(150) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, phone VARCHAR(50), role ENUM('BUYER','SELLER','ADMIN') NOT NULL,
  bio TEXT, active BOOLEAN NOT NULL DEFAULT TRUE, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL
) ENGINE=InnoDB;
