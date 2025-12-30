// AdminDashboard.js - Updated version without modules/classes dependency
import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ currentUser, users, setUsers, handleLogout, goToProfile }) => {
  const [userData, setUserData] = useState({ name: '', email: '', password: '', role: '' });
  const [modules, setModules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [moduleData, setModuleData] = useState({ name: '', description: '' });
  const [classData, setClassData] = useState({ name: '', moduleCode: '' });

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
    const newUser = { id: Date.now(), name: userData.name, email: userData.email, password: userData.password, role: userData.role, active: true };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUserData({ name: '', email: '', password: '', role: '' });
    alert('User created');
  };

  const toggleUser = (userId) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, active: !u.active } : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleModuleSubmit = (e) => {
    e.preventDefault();
    // Generate module code: initials + -MMYYYY
    const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase();
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    const code = moduleData.name
      ? `${getInitials(moduleData.name)}-${mm}${yyyy}`
      : `MOD-${mm}${yyyy}`;
    const newModule = { code, name: moduleData.name, description: moduleData.description, instructorId: null, examAdminId: null };
    const updatedModules = [...modules, newModule];
    setModules(updatedModules);
    localStorage.setItem('modules', JSON.stringify(updatedModules));
    setModuleData({ name: '', description: '' });
    alert('Module created');
  };

  const deleteModule = (moduleCode) => {
    const updatedModules = modules.filter(m => m.code !== moduleCode);
    setModules(updatedModules);
    localStorage.setItem('modules', JSON.stringify(updatedModules));
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    const newClass = { id: Date.now(), name: classData.name, moduleCode: classData.moduleCode, students: [] };
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    setClassData({ name: '', moduleCode: '' });
    alert('Class created');
  };

  const deleteClass = (classId) => {
    const updatedClasses = classes.filter(c => c.id !== classId);
    setClasses(updatedClasses);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser?.name || 'Admin'} (System Administrator)</h1>
        </div>
        <div>
          <button onClick={goToProfile}>Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <section>
          <h3>Create User Account</h3>
          <form onSubmit={handleUserSubmit}>
            <input type="text" placeholder="Name" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={userData.password} onChange={(e) => setUserData({ ...userData, password: e.target.value })} required />
            <select value={userData.role} onChange={(e) => setUserData({ ...userData, role: e.target.value })} required>
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="System Administrator">System Administrator</option>
              <option value="Exam Administrator">Exam Administrator</option>
            </select>
            <button type="submit">Create User</button>
          </form>
        </section>
        
        <section>
          <h3>Manage Users ({users?.length || 0})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {users?.map(u => (
              <div key={u.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: u.active ? '#f8f9fa' : '#f5f5f5' }}>
                <h4>{u.name}</h4>
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Role:</strong> {u.role}</p>
                <p><strong>Status:</strong> {u.active ? '✅ Active' : '❌ Inactive'}</p>
                <button onClick={() => toggleUser(u.id)} style={{ 
                  backgroundColor: u.active ? '#dc3545' : '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  {u.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3>Create Module</h3>
          <form onSubmit={handleModuleSubmit}>
            <input type="text" placeholder="Module Name" value={moduleData.name} onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })} required />
            <textarea placeholder="Description" value={moduleData.description} onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })} required />
            <button type="submit">Create Module</button>
          </form>
        </section>
        
        <section>
          <h3>Manage Modules ({modules?.length || 0})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {modules?.map(m => (
              <div key={m.code} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <h4>{m.name}</h4>
                <p><strong>Code:</strong> {m.code}</p>
                <p><strong>Description:</strong> {m.description}</p>
                <button onClick={() => deleteModule(m.code)} style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  Delete Module
                </button>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h3>Create Class</h3>
          <form onSubmit={handleClassSubmit}>
            <input type="text" placeholder="Class Name" value={classData.name} onChange={(e) => setClassData({ ...classData, name: e.target.value })} required />
            <select value={classData.moduleCode} onChange={(e) => setClassData({ ...classData, moduleCode: e.target.value })} required>
              <option value="">Select Module</option>
              {modules?.map(m => <option key={m.code} value={m.code}>{m.name} ({m.code})</option>)}
            </select>
            <button type="submit">Create Class</button>
          </form>
        </section>
        
        <section>
          <h3>Manage Classes ({classes?.length || 0})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {classes?.map(c => (
              <div key={c.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <h4>{c.name}</h4>
                <p><strong>Module:</strong> {modules?.find(m => m.code === c.moduleCode)?.name || 'Unknown'}</p>
                <p><strong>Module Code:</strong> {c.moduleCode}</p>
                <p><strong>Students:</strong> {c.students?.length || 0}</p>
                <button onClick={() => deleteClass(c.id)} style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  Delete Class
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;