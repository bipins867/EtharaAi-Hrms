import os
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "hrms_lite")

_client = MongoClient(MONGO_URL)
_database = _client[DB_NAME]

emp_col = _database["employees"]
att_col = _database["attendance"]


def setup_indexes():
    """Ensure unique constraints and compound indexes are in place."""
    emp_col.create_index("employee_id", unique=True)
    emp_col.create_index("email", unique=True)
    att_col.create_index(
        [("employee_id", ASCENDING), ("date", ASCENDING)],
        unique=True,
    )
    print(f"[DB] Successfully connected — database: {DB_NAME}")
