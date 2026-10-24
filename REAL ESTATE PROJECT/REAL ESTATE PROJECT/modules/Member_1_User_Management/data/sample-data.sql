-- BCrypt placeholder only: register through POST /api/auth/register for usable accounts.
INSERT INTO users (id,name,email,password_hash,phone,role,bio,active,created_at,updated_at)
VALUES ('USR-DEMO-001','Demo Buyer','buyer.demo@example.test','$2a$10$replaceWithRealBCryptHashOnly','+94 770000001','BUYER','Sample buyer',TRUE,NOW(),NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=NOW();
