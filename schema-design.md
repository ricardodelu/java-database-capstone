# Database Schema Design

This document outlines the database schema for the Clinic Management System, based on the Java persistence models.

## MySQL Database Schema

### Table: `patient`
Represents a patient in the system.

| Column Name  | Data Type    | Constraints                             | Description                                    |
|--------------|--------------|-----------------------------------------|------------------------------------------------|
| `id`           | BIGINT       | PRIMARY KEY, AUTO_INCREMENT             | Unique identifier for the patient.             |
| `name`         | VARCHAR(100) | NOT NULL                                | Patient's full name.                           |
| `email`        | VARCHAR(255) | NOT NULL, UNIQUE                        | Patient's email address.                       |
| `password`     | VARCHAR(255) | NOT NULL                                | Patient's hashed password.                     |
| `phone_number` | VARCHAR(255) | NOT NULL                                | Patient's phone number (e.g., `XXX-XXX-XXXX`). |
| `address`      | VARCHAR(255) | NOT NULL                                | Patient's physical address.                    |

### Table: `doctor`
Represents a doctor in the system.

| Column Name     | Data Type    | Constraints                             | Description                                  |
|-----------------|--------------|-----------------------------------------|----------------------------------------------|
| `id`              | BIGINT       | PRIMARY KEY, AUTO_INCREMENT             | Unique identifier for the doctor.            |
| `name`            | VARCHAR(100) | NOT NULL                                | Doctor's full name.                          |
| `specialty`       | VARCHAR(100) | NOT NULL                                | Doctor's medical specialty.                  |
| `email`           | VARCHAR(255) | NOT NULL, UNIQUE                        | Doctor's email address.                      |
| `password`        | VARCHAR(255) | NOT NULL                                | Doctor's hashed password.                    |
| `phone_number`    | VARCHAR(10)  | NOT NULL                                | Doctor's 10-digit phone number.              |
| `license_number`  | VARCHAR(20)  |                                         | Doctor's medical license number.             |

### Table: `doctor_available_times`
This is a collection table linked to the `doctor` table, storing their available time slots.

| Column Name       | Data Type    | Constraints      | Description                               |
|-------------------|--------------|------------------|-------------------------------------------|
| `doctor_id`         | BIGINT       | NOT NULL, FK     | Foreign key referencing the `doctor` table. |
| `available_times`   | VARCHAR(255) |                  | An available time slot (e.g., `09:00 AM`).  |

### Table: `appointment`
Represents an appointment scheduled between a doctor and a patient.

| Column Name       | Data Type | Constraints                               | Description                                      |
|-------------------|-----------|-------------------------------------------|--------------------------------------------------|
| `id`                | BIGINT    | PRIMARY KEY, AUTO_INCREMENT               | Unique identifier for the appointment.           |
| `doctor_id`         | BIGINT    | NOT NULL, FK to `doctor(id)`              | The doctor for the appointment.                  |
| `patient_id`        | BIGINT    | NOT NULL, FK to `patient(id)`             | The patient for the appointment.                 |
| `appointment_time`  | DATETIME  | NOT NULL, Must be in the future           | The scheduled date and time of the appointment.  |
| `status`            | VARCHAR(255)|                                           | The status of the appointment (e.g., `SCHEDULED`).|

### Table: `admin`
Represents an administrator in the system.

| Column Name     | Data Type      | Constraints                | Description                  |
|-----------------|---------------|----------------------------|------------------------------|
| `id`            | INT           | PRIMARY KEY, AUTO_INCREMENT| Unique admin identifier      |
| `username`      | VARCHAR(50)   | NOT NULL, UNIQUE           | Admin username               |
| `password`      | VARCHAR(255)  | NOT NULL                   | Hashed password              |
| `email`         | VARCHAR(100)  | NOT NULL, UNIQUE           | Admin email address          |
