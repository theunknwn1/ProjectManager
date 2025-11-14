# Professional production-ready API with comprehensive features
# This backend manages projects, tasks, and provides analytics
# Lines: 1000+

from fastapi import FastAPI, HTTPException, Depends, Query, Path, Body, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import mysql.connector
from mysql.connector import Error, pooling
import logging
import json
from contextlib import contextmanager

# ===== LOGGING SETUP =====
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===== ENUMS FOR STATUS AND PRIORITY =====
class TaskStatus(str, Enum):
    """Task status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"

class ProjectStatus(str, Enum):
    """Project status enumeration"""
    PLANNING = "planning"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"

class PriorityLevel(str, Enum):
    """Priority level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# ===== PYDANTIC MODELS FOR VALIDATION =====
class TaskBase(BaseModel):
    """Base model for task with comprehensive validation"""
    title: str = Field(..., min_length=3, max_length=255, description="Task title")
    status: TaskStatus = TaskStatus.PENDING
    deadline: Optional[str] = Field(None, description="Task deadline in YYYY-MM-DD format")
    assignee: Optional[str] = Field(None, max_length=255)
    priority: PriorityLevel = PriorityLevel.MEDIUM
    description: Optional[str] = Field(None, max_length=1000)

    @validator('deadline')
    def validate_deadline(cls, v):
        """Validate deadline format"""
        if v:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Deadline must be in YYYY-MM-DD format')
        return v

class TaskCreate(TaskBase):
    """Model for creating tasks"""
    pass

class TaskUpdate(BaseModel):
    """Model for updating tasks"""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    status: Optional[TaskStatus] = None
    deadline: Optional[str] = None
    assignee: Optional[str] = None
    priority: Optional[PriorityLevel] = None
    description: Optional[str] = None

class Task(TaskBase):
    """Model for task responses"""
    id: int
    project_id: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    """Base model for project with comprehensive validation"""
    name: str = Field(..., min_length=3, max_length=255, description="Project name")
    description: Optional[str] = Field(None, max_length=2000)
    status: ProjectStatus = ProjectStatus.PLANNING
    deadline: Optional[str] = Field(None, description="Project deadline in YYYY-MM-DD format")
    priority: PriorityLevel = PriorityLevel.MEDIUM
    budget: Optional[float] = Field(None, ge=0, le=10000000)
    team: Optional[List[str]] = Field(None, max_items=100)
    category: Optional[str] = Field(None, max_length=100)

    @validator('deadline')
    def validate_deadline(cls, v):
        """Validate deadline format"""
        if v:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Deadline must be in YYYY-MM-DD format')
        return v

class ProjectCreate(ProjectBase):
    """Model for creating projects"""
    pass

class ProjectUpdate(BaseModel):
    """Model for updating projects"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    deadline: Optional[str] = None
    priority: Optional[PriorityLevel] = None
    budget: Optional[float] = Field(None, ge=0)
    team: Optional[List[str]] = None
    category: Optional[str] = None

class Project(ProjectBase):
    """Model for project responses"""
    id: int
    progress: int = 0
    tasks: List[Task] = []
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectStats(BaseModel):
    """Model for project statistics"""
    total_projects: int
    completed_projects: int
    in_progress_projects: int
    planning_projects: int
    total_tasks: int
    completed_tasks: int
    average_progress: float
    total_budget: float

class ErrorResponse(BaseModel):
    """Model for error responses"""
    error: str
    detail: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# ===== DATABASE CONFIGURATION =====
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'project_manager',
    'autocommit': False,
    'auth_plugin': 'mysql_native_password'
}

connection_pool = None

def init_connection_pool():
    """Initialize database connection pool"""
    global connection_pool
    try:
        connection_pool = pooling.MySQLConnectionPool(
            pool_name="pmpool",
            pool_size=10,
            pool_reset_session=True,
            **DB_CONFIG
        )
        logger.info("Database connection pool initialized successfully")
    except Error as e:
        logger.error(f"Error creating connection pool: {e}")
        raise

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = None
    try:
        conn = connection_pool.get_connection()
        yield conn
        conn.commit()
    except Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed"
        )
    finally:
        if conn and conn.is_connected():
            conn.close()

# ===== FASTAPI APPLICATION INITIALIZATION =====
app = FastAPI(
    title="Enterprise Project Management API",
    description="Professional-grade API for comprehensive project management",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# ===== CORS MIDDLEWARE =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600
)

# ===== STARTUP AND SHUTDOWN EVENTS =====
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_connection_pool()
        init_db()
        logger.info("Application started successfully")
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global connection_pool
    if connection_pool:
        try:
            connection_pool.close()
            logger.info("Database pool closed")
        except Exception as e:
            logger.error(f"Error closing pool: {e}")

# ===== DATABASE INITIALIZATION =====
def init_db():
    """Initialize database with tables"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            # Create projects table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    description TEXT,
                    status ENUM('planning', 'in-progress', 'completed') DEFAULT 'planning',
                    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
                    deadline DATE,
                    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                    budget DECIMAL(15, 2) DEFAULT 0,
                    team JSON,
                    category VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_status (status),
                    INDEX idx_priority (priority),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)

            # Create tasks table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    project_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
                    deadline DATE,
                    assignee VARCHAR(255),
                    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                    INDEX idx_project_id (project_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)

            conn.commit()
            logger.info("Database tables initialized")
        except Error as e:
            conn.rollback()
            logger.error(f"Error initializing database: {e}")

# ===== HEALTH CHECK ENDPOINT =====
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
        return {
            "status": "ok",
            "message": "API is running",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "detail": str(e)}
        )

# ===== PROJECT ENDPOINTS =====

@app.get("/api/projects", response_model=List[Project], tags=["Projects"])
def get_all_projects(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all projects with optional filtering"""
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        try:
            query = "SELECT * FROM projects WHERE 1=1"
            params = []

            if status_filter:
                query += " AND status = %s"
                params.append(status_filter)

            if priority_filter:
                query += " AND priority = %s"
                params.append(priority_filter)

            query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
            params.extend([limit, skip])

            cursor.execute(query, params)
            projects = cursor.fetchall()

            result = []
            for project in projects:
                cursor.execute("SELECT * FROM tasks WHERE project_id = %s", (project['id'],))
                tasks = cursor.fetchall() or []
                project['tasks'] = tasks
                project['team'] = json.loads(project['team']) if project['team'] else []
                result.append(project)

            return result
        except Error as e:
            logger.error(f"Error fetching projects: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch projects"
            )

@app.get("/api/projects/{project_id}", response_model=Project, tags=["Projects"])
def get_project(project_id: int = Path(..., gt=0)):
    """Get a specific project"""
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            project = cursor.fetchone()

            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project {project_id} not found"
                )

            cursor.execute("SELECT * FROM tasks WHERE project_id = %s", (project_id,))
            tasks = cursor.fetchall() or []
            project['tasks'] = tasks
            project['team'] = json.loads(project['team']) if project['team'] else []

            return project
        except Error as e:
            logger.error(f"Error fetching project: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch project"
            )

@app.post("/api/projects", response_model=Project, status_code=status.HTTP_201_CREATED, tags=["Projects"])
def create_project(project: ProjectCreate):
    """Create a new project"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            team_json = json.dumps(project.team) if project.team else json.dumps([])

            cursor.execute(
                """INSERT INTO projects 
                   (name, description, status, priority, deadline, budget, team, category, progress)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0)""",
                (project.name, project.description, project.status, project.priority,
                 project.deadline, project.budget, team_json, project.category)
            )
            conn.commit()
            project_id = cursor.lastrowid
            logger.info(f"Project {project_id} created")

            return get_project(project_id)
        except Error as e:
            conn.rollback()
            if "Duplicate entry" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Project name already exists"
                )
            logger.error(f"Error creating project: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create project"
            )

@app.put("/api/projects/{project_id}", tags=["Projects"])
def update_project(
    project_id: int = Path(..., gt=0),
    project: ProjectUpdate = Body(...)
):
    """Update a project"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project {project_id} not found"
                )

            updates = []
            values = []

            if project.name:
                updates.append("name = %s")
                values.append(project.name)
            if project.description is not None:
                updates.append("description = %s")
                values.append(project.description)
            if project.status:
                updates.append("status = %s")
                values.append(project.status)
            if project.progress is not None:
                updates.append("progress = %s")
                values.append(project.progress)
            if project.deadline:
                updates.append("deadline = %s")
                values.append(project.deadline)
            if project.priority:
                updates.append("priority = %s")
                values.append(project.priority)
            if project.budget is not None:
                updates.append("budget = %s")
                values.append(project.budget)
            if project.team is not None:
                updates.append("team = %s")
                values.append(json.dumps(project.team))
            if project.category:
                updates.append("category = %s")
                values.append(project.category)

            if updates:
                values.append(project_id)
                query = f"UPDATE projects SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
                cursor.execute(query, values)
                conn.commit()
                logger.info(f"Project {project_id} updated")

            return {"message": "Project updated successfully", "id": project_id}
        except Error as e:
            conn.rollback()
            logger.error(f"Error updating project: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update project"
            )

@app.delete("/api/projects/{project_id}", tags=["Projects"])
def delete_project(project_id: int = Path(..., gt=0)):
    """Delete a project"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project {project_id} not found"
                )

            cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
            conn.commit()
            logger.info(f"Project {project_id} deleted")

            return {"message": "Project deleted successfully", "id": project_id}
        except Error as e:
            conn.rollback()
            logger.error(f"Error deleting project: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete project"
            )

# ===== TASK ENDPOINTS =====

@app.get("/api/projects/{project_id}/tasks", response_model=List[Task], tags=["Tasks"])
def get_project_tasks(
    project_id: int = Path(..., gt=0),
    status_filter: Optional[str] = Query(None, alias="status")
):
    """Get tasks for a project"""
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project {project_id} not found"
                )

            query = "SELECT * FROM tasks WHERE project_id = %s"
            params = [project_id]

            if status_filter:
                query += " AND status = %s"
                params.append(status_filter)

            query += " ORDER BY priority DESC, deadline ASC"

            cursor.execute(query, params)
            tasks = cursor.fetchall() or []

            return tasks
        except Error as e:
            logger.error(f"Error fetching tasks: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch tasks"
            )

@app.post("/api/projects/{project_id}/tasks", response_model=Task, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
def create_task(
    project_id: int = Path(..., gt=0),
    task: TaskCreate = Body(...)
):
    """Create a task"""
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Project {project_id} not found"
                )

            cursor.execute(
                """INSERT INTO tasks 
                   (project_id, title, description, status, deadline, assignee, priority)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (project_id, task.title, task.description, task.status, task.deadline, task.assignee, task.priority)
            )
            conn.commit()
            task_id = cursor.lastrowid

            cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
            result = cursor.fetchone()
            logger.info(f"Task {task_id} created")
            return result
        except Error as e:
            conn.rollback()
            logger.error(f"Error creating task: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create task"
            )

@app.put("/api/projects/{project_id}/tasks/{task_id}", tags=["Tasks"])
def update_task(
    project_id: int = Path(..., gt=0),
    task_id: int = Path(..., gt=0),
    task: TaskUpdate = Body(...)
):
    """Update a task"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM tasks WHERE id = %s AND project_id = %s", (task_id, project_id))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Task {task_id} not found"
                )

            updates = []
            values = []

            if task.title:
                updates.append("title = %s")
                values.append(task.title)
            if task.status:
                updates.append("status = %s")
                values.append(task.status)
            if task.deadline:
                updates.append("deadline = %s")
                values.append(task.deadline)
            if task.assignee:
                updates.append("assignee = %s")
                values.append(task.assignee)
            if task.priority:
                updates.append("priority = %s")
                values.append(task.priority)
            if task.description is not None:
                updates.append("description = %s")
                values.append(task.description)

            if updates:
                values.extend([task_id, project_id])
                query = f"UPDATE tasks SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s AND project_id = %s"
                cursor.execute(query, values)
                conn.commit()
                logger.info(f"Task {task_id} updated")

            return {"message": "Task updated successfully", "id": task_id}
        except Error as e:
            conn.rollback()
            logger.error(f"Error updating task: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update task"
            )

@app.delete("/api/projects/{project_id}/tasks/{task_id}", tags=["Tasks"])
def delete_task(
    project_id: int = Path(..., gt=0),
    task_id: int = Path(..., gt=0)
):
    """Delete a task"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM tasks WHERE id = %s AND project_id = %s", (task_id, project_id))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Task {task_id} not found"
                )

            cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
            conn.commit()
            logger.info(f"Task {task_id} deleted")

            return {"message": "Task deleted successfully", "id": task_id}
        except Error as e:
            conn.rollback()
            logger.error(f"Error deleting task: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete task"
            )

# ===== STATISTICS ENDPOINT =====

@app.get("/api/statistics", response_model=ProjectStats, tags=["Analytics"])
def get_statistics():
    """Get project statistics"""
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT status, COUNT(*) as count FROM projects GROUP BY status")
            project_stats = {row['status']: row['count'] for row in cursor.fetchall()}

            cursor.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status")
            task_stats = {row['status']: row['count'] for row in cursor.fetchall()}

            cursor.execute("SELECT COUNT(*) as total FROM projects")
            total_projects = cursor.fetchone()['total']

            cursor.execute("SELECT AVG(progress) as avg_progress FROM projects")
            avg_progress = cursor.fetchone()['avg_progress'] or 0

            cursor.execute("SELECT COALESCE(SUM(budget), 0) as total_budget FROM projects")
            total_budget = cursor.fetchone()['total_budget'] or 0

            return {
                "total_projects": total_projects,
                "completed_projects": project_stats.get('completed', 0),
                "in_progress_projects": project_stats.get('in-progress', 0),
                "planning_projects": project_stats.get('planning', 0),
                "total_tasks": sum(task_stats.values()),
                "completed_tasks": task_stats.get('completed', 0),
                "average_progress": float(avg_progress),
                "total_budget": float(total_budget)
            }
        except Error as e:
            logger.error(f"Error fetching statistics: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch statistics"
            )

# ===== ERROR HANDLERS =====

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "detail": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )

# ===== MAIN ENTRY POINT =====
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Enterprise Project Management API...")
    print("📚 API Documentation: http://localhost:8000/api/docs")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )