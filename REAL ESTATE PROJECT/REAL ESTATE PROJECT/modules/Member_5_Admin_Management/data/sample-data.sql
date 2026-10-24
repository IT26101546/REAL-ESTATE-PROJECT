INSERT INTO categories (id,name,description,icon,created_at,updated_at)
VALUES ('CAT-001','Apartment','Apartment and condominium listings','Building2',NOW(),NOW())
ON DUPLICATE KEY UPDATE description=VALUES(description),updated_at=NOW();
