import React, { useState, useEffect } from 'react';

const SystemAdminDashboard = ({ 
  currentUser, 
  users = [], 
  setUsers, 
  modules = [],
  setModules,
  classes = [],
  setClasses,
  handleLogout, 
  goToProfile,
  // Popup control props
  showAddUserPopup,
  setShowAddUserPopup,
  popupUserData,
  setPopupUserData,
  handlePopupUserSubmit,
  SupabaseService
}) => {
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

  const [moduleData, setModuleData] = useState({ 
    name: '', 
    description: '',
    instructorId: '',
    examAdminId: '' 
  });
  const [classData, setClassData] = useState({ 
    name: '', 
    moduleCode: '', 
    classType: 'lecture' 
  });

  // Handle module creation with Supabase
  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Improved module code generation
      const generateModuleCode = (name) => {
        if (!name) return 'MOD';
        
        // Get first letters of each word, max 3
        const initials = name
          .split(' ')
          .map(word => word[0] || '')
          .filter(char => char && char.match(/[A-Za-z]/))
          .join('')
          .toUpperCase()
          .slice(0, 3);
        
        // Add current month and year
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear().toString();
        
        // Add random suffix to avoid duplicates
        const randomSuffix = Math.floor(Math.random() * 90 + 10); // 10-99
        
        return `${initials || 'MOD'}-${mm}${yyyy}`;
      };
      
      const code = generateModuleCode(moduleData.name);
      
      // Prepare module data for Supabase
      const newModule = { 
        code, 
        name: moduleData.name, 
        description: moduleData.description,
        instructor_id: moduleData.instructorId ? parseInt(moduleData.instructorId) : null,
        exam_admin_id: moduleData.examAdminId ? parseInt(moduleData.examAdminId) : null,
        invitation_code: SupabaseService.generateInvitationCode()
      };
      
      // Try Supabase first
      const createdModule = await SupabaseService.createModule(newModule);
      const updatedModules = [...modules, createdModule];
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
      setModuleData({ name: '', description: '', instructorId: '', examAdminId: '' });
      alert(`Module "${moduleData.name}" created with code: ${code}`);
      window.location.reload();
    } catch (error) {
      console.error('Error creating module:', error);
      // Fallback to localStorage
      const generateModuleCode = (name) => {
        if (!name) return 'MOD';
        
        const initials = name
          .split(' ')
          .map(word => word[0] || '')
          .filter(char => char && char.match(/[A-Za-z]/))
          .join('')
          .toUpperCase()
          .slice(0, 3);
        
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear().toString().slice(-2);
        const randomSuffix = Math.floor(Math.random() * 90 + 10);
        
        return `${initials || 'MOD'}-${mm}${yyyy}-${randomSuffix}`;
      };
      
      const code = generateModuleCode(moduleData.name);
      
      const newModule = { 
        code, 
        name: moduleData.name, 
        description: moduleData.description, 
        instructorId: moduleData.instructorId ? parseInt(moduleData.instructorId) : null, 
        examAdminId: moduleData.examAdminId ? parseInt(moduleData.examAdminId) : null 
      };
      
      const updatedModules = [...modules, newModule];
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
      setModuleData({ name: '', description: '', instructorId: '', examAdminId: '' });
      alert(`Module created (local) with code: ${code}`);
      window.location.reload();
    }
  };

  const handleGenerateInvitationCode = async (moduleCode) => {
    try {
      const newCode = SupabaseService.generateUniqueInvitationCode();

      console.log('Generating new invitation code:', newCode, 'for module:', moduleCode);
      const updatedModule = await SupabaseService.updateModuleInvitationCode(moduleCode, newCode);
      
      // Update local state
      const updatedModules = modules.map(m => 
        m.code === moduleCode ? { ...m, invitation_code: newCode } : m
      );
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
      
      alert(`New invitation code generated: ${newCode}`);
    } catch (error) {
      console.error('Error generating invitation code:', error);
      alert('Failed to generate invitation code');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Invitation code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Invitation code copied!');
      });
  };

  const deleteModule = async (moduleCode) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await SupabaseService.deleteModule(moduleCode);
        const updatedModules = modules.filter(m => m.code !== moduleCode);
        setModules(updatedModules);
        localStorage.setItem('modules', JSON.stringify(updatedModules));
      } catch (error) {
        console.error('Error deleting module:', error);
        const updatedModules = modules.filter(m => m.code !== moduleCode);
        setModules(updatedModules);
        localStorage.setItem('modules', JSON.stringify(updatedModules));
      }
    }
  };

  // UPDATED: Class creation with Supabase integration
  const handleClassSubmit = async (e) => {
    e.preventDefault();
    
    if (!classData.moduleCode || !classData.classType || !classData.name) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Get count of existing classes for this module and type
      const existingClasses = await SupabaseService.getClasses();
      const existingClassesOfSameType = existingClasses.filter(c => 
        c.module_code === classData.moduleCode && c.class_type === classData.classType
      );
      const classNumber = existingClassesOfSameType.length + 1;
      
      // Generate class code: [moduleCode]_[classType]_[number]
      const classCode = `${classData.moduleCode}_${classData.classType}_${classNumber}`;
      
      // Prepare class data for Supabase
      const newClass = { 
        name: classData.name, 
        code: classCode,
        module_code: classData.moduleCode,
        class_type: classData.classType,
        instructor_id: null // Can be assigned later
      };
      
      // Create class in Supabase
      const createdClass = await SupabaseService.createClass(newClass);
      const updatedClasses = [...classes, createdClass];
      setClasses(updatedClasses);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
      
      setClassData({ name: '', moduleCode: '', classType: 'lecture' });
      alert(`Class "${classData.name}" created with code: ${classCode}`);
    } catch (error) {
      console.error('Error creating class:', error);
      // Fallback to localStorage
      const existingClassesOfSameType = classes.filter(c => 
        c.module_code === classData.moduleCode && c.class_type === classData.classType
      );
      const classNumber = existingClassesOfSameType.length + 1;
      const classCode = `${classData.moduleCode}_${classData.classType}_${classNumber}`;
      
      const newClass = { 
        id: Date.now(), 
        name: classData.name, 
        code: classCode,
        module_code: classData.moduleCode,
        class_type: classData.classType,
        instructor_id: null
      };
      
      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
      
      setClassData({ name: '', moduleCode: '', classType: 'lecture' });
      alert(`Class created (local) with code: ${classCode}`);
    }
  };

  // UPDATED: Class deletion with Supabase integration
  const deleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await SupabaseService.deleteClass(classId);
        const updatedClasses = classes.filter(c => c.id !== classId);
        setClasses(updatedClasses);
        localStorage.setItem('classes', JSON.stringify(updatedClasses));
        alert('Class deleted successfully from database');
      } catch (error) {
        console.error('Error deleting class:', error);
        const updatedClasses = classes.filter(c => c.id !== classId);
        setClasses(updatedClasses);
        localStorage.setItem('classes', JSON.stringify(updatedClasses));
        alert('Class deleted (local storage only)');
      }
    }
  };

  const toggleUser = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const updatedUser = await SupabaseService.updateUser(userId, {
        active: !user.active
      });
      
      const updatedUsers = users.map(u => 
        u.id === userId ? updatedUser : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error updating user:', error);
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, active: !u.active } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  // Helper function to get user name by ID
  const getUserName = (userId) => {
    if (!userId) return 'Not assigned';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  // Helper function to get class type badge color
  const getClassTypeBadge = (type) => {
    switch(type) {
      case 'lecture':
        return { label: 'Lecture', color: '#3498db', bgColor: '#ebf5fb' };
      case 'tutorial':
        return { label: 'Tutorial', color: '#2ecc71', bgColor: '#eafaf1' };
      case 'lab':
        return { label: 'Lab', color: '#e74c3c', bgColor: '#fdedec' };
      default:
        return { label: type, color: '#7f8c8d', bgColor: '#f2f3f4' };
    }
  };

  return (
    <div className="main-container">
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

      <main>
        <section className="welcome-banner">
          <h2 className="welcome-title">System Administrator Dashboard</h2>
          <p className="welcome-subtitle">
            Manage users, modules, classes, and system settings
          </p>
        </section>

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
              <h4 className="action-card-title">Class Management</h4>
              <p className="action-card-description">
                Create and manage classes (lecture, tutorial, lab) for modules
              </p>
              <button className="action-btn" onClick={() => document.getElementById('create-class-form')?.scrollIntoView({ behavior: 'smooth' })}>
                <i className="fas fa-arrow-right"></i> Create Class
              </button>
            </div>
          </div>
        </section>
        
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
        
        <section id="create-module-form">
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
            
            {/* Instructor Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Select Instructor (Optional)
              </label>
              <select 
                value={moduleData.instructorId} 
                onChange={(e) => setModuleData({ ...moduleData, instructorId: e.target.value })} 
                style={{ 
                  width: '100%', 
                  padding: '12px 15px', 
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                {users
                  .filter(user => user.role === 'Instructor' && user.active)
                  .map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name} ({instructor.email})
                    </option>
                  ))
                }
              </select>
            </div>
            
            {/* Exam Administrator Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Select Exam Administrator (Optional)
              </label>
              <select 
                value={moduleData.examAdminId} 
                onChange={(e) => setModuleData({ ...moduleData, examAdminId: e.target.value })} 
                style={{ 
                  width: '100%', 
                  padding: '12px 15px', 
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                {users
                  .filter(user => user.role === 'Exam Administrator' && user.active)
                  .map(admin => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} ({admin.email})
                    </option>
                  ))
                }
              </select>
            </div>
            
            <button type="submit" className="btn-primary">Create Module</button>
          </form>
        </section>
        
        <section id="manage-modules">
          <h3>Manage Modules ({modules.length})</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px', 
            marginTop: '20px' 
          }}>
            {modules.map(m => {
              const instructorId = m.instructor_id || m.instructorId;
              const examAdminId = m.exam_admin_id || m.examAdminId;
              const moduleClasses = classes.filter(c => c.module_code === m.code);
              
              return (
                <div key={m.code} className="item-card">
                  <h4>{m.name}</h4>
                  <p><strong>Code:</strong> {m.code}</p>
                  <p><strong>Description:</strong> {m.description}</p>
                  <p><strong>Instructor:</strong> {getUserName(instructorId)}</p>
                  <p><strong>Exam Admin:</strong> {getUserName(examAdminId)}</p>
                  <p><strong>Total Classes:</strong> {moduleClasses.length}</p>
                  <button 
                    onClick={() => deleteModule(m.code)}
                    className="btn-danger"
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    Delete Module
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* UPDATED: Create Class form with Supabase integration */}
        <section id="create-class-form">
          <h3>Create Class</h3>
          <form onSubmit={handleClassSubmit} className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Class Display Name (e.g., SDM Class A)" 
              value={classData.name} 
              onChange={(e) => setClassData({ ...classData, name: e.target.value })} 
              required
            />
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Select Module *
              </label>
              <select 
                value={classData.moduleCode} 
                onChange={(e) => setClassData({ ...classData, moduleCode: e.target.value })} 
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 15px', 
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select Module</option>
                {modules.map(m => (
                  <option key={m.code} value={m.code}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Select Class Type *
              </label>
              <select 
                value={classData.classType} 
                onChange={(e) => setClassData({ ...classData, classType: e.target.value })} 
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 15px', 
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="lecture">Lecture</option>
                <option value="tutorial">Tutorial</option>
                <option value="lab">Lab</option>
              </select>
            </div>
            
            {/* Preview of generated class code */}
            {classData.moduleCode && classData.classType && (
              <div style={{ 
                padding: '12px 15px', 
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                fontSize: '14px'
              }}>
                <p style={{ margin: '0', fontWeight: '500' }}>Auto-generated Class Code:</p>
                <p style={{ 
                  margin: '5px 0 0 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#667eea'
                }}>
                  {classData.moduleCode}_{classData.classType}_
                  {classes.filter(c => 
                    c.module_code === classData.moduleCode && 
                    c.class_type === classData.classType
                  ).length + 1}
                </p>
                <p style={{ 
                  margin: '5px 0 0 0', 
                  fontSize: '12px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  Format: [Module Code]_[Class Type]_[Sequence Number]
                </p>
              </div>
            )}
            
            <button type="submit" className="btn-primary">Create Class (Save to Database)</button>
          </form>
        </section>
        
        {/* UPDATED: Manage Classes with Supabase data */}
        <section id="manage-classes">
          <h3>Manage Classes ({classes.length})</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px', 
            marginTop: '20px' 
          }}>
            {classes.map(c => {
              const module = modules.find(m => m.code === c.module_code);
              const badge = getClassTypeBadge(c.class_type);
              
              return (
                <div key={c.id} className="item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0 }}>{c.name}</h4>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: badge.bgColor,
                      color: badge.color,
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {badge.label}
                    </span>
                  </div>
                  <p><strong>Module:</strong> {module?.name || 'Unknown'}</p>
                  <p><strong>Class Code:</strong> {c.code || 'N/A'}</p>
                  <p><strong>Module Code:</strong> {c.module_code || 'N/A'}</p>
                  <p><strong>Class Type:</strong> {badge.label}</p>
                  <p><strong>Instructor:</strong> {getUserName(c.instructor_id)}</p>
                  <p><strong>Created:</strong> {new Date(c.created_at).toLocaleDateString()}</p>
                  <button 
                    onClick={() => deleteClass(c.id)}
                    className="btn-danger"
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    Delete Class
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SystemAdminDashboard;