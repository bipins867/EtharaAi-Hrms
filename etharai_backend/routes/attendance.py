from fastapi import APIRouter, HTTPException, Query, status
from database import employees_collection, attendance_collection
from models import AttendanceCreate, AttendanceResponse
from pymongo.errors import DuplicateKeyError
from typing import Optional

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


def attendance_to_response(record: dict) -> dict:
    """Convert MongoDB document to response format."""
    return {
        "id": str(record["_id"]),
        "employee_id": record["employee_id"],
        "date": record["date"],
        "status": record["status"],
    }


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for an employee."""
    attendance_data = attendance.model_dump()

    # Verify employee exists
    employee = employees_collection.find_one({"employee_id": attendance_data["employee_id"]})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance_data['employee_id']}' not found"
        )

    # Check for existing attendance on same date
    existing = attendance_collection.find_one({
        "employee_id": attendance_data["employee_id"],
        "date": attendance_data["date"]
    })
    if existing:
        # Update existing record instead of duplicating
        attendance_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": attendance_data["status"]}}
        )
        existing["status"] = attendance_data["status"]
        return attendance_to_response(existing)

    try:
        result = attendance_collection.insert_one(attendance_data)
        attendance_data["_id"] = result.inserted_id
        return attendance_to_response(attendance_data)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already marked for this employee on this date"
        )


@router.get("/{employee_id}", response_model=list[AttendanceResponse])
async def get_attendance(
    employee_id: str,
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)")
):
    """Get attendance records for an employee, optionally filtered by date."""
    emp_id = employee_id.upper()

    # Verify employee exists
    employee = employees_collection.find_one({"employee_id": emp_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )

    query = {"employee_id": emp_id}
    if date:
        query["date"] = date

    records = attendance_collection.find(query).sort("date", -1)
    return [attendance_to_response(r) for r in records]
