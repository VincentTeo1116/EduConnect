import React, { useState } from 'react';

const AdminDashboard = ({ currentUser, users, modules, classes, setUsers, setModules, setClasses, handleLogout, goToProfile }) => {
  const [userData, setUserData] = useState({ name: '', email: '', password: '', role: '' });
  const [moduleData, setModuleData] = useState({ name: '', description: '' });
  const [classData, setClassData] = useState({ name: '', moduleCode: '' });

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (users.find(u => u.email === userData.email)) {
      alert('User already exists');
      return;
    }
    const newUser = { id: Date.now(), name: userData.name, email: userData.email, password: userData.password, role: userData.role, active: true };
    setUsers(prev => [...prev, newUser]);
    localStorage.setItem('users', JSON.stringify([...users, newUser]));
    setUserData({ name: '', email: '', password: '', role: '' });
    alert('User created');
  };

  const toggleUser = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));
    const updated = users.map(u => u.id === userId ? { ...u, active: !u.active } : u);
    localStorage.setItem('users', JSON.stringify(updated));
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
    setModules(prev => [...prev, newModule]);
    localStorage.setItem('modules', JSON.stringify([...modules, newModule]));
    setModuleData({ name: '', description: '' });
    alert('Module created');
  };

  const deleteModule = (moduleCode) => {
    setModules(prev => prev.filter(m => m.code !== moduleCode));
    const updated = modules.filter(m => m.code !== moduleCode);
    localStorage.setItem('modules', JSON.stringify(updated));
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    const newClass = { id: Date.now(), name: classData.name, moduleCode: classData.moduleCode, students: [] };
    setClasses(prev => [...prev, newClass]);
    localStorage.setItem('classes', JSON.stringify([...classes, newClass]));
    setClassData({ name: '', moduleCode: '' });
    alert('Class created');
  };

  const deleteClass = (classId) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    const updated = classes.filter(c => c.id !== classId);
    localStorage.setItem('classes', JSON.stringify(updated));
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (Admin)</h1>
        </div>
        <div>
          <button className="form-container" style={{ width: 'auto', padding: '10px 24px', marginRight: '10px' }} onClick={goToProfile}>Profile</button>
          <button className="form-container" style={{ width: 'auto', padding: '10px 24px' }} onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <section>
          <h3>Create User Account</h3>
          <form className="form-container" onSubmit={handleUserSubmit}>
            <input type="text" placeholder="Name" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={userData.password} onChange={(e) => setUserData({ ...userData, password: e.target.value })} required />
            <select value={userData.role} onChange={(e) => setUserData({ ...userData, role: e.target.value })} required>
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="Admin">Admin</option>
              <option value="Exam Administrator">Exam Administrator</option>
            </select>
            <button type="submit">Create User</button>
          </form>
        </section>
        <section>
          <h3>Manage Users</h3>
          <div>
            {users.map(u => (
              <div key={u.id} className="form-container" style={{ border: '1px solid #e1e5e9', padding: '18px', margin: '10px 0', background: 'rgba(255,255,255,0.95)' }}>
                <p style={{ fontWeight: '500', color: '#333' }}>{u.name} - {u.role} - {u.active ? 'Active' : 'Inactive'}</p>
                <button style={{ width: 'auto', padding: '10px 24px', marginTop: '8px' }} onClick={() => toggleUser(u.id)}>{u.active ? 'Deactivate' : 'Activate'}</button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Create Module</h3>
          <form className="form-container" onSubmit={handleModuleSubmit}>
            <input type="text" placeholder="Module Name" value={moduleData.name} onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })} required />
            <textarea style={{ width: '100%', padding: '15px', margin: '10px 0', border: '2px solid #e1e5e9', borderRadius: '10px', fontSize: '16px', background: 'rgba(255,255,255,0.8)' }} placeholder="Description" value={moduleData.description} onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })} required />
            <button type="submit">Create Module</button>
          </form>
        </section>
        <section>
          <h3>Manage Modules</h3>
          <div>
            {modules.map(m => (
              <div key={m.code} className="form-container" style={{ border: '1px solid #e1e5e9', padding: '18px', margin: '10px 0', background: 'rgba(255,255,255,0.95)' }}>
                <p style={{ fontWeight: '500', color: '#333' }}>{m.name} - {m.description}</p>
                <button style={{ width: 'auto', padding: '10px 24px', marginTop: '8px' }} onClick={() => deleteModule(m.code)}>Delete</button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Create Class</h3>
          <form className="form-container" onSubmit={handleClassSubmit}>
            <input type="text" placeholder="Class Name" value={classData.name} onChange={(e) => setClassData({ ...classData, name: e.target.value })} required />
            <select value={classData.moduleCode} onChange={(e) => setClassData({ ...classData, moduleCode: e.target.value })} required>
              <option value="">Select Module</option>
              {modules.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
            </select>
            <button type="submit">Create Class</button>
          </form>
        </section>
        <section>
          <h3>Manage Classes</h3>
          <div>
            {classes.map(c => (
              <div key={c.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <p>{c.name} - Module: {modules.find(m => m.code === c.moduleCode)?.name}</p>
                <button onClick={() => deleteClass(c.id)}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;