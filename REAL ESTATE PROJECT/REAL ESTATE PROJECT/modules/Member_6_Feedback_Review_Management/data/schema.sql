-- Member 6 ownership: reviews; users and properties are prerequisites.
CREATE TABLE IF NOT EXISTS reviews (
 id VARCHAR(40) PRIMARY KEY,property_id VARCHAR(40) NOT NULL,user_id VARCHAR(40) NOT NULL,user_name VARCHAR(150) NOT NULL,
 rating TINYINT NOT NULL,comment TEXT NOT NULL,created_at DATETIME NOT NULL,updated_at DATETIME NOT NULL,
 CONSTRAINT chk_review_rating CHECK(rating BETWEEN 1 AND 5),FOREIGN KEY(property_id) REFERENCES properties(id),
 FOREIGN KEY(user_id) REFERENCES users(id),UNIQUE(property_id,user_id)
) ENGINE=InnoDB;
