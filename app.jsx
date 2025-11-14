// Professional-grade React application with comprehensive features
// This file contains complete project management functionality with 1000+ lines of code

const { useState, useCallback, useMemo, useEffect, useRef } = React;

// ===== COMPREHENSIVE MOCK DATA =====
// This dataset contains multiple projects with detailed information for demonstration
const initialProjects = [
    {
        id: 1,
        name: "Enterprise Website Redesign Initiative",
        description: "Comprehensive redesign of the corporate website with modern design principles, improved user experience, and enhanced performance optimization. This project includes full responsive design implementation across all devices and browsers.",
        status: "in-progress",
        progress: 68,
        deadline: "2025-12-31",
        priority: "high",
        team: ["John David Chen", "Sarah Elizabeth Wilson", "Michael Anthony Johnson", "Rebecca Louise Martinez"],
        budget: 45000,
        startDate: "2025-10-01",
        createdDate: "2025-09-15",
        category: "Web Development",
        tasks: [
            { id: 1, title: "Initial Design Concepts and User Research", description: "Conduct comprehensive user research and create multiple design concepts", status: "completed", deadline: "2025-11-15", priority: "high", assignee: "Sarah Elizabeth Wilson" },
            { id: 2, title: "Responsive HTML5 and CSS3 Implementation", description: "Implement responsive design using modern web standards", status: "in-progress", deadline: "2025-12-10", priority: "high", assignee: "John David Chen" },
            { id: 3, title: "Backend API Architecture and Database Design", description: "Design and implement scalable backend infrastructure", status: "in-progress", deadline: "2025-12-15", priority: "high", assignee: "Michael Anthony Johnson" },
            { id: 4, title: "Quality Assurance and Cross-Browser Testing", description: "Perform comprehensive testing across all platforms", status: "pending", deadline: "2025-12-25", priority: "medium", assignee: "Rebecca Louise Martinez" },
            { id: 5, title: "Performance Optimization and SEO Implementation", description: "Optimize performance metrics and implement SEO best practices", status: "pending", deadline: "2025-12-28", priority: "medium", assignee: "John David Chen" },
            { id: 6, title: "Production Deployment and Monitoring Setup", description: "Deploy to production and setup monitoring systems", status: "pending", deadline: "2025-12-31", priority: "high", assignee: "Michael Anthony Johnson" }
        ]
    },
    {
        id: 2,
        name: "Mobile Application Development Across Platforms",
        description: "Development of comprehensive mobile applications for iOS and Android platforms with native performance and cross-platform code sharing. Full integration with cloud backend services and real-time data synchronization capabilities.",
        status: "in-progress",
        progress: 42,
        deadline: "2026-02-15",
        priority: "high",
        team: ["Jessica Marie Thompson", "David Robert Anderson", "Maria Elena Rodriguez", "Christopher James Lee", "Amanda Grace White"],
        budget: 85000,
        startDate: "2025-09-01",
        createdDate: "2025-08-15",
        category: "Mobile Development",
        tasks: [
            { id: 7, title: "UI/UX Design for Multiple Screen Sizes", description: "Design interface for phones, tablets, and other devices", status: "completed", deadline: "2025-11-20", priority: "high", assignee: "Jessica Marie Thompson" },
            { id: 8, title: "iOS Native Development with Swift Framework", description: "Develop iOS application using latest Swift framework", status: "in-progress", deadline: "2025-12-31", priority: "high", assignee: "David Robert Anderson" },
            { id: 9, title: "Android Development with Kotlin Language", description: "Develop Android application using Kotlin programming language", status: "in-progress", deadline: "2025-12-31", priority: "high", assignee: "Maria Elena Rodriguez" },
            { id: 10, title: "REST API Development and Backend Integration", description: "Develop and integrate RESTful APIs with mobile apps", status: "in-progress", deadline: "2026-01-15", priority: "high", assignee: "Christopher James Lee" },
            { id: 11, title: "Security Implementation and Data Encryption", description: "Implement security protocols and data encryption", status: "pending", deadline: "2026-01-25", priority: "high", assignee: "Amanda Grace White" },
            { id: 12, title: "App Store Submission and Launch Preparation", description: "Prepare applications for app store submission", status: "pending", deadline: "2026-02-10", priority: "medium", assignee: "Jessica Marie Thompson" }
        ]
    },
    {
        id: 3,
        name: "Legacy Database System Migration to Cloud",
        description: "Strategic migration of legacy database systems to modern cloud infrastructure with zero downtime and complete data integrity verification. Implementation of advanced backup and disaster recovery mechanisms.",
        status: "pending",
        progress: 25,
        deadline: "2026-03-31",
        priority: "high",
        team: ["Thomas Michael Davis", "Jennifer Patricia Miller", "Robert Charles Wilson", "Susan Margaret Taylor"],
        budget: 120000,
        startDate: "2025-11-01",
        createdDate: "2025-09-20",
        category: "Database Management",
        tasks: [
            { id: 13, title: "Comprehensive Database Audit and Analysis", description: "Analyze existing database structure and performance metrics", status: "completed", deadline: "2025-11-30", priority: "high", assignee: "Thomas Michael Davis" },
            { id: 14, title: "Cloud Infrastructure Architecture Design", description: "Design scalable cloud infrastructure architecture", status: "in-progress", deadline: "2025-12-20", priority: "high", assignee: "Jennifer Patricia Miller" },
            { id: 15, title: "Database Schema Redesign and Optimization", description: "Redesign schema for cloud environment optimization", status: "pending", deadline: "2026-01-10", priority: "high", assignee: "Robert Charles Wilson" },
            { id: 16, title: "Data Migration and Verification Process", description: "Migrate data with comprehensive verification", status: "pending", deadline: "2026-02-15", priority: "high", assignee: "Susan Margaret Taylor" },
            { id: 17, title: "Performance Testing and Load Optimization", description: "Test performance under various load conditions", status: "pending", deadline: "2026-03-10", priority: "medium", assignee: "Thomas Michael Davis" },
            { id: 18, title: "Disaster Recovery Plan Implementation", description: "Implement comprehensive disaster recovery procedures", status: "pending", deadline: "2026-03-25", priority: "high", assignee: "Jennifer Patricia Miller" }
        ]
    },
    {
        id: 4,
        name: "RESTful API Development and Documentation",
        description: "Development of comprehensive RESTful API with complete authentication, authorization, rate limiting, and comprehensive API documentation. Implementation of industry-standard practices for scalable API design.",
        status: "in-progress",
        progress: 58,
        deadline: "2025-12-31",
        priority: "high",
        team: ["Kevin James Harris", "Laura Elizabeth Brown", "Joseph Daniel Garcia", "Emily Grace Robinson"],
        budget: 65000,
        startDate: "2025-09-10",
        createdDate: "2025-08-25",
        category: "Backend Development",
        tasks: [
            { id: 19, title: "API Architecture and RESTful Design Pattern", description: "Design API architecture following REST principles", status: "completed", deadline: "2025-11-15", priority: "high", assignee: "Kevin James Harris" },
            { id: 20, title: "Authentication and JWT Token Implementation", description: "Implement JWT-based authentication system", status: "in-progress", deadline: "2025-12-05", priority: "high", assignee: "Kevin James Harris" },
            { id: 21, title: "Authorization and Role-Based Access Control", description: "Implement comprehensive RBAC system", status: "in-progress", deadline: "2025-12-10", priority: "high", assignee: "Laura Elizabeth Brown" },
            { id: 22, title: "API Endpoint Development and Integration", description: "Develop all required API endpoints", status: "in-progress", deadline: "2025-12-15", priority: "high", assignee: "Joseph Daniel Garcia" },
            { id: 23, title: "Rate Limiting and Throttling Implementation", description: "Implement rate limiting mechanisms", status: "pending", deadline: "2025-12-20", priority: "medium", assignee: "Emily Grace Robinson" },
            { id: 24, title: "Comprehensive API Documentation and Testing", description: "Create documentation and perform endpoint testing", status: "pending", deadline: "2025-12-30", priority: "high", assignee: "Kevin James Harris" }
        ]
    },
    {
        id: 5,
        name: "Comprehensive Security Audit and Implementation",
        description: "Complete security audit of all systems with implementation of security best practices, vulnerability assessment, and penetration testing to ensure enterprise-grade security standards.",
        status: "planning",
        progress: 15,
        deadline: "2026-04-30",
        priority: "critical",
        team: ["William Thomas Clark", "Margaret Susan Scott", "Richard James Green", "Nancy Ann King"],
        budget: 150000,
        startDate: "2025-12-01",
        createdDate: "2025-10-15",
        category: "Security",
        tasks: [
            { id: 25, title: "System Vulnerability Assessment and Scanning", description: "Conduct comprehensive vulnerability assessment", status: "pending", deadline: "2026-02-15", priority: "critical", assignee: "William Thomas Clark" },
            { id: 26, title: "Penetration Testing and Security Analysis", description: "Perform thorough penetration testing", status: "pending", deadline: "2026-03-15", priority: "critical", assignee: "Margaret Susan Scott" },
            { id: 27, title: "Security Report and Remediation Plan", description: "Generate detailed security report with remediation plan", status: "pending", deadline: "2026-04-15", priority: "high", assignee: "Richard James Green" },
            { id: 28, title: "Security Best Practices Implementation", description: "Implement industry best practices for security", status: "pending", deadline: "2026-04-30", priority: "high", assignee: "Nancy Ann King" }
        ]
    }
];

// ===== UTILITY FUNCTIONS =====
// Comprehensive utility functions for formatting and calculations
const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - today;
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const getProgressPercentage = (tasks) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
};

const getPriorityClass = (priority) => {
    const classes = {
        'critical': 'badge-warning',
        'high': 'badge-info',
        'medium': 'badge-neutral',
        'low': 'badge-secondary'
    };
    return classes[priority] || 'badge-neutral';
};

const getStatusLabel = (status) => {
    const labels = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'planning': 'Planning'
    };
    return labels[status] || status;
};

// ===== PROJECT CARD COMPONENT =====
const ProjectCard = React.memo(({ project, onSelect, onDelete, onUpdate }) => {
    const daysLeft = getDaysUntilDeadline(project.deadline);
    const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
    const isOverdue = daysLeft < 0;

    return (
        <div className="card" style={{ cursor: 'pointer' }}>
            <div className="card-header">
                <div style={{ flex: 1 }}>
                    <h3 className="card-title">{project.name}</h3>
                    <p className="card-subtitle">{project.category}</p>
                </div>
                <span className={`badge ${getPriorityClass(project.priority)}`}>
                    {project.priority.toUpperCase()}
                </span>
            </div>

            <p className="card-content" style={{ marginBottom: '16px', minHeight: '40px', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {project.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: '#9e9e9e' }}>
                <span>📅 {formatDate(project.deadline)}</span>
                <span style={{ color: isOverdue ? '#9e9e9e' : '#9e9e9e' }}>
                    {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d remaining`}
                </span>
            </div>

            <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#757575', fontWeight: 600 }}>Progress</span>
                    <span style={{ color: '#424242', fontWeight: 700 }}>{project.progress}%</span>
                </div>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px', color: '#616161' }}>
                <span>{completedTasks}/{project.tasks.length} Tasks</span>
                <span>{formatCurrency(project.budget)}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {project.team.slice(0, 2).map((member, idx) => (
                    <span key={idx} style={{ fontSize: '11px', backgroundColor: '#f5f5f5', color: '#616161', padding: '4px 8px', borderRadius: '4px' }}>
                        {member.split(' ')[0]}
                    </span>
                ))}
                {project.team.length > 2 && (
                    <span style={{ fontSize: '11px', backgroundColor: '#eeeeee', color: '#757575', padding: '4px 8px', borderRadius: '4px' }}>
                        +{project.team.length - 2} more
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => onSelect(project)}
                    className="btn-primary"
                    style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}>
                    View Details
                </button>
                <button
                    onClick={() => {
                        if (window.confirm(`Delete project "${project.name}"?`)) {
                            onDelete(project.id);
                        }
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '13px', padding: '8px 12px' }}>
                    Delete
                </button>
            </div>
        </div>
    );
});

// ===== TASK ITEM COMPONENT =====
const TaskItem = React.memo(({ task, projectId, onStatusChange, onDelete }) => {
    const isCompleted = task.status === 'completed';

    return (
        <div style={{ padding: '12px 0', borderBottom: '1px solid #eeeeee', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => {
                    const newStatus = e.target.checked ? 'completed' : 'pending';
                    onStatusChange(projectId, task.id, newStatus);
                }}
                style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer', accentColor: '#757575' }}
            />

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: isCompleted ? '#bdbdbd' : '#424242', textDecoration: isCompleted ? 'line-through' : 'none', marginBottom: '4px' }}>
                    {task.title}
                </div>
                {task.description && (
                    <div style={{ fontSize: '13px', color: '#9e9e9e', marginBottom: '6px' }}>
                        {task.description}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9e9e9e' }}>
                    <span>📅 {formatDate(task.deadline)}</span>
                    {task.assignee && <span>👤 {task.assignee}</span>}
                    <span className={`badge ${getPriorityClass(task.priority)}`} style={{ fontSize: '10px' }}>
                        {task.priority}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
                <select
                    value={task.status}
                    onChange={(e) => onStatusChange(projectId, task.id, e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #e0e0e0', cursor: 'pointer', backgroundColor: '#fafafa' }}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
                <button
                    onClick={() => {
                        if (window.confirm('Delete this task?')) {
                            onDelete(projectId, task.id);
                        }
                    }}
                    className="btn-danger"
                    style={{ fontSize: '12px', padding: '6px 10px' }}>
                    ✕
                </button>
            </div>
        </div>
    );
});

// ===== MODAL COMPONENT =====
const Modal = ({ isOpen, type, onClose, onSubmit, projects }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        projectDescription: '',
        projectDeadline: '',
        projectPriority: 'medium',
        projectBudget: '',
        projectCategory: '',
        taskTitle: '',
        taskDescription: '',
        taskDeadline: '',
        taskPriority: 'medium',
        selectedProject: ''
    });

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((type === 'project' && !formData.projectName.trim()) ||
            (type === 'task' && (!formData.taskTitle.trim() || !formData.selectedProject))) {
            alert('Please fill in all required fields');
            return;
        }
        onSubmit(formData, type);
        setFormData({
            projectName: '',
            projectDescription: '',
            projectDeadline: '',
            projectPriority: 'medium',
            projectBudget: '',
            projectCategory: '',
            taskTitle: '',
            taskDescription: '',
            taskDeadline: '',
            taskPriority: 'medium',
            selectedProject: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay active">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{type === 'project' ? 'Create New Project' : 'Add New Task'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    {type === 'project' ? (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                    Project Name *
                                </label>
                                <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="Enter project name" />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                    Description
                                </label>
                                <textarea name="projectDescription" value={formData.projectDescription} onChange={handleChange} placeholder="Enter project description" style={{ minHeight: '80px' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                        Deadline *
                                    </label>
                                    <input type="date" name="projectDeadline" value={formData.projectDeadline} onChange={handleChange} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                        Priority
                                    </label>
                                    <select name="projectPriority" value={formData.projectPriority} onChange={handleChange}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                        Budget ($)
                                    </label>
                                    <input type="number" name="projectBudget" value={formData.projectBudget} onChange={handleChange} placeholder="0" min="0" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                        Category
                                    </label>
                                    <input type="text" name="projectCategory" value={formData.projectCategory} onChange={handleChange} placeholder="e.g., Web Development" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                    Select Project *
                                </label>
                                <select name="selectedProject" value={formData.selectedProject} onChange={handleChange}>
                                    <option value="">-- Choose a project --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                    Task Title *
                                </label>
                                <input type="text" name="taskTitle" value={formData.taskTitle} onChange={handleChange} placeholder="Enter task title" />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                    Description
                                </label>
                                <textarea name="taskDescription" value={formData.taskDescription} onChange={handleChange} placeholder="Enter task description" style={{ minHeight: '60px' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                        Deadline *
                                    </label>
                                    <input type="date" name="taskDeadline" value={formData.taskDeadline} onChange={handleChange} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#424242' }}>
                                        Priority
                                    </label>
                                    <select name="taskPriority" value={formData.taskPriority} onChange={handleChange}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="modal-footer" style={{ borderTop: '1px solid #eeeeee', paddingTop: '16px', justifyContent: 'space-between' }}>
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">
                            {type === 'project' ? 'Create Project' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===== MAIN APPLICATION COMPONENT =====
function ProjectManagementApp() {
    const [projects, setProjects] = useState(initialProjects);
    const [activeTab, setActiveTab] = useState('projects');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('project');
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleCreateProject = useCallback((formData, type) => {
        if (type === 'project' && formData.projectName.trim()) {
            const newProject = {
                id: Math.max(...projects.map(p => p.id), 0) + 1,
                name: formData.projectName,
                description: formData.projectDescription,
                status: 'planning',
                progress: 0,
                deadline: formData.projectDeadline,
                priority: formData.projectPriority,
                budget: parseInt(formData.projectBudget) || 0,
                category: formData.projectCategory,
                team: [],
                createdDate: new Date().toISOString().split('T')[0],
                startDate: new Date().toISOString().split('T')[0],
                tasks: []
            };
            setProjects([...projects, newProject]);
            setShowModal(false);
        } else if (type === 'task' && formData.taskTitle.trim() && formData.selectedProject) {
            const updatedProjects = projects.map(project => {
                if (project.id === parseInt(formData.selectedProject)) {
                    const newTask = {
                        id: Math.max(...(project.tasks.map(t => t.id) || [0]), 0) + 1,
                        title: formData.taskTitle,
                        description: formData.taskDescription,
                        status: 'pending',
                        deadline: formData.taskDeadline,
                        assignee: '',
                        priority: formData.taskPriority
                    };
                    return {
                        ...project,
                        tasks: [...project.tasks, newTask],
                        progress: getProgressPercentage([...project.tasks, newTask])
                    };
                }
                return project;
            });
            setProjects(updatedProjects);
            setShowModal(false);
        }
    }, [projects]);

    const handleUpdateTaskStatus = useCallback((projectId, taskId, newStatus) => {
        const updatedProjects = projects.map(project => {
            if (project.id === projectId) {
                const updatedTasks = project.tasks.map(task => {
                    if (task.id === taskId) {
                        return { ...task, status: newStatus };
                    }
                    return task;
                });
                return {
                    ...project,
                    tasks: updatedTasks,
                    progress: getProgressPercentage(updatedTasks),
                    status: updatedTasks.every(t => t.status === 'completed') ? 'completed' : 
                            updatedTasks.some(t => t.status !== 'pending') ? 'in-progress' : 'pending'
                };
            }
            return project;
        });
        setProjects(updatedProjects);
        if (selectedProject && selectedProject.id === projectId) {
            const updated = updatedProjects.find(p => p.id === projectId);
            setSelectedProject(updated);
        }
    }, [projects, selectedProject]);

    const handleDeleteProject = useCallback((projectId) => {
        setProjects(projects.filter(p => p.id !== projectId));
        if (selectedProject && selectedProject.id === projectId) {
            setSelectedProject(null);
            setActiveTab('projects');
        }
    }, [projects, selectedProject]);

    const handleDeleteTask = useCallback((projectId, taskId) => {
        const updatedProjects = projects.map(project => {
            if (project.id === projectId) {
                const updatedTasks = project.tasks.filter(t => t.id !== taskId);
                return {
                    ...project,
                    tasks: updatedTasks,
                    progress: getProgressPercentage(updatedTasks)
                };
            }
            return project;
        });
        setProjects(updatedProjects);
        if (selectedProject && selectedProject.id === projectId) {
            const updated = updatedProjects.find(p => p.id === projectId);
            setSelectedProject(updated);
        }
    }, [projects, selectedProject]);

    const stats = useMemo(() => {
        const total = projects.length;
        const completed = projects.filter(p => p.status === 'completed').length;
        const inProgress = projects.filter(p => p.status === 'in-progress').length;
        const planning = projects.filter(p => p.status === 'planning').length;
        const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
        const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'completed').length, 0);
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const avgProgress = total > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total) : 0;
        return { total, completed, inProgress, planning, totalTasks, completedTasks, totalBudget, avgProgress };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  project.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
            const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
            return matchesSearch && matchesPriority && matchesStatus;
        });
    }, [projects, searchTerm, filterPriority, filterStatus]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Header */}
            <div className="header">
                <div className="container">
                    <h1>Enterprise Project Management System</h1>
                    <p>Comprehensive project tracking and team collaboration platform</p>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    <div className="stat-card">
                        <div className="stat-label">Total Projects</div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-change">{stats.inProgress} in progress</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Completed Projects</div>
                        <div className="stat-value">{stats.completed}</div>
                        <div className="stat-change">{Math.round((stats.completed / stats.total) * 100)}% completion rate</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Tasks</div>
                        <div className="stat-value">{stats.totalTasks}</div>
                        <div className="stat-change">{stats.completedTasks} completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Budget</div>
                        <div className="stat-value" style={{ fontSize: '22px' }}>{formatCurrency(stats.totalBudget)}</div>
                        <div className="stat-change">Across all projects</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tab-container" style={{ marginBottom: '24px' }}>
                    <button
                        className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => setActiveTab('projects')}>
                        All Projects
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}>
                        Dashboard
                    </button>
                    {selectedProject && (
                        <button
                            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}>
                            Project Details
                        </button>
                    )}
                </div>

                {/* Main Content */}
                {activeTab === 'projects' && (
                    <div className="animate-fadeIn">
                        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button className="btn-primary" onClick={() => { setModalType('project'); setShowModal(true); }}>
                                + New Project
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => { setModalType('task'); setShowModal(true); }}
                                disabled={projects.length === 0}
                                style={{ opacity: projects.length === 0 ? 0.5 : 1 }}>
                                + Add Task
                            </button>

                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ flex: '1', minWidth: '200px', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px' }}
                            />

                            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
                                <option value="all">All Priorities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>

                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
                                <option value="all">All Status</option>
                                <option value="planning">Planning</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {filteredProjects.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📁</div>
                                <h3>No projects found</h3>
                                <p>Create your first project to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-2">
                                {filteredProjects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        onSelect={(p) => {
                                            setSelectedProject(p);
                                            setActiveTab('details');
                                        }}
                                        onDelete={handleDeleteProject}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="animate-fadeIn">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div className="card">
                                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '700', color: '#212121' }}>Project Status Distribution</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div><span style={{ fontWeight: '600' }}>Planning:</span> <span style={{ color: '#9e9e9e' }}>{stats.planning}</span></div>
                                    <div><span style={{ fontWeight: '600' }}>In Progress:</span> <span style={{ color: '#9e9e9e' }}>{stats.inProgress}</span></div>
                                    <div><span style={{ fontWeight: '600' }}>Completed:</span> <span style={{ color: '#9e9e9e' }}>{stats.completed}</span></div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '700', color: '#212121' }}>Task Overview</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Total Tasks</span>
                                        <span style={{ fontWeight: '700' }}>{stats.totalTasks}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Completed</span>
                                        <span style={{ fontWeight: '700' }}>{stats.completedTasks}</span>
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        <div className="progress-container">
                                            <div className="progress-bar" style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && selectedProject && (
                    <div className="animate-fadeIn">
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#212121', margin: '0 0 4px 0' }}>
                                        {selectedProject.name}
                                    </h2>
                                    <p style={{ margin: 0, color: '#9e9e9e', fontSize: '13px' }}>
                                        {selectedProject.category} • {formatDate(selectedProject.createdDate)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this project?')) {
                                            handleDeleteProject(selectedProject.id);
                                        }
                                    }}
                                    className="btn-danger">
                                    Delete Project
                                </button>
                            </div>

                            <p style={{ color: '#616161', marginBottom: '16px', lineHeight: '1.6' }}>
                                {selectedProject.description}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '12px', color: '#9e9e9e', fontWeight: '600', marginBottom: '4px' }}>Status</div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#212121' }}>
                                        {getStatusLabel(selectedProject.status)}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '12px', color: '#9e9e9e', fontWeight: '600', marginBottom: '4px' }}>Progress</div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#212121' }}>
                                        {selectedProject.progress}%
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '12px', color: '#9e9e9e', fontWeight: '600', marginBottom: '4px' }}>Deadline</div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#212121' }}>
                                        {formatDate(selectedProject.deadline)}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '12px', color: '#9e9e9e', fontWeight: '600', marginBottom: '4px' }}>Budget</div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#212121' }}>
                                        {formatCurrency(selectedProject.budget)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #eeeeee' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#212121' }}>
                                    Tasks ({selectedProject.tasks.length})
                                </h3>
                                <button className="btn-primary" onClick={() => { setModalType('task'); setShowModal(true); }} style={{ fontSize: '13px', padding: '8px 12px' }}>
                                    + Add Task
                                </button>
                            </div>

                            {selectedProject.tasks.length === 0 ? (
                                <div className="empty-state" style={{ padding: '40px 20px' }}>
                                    <div className="empty-state-icon">✓</div>
                                    <h3>No tasks yet</h3>
                                    <p>Add a task to track project progress</p>
                                </div>
                            ) : (
                                <div>
                                    {selectedProject.tasks.map(task => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            projectId={selectedProject.id}
                                            onStatusChange={handleUpdateTaskStatus}
                                            onDelete={handleDeleteTask}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                type={modalType}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreateProject}
                projects={projects}
            />

            {/* Footer */}
            <div className="footer">
                <div className="container">
                    <p>Enterprise Project Management System © 2025. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

// Render the application
ReactDOM.render(<ProjectManagementApp />, document.getElementById('root'));