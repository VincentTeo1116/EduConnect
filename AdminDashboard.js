// AdminDashboard.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ currentUser, users = [], setUsers, handleLogout, goToProfile }) => {
  console.log('AdminDashboard rendering with:', { 
    currentUser: currentUser?.name, 
    usersCount: users?.length 
  });

  // Safety check - if no currentUser, show error
  if (!currentUser) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No User Logged In</h2>
        <p>Please log in to access the admin dashboard.</p>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
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
  const [isLoading, setIsLoading] = useState(true);

  // Load modules and classes from localStorage
  useEffect(() => {
    try {
      console.log('Loading data from localStorage...');
      const storedModules = JSON.parse(localStorage.getItem('modules')) || [];
      const storedClasses = JSON.parse(localStorage.getItem('classes')) || [];
      console.log('Loaded modules:', storedModules.length, 'classes:', storedClasses.length);
      setModules(storedModules);
      setClasses(storedClasses);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setModules([]);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUserSubmit = (e) => {
    e.preventDefault();
    try {
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
      alert('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  const toggleUser = (userId) => {
    try {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, active: !u.active } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error toggling user:', error);
      alert('Error updating user status');
    }
  };

  const handleModuleSubmit = (e) => {
    e.preventDefault();
    try {
      // Generate module code: initials + -MMYYYY
      const getInitials = (name) => {
        if (!name || name.trim() === '') return 'MOD';
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
      alert(`Module "${moduleData.name}" created with code: ${code}`);
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Error creating module');
    }
  };

  const deleteModule = (moduleCode) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        const updatedModules = modules.filter(m => m.code !== moduleCode);
        setModules(updatedModules);
        localStorage.setItem('modules', JSON.stringify(updatedModules));
      } catch (error) {
        console.error('Error deleting module:', error);
      }
    }
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    try {
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
      alert('Class created successfully');
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class');
    }
  };

  const deleteClass = (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        const updatedClasses = classes.filter(c => c.id !== classId);
        setClasses(updatedClasses);
        localStorage.setItem('classes', JSON.stringify(updatedClasses));
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div className="loading-spinner"></div>
        <h3>Loading Admin Dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#007bff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            EC
          </div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>
            Welcome, <span style={{ color: '#007bff' }}>{currentUser.name}</span> (System Administrator)
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={goToProfile}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Profile
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Create User Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Create User Account</h3>
          <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={userData.name} 
              onChange={(e) => setUserData({ ...userData, name: e.target.value })} 
              required
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={userData.email} 
              onChange={(e) => setUserData({ ...userData, email: e.target.value })} 
              required
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={userData.password} 
              onChange={(e) => setUserData({ ...userData, password: e.target.value })} 
              required
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <select 
              value={userData.role} 
              onChange={(e) => setUserData({ ...userData, role: e.target.value })} 
              required
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Exam Administrator">Exam Administrator</option>
            </select>
            <button 
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Create User
            </button>
          </form>
        </section>

        {/* Manage Users Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
            Manage Users ({users.length})
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {users.map(u => (
              <div 
                key={u.id} 
                style={{ 
                  border: '1px solid #e9ecef',
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: u.active ? 'white' : '#f8f9fa'
                }}
              >
                <h4 style={{ marginTop: 0, color: '#333' }}>{u.name}</h4>
                <p style={{ margin: '8px 0' }}><strong>Email:</strong> {u.email}</p>
                <p style={{ margin: '8px 0' }}><strong>Role:</strong> {u.role}</p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Status:</strong> 
                  <span style={{ 
                    color: u.active ? '#28a745' : '#dc3545',
                    fontWeight: 'bold',
                    marginLeft: '8px'
                  }}>
                    {u.active ? '✅ Active' : '❌ Inactive'}
                  </span>
                </p>
                <button 
                  onClick={() => toggleUser(u.id)}
                  style={{ 
                    width: '100%',
                    padding: '10px',
                    backgroundColor: u.active ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '15px',
                    fontSize: '14px'
                  }}
                >
                  {u.active ? 'Deactivate User' : 'Activate User'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Create Module Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Create Module</h3>
          <form onSubmit={handleModuleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Module Name (e.g., Software Development)" 
              value={moduleData.name} 
              onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })} 
              required
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <textarea 
              placeholder="Module Description" 
              value={moduleData.description} 
              onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })} 
              required
              rows="4"
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
            <button 
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Create Module
            </button>
          </form>
        </section>

        {/* Manage Modules Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
            Manage Modules ({modules.length})
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {modules.map(m => (
              <div 
                key={m.code} 
                style={{ 
                  border: '1px solid #e9ecef',
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                <h4 style={{ marginTop: 0, color: '#007bff' }}>{m.name}</h4>
                <p style={{ margin: '8px 0' }}><strong>Code:</strong> {m.code}</p>
                <p style={{ margin: '8px 0' }}><strong>Description:</strong> {m.description}</p>
                <button 
                  onClick={() => deleteModule(m.code)}
                  style={{ 
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '15px',
                    fontSize: '14px'
                  }}
                >
                  Delete Module
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Create Class Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Create Class</h3>
          <form onSubmit={handleClassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Class Name (e.g., SDM Class A)" 
              value={classData.name} 
              onChange={(e) => setClassData({ ...classData, name: e.target.value })} 
              required
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <select 
              value={classData.moduleCode} 
              onChange={(e) => setClassData({ ...classData, moduleCode: e.target.value })} 
              required
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
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
            <button 
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Create Class
            </button>
          </form>
        </section>

        {/* Manage Classes Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
            Manage Classes ({classes.length})
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {classes.map(c => {
              const module = modules.find(m => m.code === c.moduleCode);
              return (
                <div 
                  key={c.id} 
                  style={{ 
                    border: '1px solid #e9ecef',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <h4 style={{ marginTop: 0, color: '#17a2b8' }}>{c.name}</h4>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Module:</strong> {module?.name || 'Unknown Module'}
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Module Code:</strong> {c.moduleCode}
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Students Enrolled:</strong> {(c.students || []).length}
                  </p>
                  <button 
                    onClick={() => deleteClass(c.id)}
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '15px',
                      fontSize: '14px'
                    }}
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

export default AdminDashboard;