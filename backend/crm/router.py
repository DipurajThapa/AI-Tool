from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database.database import get_db
from ..database.models import User, Lead, Customer
from ..services.auth_service import AuthService, get_current_active_user
from ..services.ai_service import AIService
from pydantic import BaseModel, EmailStr

router = APIRouter()
auth_service = AuthService()
ai_service = AIService()

# Pydantic models for request/response
class LeadCreate(BaseModel):
    email: EmailStr
    name: str
    company: str
    phone: Optional[str] = None
    source: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None

class LeadResponse(BaseModel):
    id: int
    email: str
    name: str
    company: str
    phone: Optional[str]
    status: str
    source: Optional[str]
    score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CustomerCreate(BaseModel):
    lead_id: int
    company_name: str
    industry: str
    annual_revenue: float
    customer_since: datetime
    status: str

class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    annual_revenue: Optional[float] = None
    status: Optional[str] = None

class CustomerResponse(BaseModel):
    id: int
    lead_id: int
    company_name: str
    industry: str
    annual_revenue: float
    customer_since: datetime
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Lead Management Endpoints
@router.post("/leads/", response_model=LeadResponse)
async def create_lead(
    lead: LeadCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new lead."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate lead score using AI
    lead_data = lead.dict()
    lead_score = await ai_service.generate_lead_score(lead_data)
    
    db_lead = Lead(
        email=lead.email,
        name=lead.name,
        company=lead.company,
        phone=lead.phone,
        source=lead.source,
        score=lead_score
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.get("/leads/", response_model=List[LeadResponse])
async def get_leads(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of leads."""
    leads = db.query(Lead).offset(skip).limit(limit).all()
    return leads

@router.get("/leads/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific lead by ID."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.put("/leads/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    lead_update: LeadUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a lead."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if db_lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    for field, value in lead_update.dict(exclude_unset=True).items():
        setattr(db_lead, field, value)
    
    # Update lead score if relevant fields changed
    if any(field in lead_update.dict(exclude_unset=True) for field in ["company", "industry"]):
        lead_data = {
            "email": db_lead.email,
            "name": db_lead.name,
            "company": db_lead.company,
            "industry": getattr(db_lead, "industry", None)
        }
        db_lead.score = await ai_service.generate_lead_score(lead_data)
    
    db.commit()
    db.refresh(db_lead)
    return db_lead

# Customer Management Endpoints
@router.post("/customers/", response_model=CustomerResponse)
async def create_customer(
    customer: CustomerCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new customer from a lead."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == customer.lead_id).first()
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/customers/", response_model=List[CustomerResponse])
async def get_customers(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of customers."""
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return customers

@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific customer by ID."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

# AI-Powered Analytics Endpoints
@router.get("/analytics/lead-insights")
async def get_lead_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights about leads and conversion rates."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get lead data for analysis
    leads = db.query(Lead).all()
    lead_data = [
        {
            "id": lead.id,
            "email": lead.email,
            "company": lead.company,
            "status": lead.status,
            "score": lead.score,
            "created_at": lead.created_at.isoformat()
        }
        for lead in leads
    ]
    
    # Generate insights using AI
    insights = await ai_service.analyze_customer_feedback(lead_data)
    return insights

@router.get("/analytics/customer-value")
async def get_customer_value_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights about customer value and retention."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get customer data for analysis
    customers = db.query(Customer).all()
    customer_data = [
        {
            "id": customer.id,
            "company_name": customer.company_name,
            "industry": customer.industry,
            "annual_revenue": customer.annual_revenue,
            "customer_since": customer.customer_since.isoformat(),
            "status": customer.status
        }
        for customer in customers
    ]
    
    # Generate insights using AI
    insights = await ai_service.analyze_customer_feedback(customer_data)
    return insights 