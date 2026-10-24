-- Create the corresponding user and property rows first.
INSERT INTO bookings (id,property_id,buyer_id,seller_id,booking_date,reservation_fee,status,payment_status,created_at,updated_at)
VALUES ('BKG-DEMO-001','PROP-DEMO-001','USR-BUYER-001','USR-SELLER-001',CURDATE(),100000.00,'PENDING_APPROVAL','UNPAID',NOW(),NOW());
