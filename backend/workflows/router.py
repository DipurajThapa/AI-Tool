from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..database.database import get_db
from ..database.models import User, Workflow, Task
from ..services.auth_service import AuthService, get_current_active_user
from ..services.ai_service import AIService
from pydantic import BaseModel
import json

router = APIRouter()
auth_service = AuthService()
ai_service = AIService()

# Pydantic models for request/response
class WorkflowCreate(BaseModel):
    name: str
    description: str
    trigger_type: str
    trigger_config: Dict[str, Any]
    actions: List[Dict[str, Any]]
    is_active: bool = True

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None

class WorkflowResponse(BaseModel):
    id: int
    name: str
    description: str
    trigger_type: str
    trigger_config: Dict[str, Any]
    actions: List[Dict[str, Any]]
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkflowExecutionRequest(BaseModel):
    workflow_id: int
    input_data: Dict[str, Any]
    priority: str = "medium"

class WorkflowExecutionResponse(BaseModel):
    id: str
    workflow_id: int
    status: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    started_at: datetime
    completed_at: Optional[datetime]
    error: Optional[str]

# Workflow Management Endpoints
@router.post("/workflows/", response_model=WorkflowResponse)
async def create_workflow(
    workflow: WorkflowCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new workflow."""
    if not auth_service.check_permissions(current_user, "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate workflow validation using AI
    validation_prompt = f"""
    Validate the following workflow configuration:
    Name: {workflow.name}
    Trigger Type: {workflow.trigger_type}
    Trigger Config: {json.dumps(workflow.trigger_config)}
    Actions: {json.dumps(workflow.actions)}
    
    Provide:
    1. Configuration validation
    2. Potential issues
    3. Optimization suggestions
    """
    
    validation = await ai_service.generate_content(validation_prompt)
    
    # Create workflow
    db_workflow = Workflow(
        name=workflow.name,
        description=workflow.description,
        trigger_type=workflow.trigger_type,
        trigger_config=workflow.trigger_config,
        actions=workflow.actions,
        is_active=workflow.is_active,
        created_by=current_user.id
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

@router.get("/workflows/", response_model=List[WorkflowResponse])
async def get_workflows(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of workflows with optional filters."""
    query = db.query(Workflow)
    
    if is_active is not None:
        query = query.filter(Workflow.is_active == is_active)
    
    workflows = query.offset(skip).limit(limit).all()
    return workflows

@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific workflow."""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: int,
    workflow_update: WorkflowUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a workflow."""
    if not auth_service.check_permissions(current_user, "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    for field, value in workflow_update.dict(exclude_unset=True).items():
        setattr(db_workflow, field, value)
    
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

# Workflow Execution Endpoints
@router.post("/workflows/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    workflow_id: int,
    execution: WorkflowExecutionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Execute a workflow with input data."""
    # Get workflow
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    if not workflow.is_active:
        raise HTTPException(status_code=400, detail="Workflow is not active")
    
    # Generate execution plan using AI
    plan_prompt = f"""
    Create an execution plan for the following workflow:
    Workflow: {workflow.name}
    Trigger Type: {workflow.trigger_type}
    Input Data: {json.dumps(execution.input_data)}
    Actions: {json.dumps(workflow.actions)}
    
    Provide:
    1. Execution steps
    2. Resource requirements
    3. Potential bottlenecks
    4. Error handling strategies
    """
    
    execution_plan = await ai_service.generate_content(plan_prompt)
    
    # Create execution record
    execution_doc = {
        "workflow_id": workflow_id,
        "status": "running",
        "input_data": execution.input_data,
        "output_data": {},
        "execution_plan": execution_plan,
        "started_at": datetime.utcnow(),
        "created_by": current_user.id
    }
    
    try:
        # Execute workflow actions
        for action in workflow.actions:
            # Generate action execution using AI
            action_prompt = f"""
            Execute the following workflow action:
            Action: {json.dumps(action)}
            Input Data: {json.dumps(execution.input_data)}
            
            Provide the action output in JSON format.
            """
            
            action_output = await ai_service.generate_content(action_prompt)
            execution_doc["output_data"][action["id"]] = json.loads(action_output)
        
        execution_doc["status"] = "completed"
        execution_doc["completed_at"] = datetime.utcnow()
        
    except Exception as e:
        execution_doc["status"] = "failed"
        execution_doc["error"] = str(e)
    
    # Store execution record in MongoDB
    result = content_generation.insert_one(execution_doc)
    
    return {
        "id": str(result.inserted_id),
        **execution_doc
    }

# Workflow Analytics Endpoints
@router.get("/analytics/workflow-performance")
async def get_workflow_performance(
    workflow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights about workflow performance."""
    if not auth_service.check_permissions(current_user, "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get workflow data
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Get execution history
    executions = content_generation.find({"workflow_id": workflow_id})
    execution_data = [
        {
            "id": str(e["_id"]),
            "status": e["status"],
            "started_at": e["started_at"].isoformat(),
            "completed_at": e.get("completed_at", ""),
            "error": e.get("error", "")
        }
        for e in executions
    ]
    
    # Generate performance insights using AI
    insights_prompt = f"""
    Analyze the following workflow performance data and provide insights:
    Workflow: {workflow.name}
    Trigger Type: {workflow.trigger_type}
    Executions: {json.dumps(execution_data)}
    
    Provide:
    1. Success rate analysis
    2. Execution time patterns
    3. Error patterns
    4. Optimization opportunities
    5. Recommendations for improvement
    """
    
    insights = await ai_service.generate_content(insights_prompt)
    return {"insights": insights}

@router.get("/analytics/workflow-optimization")
async def get_workflow_optimization(
    workflow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered workflow optimization suggestions."""
    if not auth_service.check_permissions(current_user, "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get workflow data
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Generate optimization suggestions using AI
    optimization_prompt = f"""
    Analyze the following workflow configuration and provide optimization suggestions:
    Workflow: {workflow.name}
    Description: {workflow.description}
    Trigger Type: {workflow.trigger_type}
    Trigger Config: {json.dumps(workflow.trigger_config)}
    Actions: {json.dumps(workflow.actions)}
    
    Provide:
    1. Performance optimization suggestions
    2. Resource utilization improvements
    3. Error handling enhancements
    4. Scalability recommendations
    5. Cost optimization strategies
    """
    
    suggestions = await ai_service.generate_content(optimization_prompt)
    return {"suggestions": suggestions} 