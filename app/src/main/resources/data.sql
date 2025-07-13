-- Sample Admin Data
INSERT IGNORE INTO admin (username, password) VALUES 
('admin', '$2a$10$Et7qeaZS0wHaS7cPqxOPDulVViCumgNTjRH59M5HkJ4bFEEJUSz.i'),
('testadmin', '$2a$10$LrRiUWe8lSdZZeRsVyLDLOzulvgtirbbJCVknH4GNDad9iQw2ZBKS');

-- Sample Doctor Data
INSERT IGNORE INTO doctor (email, name, password, phone_number, specialty, license_number) VALUES
('dr.adams@example.com', 'Dr. Emily Adams', '$2a$10$bM6wi6Kg29tb9aUlPMBZDewNT8cMlxqL3LysDl0FBG5xPfBr/cjT6', '5551012020', 'Cardiology', 'LIC-112233'),
('dr.johnson@example.com', 'Dr. Mark Johnson', '$2a$10$PDZiDtpeJ9YZmvMD94kkouBcEm9NehCQDee8D4zomzm6OBWWssZfi', '5552023030', 'Neurology', 'LIC-445566'),
('dr.lee@example.com', 'Dr. Sarah Lee', '$2a$10$78aOL8QFv/zCg.n2JKHwPesDSete8oGJEWDC69A5DtCDGa3Lt/HyK', '5553034040', 'Orthopedics', 'LIC-778899'),
('dr.wilson@example.com', 'Dr. Tom Wilson', '$2a$10$T/ruTWzXgpmxJZKJkOjAWugS/KGpaDovFmiXozWv4ppyKsxAkr9g6', '5554045050', 'Pediatrics', 'LIC-101112'),
('dr.brown@example.com', 'Dr. Alice Brown', '$2a$10$A9YAW75Uggapf.0wyWBctO3MWjS5AJNqiwQ42KsNC7HoYxhtjXQzu', '5555056060', 'Dermatology', 'LIC-131415'),
('dr.taylor@example.com', 'Dr. Taylor Grant', '$2a$10$LnxK0fwALi.pHMzs7.KGj.51z6TrK8pLjM5D1WDMJFK5ydU7wzrbK', '5556067070', 'Cardiology', 'LIC-161718'),
('dr.white@example.com', 'Dr. Sam White', '$2a$10$jos6z1EsliZy/9Gly.MEu.qC48U2GjCQ8.jnwJdxXjb.enZm990vu', '5557078080', 'Neurology', 'LIC-192021'),
('dr.clark@example.com', 'Dr. Emma Clark', '$2a$10$g/PXRJHtxabPo0elbxfbJOa6KdFx8vxhDLcyXorQK9MSj8hLXacqS', '5558089090', 'Orthopedics', 'LIC-222324'),
('dr.davis@example.com', 'Dr. Olivia Davis', '$2a$10$3FdOO.GAnyc.7eIM9CRdrOoVCpKroc5RnuDDrTsYED2/6aB5h13jG', '5559090101', 'Pediatrics', 'LIC-252627'),
('dr.miller@example.com', 'Dr. Henry Miller', '$2a$10$6LsoJgdoow0unsxKbRFaH.CizfWA5t6kpZYqE07KNx8RNJFWw6YwS', '5550101111', 'Dermatology', 'LIC-282930');

-- Sample Patient Data
INSERT IGNORE INTO patient (address, email, name, password, phone_number) VALUES
('101 Oak St, Cityville', 'jane.doe@example.com', 'Jane Doe', '$2a$10$24qSYaZzOzZBgvlsMLifpe7gKlt8GqIY7eiLj/wvyBu6qsqACSBOu', '888-111-1111'),
('202 Maple Rd, Townsville', 'john.smith@example.com', 'John Smith', '$2a$10$4rSsiOKVfDYrspznkdl4M.8ddxfNKmZHphE44EEIVgIt7D2d8Mt56', '888-222-2222'),
('303 Pine Ave, Villageton', 'emily.rose@example.com', 'Emily Rose', '$2a$10$GEXh3hKb13POI2oCqP4tne7aHBAPN5L1JzoklD9NiCsV1pPTvq4mG', '888-333-3333'),
('404 Birch Ln, Metropolis', 'michael.j@example.com', 'Michael Jordan', '$2a$10$TodojJ4Gmu5VusJYT9CKhOS36vcL4fmRAKfIbpumhf/kJ8KmvvrwK', '888-444-4444'),
('505 Cedar Blvd, Springfield', 'olivia.m@example.com', 'Olivia Moon', '$2a$10$rXwbMFg1n5Hrk.6BkSlZu.0UapolqLnHHoOYbdr2M616Mpc/.7doK', '888-555-5555');
-- Sample Appointments
INSERT INTO appointment (doctor_id, patient_id, appointment_time, status) VALUES
(1, 1, '2025-07-10 09:00:00', 'SCHEDULED'),
(1, 2, '2025-07-10 10:30:00', 'COMPLETED'),
(1, 3, '2025-07-11 14:00:00', 'SCHEDULED'),
(2, 4, '2025-07-12 11:00:00', 'SCHEDULED'),
(2, 5, '2025-07-12 15:30:00', 'CANCELLED');

-- Sample Available Times for Dr. Emily Adams (Doctor ID: 1)
INSERT IGNORE INTO doctor_available_times (doctor_id, available_times) VALUES
(1, '09:00 AM'),
(1, '10:00 AM'),
(1, '11:00 AM'),
(1, '02:00 PM'),
(1, '03:00 PM');

-- Daily Appointment Report by Doctor Sproc
DELIMITER $$
CREATE PROCEDURE GetDailyAppointmentReportByDoctor(
    IN report_date DATE
)
BEGIN
    SELECT 
        d.name AS doctor_name,
        a.appointment_time,
        a.status,
        p.name AS patient_name,
        p.phone AS patient_phone
    FROM 
        appointment a
    JOIN 
        doctor d ON a.doctor_id = d.id
    JOIN 
        patient p ON a.patient_id = p.id
    WHERE 
        DATE(a.appointment_time) = report_date
    ORDER BY 
        d.name, a.appointment_time;
END$$
DELIMITER ;

-- Doctor with most patients By Month
DELIMITER $$
CREATE PROCEDURE GetDoctorWithMostPatientsByMonth(
    IN input_month INT, 
    IN input_year INT
)
BEGIN
    SELECT
        doctor_id, 
        COUNT(patient_id) AS patients_seen
    FROM
        appointment
    WHERE
        MONTH(appointment_time) = input_month 
        AND YEAR(appointment_time) = input_year
    GROUP BY
        doctor_id
    ORDER BY
        patients_seen DESC
    LIMIT 1;
END $$
DELIMITER ;

-- Doctor with most patients By Year
DELIMITER $$
CREATE PROCEDURE GetDoctorWithMostPatientsByYear(
    IN input_year INT
)
BEGIN
    SELECT
        doctor_id, 
        COUNT(patient_id) AS patients_seen
    FROM
        appointment
    WHERE
        YEAR(appointment_time) = input_year
    GROUP BY
        doctor_id
    ORDER BY
        patients_seen DESC
    LIMIT 1;
END $$
DELIMITER ;