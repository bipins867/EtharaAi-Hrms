from fastapi import APIRouter, HTTPException, status
from database import employees_collection, attendance_collection
from models import EmployeeCreate, EmployeeResponse
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

router = APIRouter(prefix="/api/employees", tags=["Employees"])


def employee_to_response(emp: dict) -> dict:
    """Convert MongoDB document to response format."""
    return {
        "id": str(emp["_id"]),
        "employee_id": emp["employee_id"],
        "full_name": emp["full_name"],
        "email": emp["email"],
        "department": emp["department"],
    }


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def add_employee(employee: EmployeeCreate):
    """Add a new employee."""
    employee_data = employee.model_dump()

    # Check for duplicate employee_id
    existing = employees_collection.find_one({"employee_id": employee_data["employee_id"]})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{employee_data['employee_id']}' already exists"
        )

    # Check for duplicate email
    existing_email = employees_collection.find_one({"email": employee_data["email"]})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{employee_data['email']}' already exists"
        )

    try:
        result = employees_collection.insert_one(employee_data)
        employee_data["_id"] = result.inserted_id
        return employee_to_response(employee_data)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee with this ID or email already exists"
        )


@router.get("", response_model=list[EmployeeResponse])
async def list_employees():
    """Retrieve all employees."""
    employees = employees_collection.find().sort("employee_id", 1)
    return [employee_to_response(emp) for emp in employees]


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    """Retrieve a single employee by ID."""
    employee = employees_collection.find_one({"employee_id": employee_id.upper()})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    return employee_to_response(employee)


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
async def delete_employee(employee_id: str):
    """Delete an employee and their attendance records."""
    emp_id = employee_id.upper()

    employee = employees_collection.find_one({"employee_id": emp_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )

    # Delete attendance records for this employee
    attendance_result = attendance_collection.delete_many({"employee_id": emp_id})

    # Delete the employee
    employees_collection.delete_one({"employee_id": emp_id})

    return {
        "message": f"Employee '{emp_id}' deleted successfully",
        "attendance_records_deleted": attendance_result.deleted_count
    }
