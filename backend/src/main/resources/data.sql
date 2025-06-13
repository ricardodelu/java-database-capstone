-- Sample Admin Data
INSERT IGNORE INTO admin (username, password) VALUES 
('admin', 'admin123'),
('testadmin', 'password');

-- Sample Doctor Data
INSERT IGNORE INTO doctor (email, name, password, phone_number, specialty) VALUES
('dr.adams@example.com', 'Dr. Emily Adams', 'pass12345', '555-101-2020', 'Cardiology'),
('dr.johnson@example.com', 'Dr. Mark Johnson', 'secure4567', '555-202-3030', 'Neurology'),
('dr.lee@example.com', 'Dr. Sarah Lee', 'leePass987', '555-303-4040', 'Orthopedics'),
('dr.wilson@example.com', 'Dr. Tom Wilson', 'w!ls0nPwd', '555-404-5050', 'Pediatrics'),
('dr.brown@example.com', 'Dr. Alice Brown', 'brownie123', '555-505-6060', 'Dermatology'),
('dr.taylor@example.com', 'Dr. Taylor Grant', 'taylor321', '555-606-7070', 'Cardiology'),
('dr.white@example.com', 'Dr. Sam White', 'whiteSecure1', '555-707-8080', 'Neurology'),
('dr.clark@example.com', 'Dr. Emma Clark', 'clarkPass456', '555-808-9090', 'Orthopedics'),
('dr.davis@example.com', 'Dr. Olivia Davis', 'davis789', '555-909-0101', 'Pediatrics'),
('dr.miller@example.com', 'Dr. Henry Miller', 'millertime!', '555-010-1111', 'Dermatology');

-- Sample Patient Data
INSERT IGNORE INTO patient (address, email, name, password, phone_number) VALUES
('101 Oak St, Cityville', 'jane.doe@example.com', 'Jane Doe', 'passJane1', '888-111-1111'),
('202 Maple Rd, Townsville', 'john.smith@example.com', 'John Smith', 'smithSecure', '888-222-2222'),
('303 Pine Ave, Villageton', 'emily.rose@example.com', 'Emily Rose', 'emilyPass99', '888-333-3333'),
('404 Birch Ln, Metropolis', 'michael.j@example.com', 'Michael Jordan', 'airmj23', '888-444-4444'),
('505 Cedar Blvd, Springfield', 'olivia.m@example.com', 'Olivia Moon', 'moonshine12', '888-555-5555');