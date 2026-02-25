from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status
from pymongo.errors import DuplicateKeyError

from database import emp_col, att_col
from models import NewAttendance, AttendanceOut

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


def _format_record(rec: dict) -> dict:
    """Convert a raw attendance document for the API response."""
    return {
        "id": str(rec["_id"]),
        "employee_id": rec["employee_id"],
        "date": rec["date"],
        "status": rec["status"],
    }


@router.post("", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
async def mark(payload: NewAttendance):
    """Record or update attendance for a given employee and date."""
    data = payload.model_dump()

    # make sure the employee is real
    if emp_col.find_one({"employee_id": data["employee_id"]}) is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{data['employee_id']}' does not exist",
        )

    # if a record already exists for that day, just flip the status
    prev = att_col.find_one({
        "employee_id": data["employee_id"],
        "date": data["date"],
    })
    if prev:
        att_col.update_one(
            {"_id": prev["_id"]},
            {"$set": {"status": data["status"]}},
        )
        prev["status"] = data["status"]
        return _format_record(prev)

    try:
        result = att_col.insert_one(data)
        data["_id"] = result.inserted_id
        return _format_record(data)
    except DuplicateKeyError:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail="Attendance already exists for this employee on the given date",
        )


@router.get("/{employee_id}", response_model=list[AttendanceOut])
async def history(
    employee_id: str,
    date: Optional[str] = Query(None, description="Optional date filter (YYYY-MM-DD)"),
):
    """Retrieve attendance records for one employee, newest first."""
    eid = employee_id.upper()

    if emp_col.find_one({"employee_id": eid}) is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' does not exist",
        )

    filters: dict = {"employee_id": eid}
    if date:
        filters["date"] = date

    cursor = att_col.find(filters).sort("date", -1)
    return [_format_record(r) for r in cursor]
