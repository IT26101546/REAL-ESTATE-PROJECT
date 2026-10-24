-- Prerequisite IDs CAT-001 and USR-SELLER-001 must exist.
INSERT INTO properties (id,title,description,category_id,location,price,type,bedrooms,bathrooms,area,seller_id,status,created_at,updated_at)
VALUES ('PROP-DEMO-001','Demo City Apartment','Two-bedroom demonstration listing','CAT-001','Colombo',25000000.00,'SALE',2,2,950,'USR-SELLER-001','AVAILABLE',NOW(),NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title),updated_at=NOW();
