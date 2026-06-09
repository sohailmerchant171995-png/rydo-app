from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import os
import hashlib
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="RYDO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY"),
)

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class BookingCreate(BaseModel):
    user_email: str
    vehicle_id: int
    vehicle_name: str
    owner_name: str
    days: int
    daily_rate: float
    service_fee: float = 5.0
    total_amount: float

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.get("/")
def root():
    return {"message": "RYDO API is running"}

@app.get("/vehicles")
def get_vehicles():
    response = supabase.table("vehicles").select("*").eq("available", True).execute()
    return response.data

@app.post("/auth/register")
def register(user: UserRegister):
    existing = supabase.table("users").select("id").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    supabase.table("users").insert({
        "email": user.email,
        "password_hash": hash_password(user.password),
    }).execute()
    return {"message": "Registration successful", "email": user.email}

@app.post("/auth/login")
def login(user: UserLogin):
    result = (
        supabase.table("users")
        .select("*")
        .eq("email", user.email)
        .eq("password_hash", hash_password(user.password))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful", "email": user.email}

@app.post("/bookings")
def create_booking(booking: BookingCreate):
    result = supabase.table("bookings").insert({
        "user_email": booking.user_email,
        "vehicle_id": booking.vehicle_id,
        "vehicle_name": booking.vehicle_name,
        "owner_name": booking.owner_name,
        "days": booking.days,
        "daily_rate": booking.daily_rate,
        "service_fee": booking.service_fee,
        "total_amount": booking.total_amount,
        "status": "confirmed",
    }).execute()
    return {"message": "Booking confirmed", "booking": result.data[0]}

@app.get("/bookings/{user_email}")
def get_bookings(user_email: str):
    result = (
        supabase.table("bookings")
        .select("*")
        .eq("user_email", user_email)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
    