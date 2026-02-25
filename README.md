# HRMS Lite

A lightweight Human Resource Management System built as a full-stack web application. It allows an admin to manage employee records and track daily attendance through a clean, professional interface.

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | React 19, React Router 7, Axios, React Toastify |
| Backend    | Python, FastAPI, PyMongo, Pydantic              |
| Database   | MongoDB (Atlas / local)                         |
| Deployment | Vercel (frontend), Render (backend)             |

## Features

### Core

- **Employee Management** — Add, view, and delete employees with validation (unique ID, email format, required fields)
- **Attendance Tracking** — Mark daily attendance (Present / Absent) per employee, with duplicate-date prevention and automatic status update

### Bonus

- Filter attendance records by employee and date
- Per-employee attendance summary (total present days)
- Dashboard with summary cards (total employees, present today, absent today, not marked) and department breakdown

## Project Structure

```
EtharaAi/
├── etharai_backend/             # FastAPI + MongoDB backend
│   ├── main.py                  # App entry point, CORS, startup events
│   ├── database.py              # MongoDB connection & index setup
│   ├── models.py                # Pydantic request/response schemas
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── employees.py         # /api/employees endpoints
│   │   ├── attendance.py        # /api/attendance endpoints
│   │   └── dashboard.py         # /api/dashboard endpoint
│   ├── .env                     # Environment variables (not committed)
│   └── requirements.txt
│
└── etharaai_frontend/            # React frontend
    ├── public/
    ├── src/
    │   ├── api/                  # Axios service modules
    │   │   ├── axiosInstance.js   # Configured Axios instance
    │   │   ├── employees.js      # Employee API calls
    │   │   ├── attendance.js     # Attendance API calls
    │   │   └── dashboard.js      # Dashboard API calls
    │   ├── components/
    │   │   ├── Attendance/       # Attendance-related components
    │   │   ├── Dashboard/        # Dashboard widgets
    │   │   ├── Employee/         # Employee-related components
    │   │   ├── Layout/           # App layout & navigation
    │   │   └── common/           # Shared/reusable UI components
    │   ├── pages/
    │   │   ├── DashboardPage.jsx
    │   │   ├── EmployeesPage.jsx
    │   │   └── AttendancePage.jsx
    │   ├── App.js                # Router setup
    │   ├── App.css               # Global styles
    │   ├── index.js              # React entry point
    │   └── index.css
    ├── .env
    ├── vercel.json
    └── package.json
```

## Getting Started (Local Development)

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster)

### 1. Backend

```bash
cd etharai_backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create a .env file with the variables listed below

# Run the server
python main.py
# — or —
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd etharaai_frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`.

## Environment Variables

### Backend (`etharai_backend/.env`)

| Variable          | Description                          | Default                     |
| ----------------- | ------------------------------------ | --------------------------- |
| `MONGODB_URI`     | MongoDB connection string            | `mongodb://localhost:27017` |
| `DATABASE_NAME`   | MongoDB database name                | `hrms_lite`                 |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `*`                         |
| `ENV`             | Environment (`dev` / `prod`)         | `dev`                       |
| `PORT`            | Port the server listens on           | `8000`                      |

### Frontend (`etharaai_frontend/.env`)

| Variable            | Description          | Default                     |
| ------------------- | -------------------- | --------------------------- |
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000/api` |

## API Endpoints

### Employees — `/api/employees`

| Method | Endpoint                       | Description                          |
| ------ | ------------------------------ | ------------------------------------ |
| POST   | `/api/employees`               | Create a new employee                |
| GET    | `/api/employees`               | List all employees                   |
| GET    | `/api/employees/{employee_id}` | Get employee by ID                   |
| DELETE | `/api/employees/{employee_id}` | Delete employee & related attendance |

### Attendance — `/api/attendance`

| Method | Endpoint                        | Description                                       |
| ------ | ------------------------------- | ------------------------------------------------- |
| POST   | `/api/attendance`               | Mark or update attendance for a date              |
| GET    | `/api/attendance/{employee_id}` | Get attendance history (optional `?date=` filter) |

### Dashboard — `/api/dashboard`

| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| GET    | `/api/dashboard/summary` | Summary statistics & department breakdown |

## Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com) pointing to this repo
2. Set the root directory to `etharai_backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from the table above (provide your MongoDB Atlas URI)

### Frontend (Vercel)

1. Import the repo on [Vercel](https://vercel.com)
2. Set the root directory to `etharaai_frontend`
3. Set `REACT_APP_API_URL` to your deployed backend URL (e.g. `https://your-backend.onrender.com/api`)

### Database

Provision a **MongoDB Atlas** cluster (free tier available) and update the `MONGODB_URI` environment variable on your backend deployment. Collections and indexes are auto-created on server startup.

## Assumptions & Limitations

- Single admin user; no authentication/authorization layer
- Leave management, payroll, and advanced HR features are out of scope
- Employee deletion cascades to remove all associated attendance records
- One attendance record per employee per day (enforced via unique compound index)
- Attendance updates on duplicate date will overwrite the previous status
