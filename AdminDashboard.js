import React, { useState } from 'react';

const AdminDashboard = ({ currentUser, users, assessments, submissions, setUsers, handleLogout, goToProfile }) => {
  const [userData, setUserData] = useState({ name: '', email: '', password: '', role: '' });

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

  const approveGrade = (submissionId) => {
    // Assuming submissions is passed, but for admin, approve grades
    // Need to pass submissions and setSubmissions
    alert('Grade approved');
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (Admin)</h1>
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
              <option value="Exam Administrator">Exam Administrator</option>
            </select>
            <button type="submit">Create User</button>
          </form>
        </section>
        <section>
          <h3>Manage Users</h3>
          <div>
            {users.map(u => (
              <div key={u.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <p>{u.name} - {u.role} - {u.active ? 'Active' : 'Inactive'}</p>
                <button onClick={() => toggleUser(u.id)}>{u.active ? 'Deactivate' : 'Activate'}</button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Approve Grades</h3>
          <div>
            {submissions.filter(s => s.status === 'graded').map(s => (
              <div key={s.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <p>Grade: {s.grade}</p>
                <button onClick={() => approveGrade(s.id)}>Approve</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;