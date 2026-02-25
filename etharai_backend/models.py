import re
from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------- enums ----------

class StatusOption(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"


# ---------- request schemas ----------

class NewEmployee(BaseModel):
    employee_id: str = Field(
        ..., min_length=1, max_length=20,
        description="Unique ID assigned to the employee",
    )
    full_name: str = Field(
        ..., min_length=1, max_length=100,
        description="Employee full name",
    )
    email: EmailStr = Field(..., description="Work email address")
    department: str = Field(
        ..., min_length=1, max_length=50,
        description="Department the employee belongs to",
    )

    @field_validator("employee_id")
    @classmethod
    def clean_employee_id(cls, value: str) -> str:
        value = value.strip()
        if len(value) == 0:
            raise ValueError("employee_id must not be blank")
        pattern = r'^[A-Za-z0-9_-]+$'
        if not re.match(pattern, value):
            raise ValueError(
                "Only alphanumeric characters, hyphens and underscores are allowed"
            )
        return value.upper()

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) == 0:
            raise ValueError("Name field is required")
        return value

    @field_validator("department")
    @classmethod
    def clean_department(cls, value: str) -> str:
        value = value.strip()
        if len(value) == 0:
            raise ValueError("Department is required")
        return value


class EmployeeOut(BaseModel):
    id: str
    employee_id: str
    full_name: str
    email: str
    department: str


class NewAttendance(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Target employee ID")
    date: str = Field(..., description="Attendance date (YYYY-MM-DD)")
    status: StatusOption = Field(..., description="Present or Absent")

    @field_validator("employee_id")
    @classmethod
    def normalise_emp_id(cls, value: str) -> str:
        value = value.strip().upper()
        if len(value) == 0:
            raise ValueError("Employee ID is required")
        return value

    @field_validator("date")
    @classmethod
    def check_date_format(cls, value: str) -> str:
        value = value.strip()
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', value):
            raise ValueError("Expected format: YYYY-MM-DD")
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Not a valid calendar date")
        return value


class AttendanceOut(BaseModel):
    id: str
    employee_id: str
    date: str
    status: str
