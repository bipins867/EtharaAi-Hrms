# HRMS Lite

A lightweight Human Resource Management System built as a full-stack web application. It allows an admin to manage employee records and track daily attendance through a clean, professional interface.

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | React 19, React Router, Axios      |
| Backend    | Python, FastAPI, SQLAlchemy, Pydantic |
| Database   | MySQL (via PyMySQL)                |
| Deployment | Vercel (frontend), Render (backend) |

## Features

### Core
- **Employee Management** -- Add, view, and delete employees with validation (unique ID, email format, required fields)
- **Attendance Tracking** -- Mark daily attendance (Present / Absent) per employee, with duplicate-date prevention

### Bonus
- Filter attendance records by employee and date range
- Per-employee attendance summary (total present / absent days)
- Dashboard with summary cards (total employees, present today, absent today) and department breakdown

## Project Structure

```
EtharaAi/
├── EtharaAi-Backend/          # FastAPI backend
│   ├── app/
│   │   ├── main.py            # App entry point, CORS, lifespan
│   │   ├── config.py          # Settings loaded from .env
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models.py          # ORM models (Employee, Attendance)
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── employees.py   # /api/employees endpoints
│   │       ├── attendance.py  # /api/attendance endpoints
│   │       └── dashboard.py   # /api/dashboard endpoint
│   ├── .env.example
│   └── requirements.txt
│
└── etharaai_frontend/         # React frontend
    ├── src/
    │   ├── api/               # Axios service modules
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Page-level components
    │   ├── App.js             # Router setup
    │   └── App.css            # Global styles
    ├── .env
    └── package.json
```

## Getting Started (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL server running locally

### 1. Database Setup

```sql
CREATE DATABASE hrms_lite;
```

### 2. Backend

```bash
cd EtharaAi-Backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and fill in your MySQL credentials
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

# Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd etharaai_frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`.

## Environment Variables

### Backend (`EtharaAi-Backend/.env`)

| Variable      | Description                  | Default               |
|---------------|------------------------------|-----------------------|
| `DB_HOST`     | MySQL host                   | `localhost`           |
| `DB_PORT`     | MySQL port                   | `3306`                |
| `DB_USER`     | MySQL username               | `root`                |
| `DB_PASSWORD` | MySQL password               | (empty)               |
| `DB_NAME`     | MySQL database name          | `hrms_lite`           |
| `CORS_ORIGINS`| Comma-separated allowed origins | `http://localhost:3000` |

### Frontend (`etharaai_frontend/.env`)

| Variable            | Description          | Default                        |
|---------------------|----------------------|--------------------------------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000/api`    |

## API Endpoints

### Employees
| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/employees/`      | Create a new employee    |
| GET    | `/api/employees/`      | List all employees       |
| GET    | `/api/employees/{id}`  | Get employee by ID       |
| DELETE | `/api/employees/{id}`  | Delete an employee       |

### Attendance
| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| POST   | `/api/attendance/`                | Mark attendance                    |
| GET    | `/api/attendance/`                | List records (filterable)          |
| GET    | `/api/attendance/summary/{id}`    | Present/absent count for employee  |

### Dashboard
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | `/api/dashboard/`  | Summary statistics   |

## Deployment

### Backend (Render)
1. Create a new Web Service on Render pointing to this repo
2. Set the root directory to `EtharaAi-Backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example`

### Frontend (Vercel)
1. Import the repo on Vercel
2. Set the root directory to `etharaai_frontend`
3. Set `REACT_APP_API_URL` to your deployed backend URL (e.g. `https://your-backend.onrender.com/api`)

### Database
Provision a managed MySQL instance from PlanetScale, Aiven, or Railway and update the backend environment variables accordingly. Tables are auto-created on server startup.

## Assumptions & Limitations
- Single admin user; no authentication/authorization required
- Leave management, payroll, and advanced HR features are out of scope
- Employee deletion cascades to remove all associated attendance records
- One attendance record per employee per day (enforced at database level)
