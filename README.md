# ApexCare Hospital Queue & Appointment Management System

A full-stack healthcare web application providing appointment booking, token generation, live queue tracking, doctor consultation schedules, and administrative management.

---

## 🔐 System User Login Credentials

All default and registered test user login credentials categorized by role:

### 1. Administrator Account
| Name | Email | Password | Role | Phone |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin123` | `ADMIN` | `0000000000` |

---

### 2. Doctor Accounts
> **Default Doctor Password:** `doctor123` for all doctors.

| Name | Email | Password | Department | Specialization | Room | Fee | Phone |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Alice Smith** | `alice@hospital.com` | `doctor123` | Cardiology | Cardiology | 101 | ₹500 | `9876500000` |
| **Dr. Rajesh Kumar** | `rajesh@hospital.com` | `doctor123` | General Medicine | General Physician | 102 | ₹350 | `9876500001` |
| **Dr. Vikram Reddy** | `vikram@hospital.com` | `doctor123` | Orthopedics | Orthopedic Surgeon | 103 | ₹450 | `9876500002` |
| **Dr. Sneha Rao** | `sneha@hospital.com` | `doctor123` | Dermatology | Dermatologist | 104 | ₹400 | `9876500003` |
| **Dr. Ananya Sen** | `ananya@hospital.com` | `doctor123` | Pediatrics | Pediatrician | 105 | ₹350 | `9876500004` |
| **Dr. Suresh Verma** | `suresh@hospital.com` | `doctor123` | ENT | ENT Specialist | 106 | ₹400 | `9876500005` |

---

### 3. Patient Accounts

| Name | Email | Password | Role | Phone | Age / Gender | Address |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **John Doe** | `john@example.com` | `password123` | `PATIENT` | `9876543210` | 30 / Male | 123 Main St |
| **Jane Doe** | `jane@example.com` | `password123` | `PATIENT` | `9876543211` | 28 / Female | 456 Elm St |
| **Bob Ross** | `bob@example.com` | `password123` | `PATIENT` | `9876543212` | 40 / Male | 789 Pine St |
| **krishna** | `krishna@gmail.com` | `admin123` | `PATIENT` | `9000087654` | 20 / Male | Uppal, Hyderabad |
| **ram** | `ram@gmail.com` | `password123` | `PATIENT` | `8759759759` | 21 / Male | Uppal, Hyderabad |
| **ramcharan** | `ramcharan@gmail.com` | `12345678` | `PATIENT` | `1234567890` | 21 / Male | Uppal, Hyderabad |

---

## 🚀 Running the Project

### Prerequisites
- **Java**: JDK 21+
- **Node.js**: v18+
- **MySQL**: Running on port `3306` with database `hospital_db` (`root` / `root`)

### 1. Backend (Spring Boot)
```bash
cd hospital
.\mvnw.cmd spring-boot:run
```
*API runs at `http://localhost:8080`*

### 2. Frontend (React + Vite)
```bash
cd frontend
npm.cmd run dev
```
*Web App runs at `http://localhost:5173`*
