import React, { useState } from 'react';

const ProfilePage = ({ currentUser, setCurrentUser, users, setUsers, goBack, handleLogout }) => {
  const [profileData, setProfileData] = useState({ name: currentUser.name, email: currentUser.email });

  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedUser = { ...currentUser, name: profileData.name, email: profileData.email };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    localStorage.setItem('users', JSON.stringify(users.map(u => u.id === currentUser.id ? updatedUser : u)));
    alert('Profile updated');
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Profile</h1>
        </div>
        <div>
          <button onClick={goBack}>Back</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <section>
          <h3>Update Profile</h3>
          <form onSubmit={handleUpdate}>
            <input type="text" placeholder="Name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} required />
            <button type="submit">Update</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;