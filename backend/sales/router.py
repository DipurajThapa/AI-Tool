from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..database.database import get_db, content_generation
from ..database.models import User, Lead, Customer
from ..services.auth_service import AuthService, get_current_active_user
from ..services.ai_service import AIService
from pydantic import BaseModel
import json

router = APIRouter()
auth_service = AuthService()
ai_service = AIService()

# Pydantic models for request/response
class SalesPipelineRequest(BaseModel):
    name: str
    stages: List[str]
    description: Optional[str] = None
    target_revenue: float
    expected_duration: int  # in days

class SalesPipelineResponse(BaseModel):
    id: str
    name: str
    stages: List[str]
    description: Optional[str]
    target_revenue: float
    expected_duration: int
    current_revenue: float
    created_at: datetime
    updated_at: datetime

class ProposalRequest(BaseModel):
    customer_id: int
    product_data: Dict[str, Any]
    pricing_data: Dict[str, Any]
    custom_requirements: Optional[List[str]] = None

class ProposalResponse(BaseModel):
    id: str
    customer_id: int
    content: str
    status: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]

# Pipeline Management Endpoints
@router.post("/pipelines/", response_model=SalesPipelineResponse)
async def create_pipeline(
    pipeline: SalesPipelineRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new sales pipeline."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate pipeline strategy using AI
    strategy_prompt = f"""
    Create a sales pipeline strategy for:
    Name: {pipeline.name}
    Stages: {', '.join(pipeline.stages)}
    Target Revenue: ${pipeline.target_revenue}
    Expected Duration: {pipeline.expected_duration} days
    
    Provide:
    1. Stage-specific tactics
    2. Revenue projections
    3. Resource allocation
    4. Risk mitigation strategies
    """
    
    strategy = await ai_service.generate_content(strategy_prompt)
    
    # Store pipeline in MongoDB
    pipeline_doc = {
        "name": pipeline.name,
        "stages": pipeline.stages,
        "description": pipeline.description,
        "target_revenue": pipeline.target_revenue,
        "expected_duration": pipeline.expected_duration,
        "current_revenue": 0,
        "strategy": strategy,
        "created_by": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = content_generation.insert_one(pipeline_doc)
    
    return {
        "id": str(result.inserted_id),
        **pipeline_doc
    }

@router.get("/pipelines/{pipeline_id}", response_model=SalesPipelineResponse)
async def get_pipeline(
    pipeline_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific sales pipeline."""
    pipeline = content_generation.find_one({"_id": pipeline_id})
    if pipeline is None:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

# Proposal Generation Endpoints
@router.post("/proposals/", response_model=ProposalResponse)
async def create_proposal(
    proposal: ProposalRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a sales proposal using AI."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == proposal.customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Generate proposal using AI
    proposal_content = await ai_service.generate_sales_proposal(
        customer_data={
            "company_name": customer.company_name,
            "industry": customer.industry,
            "annual_revenue": customer.annual_revenue
        },
        product_data=proposal.product_data
    )
    
    # Store proposal in MongoDB
    proposal_doc = {
        "customer_id": proposal.customer_id,
        "content": proposal_content,
        "status": "draft",
        "product_data": proposal.product_data,
        "pricing_data": proposal.pricing_data,
        "custom_requirements": proposal.custom_requirements,
        "created_by": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = content_generation.insert_one(proposal_doc)
    
    return {
        "id": str(result.inserted_id),
        **proposal_doc
    }

@router.get("/proposals/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific sales proposal."""
    proposal = content_generation.find_one({"_id": proposal_id})
    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

# Sales Analytics Endpoints
@router.get("/analytics/pipeline-performance")
async def get_pipeline_performance(
    pipeline_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights about pipeline performance."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get pipeline data
    pipeline = content_generation.find_one({"_id": pipeline_id})
    if pipeline is None:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Generate performance insights using AI
    insights_prompt = f"""
    Analyze the following sales pipeline performance data and provide insights:
    Pipeline: {pipeline['name']}
    Current Revenue: ${pipeline['current_revenue']}
    Target Revenue: ${pipeline['target_revenue']}
    Stages: {', '.join(pipeline['stages'])}
    
    Provide:
    1. Revenue analysis
    2. Stage conversion rates
    3. Bottleneck identification
    4. Recommendations for improvement
    """
    
    insights = await ai_service.generate_content(insights_prompt)
    return {"insights": insights}

@router.get("/analytics/customer-insights")
async def get_customer_insights(
    customer_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights about customer behavior and potential."""
    if not auth_service.check_permissions(current_user, "sales"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get customer data
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get customer's proposals
    proposals = content_generation.find({"customer_id": customer_id})
    proposal_data = [
        {
            "id": str(p["_id"]),
            "status": p["status"],
            "created_at": p["created_at"].isoformat(),
            "product_data": p["product_data"]
        }
        for p in proposals
    ]
    
    # Generate customer insights using AI
    insights_prompt = f"""
    Analyze the following customer data and provide insights:
    Customer: {customer.company_name}
    Industry: {customer.industry}
    Annual Revenue: ${customer.annual_revenue}
    Customer Since: {customer.customer_since.isoformat()}
    Proposals: {json.dumps(proposal_data)}
    
    Provide:
    1. Customer value analysis
    2. Purchase behavior patterns
    3. Upsell opportunities
    4. Risk assessment
    """
    
    insights = await ai_service.generate_content(insights_prompt)
    return {"insights": insights} 