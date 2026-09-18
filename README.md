# Student Complaint Management System

A full-stack web application for managing student complaints in a college environment.

The idea behind this project is simple: students can submit and track their complaints, while admins can manage complaints, assign departments, update their status, and handle resolutions from one place.

## About the Project

I built this project to practice and bring together the concepts I have learned in Java, Spring Boot, React, MySQL, REST APIs, and Spring Security.

The application has separate access for students and administrators. Students can create complaints and follow their progress, while administrators can manage the complaints and update them as they move through the process.

## Features

### Student

- Register and login
- JWT-based authentication
- Student dashboard
- Submit a complaint
- Select complaint category and priority
- View complaint history
- View complaint details
- Track complaint status
- Edit a complaint when allowed
- Cancel a complaint when allowed
- Add comments
- Upload attachments
- Preview uploaded attachments
- View status history
- Get a unique complaint tracking number

### Admin

- Admin login
- Admin dashboard
- View complaint statistics
- View all complaints
- Search complaints
- Filter complaints by status, category, priority and department
- Pagination and sorting
- View complete complaint details
- Assign complaints to departments
- Update complaint status
- Add resolution details
- Add comments
- View complaint attachments
- Manage departments

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- MySQL
- Maven
- Lombok

### Frontend

- React
- JavaScript
- Axios
- CSS
- Vite

### Tools

- IntelliJ IDEA / VS Code
- MySQL Workbench
- Postman
- Git & GitHub

## How It Works

The basic flow of the application is:

```text
Student
   |
   | Submit Complaint
   v
Complaint
   |
   | Admin assigns department
   v
Assigned
   |
   | Admin updates status
   v
In Progress
   |
   | Admin resolves
   v
Resolved
   |
   v
Closed
