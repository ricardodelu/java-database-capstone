# User Story Template
**Title:**
_As a [user role], I want [feature/goal], so that [reason]._
**Acceptance Criteria:**
1. [Criteria 1]
2. [Criteria 2]
3. [Criteria 3]
**Priority:** [High/Medium/Low]
**Story Points:** [Estimated Effort in Points]
**Notes:**
- [Additional information or edge cases]

## Admin User Stories

**Title:** Admin Login
_As an admin, I want to log into the portal with my username and password, so that I can manage the platform securely._
**Acceptance Criteria:**
1.  Admin can enter valid username and password.
2.  Admin is redirected to the admin dashboard upon successful login.
3.  The system displays an error message for invalid login attempts.
**Priority:** High
**Story Points:** 3
**Notes:** Ensure password complexity requirements are enforced.

---

**Title:** Admin Logout
_As an admin, I want to log out of the portal, so that I can protect system access._
**Acceptance Criteria:**
1.  Admin can log out with a clear logout button.
2.  Admin is redirected to the login page after logging out.
3.  The session is terminated upon logout.
**Priority:** High
**Story Points:** 1
**Notes:** Implement session timeout for inactivity.

---

**Title:** Add Doctor to Portal
_As an admin, I want to add doctors to the portal, so that we can expand our network of healthcare providers._
**Acceptance Criteria:**
1.  Admin can input doctor's information (name, specialty, contact details, etc.).
2.  Doctor's profile is created in the system.
3.  Admin receives confirmation of successful addition.
**Priority:** Medium
**Story Points:** 5
**Notes:** Include validation for input fields.

---

**Title:** Delete Doctor's Profile
_As an admin, I want to delete a doctor's profile from the portal, so that we can manage our list of providers effectively._
**Acceptance Criteria:**
1.  Admin can search for a doctor's profile.
2.  Admin can delete the selected doctor's profile.
3.  Admin receives confirmation of successful deletion.
**Priority:** Medium
**Story Points:** 3
**Notes:** Implement a confirmation step before deletion.

---

**Title:** Track Appointment Statistics
_As an admin, I want to run a stored procedure in MySQL CLI to get the number of appointments per month, so that I can track usage statistics._
**Acceptance Criteria:**
1.  Admin can execute the stored procedure via MySQL CLI.
2.  The stored procedure returns the number of appointments per month.
3.  The results are displayed in a readable format.
**Priority:** Low
**Story Points:** 2
**Notes:** Ensure proper access rights for the admin user to execute the stored procedure.

## Patient User Stories

**Title:** View Doctor List (No Login)
_As a patient, I want to view a list of doctors without logging in, so that I can explore options before registering._
**Acceptance Criteria:**
1.  Patient can access a list of doctors without logging in.
2.  Doctor profiles include basic information (specialty, location).
3.  The list is easily searchable and filterable.
**Priority:** High
**Story Points:** 3
**Notes:** Ensure performance is optimized for public access.

---

**Title:** Patient Sign Up
_As a patient, I want to sign up using my email and password, so that I can book appointments._
**Acceptance Criteria:**
1.  Patient can enter a valid email and password.
2.  Patient receives a verification email.
3.  Patient is redirected to the login page after successful signup.
**Priority:** High
**Story Points:** 3
**Notes:** Implement email verification and password complexity requirements.

---

**Title:** Patient Login
_As a patient, I want to log into the portal, so that I can manage my bookings._
**Acceptance Criteria:**
1.  Patient can enter valid email and password.
2.  Patient is redirected to the patient dashboard upon successful login.
3.  The system displays an error message for invalid login attempts.
**Priority:** High
**Story Points:** 3
**Notes:** Ensure secure authentication.

---

**Title:** Patient Logout
_As a patient, I want to log out of the portal, so that I can secure my account._
**Acceptance Criteria:**
1.  Patient can log out with a clear logout button.
2.  Patient is redirected to the login page after logging out.
3.  The session is terminated upon logout.
**Priority:** High
**Story Points:** 1
**Notes:** Implement session timeout for inactivity.

---

**Title:** Book Appointment
_As a patient, I want to log in and book an hour-long appointment to consult with a doctor._
**Acceptance Criteria:**
1.  Patient can select a doctor and an available time slot.
2.  The appointment is confirmed and added to the patient's bookings.
3.  Patient receives a confirmation email.
**Priority:** High
**Story Points:** 5
**Notes:** Ensure time slot availability is accurately reflected.

---

**Title:** View Upcoming Appointments
_As a patient, I want to view my upcoming appointments, so that I can prepare accordingly._
**Acceptance Criteria:**
1.  Patient can view a list of their upcoming appointments.
2.  Each appointment displays date, time, doctor, and appointment details.
3.  Patient can easily access and manage their appointments.
**Priority:** High
**Story Points:** 3
**Notes:** Include options to reschedule or cancel appointments.

## Doctor User Stories

**Title:** Doctor Login
_As a doctor, I want to log into the portal, so that I can manage my appointments._
**Acceptance Criteria:**
1.  Doctor can enter valid credentials.
2.  Doctor is redirected to the doctor dashboard upon successful login.
3.  The system displays an error message for invalid login attempts.
**Priority:** High
**Story Points:** 3
**Notes:** Ensure secure authentication.

---

**Title:** Doctor Logout
_As a doctor, I want to log out of the portal, so that I can protect my data._
**Acceptance Criteria:**
1.  Doctor can log out with a clear logout button.
2.  Doctor is redirected to the login page after logging out.
3.  The session is terminated upon logout.
**Priority:** High
**Story Points:** 1
**Notes:** Implement session timeout for inactivity.

---

**Title:** View Appointment Calendar
_As a doctor, I want to view my appointment calendar, so that I can stay organized._
**Acceptance Criteria:**
1.  Doctor can view a calendar displaying all appointments.
2.  Appointments are clearly displayed with patient details.
3.  The calendar is easy to navigate.
**Priority:** High
**Story Points:** 3
**Notes:** Support daily, weekly, and monthly views.

---

**Title:** Mark Unavailability
_As a doctor, I want to mark my unavailability, so that patients are only shown available slots._
**Acceptance Criteria:**
1.  Doctor can mark specific time slots or days as unavailable.
2.  Unavailable slots are not shown to patients when booking appointments.
3.  Doctor can easily manage and update their availability.
**Priority:** High
**Story Points:** 5
**Notes:** Ensure seamless integration with the appointment booking system.

---

**Title:** Update Profile Information
_As a doctor, I want to update my profile with specialization and contact information, so that patients have up-to-date information._
**Acceptance Criteria:**
1.  Doctor can update their profile information (specialization, contact details, etc.).
2.  Updated information is displayed on the doctor's profile.
3.  Doctor receives confirmation of successful update.
**Priority:** Medium
**Story Points:** 3
**Notes:** Include validation for input fields.

---

**Title:** View Patient Details
_As a doctor, I want to view the patient details for upcoming appointments, so that I can be prepared._
**Acceptance Criteria:**
1.  Doctor can view patient details for each upcoming appointment.
2.  Patient details include relevant medical history and contact information.
3.  Doctor can easily access patient information.
**Priority:** High
**Story Points:** 3
**Notes:** Ensure compliance with privacy regulations.
