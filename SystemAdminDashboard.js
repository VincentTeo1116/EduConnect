import React, { useState, useEffect } from 'react';

const SystemAdminDashboard = ({ currentUser, users = [], setUsers, handleLogout, goToProfile }) => {
  // Safety check - if no currentUser
  if (!currentUser) {
    return (
      <div className="form-container">
        <h2>No User Logged In</h2>
        <p>Please log in to access the admin dashboard.</p>
        <button className="btn-primary" onClick={handleLogout}>
          Go to Login
        </button>
      </div>
    );
  }

  const [userData, setUserData] = useState({ name: '', email: '', password: '', role: '' });
  const [modules, setModules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [moduleData, setModuleData] = useState({ name: '', description: '' });
  const [classData, setClassData] = useState({ name: '', moduleCode: '' });
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);

  // Load modules and classes from localStorage
  useEffect(() => {
    const storedModules = JSON.parse(localStorage.getItem('modules')) || [];
    const storedClasses = JSON.parse(localStorage.getItem('classes')) || [];
    setModules(storedModules);
    setClasses(storedClasses);
  }, []);

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (users.find(u => u.email === userData.email)) {
      alert('User already exists');
      return;
    }
    const newUser = { 
      id: Date.now(), 
      name: userData.name, 
      email: userData.email, 
      password: userData.password, 
      role: userData.role, 
      active: true 
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUserData({ name: '', email: '', password: '', role: '' });
    setShowAddUserPopup(false);
    alert('User created');
  };

  const toggleUser = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleModuleSubmit = (e) => {
    e.preventDefault();
    const getInitials = (name) => {
      if (!name) return 'MOD';
      return name.split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);
    };
    
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const code = `${getInitials(moduleData.name)}-${mm}${yyyy}`;
    
    const newModule = { 
      code, 
      name: moduleData.name, 
      description: moduleData.description, 
      instructorId: null, 
      examAdminId: null 
    };
    
    const updatedModules = [...modules, newModule];
    setModules(updatedModules);
    localStorage.setItem('modules', JSON.stringify(updatedModules));
    setModuleData({ name: '', description: '' });
    alert(`Module created with code: ${code}`);
  };

  const deleteModule = (moduleCode) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      const updatedModules = modules.filter(m => m.code !== moduleCode);
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
    }
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    const newClass = { 
      id: Date.now(), 
      name: classData.name, 
      moduleCode: classData.moduleCode, 
      students: [] 
    };
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    setClassData({ name: '', moduleCode: '' });
    alert('Class created');
  };

  const deleteClass = (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      const updatedClasses = classes.filter(c => c.id !== classId);
      setClasses(updatedClasses);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
    }
  };

  return (
    <div className="main-container">
      {/* Header - Uses CSS from App.css */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (System Administrator)</h1>
        </div>
        <div>
          <button className="btn-secondary" onClick={goToProfile}>Profile</button>
          <button className="btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content - Uses section classes from App.css */}
      <main>
        {/* Welcome Banner */}
        <section className="welcome-banner">
          <h2 className="welcome-title">System Administrator Dashboard</h2>
          <p className="welcome-subtitle">
            Manage users, modules, classes, and system settings
          </p>
        </section>

        {/* Quick Actions */}
        <section>
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <div className="action-card">
              <div className="action-card-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <h4 className="action-card-title">Create User Account</h4>
              <p className="action-card-description">
                Add new students, instructors, or administrators to the system
              </p>
              <button className="action-btn" onClick={() => setShowAddUserPopup(true)}>
                <i className="fas fa-plus"></i> Add User
              </button>
            </div>
            
            <div className="action-card">
              <div className="action-card-icon">
                <i className="fas fa-book"></i>
              </div>
              <h4 className="action-card-title">Manage Modules</h4>
              <p className="action-card-description">
                Create and manage course modules for the academic system
              </p>
              <button className="action-btn" onClick={() => document.getElementById('manage-modules')?.scrollIntoView({ behavior: 'smooth' })}>
                <i className="fas fa-arrow-right"></i> View Modules
              </button>
            </div>
            
            <div className="action-card">
              <div className="action-card-icon">
                <i className="fas fa-users"></i>
              </div>
              <h4 className="action-card-title">User Management</h4>
              <p className="action-card-description">
                View and manage all user accounts in the system
              </p>
              <button className="action-btn" onClick={() => document.getElementById('manage-users')?.scrollIntoView({ behavior: 'smooth' })}>
                <i className="fas fa-arrow-right"></i> Manage Users
              </button>
            </div>
          </div>
        </section>

        {/* Create User Account - Form Container Style */}
        <section id="create-user-form">
          <h3>Create User Account</h3>
          <form onSubmit={handleUserSubmit} className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={userData.name} 
              onChange={(e) => setUserData({ ...userData, name: e.target.value })} 
              required
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={userData.email} 
              onChange={(e) => setUserData({ ...userData, email: e.target.value })} 
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={userData.password} 
              onChange={(e) => setUserData({ ...userData, password: e.target.value })} 
              required
            />
            <select 
              value={userData.role} 
              onChange={(e) => setUserData({ ...userData, role: e.target.value })} 
              required
            >
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Exam Administrator">Exam Administrator</option>
            </select>
            <button type="submit" className="btn-primary">Create User</button>
          </form>
        </section>
        
        {/* Manage Users */}
        <section id="manage-users">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Manage Users ({users.length})</h3>
            <button 
              onClick={() => setShowAddUserPopup(true)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fas fa-plus"></i> Add User
            </button>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px', 
            marginTop: '20px' 
          }}>
            {users.map(u => (
              <div key={u.id} className="item-card">
                <h4>{u.name}</h4>
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Role:</strong> {u.role}</p>
                <p><strong>Status:</strong> {u.active ? '✅ Active' : '❌ Inactive'}</p>
                <button 
                  onClick={() => toggleUser(u.id)}
                  className={u.active ? 'btn-danger' : 'btn-success'}
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  {u.active ? 'Deactivate Account' : 'Activate Account'}
                </button>
              </div>
            ))}
          </div>
        </section>
        
        {/* Create Module */}
        <section>
          <h3>Create Module</h3>
          <form onSubmit={handleModuleSubmit} className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Module Name (e.g., Software Development)" 
              value={moduleData.name} 
              onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })} 
              required
            />
            <textarea 
              placeholder="Module Description" 
              value={moduleData.description} 
              onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })} 
              required
              rows="4"
            />
            <button type="submit" className="btn-primary">Create Module</button>
          </form>
        </section>
        
        {/* Manage Modules */}
        <section id="manage-modules">
          <h3>Manage Modules ({modules.length})</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px', 
            marginTop: '20px' 
          }}>
            {modules.map(m => (
              <div key={m.code} className="item-card">
                <h4>{m.name}</h4>
                <p><strong>Code:</strong> {m.code}</p>
                <p><strong>Description:</strong> {m.description}</p>
                <button 
                  onClick={() => deleteModule(m.code)}
                  className="btn-danger"
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  Delete Module
                </button>
              </div>
            ))}
          </div>
        </section>
        
        {/* Create Class */}
        <section>
          <h3>Create Class</h3>
          <form onSubmit={handleClassSubmit} className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Class Name (e.g., SDM Class A)" 
              value={classData.name} 
              onChange={(e) => setClassData({ ...classData, name: e.target.value })} 
              required
            />
            <select 
              value={classData.moduleCode} 
              onChange={(e) => setClassData({ ...classData, moduleCode: e.target.value })} 
              required
            >
              <option value="">Select Module</option>
              {modules.map(m => (
                <option key={m.code} value={m.code}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary">Create Class</button>
          </form>
        </section>
        
        {/* Manage Classes */}
        <section>
          <h3>Manage Classes ({classes.length})</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px', 
            marginTop: '20px' 
          }}>
            {classes.map(c => (
              <div key={c.id} className="item-card">
                <h4>{c.name}</h4>
                <p><strong>Module:</strong> {modules.find(m => m.code === c.moduleCode)?.name || 'Unknown'}</p>
                <p><strong>Module Code:</strong> {c.moduleCode}</p>
                <p><strong>Students:</strong> {c.students?.length || 0}</p>
                <button 
                  onClick={() => deleteClass(c.id)}
                  className="btn-danger"
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  Delete Class
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Add User Popup */}
        {showAddUserPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '300',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0
                }}>
                  Add New User
                </h2>
                <button 
                  onClick={() => setShowAddUserPopup(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '28px', 
                    cursor: 'pointer', 
                    color: '#666',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUserSubmit}>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={userData.name} 
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })} 
                  required
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={userData.email} 
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })} 
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={userData.password} 
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })} 
                  required
                />
                <select 
                  value={userData.role} 
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })} 
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="System Administrator">System Administrator</option>
                  <option value="Exam Administrator">Exam Administrator</option>
                </select>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create User</button>
                  <button type="button" onClick={() => setShowAddUserPopup(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SystemAdminDashboard;