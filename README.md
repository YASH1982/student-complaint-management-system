# Student Complaint Management System

A full-stack web application for managing student complaints in a college or university environment.

The system allows students to submit and track complaints, while administrators can manage complaints, assign departments, update statuses, add resolutions, and monitor the overall complaint process.

---

## About the Project

I built this project to practice and demonstrate full-stack development using **Java, Spring Boot, React, MySQL, REST APIs, and Spring Security**.

The main focus of the project is to create a structured complaint management system with authentication, role-based access, complaint tracking, department assignment, attachments, search, filtering, pagination, and status management.

---

## Features

### Student Features

- Student registration and login
- JWT-based authentication
- Student dashboard
- Submit complaints
- Select complaint category
- Select complaint priority
- View complaint history
- View complaint details
- Track complaint status
- Edit complaints
- Cancel complaints
- Upload complaint attachments
- Preview uploaded attachments
- View resolution provided by admin

### Admin Features

- Admin login
- JWT-based authentication
- Admin dashboard
- View all complaints
- Search complaints
- Search complaints by student name/email
- Filter complaints by:
  - Status
  - Category
  - Priority
  - Department
- Pagination
- Sorting
- Assign complaints to departments
- Update complaint status
- Add resolution
- Add comments
- View complaint attachments
- View complaint status history
- Monitor complaint statistics

---

## How It Works

The application has two main flows: **Student Flow** and **Admin Flow**.

### Student Flow

```text
Student
   |
   | Register / Login
   v
Student Dashboard
   |
   | Submit Complaint
   v
Complaint Created
   |
   | Track Status
   v
View Complaint Details
   |
   +----------------------+
   |                      |
   v                      v
Edit Complaint        Cancel Complaint
   |                      |
   +----------+-----------+
              |
              v
        Track Resolution
### Admin Flow

```text
Admin
   |
   | Login
   v
Admin Dashboard
   |
   | View Complaints
   v
Search / Filter Complaints
   |
   | Assign Department
   v
Update Complaint Status
   |
   +-----------------------------+
   |              |              |
   v              v              v
Assigned     In Progress      Rejected
   |
   | Resolve Complaint
   v
Resolved
   |
   | Close Complaint
   v
Closed

### SUBMITTED
    |
    v
ASSIGNED
    |
    v
IN_PROGRESS
    |
    +------------------+
    |                  |
    v                  v
RESOLVED           REJECTED
    |
    v
CLOSED

Student can also CANCEL
the complaint when allowed.
