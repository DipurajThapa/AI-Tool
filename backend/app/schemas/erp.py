from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from app.models.erp import UserRole, TransactionType, TransactionCategory

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Transaction schemas
class TransactionBase(BaseModel):
    amount: float
    type: TransactionType
    category: TransactionCategory
    description: str
    date: datetime
    vendor: str
    invoice_link: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category: Optional[TransactionCategory] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    vendor: Optional[str] = None
    invoice_link: Optional[str] = None

class Transaction(TransactionBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Employee schemas
class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    department: str
    position: str
    salary: float
    hire_date: datetime

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    position: Optional[str] = None
    salary: Optional[float] = None
    hire_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class Employee(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Payroll schemas
class PayrollBase(BaseModel):
    employee_id: int
    amount: float
    tax_deductions: float
    benefits: float
    payment_date: datetime
    status: str

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    amount: Optional[float] = None
    tax_deductions: Optional[float] = None
    benefits: Optional[float] = None
    payment_date: Optional[datetime] = None
    status: Optional[str] = None

class Payroll(PayrollBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Invoice schemas
class InvoiceBase(BaseModel):
    vendor: str
    amount: float
    due_date: datetime
    invoice_number: str
    ocr_data: dict
    status: str

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    vendor: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[datetime] = None
    invoice_number: Optional[str] = None
    ocr_data: Optional[dict] = None
    status: Optional[str] = None

class Invoice(InvoiceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Notification schemas
class NotificationBase(BaseModel):
    type: str
    message: str
    priority: str
    status: str

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    type: Optional[str] = None
    message: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class Notification(NotificationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    employee_count: int
    pending_invoices: int
    notifications: List[Notification]

class FinancialForecast(BaseModel):
    predicted_revenue: float
    predicted_expenses: float
    confidence_score: float
    factors: List[str]

class AIRecommendation(BaseModel):
    type: str
    message: str
    impact: str
    priority: str
    action_items: List[str] 