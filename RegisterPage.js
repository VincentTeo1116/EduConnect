import React from 'react';

const RegisterPage = ({ registerData, setRegisterData, handleRegister, goToLogin }) => (
  <div className="form-container">
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
    </div>
    <h2>Register for EduConnect</h2>
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Name"
        value={registerData.name}
        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={registerData.email}
        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={registerData.password}
        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
        required
      />
      <select
        value={registerData.role}
        onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
        required
      >
        <option value="">Select Role</option>
        <option value="Student">Student</option>
        <option value="Instructor">Instructor</option>
        <option value="Exam Administrator">Exam Administrator</option>
      </select>
      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <button onClick={goToLogin}>Login</button></p>
  </div>
);

export default RegisterPage;