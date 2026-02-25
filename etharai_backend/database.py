import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hrms_lite")

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Collections
employees_collection = db["employees"]
attendance_collection = db["attendance"]

def init_db():
    """Create indexes for data integrity."""
    employees_collection.create_index("employee_id", unique=True)
    employees_collection.create_index("email", unique=True)
    attendance_collection.create_index([("employee_id", 1), ("date", 1)], unique=True)
    print(f"Connected to MongoDB: {DATABASE_NAME}")
