from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

class LeadSource(str, enum.Enum):
    WEBSITE = "website"
    REFERRAL = "referral"
    SOCIAL = "social"
    PAID = "paid"
    OTHER = "other"

class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class DealStage(str, enum.Enum):
    LEAD = "lead"
    ENGAGED = "engaged"
    PROPOSAL_SENT = "proposal_sent"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    company = Column(String)
    source = Column(Enum(LeadSource))
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW)
    score = Column(Float, default=0.0)
    industry = Column(String)
    pain_points = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI-generated fields
    ai_score = Column(Float, default=0.0)
    ai_segment = Column(String)
    ai_next_action = Column(String)
    ai_last_contact = Column(DateTime)
    
    # Relationships
    deals = relationship("Deal", back_populates="lead")
    interactions = relationship("LeadInteraction", back_populates="lead")
    proposals = relationship("Proposal", back_populates="lead")

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    stage = Column(Enum(DealStage), default=DealStage.LEAD)
    amount = Column(Float)
    probability = Column(Float, default=0.0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI-generated fields
    ai_priority = Column(Float, default=0.0)
    ai_next_action = Column(String)
    ai_staleness_score = Column(Float, default=0.0)
    
    # Relationships
    lead = relationship("Lead", back_populates="deals")
    owner = relationship("User", back_populates="deals")
    proposals = relationship("Proposal", back_populates="deal")

class LeadInteraction(Base):
    __tablename__ = "lead_interactions"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    type = Column(String)  # email, call, meeting, etc.
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sentiment = Column(Float)  # AI-analyzed sentiment score
    engagement_score = Column(Float)  # AI-calculated engagement score
    
    # Relationships
    lead = relationship("Lead", back_populates="interactions")

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    deal_id = Column(Integer, ForeignKey("deals.id"))
    amount = Column(Float)
    status = Column(String)  # draft, sent, accepted, rejected
    content = Column(JSON)  # AI-generated proposal content
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI-generated fields
    ai_confidence = Column(Float, default=0.0)
    ai_competitor_analysis = Column(JSON)
    
    # Relationships
    lead = relationship("Lead", back_populates="proposals")
    deal = relationship("Deal", back_populates="proposals")

class RevenueForecast(Base):
    __tablename__ = "revenue_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    period = Column(String)  # e.g., "2024-Q1"
    expected_revenue = Column(Float)
    confidence_score = Column(Float)
    factors = Column(JSON)  # AI-analyzed factors affecting forecast
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AITrainingData(Base):
    __tablename__ = "ai_training_data"

    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String)  # lead_scoring, revenue_forecast, etc.
    input_data = Column(JSON)
    output_data = Column(JSON)
    accuracy_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    used_for_training = Column(Boolean, default=False) 