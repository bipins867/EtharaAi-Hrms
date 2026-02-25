from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from enum import Enum
import re


class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"


class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=20, description="Unique employee identifier")
    full_name: str = Field(..., min_length=1, max_length=100, description="Full name of the employee")
    email: EmailStr = Field(..., description="Valid email address")
    department: str = Field(..., min_length=1, max_length=50, description="Department name")

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Employee ID cannot be empty")
        if not re.match(r'^[A-Za-z0-9_-]+$', v):
            raise ValueError("Employee ID can only contain letters, numbers, hyphens, and underscores")
        return v.upper()

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty")
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Department cannot be empty")
        return v


class EmployeeResponse(BaseModel):
    id: str
    employee_id: str
    full_name: str
    email: str
    department: str


class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Employee ID")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    status: AttendanceStatus = Field(..., description="Attendance status: Present or Absent")

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v):
        v = v.strip().upper()
        if not v:
            raise ValueError("Employee ID cannot be empty")
        return v

    @field_validator("date")
    @classmethod
    def validate_date(cls, v):
        v = v.strip()
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', v):
            raise ValueError("Date must be in YYYY-MM-DD format")
        # Validate it's a real date
        from datetime import datetime
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid date")
        return v


class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    date: str
    status: str
