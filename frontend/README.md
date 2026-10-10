# ApexCare Hospital Portal - Frontend

## 🔐 System User Login Credentials

### 1. Administrator Account
| Name | Email | Password | Role | Phone |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin123` | `ADMIN` | `0000000000` |

---

### 2. Doctor Accounts
> **Default Doctor Password:** `doctor123`

| Name | Email | Password | Department | Specialization | Room | Consultation Fee |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Alice Smith** | `alice@hospital.com` | `doctor123` | Cardiology | Cardiology | 101 | ₹500 |
| **Dr. Rajesh Kumar** | `rajesh@hospital.com` | `doctor123` | General Medicine | General Physician | 102 | ₹350 |
| **Dr. Vikram Reddy** | `vikram@hospital.com` | `doctor123` | Orthopedics | Orthopedic Surgeon | 103 | ₹450 |
| **Dr. Sneha Rao** | `sneha@hospital.com` | `doctor123` | Dermatology | Dermatologist | 104 | ₹400 |
| **Dr. Ananya Sen** | `ananya@hospital.com` | `doctor123` | Pediatrics | Pediatrician | 105 | ₹350 |
| **Dr. Suresh Verma** | `suresh@hospital.com` | `doctor123` | ENT | ENT Specialist | 106 | ₹400 |

---

### 3. Patient Accounts

| Name | Email | Password | Role | Phone | Age / Gender |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **John Doe** | `john@example.com` | `password123` | `PATIENT` | `9876543210` | 30 / Male |
| **Jane Doe** | `jane@example.com` | `password123` | `PATIENT` | `9876543211` | 28 / Female |
| **Bob Ross** | `bob@example.com` | `password123` | `PATIENT` | `9876543212` | 40 / Male |
| **krishna** | `krishna@gmail.com` | `admin123` | `PATIENT` | `9000087654` | 20 / Male |
| **ram** | `ram@gmail.com` | `password123` | `PATIENT` | `8759759759` | 21 / Male |
| **ramcharan** | `ramcharan@gmail.com` | `12345678` | `PATIENT` | `1234567890` | 21 / Male |

---

## Development

Run development server:
```bash
npm.cmd run dev
```
Proxy routes `/api/*` to `http://localhost:8080`.
