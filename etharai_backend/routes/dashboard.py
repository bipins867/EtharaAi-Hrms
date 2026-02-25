from fastapi import APIRouter
from database import employees_collection, attendance_collection
from datetime import date

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_dashboard_summary():
    """Get dashboard summary statistics."""
    today = date.today().isoformat()

    # Total employees
    total_employees = employees_collection.count_documents({})

    # Today's attendance
    present_today = attendance_collection.count_documents({"date": today, "status": "Present"})
    absent_today = attendance_collection.count_documents({"date": today, "status": "Absent"})

    # Department breakdown
    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    departments = list(employees_collection.aggregate(pipeline))
    department_breakdown = [{"department": d["_id"], "count": d["count"]} for d in departments]

    # Per-employee attendance summary (total present days)
    attendance_pipeline = [
        {"$match": {"status": "Present"}},
        {"$group": {"_id": "$employee_id", "present_days": {"$sum": 1}}},
        {"$sort": {"present_days": -1}}
    ]
    employee_attendance = list(attendance_collection.aggregate(attendance_pipeline))

    # Enrich with employee names
    attendance_summary = []
    for item in employee_attendance:
        emp = employees_collection.find_one({"employee_id": item["_id"]})
        if emp:
            attendance_summary.append({
                "employee_id": item["_id"],
                "full_name": emp["full_name"],
                "department": emp["department"],
                "present_days": item["present_days"]
            })

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "not_marked_today": total_employees - present_today - absent_today,
        "department_breakdown": department_breakdown,
        "attendance_summary": attendance_summary
    }
