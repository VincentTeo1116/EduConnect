import React, { useState } from 'react';

const SystemAdminDashboard = ({ 
  currentUser, 
  users = [], 
  setUsers, 
  modules = [],
  setModules,
  classes = [],
  setClasses,
  handleLogout, 
  goToProfile
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

  // Helper function to generate invitation code
  const generateInvitationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  // Handle module creation
  const handleModuleSubmit = (e) => {
    e.preventDefault();
    
    // Generate module code
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
      const yyyy = now.getFullYear().toString();
      const randomSuffix = Math.floor(Math.random() * 90 + 10);
      
      return `${initials || 'MOD'}-${mm}${yyyy}-${randomSuffix}`;
    };
    
    const code = generateModuleCode(moduleData.name);
    const invitationCode = generateInvitationCode();
    
    const newModule = { 
      code, 
      name: moduleData.name, 
      description: moduleData.description,
      instructorId: moduleData.instructorId ? parseInt(moduleData.instructorId) : null,
      examAdminId: moduleData.examAdminId ? parseInt(moduleData.examAdminId) : null,
      invitation_code: invitationCode
    };
    
    const updatedModules = [...modules, newModule];
    setModules(updatedModules);
    localStorage.setItem('modules', JSON.stringify(updatedModules));
    setModuleData({ name: '', description: '', instructorId: '', examAdminId: '' });
    alert(`Module "${moduleData.name}" created with code: ${code}\nInvitation Code: ${invitationCode}`);
  };

  const handleGenerateInvitationCode = (moduleCode) => {
    const newCode = generateInvitationCode();
    
    // Update module
    const updatedModules = modules.map(m => 
      m.code === moduleCode ? { ...m, invitation_code: newCode } : m
    );
    setModules(updatedModules);
    localStorage.setItem('modules', JSON.stringify(updatedModules));
    
    alert(`New invitation code generated: ${newCode}`);
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

  const deleteModule = (moduleCode) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      const updatedModules = modules.filter(m => m.code !== moduleCode);
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
    }
  };

  // Class creation
  const handleClassSubmit = (e) => {
    e.preventDefault();
    
    if (!classData.moduleCode || !classData.classType || !classData.name) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Get count of existing classes for this module and type
    const existingClassesOfSameType = classes.filter(c => 
      c.module_code === classData.moduleCode
    );
    const classNumber = existingClassesOfSameType.length + 1;
    const displayName = `${classData.name} - ${classData.classType.charAt(0).toUpperCase() + classData.classType.slice(1)} ${classNumber}`;
    
    const newClass = { 
      id: Date.now(), 
      name: displayName,
      module_code: classData.moduleCode,
      class_type: classData.classType,
      students: [],
      display_code: `${classData.moduleCode}_${classData.classType}_${classNumber}`,
      created_at: new Date().toISOString()
    };
    
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    
    setClassData({ name: '', moduleCode: '', classType: 'lecture' });
    alert(`Class "${displayName}" created!`);
  };

  // Class deletion
  const deleteClass = (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      const updatedClasses = classes.filter(c => c.id !== classId);
      setClasses(updatedClasses);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
      alert('Class deleted successfully');
    }
  };

  const toggleUser = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
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

        <section id="manage-users">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Manage Users ({users.length})</h3>
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
                Select Instructor
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
                <option value="">Select Instructor</option>
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
                Select Exam Administrator
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
                <option value="">Select Exam Administrator</option>
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

        <section id="module-invitation">
          <h3>Module Invitation Codes</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px', 
            marginTop: '20px' 
          }}>
            {modules.map(m => {
              const instructorId = m.instructor_id || m.instructorId;
              const moduleClasses = classes.filter(c => c.module_code === m.code);
              
              return (
                <div key={m.code} className="item-card">
                  <h4>{m.name}</h4>
                  <p><strong>Code:</strong> {m.code}</p>
                  <div className="invitation-code-display">
                    {m.invitation_code || 'No code generated'}
                  </div>
                  
                  <div className="invite-actions">
                    <button 
                      onClick={() => handleGenerateInvitationCode(m.code)}
                      className="refresh-btn"
                    >
                      <i className="fas fa-sync-alt"></i>
                      {m.invitation_code ? 'Regenerate' : 'Generate'}
                    </button>
                    
                    {m.invitation_code && (
                      <button 
                        onClick={() => copyToClipboard(m.invitation_code)}
                        className="copy-btn"
                      >
                        <i className="fas fa-copy"></i>
                        Copy Code
                      </button>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '15px' }}>
                    <p><strong>How to invite students:</strong></p>
                    <ol style={{ margin: '10px 0', paddingLeft: '20px', fontSize: '14px' }}>
                      <li>Generate an invitation code</li>
                      <li>Share the code with students</li>
                      <li>Students enter the code in their dashboard</li>
                      <li>Students are automatically added to module classes</li>
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* Create Class form */}
        <section id="create-class-form">
          <h3>Create Class</h3>
          <form onSubmit={handleClassSubmit} className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Class Base Name (e.g., SDM Class)" 
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
            
            {/* Preview of generated class */}
            {classData.moduleCode && classData.classType && classData.name && (
              <div style={{ 
                padding: '12px 15px', 
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                fontSize: '14px'
              }}>
                <p style={{ margin: '0', fontWeight: '500' }}>Class Preview:</p>
                <p style={{ 
                  margin: '5px 0 0 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#667eea'
                }}>
                  {classData.name} - {classData.classType.charAt(0).toUpperCase() + classData.classType.slice(1)} {classes.filter(c => c.module_code === classData.moduleCode).length + 1}
                </p>
                <p style={{ 
                  margin: '5px 0 0 0', 
                  fontSize: '14px', 
                  color: '#666'
                }}>
                  <strong>Display Code:</strong> {classData.moduleCode}_{classData.classType}_{classes.filter(c => c.module_code === classData.moduleCode).length + 1}
                </p>
              </div>
            )}
            
            <button type="submit" className="btn-primary">Create Class</button>
          </form>
        </section>
        
        {/* Manage Classes */}
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
              const classType = c.class_type || 'lecture';
              const badge = getClassTypeBadge(classType);
              
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
                  <p><strong>Module Code:</strong> {c.module_code || 'N/A'}</p>
                  <p><strong>Students:</strong> {c.students?.length || 0}</p>
                  {c.created_at && (
                    <p><strong>Created:</strong> {new Date(c.created_at).toLocaleDateString()}</p>
                  )}
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