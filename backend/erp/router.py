from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database.database import get_db
from ..database.models import User, Task
from ..services.auth_service import AuthService, get_current_active_user
from ..services.ai_service import AIService
from pydantic import BaseModel

router = APIRouter()
auth_service = AuthService()
ai_service = AIService()

# Pydantic models for request/response
class TaskCreate(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: str
    assigned_to: Optional[int]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Task Management Endpoints
@router.post("/tasks/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new task."""
    if not auth_service.check_permissions(current_user, "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        assigned_to=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/tasks/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of tasks."""
    tasks = db.query(Task).offset(skip).limit(limit).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a task."""
    if not auth_service.check_permissions(current_user, "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a task."""
    if not auth_service.check_permissions(current_user, "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

# AI-Powered Analytics Endpoints
@router.get("/analytics/task-insights")
async def get_task_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights about tasks and productivity."""
    if not auth_service.check_permissions(current_user, "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get task data for analysis
    tasks = db.query(Task).all()
    task_data = [
        {
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "priority": task.priority,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }
        for task in tasks
    ]
    
    # Generate insights using AI
    insights = await ai_service.analyze_customer_feedback(task_data)
    return insights

@router.get("/analytics/workload-optimization")
async def get_workload_optimization(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered workload optimization suggestions."""
    if not auth_service.check_permissions(current_user, "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get user workload data
    user_tasks = db.query(Task).filter(Task.assigned_to == current_user.id).all()
    workload_data = {
        "user_id": current_user.id,
        "total_tasks": len(user_tasks),
        "tasks_by_priority": {
            "high": len([t for t in user_tasks if t.priority == "high"]),
            "medium": len([t for t in user_tasks if t.priority == "medium"]),
            "low": len([t for t in user_tasks if t.priority == "low"])
        },
        "tasks_by_status": {
            "pending": len([t for t in user_tasks if t.status == "pending"]),
            "in_progress": len([t for t in user_tasks if t.status == "in_progress"]),
            "completed": len([t for t in user_tasks if t.status == "completed"])
        }
    }
    
    # Generate optimization suggestions using AI
    suggestions = await ai_service.generate_workflow_actions(workload_data)
    return suggestions 