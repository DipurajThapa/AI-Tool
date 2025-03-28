from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..database.database import get_db, content_generation
from ..database.models import User
from ..services.auth_service import AuthService, get_current_active_user
from ..services.ai_service import AIService
from pydantic import BaseModel
import json

router = APIRouter()
auth_service = AuthService()
ai_service = AIService()

# Pydantic models for request/response
class ContentRequest(BaseModel):
    topic: str
    content_type: str  # blog, social, email, etc.
    target_audience: str
    tone: str = "professional"
    keywords: List[str] = []
    length: str = "medium"  # short, medium, long

class ContentResponse(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    created_at: datetime
    seo_score: float
    keywords: List[str]

class CampaignRequest(BaseModel):
    name: str
    description: str
    target_audience: str
    channels: List[str]
    start_date: datetime
    end_date: datetime
    budget: float
    goals: List[str]

class CampaignResponse(BaseModel):
    id: str
    name: str
    description: str
    status: str
    performance_metrics: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

# Content Generation Endpoints
@router.post("/content/generate", response_model=ContentResponse)
async def generate_content(
    request: ContentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate AI-powered content based on specifications."""
    if not auth_service.check_permissions(current_user, "marketing"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate content using AI
    prompt = f"""
    Generate {request.content_type} content with the following specifications:
    Topic: {request.topic}
    Target Audience: {request.target_audience}
    Tone: {request.tone}
    Keywords: {', '.join(request.keywords)}
    Length: {request.length}
    
    Please ensure the content is engaging, informative, and optimized for the target audience.
    """
    
    content = await ai_service.generate_content(prompt)
    
    # Generate SEO score and keyword analysis
    seo_prompt = f"""
    Analyze the following content for SEO optimization:
    {content}
    
    Provide:
    1. SEO score (0-100)
    2. Key keywords found
    3. Suggestions for improvement
    """
    
    seo_analysis = await ai_service.generate_content(seo_prompt)
    
    # Store content in MongoDB
    content_doc = {
        "content": content,
        "metadata": {
            "topic": request.topic,
            "content_type": request.content_type,
            "target_audience": request.target_audience,
            "tone": request.tone,
            "keywords": request.keywords,
            "length": request.length,
            "created_by": current_user.id
        },
        "created_at": datetime.utcnow(),
        "seo_score": float(seo_analysis.split("SEO score: ")[1].split("\n")[0]),
        "keywords": request.keywords
    }
    
    result = content_generation.insert_one(content_doc)
    
    return {
        "id": str(result.inserted_id),
        **content_doc
    }

@router.get("/content/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get generated content by ID."""
    content = content_generation.find_one({"_id": content_id})
    if content is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

# Campaign Management Endpoints
@router.post("/campaigns/", response_model=CampaignResponse)
async def create_campaign(
    campaign: CampaignRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new marketing campaign."""
    if not auth_service.check_permissions(current_user, "marketing"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate campaign strategy using AI
    strategy_prompt = f"""
    Create a marketing campaign strategy for:
    Name: {campaign.name}
    Description: {campaign.description}
    Target Audience: {campaign.target_audience}
    Channels: {', '.join(campaign.channels)}
    Goals: {', '.join(campaign.goals)}
    
    Provide:
    1. Channel-specific tactics
    2. Content recommendations
    3. Timeline suggestions
    4. Budget allocation
    """
    
    strategy = await ai_service.generate_content(strategy_prompt)
    
    # Store campaign in MongoDB
    campaign_doc = {
        "name": campaign.name,
        "description": campaign.description,
        "status": "planning",
        "target_audience": campaign.target_audience,
        "channels": campaign.channels,
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "budget": campaign.budget,
        "goals": campaign.goals,
        "strategy": strategy,
        "performance_metrics": {
            "reach": 0,
            "engagement": 0,
            "conversions": 0,
            "roi": 0
        },
        "created_by": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = content_generation.insert_one(campaign_doc)
    
    return {
        "id": str(result.inserted_id),
        **campaign_doc
    }

# SEO Analysis Endpoints
@router.post("/seo/analyze")
async def analyze_seo(
    content: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze content for SEO optimization."""
    if not auth_service.check_permissions(current_user, "marketing"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate comprehensive SEO analysis
    seo_prompt = f"""
    Perform a comprehensive SEO analysis of the following content:
    {content}
    
    Provide:
    1. SEO score (0-100)
    2. Keyword density analysis
    3. Content structure assessment
    4. Meta description suggestions
    5. Title tag optimization
    6. Internal linking opportunities
    7. Mobile optimization recommendations
    """
    
    analysis = await ai_service.generate_content(seo_prompt)
    return {"analysis": analysis}

# Performance Analytics Endpoints
@router.get("/analytics/campaign-performance")
async def get_campaign_performance(
    campaign_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights about campaign performance."""
    if not auth_service.check_permissions(current_user, "marketing"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get campaign data
    campaign = content_generation.find_one({"_id": campaign_id})
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Generate performance insights using AI
    insights_prompt = f"""
    Analyze the following campaign performance data and provide insights:
    Campaign: {campaign['name']}
    Performance Metrics: {json.dumps(campaign['performance_metrics'])}
    Goals: {', '.join(campaign['goals'])}
    
    Provide:
    1. Performance analysis
    2. Goal achievement assessment
    3. ROI calculation
    4. Recommendations for improvement
    """
    
    insights = await ai_service.generate_content(insights_prompt)
    return {"insights": insights} 