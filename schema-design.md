# Database Schema Design

## MySQL Database Design

### Table: `patients`
| Column Name     | Data Type      | Constraints                | Description                  |
|-----------------|---------------|----------------------------|------------------------------|
| patient_id      | INT           | PRIMARY KEY, AUTO_INCREMENT| Unique patient identifier    |
| email           | VARCHAR(100)  | NOT NULL, UNIQUE           | Patient email address        |
| password_hash   | VARCHAR(255)  | NOT NULL                   | Hashed password              |
| name            | VARCHAR(100)  | NOT NULL                   | Full name                    |
| phone           | VARCHAR(20)   |                            | Contact number               |
| created_at      | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Registration date     |

### Table: `doctors`
| Column Name     | Data Type      | Constraints                | Description                  |
|-----------------|---------------|----------------------------|------------------------------|
| doctor_id       | INT           | PRIMARY KEY, AUTO_INCREMENT| Unique doctor identifier     |
| email           | VARCHAR(100)  | NOT NULL, UNIQUE           | Doctor email address         |
| password_hash   | VARCHAR(255)  | NOT NULL                   | Hashed password              |
| name            | VARCHAR(100)  | NOT NULL                   | Full name                    |
| specialization  | VARCHAR(100)  | NOT NULL                   | Medical specialty            |
| phone           | VARCHAR(20)   |                            | Contact number               |
| available       | BOOLEAN        | NOT NULL, DEFAULT 1        | Availability status          |

### Table: `appointments`
| Column Name     | Data Type      | Constraints                | Description                  |
|-----------------|---------------|----------------------------|------------------------------|
| appointment_id  | INT           | PRIMARY KEY, AUTO_INCREMENT| Unique appointment identifier|
| patient_id      | INT           | NOT NULL, FOREIGN KEY (patient_id) REFERENCES patients(patient_id) | Patient reference |
| doctor_id       | INT           | NOT NULL, FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)   | Doctor reference  |
| appointment_time| DATETIME      | NOT NULL                   | Scheduled time               |
| duration_min    | INT           | NOT NULL, DEFAULT 60       | Duration in minutes          |
| status          | VARCHAR(20)   | NOT NULL, DEFAULT 'scheduled' | Appointment status        |

### Table: `admin`
| Column Name     | Data Type      | Constraints                | Description                  |
|-----------------|---------------|----------------------------|------------------------------|
| admin_id        | INT           | PRIMARY KEY, AUTO_INCREMENT| Unique admin identifier      |
| username        | VARCHAR(50)   | NOT NULL, UNIQUE           | Admin username               |
| password_hash   | VARCHAR(255)  | NOT NULL                   | Hashed password              |
| email           | VARCHAR(100)  | NOT NULL, UNIQUE           | Admin email address          |
| created_at      | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation date |

---

## MongoDB Collection Design

### Collection: `prescriptions`

#### Example Document

```json
{
  "_id": "665a1b2c3d4e5f6789012345",
  "patient_id": 101,
  "doctor_id": 12,
  "date_issued": "2025-05-30T10:30:00Z",
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times a day",
      "duration_days": 7
    },
    {
      "name": "Ibuprofen",
      "dosage": "200mg",
      "frequency": "as needed",
      "duration_days": 5
    }
  ],
  "notes": "Take medications with food. Return for follow-up in one week.",
  "pharmacy": {
    "name": "HealthPlus Pharmacy",
    "address": "123 Main St, Cityville"
  }
}
