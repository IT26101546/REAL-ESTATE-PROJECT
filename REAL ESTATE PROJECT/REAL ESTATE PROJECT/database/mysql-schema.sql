-- MySQL 8+ schema for the integrated portal.
-- IDs intentionally remain VARCHAR values (USR-..., PROP-...) so existing API
-- contracts and seeded records can be migrated without changing client routes.
CREATE DATABASE IF NOT EXISTS real_estate_portal
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE real_estate_portal;

CREATE TABLE users (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM('BUYER','SELLER','ADMIN') NOT NULL,
  bio TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE categories (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE properties (
  id VARCHAR(40) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id VARCHAR(40) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  type ENUM('SALE','RENT') NOT NULL,
  bedrooms INT NOT NULL DEFAULT 0,
  bathrooms INT NOT NULL DEFAULT 0,
  area DOUBLE NOT NULL DEFAULT 0,
  image_url VARCHAR(2000),
  seller_id VARCHAR(40) NOT NULL,
  status ENUM('AVAILABLE','RESERVED','SOLD','RENTED','ARCHIVED') NOT NULL DEFAULT 'AVAILABLE',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_property_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_property_seller FOREIGN KEY (seller_id) REFERENCES users(id),
  INDEX idx_properties_search (location, type, status),
  INDEX idx_properties_seller (seller_id)
) ENGINE=InnoDB;

CREATE TABLE bookings (
  id VARCHAR(40) PRIMARY KEY,
  property_id VARCHAR(40) NOT NULL,
  buyer_id VARCHAR(40) NOT NULL,
  seller_id VARCHAR(40) NOT NULL,
  booking_date DATE NOT NULL,
  reservation_fee DECIMAL(15,2) NOT NULL,
  status ENUM('PENDING_APPROVAL','APPROVED','REJECTED','CONFIRMED','CANCELLED') NOT NULL,
  notes TEXT,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_booking_property FOREIGN KEY (property_id) REFERENCES properties(id),
  CONSTRAINT fk_booking_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
  CONSTRAINT fk_booking_seller FOREIGN KEY (seller_id) REFERENCES users(id),
  INDEX idx_bookings_buyer (buyer_id), INDEX idx_bookings_seller (seller_id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id VARCHAR(40) PRIMARY KEY,
  booking_id VARCHAR(40) NOT NULL,
  buyer_id VARCHAR(40) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  property_id VARCHAR(40) NOT NULL,
  payment_method ENUM('CREDIT_CARD','DEBIT_CARD','BANK_TRANSFER','DIGITAL_WALLET','CASH') NOT NULL,
  status ENUM('PENDING','PENDING_COLLECTION','COMPLETED','FAILED','REFUNDED') NOT NULL,
  transaction_reference VARCHAR(120) NOT NULL UNIQUE,
  payment_date DATETIME NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_payment_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
  CONSTRAINT fk_payment_property FOREIGN KEY (property_id) REFERENCES properties(id),
  INDEX idx_payments_buyer (buyer_id)
) ENGINE=InnoDB;

CREATE TABLE inquiries (
  id VARCHAR(40) PRIMARY KEY,
  property_id VARCHAR(40) NOT NULL,
  buyer_id VARCHAR(40) NOT NULL,
  seller_id VARCHAR(40) NOT NULL,
  question TEXT NOT NULL,
  response TEXT,
  status ENUM('PENDING','ANSWERED') NOT NULL DEFAULT 'PENDING',
  answered_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_inquiry_property FOREIGN KEY (property_id) REFERENCES properties(id),
  CONSTRAINT fk_inquiry_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
  CONSTRAINT fk_inquiry_seller FOREIGN KEY (seller_id) REFERENCES users(id),
  INDEX idx_inquiries_buyer (buyer_id), INDEX idx_inquiries_seller (seller_id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id VARCHAR(40) PRIMARY KEY,
  property_id VARCHAR(40) NOT NULL,
  user_id VARCHAR(40) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_review_property FOREIGN KEY (property_id) REFERENCES properties(id),
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uq_review_property_user UNIQUE (property_id, user_id),
  INDEX idx_reviews_property (property_id)
) ENGINE=InnoDB;
-- MySQL 8+ schema. String IDs preserve current API values such as USR-001.
CREATE DATABASE IF NOT EXISTS real_estate_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE real_estate_portal;

CREATE TABLE users (
  id VARCHAR(40) PRIMARY KEY, name VARCHAR(150) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, phone VARCHAR(50), role ENUM('BUYER','SELLER','ADMIN') NOT NULL,
  bio TEXT, active BOOLEAN NOT NULL DEFAULT TRUE, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL
) ENGINE=InnoDB;
CREATE TABLE categories (
  id VARCHAR(40) PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, description TEXT, icon VARCHAR(100),
  created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL
) ENGINE=InnoDB;
CREATE TABLE properties (
  id VARCHAR(40) PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, category_id VARCHAR(40) NOT NULL,
  location VARCHAR(255) NOT NULL, price DECIMAL(15,2) NOT NULL, type ENUM('SALE','RENT') NOT NULL,
  bedrooms INT NOT NULL DEFAULT 0, bathrooms INT NOT NULL DEFAULT 0, area DOUBLE NOT NULL DEFAULT 0, image_url VARCHAR(2000),
  seller_id VARCHAR(40) NOT NULL, status ENUM('AVAILABLE','RESERVED','SOLD','RENTED','ARCHIVED') NOT NULL DEFAULT 'AVAILABLE',
  created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id), FOREIGN KEY (seller_id) REFERENCES users(id),
  INDEX idx_properties_search (location, type, status), INDEX idx_properties_seller (seller_id)
) ENGINE=InnoDB;
CREATE TABLE bookings (
  id VARCHAR(40) PRIMARY KEY, property_id VARCHAR(40) NOT NULL, buyer_id VARCHAR(40) NOT NULL, seller_id VARCHAR(40) NOT NULL,
  booking_date DATE NOT NULL, reservation_fee DECIMAL(15,2) NOT NULL,
  status ENUM('PENDING_APPROVAL','APPROVED','REJECTED','CONFIRMED','CANCELLED') NOT NULL, notes TEXT,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID', created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id), FOREIGN KEY (buyer_id) REFERENCES users(id), FOREIGN KEY (seller_id) REFERENCES users(id),
  INDEX idx_bookings_buyer (buyer_id), INDEX idx_bookings_seller (seller_id)
) ENGINE=InnoDB;
CREATE TABLE payments (
  id VARCHAR(40) PRIMARY KEY, booking_id VARCHAR(40) NOT NULL, property_id VARCHAR(40) NOT NULL, buyer_id VARCHAR(40) NOT NULL,
  amount DECIMAL(15,2) NOT NULL, payment_method ENUM('CREDIT_CARD','DEBIT_CARD','BANK_TRANSFER','DIGITAL_WALLET','CASH') NOT NULL,
  status ENUM('PENDING','PENDING_COLLECTION','COMPLETED','FAILED','REFUNDED') NOT NULL,
  transaction_reference VARCHAR(120) NOT NULL UNIQUE, payment_date DATETIME NOT NULL, notes TEXT,
  created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id), FOREIGN KEY (property_id) REFERENCES properties(id), FOREIGN KEY (buyer_id) REFERENCES users(id),
  INDEX idx_payments_buyer (buyer_id)
) ENGINE=InnoDB;
CREATE TABLE inquiries (
  id VARCHAR(40) PRIMARY KEY, property_id VARCHAR(40) NOT NULL, buyer_id VARCHAR(40) NOT NULL, seller_id VARCHAR(40) NOT NULL,
  question TEXT NOT NULL, response TEXT, status ENUM('PENDING','ANSWERED') NOT NULL DEFAULT 'PENDING', answered_at DATETIME,
  created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id), FOREIGN KEY (buyer_id) REFERENCES users(id), FOREIGN KEY (seller_id) REFERENCES users(id),
  INDEX idx_inquiries_buyer (buyer_id), INDEX idx_inquiries_seller (seller_id)
) ENGINE=InnoDB;
CREATE TABLE reviews (
  id VARCHAR(40) PRIMARY KEY, property_id VARCHAR(40) NOT NULL, user_id VARCHAR(40) NOT NULL, user_name VARCHAR(150) NOT NULL,
  rating TINYINT NOT NULL, comment TEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
  CHECK (rating BETWEEN 1 AND 5), FOREIGN KEY (property_id) REFERENCES properties(id), FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (property_id, user_id), INDEX idx_reviews_property (property_id)
) ENGINE=InnoDB;
