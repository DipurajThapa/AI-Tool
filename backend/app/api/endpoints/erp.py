from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.erp import User, Transaction, Employee, Invoice, Notification
from app.schemas.erp import (
    DashboardStats,
    FinancialForecast,
    AIRecommendation,
    Transaction as TransactionSchema,
    Employee as EmployeeSchema,
    Invoice as InvoiceSchema,
    Notification as NotificationSchema
)
from app.services.ai_service import AIService
from app.core.auth import get_current_user
from app.models.erp import UserRole
from datetime import datetime, timedelta

router = APIRouter()
ai_service = AIService()

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics based on user role."""
    # Get date range for filtering
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)

    # Get transactions based on user role
    if current_user.role == UserRole.ADMIN:
        transactions = db.query(Transaction).filter(
            Transaction.date.between(start_date, end_date)
        ).all()
    elif current_user.role == UserRole.FINANCE_MANAGER:
        transactions = db.query(Transaction).filter(
            Transaction.date.between(start_date, end_date),
            Transaction.type.in_(['income', 'expense'])
        ).all()
    else:
        transactions = []

    # Calculate totals
    total_revenue = sum(t.amount for t in transactions if t.type == 'income')
    total_expenses = sum(t.amount for t in transactions if t.type == 'expense')
    net_profit = total_revenue - total_expenses

    # Get employee count
    employee_count = db.query(Employee).filter(Employee.is_active == True).count()

    # Get pending invoices
    pending_invoices = db.query(Invoice).filter(
        Invoice.status == 'pending',
        Invoice.due_date >= datetime.utcnow()
    ).count()

    # Get notifications
    notifications = db.query(Notification).filter(
        Notification.created_at >= start_date
    ).all()

    return DashboardStats(
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        net_profit=net_profit,
        employee_count=employee_count,
        pending_invoices=pending_invoices,
        notifications=notifications
    )

@router.get("/dashboard/forecast", response_model=FinancialForecast)
async def get_financial_forecast(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated financial forecast."""
    if current_user.role not in [UserRole.ADMIN, UserRole.FINANCE_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to access financial forecasts")

    # Get historical transactions
    transactions = db.query(Transaction).filter(
        Transaction.date >= datetime.utcnow() - timedelta(days=365)
    ).all()

    # Generate forecast using AI service
    forecast = await ai_service.analyze_financial_data(transactions)
    return forecast

@router.get("/dashboard/recommendations", response_model=List[AIRecommendation])
async def get_ai_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered recommendations based on current data."""
    # Get relevant data based on user role
    if current_user.role == UserRole.ADMIN:
        transactions = db.query(Transaction).all()
        employees = db.query(Employee).all()
        invoices = db.query(Invoice).all()
    elif current_user.role == UserRole.FINANCE_MANAGER:
        transactions = db.query(Transaction).filter(
            Transaction.type.in_(['income', 'expense'])
        ).all()
        employees = []
        invoices = db.query(Invoice).all()
    elif current_user.role == UserRole.HR_MANAGER:
        transactions = []
        employees = db.query(Employee).all()
        invoices = []
    else:  # OPERATIONS_MANAGER
        transactions = []
        employees = []
        invoices = db.query(Invoice).all()

    # Generate recommendations using AI service
    recommendations = await ai_service.generate_recommendations(
        transactions=transactions,
        employees=employees,
        invoices=invoices
    )
    return recommendations

@router.get("/dashboard/transactions", response_model=List[TransactionSchema])
async def get_recent_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get recent transactions based on user role."""
    if current_user.role not in [UserRole.ADMIN, UserRole.FINANCE_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to access transactions")

    transactions = db.query(Transaction).order_by(
        Transaction.date.desc()
    ).limit(limit).all()
    return transactions

@router.get("/dashboard/employees", response_model=List[EmployeeSchema])
async def get_employee_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get employee list based on user role."""
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to access employee data")

    employees = db.query(Employee).filter(
        Employee.is_active == True
    ).order_by(Employee.hire_date.desc()).limit(limit).all()
    return employees

@router.get("/dashboard/invoices", response_model=List[InvoiceSchema])
async def get_recent_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get recent invoices based on user role."""
    if current_user.role not in [UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.OPERATIONS_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to access invoices")

    invoices = db.query(Invoice).order_by(
        Invoice.due_date.asc()
    ).limit(limit).all()
    return invoices

@router.get("/dashboard/notifications", response_model=List[NotificationSchema])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get recent notifications."""
    notifications = db.query(Notification).order_by(
        Notification.created_at.desc()
    ).limit(limit).all()
    return notifications 