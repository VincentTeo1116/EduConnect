class EduConnect {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.initializeApp();
    }
    
    getCurrentUser() {
        // In a real app, this would come from authentication/backend
        // For demo purposes, we'll simulate different roles
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role') || 'student'; // Default to student
        
        return {
            id: role === 'student' ? 'STU001' : 'LEC001',
            name: role === 'student' ? 'Alex Johnson' : 'Dr. Sarah Miller',
            role: role,
            email: role === 'student' ? 'alex.johnson@educonnect.com' : 'sarah.miller@educonnect.com',
            avatar: `https://ui-avatars.com/api/?name=${role === 'student' ? 'Alex+Johnson' : 'Sarah+Miller'}&background=3498db&color=fff`,
            notifications: role === 'student' ? 3 : 5
        };
    }
    
    initializeApp() {
        this.render();
        this.bindEvents();
        this.loadDashboard();
    }
    
    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="main-container">
                <header class="header">
                    <div class="logo-section" id="homeLink">
                        <img src="Images/Logo.png" alt="EduConnect Logo" class="logo" />
                        <h1>EduConnect</h1>
                    </div>          
                    <div class="nav-links-container">
                        <ul class="nav-links" id="navLinks">
                            ${this.renderNavLinks()}
                        </ul>
                        
                        <div class="profile-section">
                            <div class="role-badge" id="roleBadge">
                                ${this.currentUser.role === 'student' ? 'Student' : 'Lecturer'}
                            </div>
                            <div class="profile-icon ${this.currentUser.notifications > 0 ? 'has-notifications' : ''}" id="profileIcon">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                    </div>
                </header>
                
                <main class="main-content" id="mainContent">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                    </div>
                </main>
            </div>
        `;
    }
    
    renderNavLinks() {
        const navItems = {
            student: [
                { icon: 'fa-book', text: 'Modules', href: '#', page: 'modules' },
                { icon: 'fa-calendar-alt', text: 'Schedule', href: '#', page: 'schedule' },
                { icon: 'fa-tasks', text: 'Assignments', href: '#', page: 'assignments' },
                { icon: 'fa-chart-line', text: 'Grades', href: '#', page: 'grades' },
                { icon: 'fa-comments', text: 'Discussions', href: '#', page: 'discussions', badge: 3 }
            ],
            lecturer: [
                { icon: 'fa-book', text: 'Modules', href: '#', page: 'modules' },
                { icon: 'fa-users', text: 'Students', href: '#', page: 'students' },
                { icon: 'fa-file-alt', text: 'Assignments', href: '#', page: 'assignments' },
                { icon: 'fa-chart-bar', text: 'Analytics', href: '#', page: 'analytics' },
                { icon: 'fa-calendar-plus', text: 'Schedule', href: '#', page: 'schedule' },
                { icon: 'fa-comments', text: 'Discussions', href: '#', page: 'discussions', badge: 5 }
            ]
        };
        
        const items = navItems[this.currentUser.role] || navItems.student;
        
        return items.map(item => `
            <li class="nav-item">
                <a href="${item.href}" class="nav-link" data-page="${item.page}">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.text}</span>
                    ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
                </a>
            </li>
        `).join('');
    }
    
    bindEvents() {
        // Home link
        document.getElementById('homeLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadDashboard();
        });
        
        // Profile icon click - redirect to profile page
        document.getElementById('profileIcon').addEventListener('click', () => {
            window.location.href = `Profile.php?role=${this.currentUser.role}&id=${this.currentUser.id}`;
        });
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.loadPage(page);
                
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // Role switching for demo purposes
        document.getElementById('roleBadge').addEventListener('click', () => {
            const newRole = this.currentUser.role === 'student' ? 'lecturer' : 'student';
            window.location.href = `?role=${newRole}`;
        });
    }
    
    loadDashboard() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="dashboard fade-in">
                <div class="welcome-banner">
                    <h1 class="welcome-title">Welcome back, ${this.currentUser.name}!</h1>
                    <p class="welcome-subtitle">
                        ${this.currentUser.role === 'student' 
                            ? 'Continue your learning journey with personalized modules and assignments.' 
                            : 'Manage your courses, track student progress, and create engaging content.'}
                    </p>
                </div>
                
                <div class="quick-actions">
                    ${this.renderQuickActions()}
                </div>
                
                <div class="modules-section">
                    <h2 style="font-size: 24px; margin-bottom: 24px; color: var(--primary-color);">
                        ${this.currentUser.role === 'student' ? 'Your Modules' : 'Managed Modules'}
                    </h2>
                    <div class="modules-grid" id="modulesGrid">
                        ${this.renderModules()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderQuickActions() {
        const actions = {
            student: [
                {
                    icon: 'fa-play-circle',
                    title: 'Continue Learning',
                    description: 'Resume your last viewed module or start a new one',
                    button: { text: 'Continue', action: 'continue', type: 'primary' }
                },
                {
                    icon: 'fa-file-alt',
                    title: 'Upcoming Assignments',
                    description: 'View and submit your pending assignments',
                    button: { text: 'View Assignments', action: 'assignments', type: 'secondary' }
                },
                {
                    icon: 'fa-question-circle',
                    title: 'Need Help?',
                    description: 'Access learning resources and get support',
                    button: { text: 'Get Help', action: 'help', type: 'secondary' }
                }
            ],
            lecturer: [
                {
                    icon: 'fa-plus-circle',
                    title: 'Create New Module',
                    description: 'Design and publish a new learning module for your students',
                    button: { text: 'Create Module', action: 'create-module', type: 'primary' }
                },
                {
                    icon: 'fa-chart-bar',
                    title: 'Student Analytics',
                    description: 'Track student performance and engagement metrics',
                    button: { text: 'View Analytics', action: 'analytics', type: 'secondary' }
                },
                {
                    icon: 'fa-comments',
                    title: 'Discussion Forum',
                    description: 'Monitor and participate in course discussions',
                    button: { text: 'View Discussions', action: 'discussions', type: 'secondary' }
                }
            ]
        };
        
        const userActions = actions[this.currentUser.role] || actions.student;
        
        return userActions.map(action => `
            <div class="action-card fade-in">
                <div class="action-card-icon">
                    <i class="fas ${action.icon}"></i>
                </div>
                <h3 class="action-card-title">${action.title}</h3>
                <p class="action-card-description">${action.description}</p>
                <button class="action-btn ${action.button.type === 'secondary' ? 'secondary' : ''}" 
                        data-action="${action.button.action}">
                    ${action.button.text} <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `).join('');
    }
    
    renderModules() {
        const modules = {
            student: [
                { code: 'CS101', title: 'Introduction to Programming', description: 'Learn the fundamentals of programming with Python', status: 'active', students: 150, assignments: 3 },
                { code: 'CS203', title: 'Data Structures', description: 'Advanced data structures and algorithms', status: 'active', students: 120, assignments: 5 },
                { code: 'MATH202', title: 'Discrete Mathematics', description: 'Mathematical foundations for computer science', status: 'active', students: 180, assignments: 2 }
            ],
            lecturer: [
                { code: 'CS101', title: 'Introduction to Programming', description: 'Teaching basic programming concepts', status: 'active', students: 150, assignments: 8 },
                { code: 'CS305', title: 'Machine Learning', description: 'Advanced machine learning algorithms', status: 'active', students: 80, assignments: 6 },
                { code: 'CS410', title: 'Software Engineering', description: 'Software development methodologies and practices', status: 'inactive', students: 95, assignments: 4 }
            ]
        };
        
        const userModules = modules[this.currentUser.role] || modules.student;
        
        return userModules.map(module => `
            <div class="module-card fade-in">
                <div class="module-card-header">
                    <span class="module-code">${module.code}</span>
                    <span class="module-status ${module.status}">${module.status}</span>
                </div>
                <h3 class="module-title">${module.title}</h3>
                <p class="module-description">${module.description}</p>
                <div class="module-stats">
                    <div class="stat-item">
                        <span class="stat-value">${module.students}</span>
                        <span class="stat-label">Students</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${module.assignments}</span>
                        <span class="stat-label">Assignments</span>
                    </div>
                    <button class="action-btn" data-module="${module.code}" style="padding: 8px 16px; font-size: 14px;">
                        ${this.currentUser.role === 'student' ? 'View Module' : 'Manage'} <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    loadPage(page) {
        const mainContent = document.getElementById('mainContent');
        
        // Simulate loading
        mainContent.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;
        
        // Simulate API delay
        setTimeout(() => {
            const pageTitles = {
                modules: 'Modules Management',
                schedule: 'Schedule & Calendar',
                assignments: 'Assignments',
                grades: 'Grades & Performance',
                discussions: 'Discussion Forum',
                students: 'Student Management',
                analytics: 'Analytics Dashboard'
            };
            
            mainContent.innerHTML = `
                <div class="fade-in">
                    <h1 style="font-size: 20px; margin-bottom: 24px; color: var(--primary-color);">
                        ${pageTitles[page] || 'Page'}
                    </h1>
                    <div class="action-card">
                        <div class="action-card-icon">
                            <i class="fas fa-${page === 'modules' ? 'book' : page === 'schedule' ? 'calendar-alt' : 'info-circle'}"></i>
                        </div>
                        <h3 class="action-card-title">${pageTitles[page] || 'Page'} Content</h3>
                        <p class="action-card-description">
                            This is the ${pageTitles[page]?.toLowerCase() || page} page for ${this.currentUser.role === 'student' ? 'students' : 'lecturers'}.
                            ${this.currentUser.role === 'student' 
                                ? 'Here you can access all your learning materials, track progress, and interact with your courses.' 
                                : 'Here you can manage your courses, monitor student performance, and create engaging content.'}
                        </p>
                        <button class="action-btn" onclick="window.location.href='${page}.php?role=${this.currentUser.role}'">
                            Open Full Page <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                    <button class="action-btn secondary" style="margin-top: 24px;" id="backToDashboard">
                        <i class="fas fa-arrow-left"></i> Back to Dashboard
                    </button>
                </div>
            `;
            
            // Add back button functionality
            document.getElementById('backToDashboard').addEventListener('click', () => {
                this.loadDashboard();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            });
        }, 500);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new EduConnect();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EduConnect;
}