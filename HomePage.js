import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming you have a CSS file for styling

const HomePage = () => {
  const [page, setPage] = useState('login');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      setCurrentUser(storedUser);
      setPage('home');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginData.email && u.password === loginData.password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setPage('home');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (users.find(u => u.email === registerData.email)) {
      alert('User already exists');
      return;
    }
    const newUser = { ...registerData, id: Date.now() };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setPage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setPage('login');
  };

  const LoginForm = () => (
    <div className="form-container">
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
      <p>Don't have an account? <button onClick={() => setPage('register')}>Register</button></p>
    </div>
  );

  const RegisterForm = () => (
    <div className="form-container">
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
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <button onClick={() => setPage('login')}>Login</button></p>
    </div>
  );

  const MainPage = () => (
    <div className="main-container">
      <header>
        <h1>Welcome to EduConnect Learning Centre, {currentUser.name}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main>
        <section>
          <h2>Available Courses</h2>
          <ul>
            <li>Introduction to Programming</li>
            <li>Data Structures and Algorithms</li>
            <li>Web Development</li>
            <li>Machine Learning Basics</li>
          </ul>
        </section>
        <section>
          <h2>Your Progress</h2>
          <p>Track your learning progress here.</p>
        </section>
      </main>
    </div>
  );

  if (page === 'login') return <LoginForm />;
  if (page === 'register') return <RegisterForm />;
  if (page === 'home') return <MainPage />;
};

export default HomePage;