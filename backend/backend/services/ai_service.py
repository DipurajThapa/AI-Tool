from typing import List, Dict, Any, Optional
import numpy as np
from datetime import datetime, timedelta
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from ..models.sales_funnel import Lead, Deal, LeadInteraction, Proposal, RevenueForecast
from ..database import SessionLocal

class LeadScore(BaseModel):
    score: float = Field(description="AI-calculated lead score between 0 and 100")
    segment: str = Field(description="Lead segment (high-intent, mid-intent, low-intent)")
    next_action: str = Field(description="Recommended next action for the lead")
    confidence: float = Field(description="AI confidence in the assessment")

class DealPriority(BaseModel):
    priority: float = Field(description="AI-calculated deal priority between 0 and 100")
    next_action: str = Field(description="Recommended next action for the deal")
    staleness_score: float = Field(description="Score indicating how stale the deal is")
    confidence: float = Field(description="AI confidence in the assessment")

class RevenuePrediction(BaseModel):
    expected_revenue: float = Field(description="Expected revenue for the period")
    confidence_score: float = Field(description="AI confidence in the prediction")
    factors: Dict[str, float] = Field(description="Factors affecting the prediction")

class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0)
        self.lead_scoring_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI sales assistant. Analyze the lead data and provide a score and recommendations."),
            ("human", "Lead data: {lead_data}")
        ])
        self.deal_priority_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI sales assistant. Analyze the deal data and provide priority and recommendations."),
            ("human", "Deal data: {deal_data}")
        ])
        self.revenue_forecast_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI sales assistant. Analyze the sales data and provide revenue forecasts."),
            ("human", "Sales data: {sales_data}")
        ])

    async def score_lead(self, lead: Lead) -> LeadScore:
        """Score a lead using AI analysis of their data and interactions."""
        db = SessionLocal()
        try:
            # Get lead interactions
            interactions = db.query(LeadInteraction).filter(
                LeadInteraction.lead_id == lead.id
            ).all()

            # Prepare lead data for AI analysis
            lead_data = {
                "name": lead.name,
                "company": lead.company,
                "industry": lead.industry,
                "source": lead.source,
                "status": lead.status,
                "score": lead.score,
                "pain_points": lead.pain_points,
                "interactions": [
                    {
                        "type": i.type,
                        "timestamp": i.timestamp.isoformat(),
                        "sentiment": i.sentiment,
                        "engagement_score": i.engagement_score
                    }
                    for i in interactions
                ]
            }

            # Get AI analysis
            chain = self.lead_scoring_prompt | self.llm | PydanticOutputParser(pydantic_object=LeadScore)
            result = await chain.ainvoke({"lead_data": str(lead_data)})

            # Update lead with AI insights
            lead.ai_score = result.score
            lead.ai_segment = result.segment
            lead.ai_next_action = result.next_action
            lead.ai_last_contact = datetime.utcnow()
            
            db.commit()
            return result

        finally:
            db.close()

    async def prioritize_deal(self, deal: Deal) -> DealPriority:
        """Prioritize a deal using AI analysis of its data and related information."""
        db = SessionLocal()
        try:
            # Get related data
            lead = deal.lead
            proposals = deal.proposals

            # Prepare deal data for AI analysis
            deal_data = {
                "amount": deal.amount,
                "stage": deal.stage,
                "probability": deal.probability,
                "lead": {
                    "name": lead.name,
                    "company": lead.company,
                    "industry": lead.industry,
                    "ai_score": lead.ai_score
                },
                "proposals": [
                    {
                        "amount": p.amount,
                        "status": p.status,
                        "ai_confidence": p.ai_confidence
                    }
                    for p in proposals
                ]
            }

            # Get AI analysis
            chain = self.deal_priority_prompt | self.llm | PydanticOutputParser(pydantic_object=DealPriority)
            result = await chain.ainvoke({"deal_data": str(deal_data)})

            # Update deal with AI insights
            deal.ai_priority = result.priority
            deal.ai_next_action = result.next_action
            deal.ai_staleness_score = result.staleness_score
            
            db.commit()
            return result

        finally:
            db.close()

    async def forecast_revenue(self, period: str) -> RevenuePrediction:
        """Generate revenue forecast for a specific period using AI analysis."""
        db = SessionLocal()
        try:
            # Get historical data
            deals = db.query(Deal).filter(
                Deal.stage.in_([DealStage.CLOSED_WON, DealStage.CLOSED_LOST])
            ).all()

            # Get current pipeline
            pipeline = db.query(Deal).filter(
                Deal.stage.in_([DealStage.LEAD, DealStage.ENGAGED, DealStage.PROPOSAL_SENT, DealStage.NEGOTIATION])
            ).all()

            # Prepare sales data for AI analysis
            sales_data = {
                "period": period,
                "historical_deals": [
                    {
                        "amount": d.amount,
                        "stage": d.stage,
                        "probability": d.probability,
                        "created_at": d.created_at.isoformat()
                    }
                    for d in deals
                ],
                "current_pipeline": [
                    {
                        "amount": d.amount,
                        "stage": d.stage,
                        "probability": d.probability,
                        "ai_priority": d.ai_priority
                    }
                    for d in pipeline
                ]
            }

            # Get AI analysis
            chain = self.revenue_forecast_prompt | self.llm | PydanticOutputParser(pydantic_object=RevenuePrediction)
            result = await chain.ainvoke({"sales_data": str(sales_data)})

            # Save forecast
            forecast = RevenueForecast(
                period=period,
                expected_revenue=result.expected_revenue,
                confidence_score=result.confidence_score,
                factors=result.factors
            )
            db.add(forecast)
            db.commit()

            return result

        finally:
            db.close()

    async def generate_proposal(self, lead: Lead, deal: Deal) -> Dict[str, Any]:
        """Generate a sales proposal using AI analysis of the lead and deal data."""
        # Implementation for AI-powered proposal generation
        pass

    async def analyze_churn_risk(self, lead: Lead) -> Dict[str, Any]:
        """Analyze churn risk for a lead using AI analysis of their behavior."""
        # Implementation for churn risk analysis
        pass

    async def suggest_next_actions(self, lead: Lead, deal: Deal) -> List[str]:
        """Suggest next actions for a lead or deal using AI analysis."""
        # Implementation for next action suggestions
        pass 