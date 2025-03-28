from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.sales_funnel import (
    Lead, Deal, LeadInteraction, Proposal, RevenueForecast,
    LeadSource, LeadStatus, DealStage
)
from ..services.ai_service import AIService
from pydantic import BaseModel, EmailStr
from ..auth import get_current_user

router = APIRouter()
ai_service = AIService()

# Pydantic models for request/response
class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    source: LeadSource
    industry: Optional[str] = None
    pain_points: Optional[dict] = None

class DealCreate(BaseModel):
    lead_id: int
    amount: float
    stage: DealStage = DealStage.LEAD

class LeadInteractionCreate(BaseModel):
    lead_id: int
    type: str
    content: str

class ProposalCreate(BaseModel):
    lead_id: int
    deal_id: int
    amount: float
    status: str = "draft"

# Lead Management Endpoints
@router.post("/leads/", response_model=Lead)
async def create_lead(
    lead: LeadCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new lead and trigger AI scoring."""
    db_lead = Lead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    
    # Trigger AI scoring
    await ai_service.score_lead(db_lead)
    return db_lead

@router.get("/leads/", response_model=List[Lead])
async def get_leads(
    skip: int = 0,
    limit: int = 100,
    segment: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get leads with optional AI segment filtering."""
    query = db.query(Lead)
    if segment:
        query = query.filter(Lead.ai_segment == segment)
    return query.offset(skip).limit(limit).all()

@router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific lead by ID."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

# Deal Management Endpoints
@router.post("/deals/", response_model=Deal)
async def create_deal(
    deal: DealCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new deal and trigger AI prioritization."""
    db_deal = Deal(**deal.dict(), owner_id=current_user.id)
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    # Trigger AI prioritization
    await ai_service.prioritize_deal(db_deal)
    return db_deal

@router.get("/deals/", response_model=List[Deal])
async def get_deals(
    skip: int = 0,
    limit: int = 100,
    stage: Optional[DealStage] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get deals with optional stage filtering."""
    query = db.query(Deal)
    if stage:
        query = query.filter(Deal.stage == stage)
    return query.offset(skip).limit(limit).all()

@router.put("/deals/{deal_id}/stage", response_model=Deal)
async def update_deal_stage(
    deal_id: int,
    stage: DealStage,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update deal stage and trigger AI re-prioritization."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    deal.stage = stage
    db.commit()
    
    # Trigger AI re-prioritization
    await ai_service.prioritize_deal(deal)
    return deal

# Lead Interaction Endpoints
@router.post("/interactions/", response_model=LeadInteraction)
async def create_interaction(
    interaction: LeadInteractionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new lead interaction and trigger AI analysis."""
    db_interaction = LeadInteraction(**interaction.dict())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    
    # Trigger AI lead re-scoring
    lead = db.query(Lead).filter(Lead.id == interaction.lead_id).first()
    if lead:
        await ai_service.score_lead(lead)
    
    return db_interaction

# Proposal Management Endpoints
@router.post("/proposals/", response_model=Proposal)
async def create_proposal(
    proposal: ProposalCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new proposal and trigger AI generation."""
    db_proposal = Proposal(**proposal.dict())
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    
    # Trigger AI proposal generation
    lead = db.query(Lead).filter(Lead.id == proposal.lead_id).first()
    deal = db.query(Deal).filter(Deal.id == proposal.deal_id).first()
    if lead and deal:
        await ai_service.generate_proposal(lead, deal)
    
    return db_proposal

# Revenue Forecasting Endpoints
@router.get("/revenue/forecast/{period}", response_model=RevenueForecast)
async def get_revenue_forecast(
    period: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get AI-generated revenue forecast for a specific period."""
    forecast = await ai_service.forecast_revenue(period)
    return forecast

# AI Insights Endpoints
@router.get("/leads/{lead_id}/ai-insights")
async def get_lead_ai_insights(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get AI-generated insights for a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Get AI analysis
    score = await ai_service.score_lead(lead)
    next_actions = await ai_service.suggest_next_actions(lead, None)
    churn_risk = await ai_service.analyze_churn_risk(lead)
    
    return {
        "score": score,
        "next_actions": next_actions,
        "churn_risk": churn_risk
    }

@router.get("/deals/{deal_id}/ai-insights")
async def get_deal_ai_insights(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get AI-generated insights for a deal."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Get AI analysis
    priority = await ai_service.prioritize_deal(deal)
    next_actions = await ai_service.suggest_next_actions(None, deal)
    
    return {
        "priority": priority,
        "next_actions": next_actions
    } 