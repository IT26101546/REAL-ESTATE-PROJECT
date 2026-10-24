-- Member 2 ownership: properties. Requires users and categories from the complete schema.
CREATE TABLE IF NOT EXISTS properties (
 id VARCHAR(40) PRIMARY KEY,title VARCHAR(255) NOT NULL,description TEXT NOT NULL,category_id VARCHAR(40) NOT NULL,
 location VARCHAR(255) NOT NULL,price DECIMAL(15,2) NOT NULL,type ENUM('SALE','RENT') NOT NULL,
 bedrooms INT NOT NULL DEFAULT 0,bathrooms INT NOT NULL DEFAULT 0,area DOUBLE NOT NULL DEFAULT 0,image_url VARCHAR(2000),
 seller_id VARCHAR(40) NOT NULL,status ENUM('AVAILABLE','RESERVED','SOLD','RENTED','ARCHIVED') NOT NULL DEFAULT 'AVAILABLE',
 created_at DATETIME NOT NULL,updated_at DATETIME NOT NULL,FOREIGN KEY(category_id) REFERENCES categories(id),FOREIGN KEY(seller_id) REFERENCES users(id)
) ENGINE=InnoDB;
