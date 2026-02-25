from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

from database import emp_col, att_col
from models import NewEmployee, EmployeeOut

router = APIRouter(prefix="/api/employees", tags=["Employees"])


def _serialize(doc: dict) -> dict:
    """Turn a raw Mongo document into a JSON-safe dict."""
    return {
        "id": str(doc["_id"]),
        "employee_id": doc["employee_id"],
        "full_name": doc["full_name"],
        "email": doc["email"],
        "department": doc["department"],
    }


@router.post("", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
async def add_employee(payload: NewEmployee):
    """Register a new employee in the system."""
    data = payload.model_dump()

    if emp_col.find_one({"employee_id": data["employee_id"]}):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{data['employee_id']}' already exists",
        )

    if emp_col.find_one({"email": data["email"]}):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail=f"Email '{data['email']}' is already registered",
        )

    try:
        result = emp_col.insert_one(data)
        data["_id"] = result.inserted_id
        return _serialize(data)
    except DuplicateKeyError:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail="Duplicate employee ID or email",
        )


@router.get("", response_model=list[EmployeeOut])
async def list_all():
    """Return every employee sorted by their ID."""
    docs = emp_col.find().sort("employee_id", 1)
    return [_serialize(d) for d in docs]


@router.get("/{employee_id}", response_model=EmployeeOut)
async def fetch_one(employee_id: str):
    """Look up a single employee by their custom ID."""
    doc = emp_col.find_one({"employee_id": employee_id.upper()})
    if doc is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"No employee found with ID '{employee_id}'",
        )
    return _serialize(doc)


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
async def remove_employee(employee_id: str):
    """Remove an employee together with all their attendance history."""
    eid = employee_id.upper()

    if emp_col.find_one({"employee_id": eid}) is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"No employee found with ID '{employee_id}'",
        )

    deleted_attendance = att_col.delete_many({"employee_id": eid})
    emp_col.delete_one({"employee_id": eid})

    return {
        "message": f"Employee '{eid}' deleted successfully",
        "attendance_records_deleted": deleted_attendance.deleted_count,
    }
