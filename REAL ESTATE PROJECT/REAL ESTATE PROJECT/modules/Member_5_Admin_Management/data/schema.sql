-- Member 5 ownership: categories; dashboard reads the complete schema.
CREATE TABLE IF NOT EXISTS categories (
 id VARCHAR(40) PRIMARY KEY,name VARCHAR(100) NOT NULL UNIQUE,description TEXT,icon VARCHAR(100),
 created_at DATETIME NOT NULL,updated_at DATETIME NOT NULL
) ENGINE=InnoDB;
