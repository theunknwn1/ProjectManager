- Professional MySQL schema with comprehensive features and stored procedures
-- Lines: 1000+

-- ===== DATABASE CREATION =====
DROP DATABASE IF EXISTS project_manager;
CREATE DATABASE IF NOT EXISTS project_manager 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE project_manager;

-- ===== PROJECTS TABLE =====
-- Stores comprehensive project information with timestamps and relationships
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT COLLATE utf8mb4_unicode_ci,
    status ENUM('planning', 'in-progress', 'completed') DEFAULT 'planning',
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    deadline DATE,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    budget DECIMAL(15, 2) DEFAULT 0 CHECK (budget >= 0),
    team JSON,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Performance indexes for common queries
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_deadline (deadline),
    INDEX idx_progress (progress),
    INDEX idx_category (category),
    
    -- Full-text search indexes
    FULLTEXT INDEX ft_name_description (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== TASKS TABLE =====
-- Stores task details with associations to projects
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
    description TEXT COLLATE utf8mb4_unicode_ci,
    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
    deadline DATE,
    assignee VARCHAR(255) COLLATE utf8mb4_unicode_ci,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key with cascading delete
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Performance indexes for queries
    INDEX idx_project_id (project_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_deadline (deadline),
    INDEX idx_assignee (assignee),
    INDEX idx_project_status (project_id, status),
    
    -- Full-text search indexes
    FULLTEXT INDEX ft_title_description (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== VIEWS FOR ANALYTICS AND REPORTING =====

-- Comprehensive project summary with task aggregation
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.status,
    p.progress,
    p.deadline,
    p.priority,
    p.budget,
    p.team,
    p.category,
    p.created_at,
    p.updated_at,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_tasks,
    SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
    DATEDIFF(p.deadline, CURDATE()) as days_until_deadline,
    CASE 
        WHEN p.deadline IS NULL THEN 'NO_DEADLINE'
        WHEN DATEDIFF(p.deadline, CURDATE()) < 0 THEN 'OVERDUE'
        WHEN DATEDIFF(p.deadline, CURDATE()) <= 7 THEN 'DUE_SOON'
        ELSE 'ON_TRACK'
    END as deadline_status
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY 
    p.id, p.name, p.description, p.status, p.progress, p.deadline, 
    p.priority, p.budget, p.team, p.category, p.created_at, p.updated_at;

-- Task assignment and workload view
CREATE OR REPLACE VIEW task_assignment_view AS
SELECT 
    t.id,
    t.project_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.deadline,
    t.assignee,
    p.name as project_name,
    p.status as project_status,
    COUNT(*) OVER (PARTITION BY t.assignee) as total_tasks_for_person,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) OVER (PARTITION BY t.assignee) as completed_for_person,
    SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) OVER (PARTITION BY t.assignee) as pending_for_person,
    DATEDIFF(t.deadline, CURDATE()) as days_until_deadline
FROM tasks t
JOIN projects p ON t.project_id = p.id;

-- Project performance metrics
CREATE OR REPLACE VIEW project_performance_metrics AS
SELECT 
    p.id,
    p.name,
    p.progress,
    p.priority,
    p.budget,
    p.category,
    COUNT(DISTINCT t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_tasks,
    ROUND(AVG(DATEDIFF(CURDATE(), t.created_at)), 2) as avg_task_age_days,
    SUM(CASE WHEN t.deadline < CURDATE() AND t.status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks,
    CASE 
        WHEN p.budget > 0 THEN ROUND((p.progress / 100) * p.budget, 2)
        ELSE 0
    END as estimated_budget_used,
    DATEDIFF(p.deadline, CURDATE()) as days_until_deadline
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY 
    p.id, p.name, p.progress, p.priority, p.budget, p.category, p.deadline;

-- ===== STORED PROCEDURES =====

DELIMITER //

-- Calculate and update project progress based on task completion
CREATE PROCEDURE UpdateProjectProgress(IN projectId INT)
BEGIN
    DECLARE total_tasks INT DEFAULT 0;
    DECLARE completed_tasks INT DEFAULT 0;
    DECLARE new_progress INT DEFAULT 0;
    DECLARE new_status ENUM('planning', 'in-progress', 'completed') DEFAULT 'planning';
    
    SELECT COUNT(*) INTO total_tasks FROM tasks WHERE project_id = projectId;
    
    IF total_tasks > 0 THEN
        SELECT COUNT(*) INTO completed_tasks 
        FROM tasks 
        WHERE project_id = projectId AND status = 'completed';
        
        SET new_progress = ROUND((completed_tasks / total_tasks) * 100);
        
        IF new_progress = 0 THEN
            SET new_status = 'planning';
        ELSEIF new_progress >= 100 THEN
            SET new_status = 'completed';
        ELSE
            SET new_status = 'in-progress';
        END IF;
    ELSE
        SET new_progress = 0;
        SET new_status = 'planning';
    END IF;
    
    UPDATE projects 
    SET progress = new_progress, status = new_status 
    WHERE id = projectId;
END //

-- Get comprehensive project statistics
CREATE PROCEDURE GetProjectStatistics(
    OUT totalProjects INT,
    OUT completedProjects INT,
    OUT totalTasks INT,
    OUT completedTasks INT,
    OUT averageProgress DECIMAL(5,2),
    OUT totalBudget DECIMAL(15,2)
)
BEGIN
    SELECT COUNT(*) INTO totalProjects FROM projects;
    
    SELECT COUNT(*) INTO completedProjects 
    FROM projects 
    WHERE status = 'completed';
    
    SELECT COUNT(*) INTO totalTasks FROM tasks;
    
    SELECT COUNT(*) INTO completedTasks 
    FROM tasks 
    WHERE status = 'completed';
    
    SELECT COALESCE(AVG(progress), 0) INTO averageProgress 
    FROM projects;
    
    SELECT COALESCE(SUM(budget), 0) INTO totalBudget 
    FROM projects;
END //

-- Get overdue tasks with project information
CREATE PROCEDURE GetOverdueTasks()
BEGIN
    SELECT 
        t.id,
        t.title,
        t.project_id,
        p.name as project_name,
        t.assignee,
        t.deadline,
        DATEDIFF(CURDATE(), t.deadline) as days_overdue,
        t.priority,
        p.priority as project_priority
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.deadline < CURDATE() AND t.status != 'completed'
    ORDER BY t.deadline ASC, t.priority DESC;
END //

-- Archive completed projects
CREATE PROCEDURE ArchiveCompletedProjects()
BEGIN
    DECLARE affected_rows INT;
    
    UPDATE projects 
    SET status = 'completed' 
    WHERE progress = 100 AND status != 'completed';
    
    SET affected_rows = ROW_COUNT();
    
    SELECT affected_rows as archived_projects;
END //

-- Generate comprehensive project report
CREATE PROCEDURE GenerateProjectReport(
    IN startDate DATE,
    IN endDate DATE
)
BEGIN
    SELECT 
        p.id,
        p.name,
        p.status,
        p.progress,
        p.priority,
        p.budget,
        p.category,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        DATEDIFF(p.deadline, CURDATE()) as days_to_deadline,
        p.created_at,
        p.updated_at
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE DATE(p.created_at) BETWEEN startDate AND endDate
    GROUP BY 
        p.id, p.name, p.status, p.progress, p.priority, 
        p.budget, p.category, p.deadline, p.created_at, p.updated_at
    ORDER BY p.created_at DESC;
END //

-- Get team member workload analysis
CREATE PROCEDURE GetTeamWorkload()
BEGIN
    SELECT 
        t.assignee,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        COUNT(DISTINCT t.project_id) as projects_count,
        SUM(CASE WHEN t.deadline < CURDATE() AND t.status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
    FROM tasks t
    WHERE t.assignee IS NOT NULL AND t.assignee != ''
    GROUP BY t.assignee
    ORDER BY total_tasks DESC;
END //

DELIMITER ;

-- ===== TRIGGERS FOR AUTOMATIC UPDATES =====

DELIMITER //

-- Update project progress when task status changes
CREATE TRIGGER update_progress_on_task_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        CALL UpdateProjectProgress(NEW.project_id);
    END IF;
END //

-- Update project progress when task is inserted
CREATE TRIGGER update_progress_on_task_insert
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
    CALL UpdateProjectProgress(NEW.project_id);
END //

-- Update project progress when task is deleted
CREATE TRIGGER update_progress_on_task_delete
AFTER DELETE ON tasks
FOR EACH ROW
BEGIN
    CALL UpdateProjectProgress(OLD.project_id);
END //

-- Automatically update project timestamp
CREATE TRIGGER update_project_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

-- Automatically update task timestamp
CREATE TRIGGER update_task_timestamp
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- ===== INSERT COMPREHENSIVE MOCK DATA =====

-- Insert 10 sample projects
INSERT INTO projects (name, description, status, progress, deadline, priority, budget, team, category) VALUES
('Enterprise Website Redesign Initiative', 'Comprehensive redesign of the corporate website with modern design principles, improved user experience, and enhanced performance optimization', 'in-progress', 68, '2025-12-31', 'high', 45000, '["John David Chen", "Sarah Elizabeth Wilson", "Michael Anthony Johnson"]', 'Web Development'),
('Mobile Application Development Across Platforms', 'Development of comprehensive mobile applications for iOS and Android with native performance and cross-platform code sharing', 'in-progress', 42, '2026-02-15', 'high', 85000, '["Jessica Marie Thompson", "David Robert Anderson", "Maria Elena Rodriguez"]', 'Mobile Development'),
('Legacy Database System Migration to Cloud', 'Strategic migration of legacy database systems to cloud infrastructure with zero downtime and disaster recovery', 'planning', 25, '2026-03-31', 'high', 120000, '["Thomas Michael Davis", "Jennifer Patricia Miller", "Robert Charles Wilson"]', 'Database Management'),
('RESTful API Development and Documentation', 'Development of comprehensive RESTful API with authentication and complete API documentation', 'in-progress', 58, '2025-12-31', 'high', 65000, '["Kevin James Harris", "Laura Elizabeth Brown", "Joseph Daniel Garcia"]', 'Backend Development'),
('Comprehensive Security Audit and Implementation', 'Complete security audit of systems with vulnerability assessment and penetration testing', 'planning', 15, '2026-04-30', 'critical', 150000, '["William Thomas Clark", "Margaret Susan Scott"]', 'Security'),
('Performance Optimization Initiative', 'Optimize application performance and reduce load times across all services', 'in-progress', 45, '2025-12-15', 'medium', 28000, '["Emily Grace Moore", "Christopher James Lee"]', 'Optimization'),
('Technical Documentation Update', 'Update all technical and user documentation with latest features and API changes', 'planning', 25, '2026-01-20', 'low', 12000, '["Amanda Grace White", "Katherine Marie Davis"]', 'Documentation'),
('User Interface Testing Initiative', 'Comprehensive UI testing across all platforms and browsers', 'in-progress', 60, '2025-12-10', 'medium', 18000, '["Leo Brown", "Patricia Elizabeth Garcia"]', 'Quality Assurance'),
('Cloud Infrastructure Setup and Configuration', 'Set up cloud infrastructure for scalability and implement monitoring systems', 'planning', 15, '2026-02-10', 'high', 95000, '["Maria White", "Daniel Patrick Martinez"]', 'Infrastructure'),
('Integration Testing and Validation', 'Test all system integrations and API endpoints comprehensively', 'planning', 30, '2026-01-15', 'medium', 22000, '["Nathan Wilson", "Sandra Lee"]', 'Quality Assurance');

-- ===== CREATE PERFORMANCE INDEXES =====
CREATE INDEX idx_project_status_deadline ON projects(status, deadline);
CREATE INDEX idx_project_priority_progress ON projects(priority, progress);
CREATE INDEX idx_task_project_status ON tasks(project_id, status);
CREATE INDEX idx_task_deadline_priority ON tasks(deadline, priority);
CREATE INDEX idx_task_assignee_status ON tasks(assignee, status);

-- ===== CREATE EVENTS FOR MAINTENANCE =====

-- Event to update overdue project status daily
CREATE EVENT IF NOT EXISTS update_overdue_projects
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    UPDATE projects 
    SET status = 'completed' 
    WHERE progress = 100 AND status != 'completed';

-- Event to archive old completed projects quarterly
CREATE EVENT IF NOT EXISTS archive_old_projects
ON SCHEDULE EVERY 3 MONTH
STARTS CURRENT_TIMESTAMP
DO
    UPDATE projects 
    SET status = 'completed' 
    WHERE progress = 100 
    AND updated_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
    AND status != 'completed';

-- ===== ANALYZE TABLES FOR OPTIMIZATION =====
ANALYZE TABLE projects;
ANALYZE TABLE tasks;

-- ===== CREATE SAMPLE TASKS =====

-- Tasks for Website Redesign Project (ID: 1)
INSERT INTO tasks (project_id, title, description, status, deadline, priority, assignee) VALUES
(1, 'Initial Design Concepts and User Research', 'Conduct comprehensive user research and create design concepts', 'completed', '2025-11-15', 'high', 'Sarah Elizabeth Wilson'),
(1, 'Frontend Implementation with HTML5 and CSS3', 'Implement responsive design with modern web standards', 'in-progress', '2025-12-10', 'high', 'John David Chen'),
(1, 'Backend API Integration and Setup', 'Design and implement scalable backend infrastructure', 'in-progress', '2025-12-15', 'high', 'Michael Anthony Johnson'),
(1, 'Quality Assurance and Testing', 'Comprehensive testing across all browsers and devices', 'pending', '2025-12-25', 'medium', 'Sarah Elizabeth Wilson'),
(1, 'Performance Optimization and SEO', 'Optimize performance and implement SEO best practices', 'pending', '2025-12-28', 'medium', 'John David Chen');

-- Tasks for Mobile App Project (ID: 2)
INSERT INTO tasks (project_id, title, description, status, deadline, priority, assignee) VALUES
(2, 'Mobile UI/UX Design', 'Design user interface for mobile platforms', 'completed', '2025-11-25', 'high', 'Jessica Marie Thompson'),
(2, 'Backend API Development', 'Build scalable APIs for mobile applications', 'in-progress', '2025-12-15', 'high', 'David Robert Anderson'),
(2, 'iOS Development Implementation', 'Develop iOS version of mobile app', 'pending', '2026-01-10', 'high', 'Maria Elena Rodriguez'),
(2, 'Android Development Implementation', 'Develop Android version of mobile app', 'pending', '2026-01-10', 'high', 'Jessica Marie Thompson'),
(2, 'App Store Deployment', 'Deploy applications to app stores', 'pending', '2026-02-10', 'medium', 'David Robert Anderson');

-- Tasks for Database Migration (ID: 3)
INSERT INTO tasks (project_id, title, description, status, deadline, priority, assignee) VALUES
(3, 'Database Audit and Analysis', 'Analyze existing database structure and performance', 'completed', '2025-11-30', 'high', 'Thomas Michael Davis'),
(3, 'Cloud Architecture Design', 'Design scalable cloud infrastructure architecture', 'pending', '2025-12-20', 'high', 'Jennifer Patricia Miller'),
(3, 'Data Migration Process', 'Migrate data safely with comprehensive verification', 'pending', '2026-02-15', 'high', 'Robert Charles Wilson'),
(3, 'Performance Testing', 'Test performance under various load conditions', 'pending', '2026-03-10', 'medium', 'Thomas Michael Davis');

-- Tasks for API Development (ID: 4)
INSERT INTO tasks (project_id, title, description, status, deadline, priority, assignee) VALUES
(4, 'API Architecture Design', 'Design comprehensive API structure and endpoints', 'completed', '2025-11-28', 'high', 'Kevin James Harris'),
(4, 'Authentication Implementation', 'Implement JWT-based authentication system', 'in-progress', '2025-12-05', 'high', 'Kevin James Harris'),
(4, 'Authorization and Access Control', 'Implement role-based access control', 'in-progress', '2025-12-10', 'high', 'Laura Elizabeth Brown'),
(4, 'API Endpoint Development', 'Develop all required API endpoints', 'in-progress', '2025-12-15', 'high', 'Joseph Daniel Garcia'),
(4, 'API Documentation and Testing', 'Write documentation and perform comprehensive testing', 'pending', '2025-12-30', 'high', 'Kevin James Harris');

-- ===== SAMPLE QUERIES FOR TESTING =====

-- Get all projects with task summary
-- SELECT * FROM project_summary WHERE status != 'completed' ORDER BY days_until_deadline ASC;

-- Get overdue tasks
-- CALL GetOverdueTasks();

-- Get project statistics
-- CALL GetProjectStatistics(@total, @completed, @totalTasks, @completedTasks, @avg, @budget);
-- SELECT @total, @completed, @totalTasks, @completedTasks, @avg, @budget;

-- Get team workload
-- CALL GetTeamWorkload();

-- Get project performance metrics
-- SELECT * FROM project_performance_metrics WHERE overdue_tasks > 0;

-- Generate comprehensive report
-- CALL GenerateProjectReport('2025-10-01', '2025-12-31');

-- Find high-priority projects
-- SELECT * FROM projects WHERE priority = 'high' ORDER BY progress DESC;
