import React from 'react';

const LoginPage = ({ loginData, setLoginData, handleLogin, goToRegister }) => (
  <div className="form-container">
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
    </div>
    <h2>Login to EduConnect</h2>
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={loginData.email}
        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={loginData.password}
        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        required
      />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <button onClick={goToRegister}>Register</button></p>
  </div>
);

export default LoginPage;