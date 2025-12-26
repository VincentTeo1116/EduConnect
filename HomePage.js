import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './LoginPage.js';
import RegisterPage from './RegisterPage.js';
import StudentDashboard from './StudentDashboard.js';
import InstructorDashboard from './InstructorDashboard.js';
import AdminDashboard from './AdminDashboard.js';
import ProfilePage from './ProfilePage.js';

const HomePage = () => {
  const [page, setPage] = useState('login');
  const [users, setUsers] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', role: '' });

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const storedAssessments = JSON.parse(localStorage.getItem('assessments')) || [];
    const storedSubmissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const storedQuestions = JSON.parse(localStorage.getItem('questions')) || [];
    setUsers(storedUsers);
    setAssessments(storedAssessments);
    setSubmissions(storedSubmissions);
    setQuestions(storedQuestions);
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      setCurrentUser(storedUser);
      if (storedUser.role === 'Student') setPage('student-dashboard');
      else if (storedUser.role === 'Instructor') setPage('instructor-dashboard');
      else if (storedUser.role === 'Exam Administrator') setPage('admin-dashboard');
    } else {
      const hasAdmin = storedUsers.some(u => u.role === 'Exam Administrator');
      if (storedUsers.length === 0 || !hasAdmin) {
        setPage('register');
      } else {
        setPage('login');
      }
    }
  }, []);

  const saveData = () => {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('assessments', JSON.stringify(assessments));
    localStorage.setItem('submissions', JSON.stringify(submissions));
    localStorage.setItem('questions', JSON.stringify(questions));
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginData.email && u.password === loginData.password && u.active !== false);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (user.role === 'Student') setPage('student-dashboard');
      else if (user.role === 'Instructor') setPage('instructor-dashboard');
      else if (user.role === 'Exam Administrator') setPage('admin-dashboard');
    } else {
      alert('Invalid credentials or account deactivated');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (users.find(u => u.email === registerData.email)) {
      alert('User already exists');
      return;
    }
    const newUser = { id: Date.now(), name: registerData.name, email: registerData.email, password: registerData.password, role: registerData.role, active: true };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    saveData();
    if (newUser.role === 'Student') setPage('student-dashboard');
    else if (newUser.role === 'Instructor') setPage('instructor-dashboard');
    else if (newUser.role === 'Exam Administrator') setPage('admin-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setPage('login');
  };

  const goToRegister = () => setPage('register');
  const goToLogin = () => setPage('login');
  const goToProfile = () => setPage('profile');
  const goBack = () => {
    if (currentUser.role === 'Student') setPage('student-dashboard');
    else if (currentUser.role === 'Instructor') setPage('instructor-dashboard');
    else if (currentUser.role === 'Exam Administrator') setPage('admin-dashboard');
  };

  if (page === 'login') return <LoginPage loginData={loginData} setLoginData={setLoginData} handleLogin={handleLogin} goToRegister={goToRegister} />;
  if (page === 'register') return <RegisterPage registerData={registerData} setRegisterData={setRegisterData} handleRegister={handleRegister} goToLogin={goToLogin} />;
  if (page === 'student-dashboard') return <StudentDashboard currentUser={currentUser} assessments={assessments} submissions={submissions} questions={questions} setSubmissions={setSubmissions} setQuestions={setQuestions} handleLogout={handleLogout} goToProfile={goToProfile} />;
  if (page === 'instructor-dashboard') return <InstructorDashboard currentUser={currentUser} assessments={assessments} submissions={submissions} questions={questions} setAssessments={setAssessments} setSubmissions={setSubmissions} setQuestions={setQuestions} handleLogout={handleLogout} goToProfile={goToProfile} />;
  if (page === 'admin-dashboard') return <AdminDashboard currentUser={currentUser} users={users} assessments={assessments} submissions={submissions} setUsers={setUsers} handleLogout={handleLogout} goToProfile={goToProfile} />;
  if (page === 'profile') return <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} setUsers={setUsers} goBack={goBack} handleLogout={handleLogout} />;
  return <div>Page not found</div>;
};

export default HomePage;