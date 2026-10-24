-- Member 4 ownership: inquiries; users and properties must be created first.
CREATE TABLE IF NOT EXISTS inquiries (
 id VARCHAR(40) PRIMARY KEY,property_id VARCHAR(40) NOT NULL,buyer_id VARCHAR(40) NOT NULL,seller_id VARCHAR(40) NOT NULL,
 question TEXT NOT NULL,response TEXT,status ENUM('PENDING','ANSWERED') NOT NULL DEFAULT 'PENDING',answered_at DATETIME NULL,
 created_at DATETIME NOT NULL,updated_at DATETIME NOT NULL,FOREIGN KEY(property_id) REFERENCES properties(id),
 FOREIGN KEY(buyer_id) REFERENCES users(id),FOREIGN KEY(seller_id) REFERENCES users(id)
) ENGINE=InnoDB;
