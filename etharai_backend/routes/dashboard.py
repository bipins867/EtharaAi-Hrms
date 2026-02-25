from datetime import date as dt_date
from fastapi import APIRouter

from database import emp_col, att_col

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def overview():
    """Aggregate key metrics for the admin dashboard."""
    today_str = dt_date.today().isoformat()

    total_emp = emp_col.count_documents({})
    present_cnt = att_col.count_documents({"date": today_str, "status": "Present"})
    absent_cnt = att_col.count_documents({"date": today_str, "status": "Absent"})

    # group employees by department
    dept_pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    dept_docs = list(emp_col.aggregate(dept_pipeline))
    dept_data = [
        {"department": d["_id"], "count": d["count"]}
        for d in dept_docs
    ]

    # total present days per employee
    att_pipeline = [
        {"$match": {"status": "Present"}},
        {"$group": {"_id": "$employee_id", "present_days": {"$sum": 1}}},
        {"$sort": {"present_days": -1}},
    ]
    att_docs = list(att_col.aggregate(att_pipeline))

    att_data = []
    for entry in att_docs:
        emp = emp_col.find_one({"employee_id": entry["_id"]})
        if emp:
            att_data.append({
                "employee_id": entry["_id"],
                "full_name": emp["full_name"],
                "department": emp["department"],
                "present_days": entry["present_days"],
            })

    return {
        "total_employees": total_emp,
        "present_today": present_cnt,
        "absent_today": absent_cnt,
        "not_marked_today": total_emp - present_cnt - absent_cnt,
        "department_breakdown": dept_data,
        "attendance_summary": att_data,
    }
