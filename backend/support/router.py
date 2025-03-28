from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..database.database import get_db
from ..database.models import User, Customer, SupportTicket
from ..services.auth_service import AuthService, get_current_active_user
from ..services.ai_service import AIService
from pydantic import BaseModel
import json

router = APIRouter()
auth_service = AuthService()
ai_service = AIService()

# Pydantic models for request/response
class TicketCreate(BaseModel):
    customer_id: int
    subject: str
    description: str
    priority: str = "medium"
    category: Optional[str] = None

class TicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    resolution: Optional[str] = None

class TicketResponse(BaseModel):
    id: int
    customer_id: int
    subject: str
    description: str
    status: str
    priority: str
    category: Optional[str]
    assigned_to: Optional[int]
    resolution: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    message: str
    ticket_id: Optional[int] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    ticket_id: Optional[int]
    context: Optional[Dict[str, Any]]
    is_ai_response: bool

# Ticket Management Endpoints
@router.post("/tickets/", response_model=TicketResponse)
async def create_ticket(
    ticket: TicketCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new support ticket."""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == ticket.customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Analyze ticket sentiment and priority using AI
    sentiment_analysis = await ai_service.analyze_sentiment(ticket.description)
    
    # Adjust priority based on sentiment
    if sentiment_analysis["negative"] > 0.7:
        ticket.priority = "high"
    
    # Create ticket
    db_ticket = SupportTicket(
        customer_id=ticket.customer_id,
        subject=ticket.subject,
        description=ticket.description,
        priority=ticket.priority,
        category=ticket.category,
        assigned_to=current_user.id
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.get("/tickets/", response_model=List[TicketResponse])
async def get_tickets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of support tickets with optional filters."""
    query = db.query(SupportTicket)
    
    if status:
        query = query.filter(SupportTicket.status == status)
    if priority:
        query = query.filter(SupportTicket.priority == priority)
    
    tickets = query.offset(skip).limit(limit).all()
    return tickets

@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific support ticket."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a support ticket."""
    if not auth_service.check_permissions(current_user, "support"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    for field, value in ticket_update.dict(exclude_unset=True).items():
        setattr(db_ticket, field, value)
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

# AI Support Chat Endpoints
@router.post("/chat/", response_model=ChatResponse)
async def chat_with_ai(
    message: ChatMessage,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Chat with AI support assistant."""
    # Get ticket context if available
    context = {}
    if message.ticket_id:
        ticket = db.query(SupportTicket).filter(SupportTicket.id == message.ticket_id).first()
        if ticket:
            context = {
                "ticket_id": ticket.id,
                "subject": ticket.subject,
                "description": ticket.description,
                "status": ticket.status,
                "priority": ticket.priority
            }
    
    # Generate AI response
    prompt = f"""
    You are a helpful customer support assistant. Respond to the following message:
    {message.message}
    
    Context: {json.dumps(context)}
    Additional Context: {json.dumps(message.context or {})}
    
    Provide a helpful, professional response that addresses the customer's needs.
    """
    
    response = await ai_service.generate_content(prompt)
    
    return ChatResponse(
        message=response,
        ticket_id=message.ticket_id,
        context=context,
        is_ai_response=True
    )

# Support Analytics Endpoints
@router.get("/analytics/ticket-insights")
async def get_ticket_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights about support tickets."""
    if not auth_service.check_permissions(current_user, "support"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get ticket data for analysis
    tickets = db.query(SupportTicket).all()
    ticket_data = [
        {
            "id": ticket.id,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at.isoformat(),
            "resolution": ticket.resolution
        }
        for ticket in tickets
    ]
    
    # Generate insights using AI
    insights_prompt = f"""
    Analyze the following support ticket data and provide insights:
    {json.dumps(ticket_data)}
    
    Provide:
    1. Common issues and patterns
    2. Resolution time analysis
    3. Customer satisfaction indicators
    4. Support team performance metrics
    5. Recommendations for improvement
    """
    
    insights = await ai_service.generate_content(insights_prompt)
    return {"insights": insights}

@router.get("/analytics/customer-support-score")
async def get_customer_support_score(
    customer_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered customer support score and insights."""
    if not auth_service.check_permissions(current_user, "support"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get customer data
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get customer's tickets
    tickets = db.query(SupportTicket).filter(SupportTicket.customer_id == customer_id).all()
    ticket_data = [
        {
            "id": ticket.id,
            "subject": ticket.subject,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at.isoformat(),
            "resolution": ticket.resolution
        }
        for ticket in tickets
    ]
    
    # Generate customer support score and insights using AI
    analysis_prompt = f"""
    Analyze the following customer support data and provide:
    1. Overall support score (0-100)
    2. Support experience analysis
    3. Issue patterns
    4. Recommendations for improvement
    
    Customer: {customer.company_name}
    Industry: {customer.industry}
    Tickets: {json.dumps(ticket_data)}
    """
    
    analysis = await ai_service.generate_content(analysis_prompt)
    return {"analysis": analysis} 