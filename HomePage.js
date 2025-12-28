import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './LoginPage.js';
import RegisterPage from './RegisterPage.js';
import StudentDashboard from './StudentDashboard.js';
import InstructorDashboard from './InstructorDashboard.js';
import AdminDashboard from './AdminDashboard.js';
import ProfilePage from './ProfilePage.js';
import ExamAdminDashboard from './ExamAdminDashboard.js';

const HomePage = () => {
  const [page, setPage] = useState('login');
  const [users, setUsers] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', role: '' });
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    console.log('HomePage useEffect running...');
    
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const storedAssessments = JSON.parse(localStorage.getItem('assessments')) || [];
    const storedSubmissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const storedQuestions = JSON.parse(localStorage.getItem('questions')) || [];
    
    console.log('Loaded users from localStorage:', storedUsers);
    
    // Create default admin if no users exist
    let updatedUsers = storedUsers;
    if (storedUsers.length === 0) {
      const defaultAdmin = {
        id: Date.now(),
        name: 'System Administrator',
        email: 'admin@educonnect.com',
        password: 'admin123',
        role: 'System Administrator',
        active: true
      };
      updatedUsers = [defaultAdmin];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      console.log('Default admin created:', defaultAdmin);
    }
    
    setUsers(updatedUsers);
    setAssessments(storedAssessments);
    setSubmissions(storedSubmissions);
    setQuestions(storedQuestions);
    
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Stored user from localStorage:', storedUser);
    
    if (storedUser) {
      setCurrentUser(storedUser);
      if (storedUser.role === 'Student') setPage('student-dashboard');
      else if (storedUser.role === 'Instructor') setPage('instructor-dashboard');
      else if (storedUser.role === 'Exam Administrator') setPage('exam-admin-dashboard');
      else if (storedUser.role === 'System Administrator') setPage('admin-dashboard');
      else setPage('login'); // Fallback for unknown role
    } else {
      const hasAdmin = updatedUsers.some(u => u.role === 'System Administrator');
      if (updatedUsers.length === 0 || !hasAdmin) {
        setPage('register');
      } else {
        setPage('login');
      }
    }
    
    setIsLoading(false); // Data loaded
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
    console.log('Login attempt with:', loginData.email);
    console.log('Available users:', users);
    
    const user = users.find(u => 
      u.email === loginData.email && 
      u.password === loginData.password && 
      u.active !== false
    );
    
    if (user) {
      console.log('User found:', user);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      if (user.role === 'Student') setPage('student-dashboard');
      else if (user.role === 'Instructor') setPage('instructor-dashboard');
      else if (user.role === 'Exam Administrator') setPage('exam-admin-dashboard');
      else if (user.role === 'System Administrator') setPage('admin-dashboard');
      else setPage('login'); // Fallback
    } else {
      console.log('Login failed - no matching user found');
      alert('Invalid credentials or account deactivated');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (users.find(u => u.email === registerData.email)) {
      alert('User already exists');
      return;
    }
    const newUser = { 
      id: Date.now(), 
      name: registerData.name, 
      email: registerData.email, 
      password: registerData.password, 
      role: registerData.role, 
      active: true 
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    if (newUser.role === 'Student') setPage('student-dashboard');
    else if (newUser.role === 'Instructor') setPage('instructor-dashboard');
    else if (newUser.role === 'Exam Administrator') setPage('exam-admin-dashboard');
    else if (newUser.role === 'System Administrator') setPage('admin-dashboard');
    else setPage('login'); // Fallback
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
    if (!currentUser) {
      setPage('login');
      return;
    }
    
    if (currentUser.role === 'Student') setPage('student-dashboard');
    else if (currentUser.role === 'Instructor') setPage('instructor-dashboard');
    else if (currentUser.role === 'Exam Administrator') setPage('exam-admin-dashboard');
    else if (currentUser.role === 'System Administrator') setPage('admin-dashboard');
    else setPage('login'); // Fallback
  };

  // Add loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#333'
      }}>
        Loading EduConnect System...
      </div>
    );
  }

  // Render the appropriate page
  switch(page) {
    case 'login':
      return <LoginPage loginData={loginData} setLoginData={setLoginData} handleLogin={handleLogin} goToRegister={goToRegister} />;
    case 'register':
      return <RegisterPage registerData={registerData} setRegisterData={setRegisterData} handleRegister={handleRegister} goToLogin={goToLogin} />;
    case 'student-dashboard':
      return <StudentDashboard currentUser={currentUser} assessments={assessments} submissions={submissions} questions={questions} setSubmissions={setSubmissions} setQuestions={setQuestions} handleLogout={handleLogout} goToProfile={goToProfile} />;
    case 'instructor-dashboard':
      return <InstructorDashboard currentUser={currentUser} assessments={assessments} submissions={submissions} questions={questions} setAssessments={setAssessments} setSubmissions={setSubmissions} setQuestions={setQuestions} handleLogout={handleLogout} goToProfile={goToProfile} />;
    case 'exam-admin-dashboard':
      return <ExamAdminDashboard currentUser={currentUser} assessments={assessments} submissions={submissions} questions={questions} setAssessments={setAssessments} setSubmissions={setSubmissions} setQuestions={setQuestions} handleLogout={handleLogout} goToProfile={goToProfile} />;
    case 'admin-dashboard':
      return <AdminDashboard currentUser={currentUser} users={users} assessments={assessments} submissions={submissions} setUsers={setUsers} handleLogout={handleLogout} goToProfile={goToProfile} />;
    case 'profile':
      return <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} setUsers={setUsers} goBack={goBack} handleLogout={handleLogout} />;
    default:
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column'
        }}>
          <h2>Page not found: {page}</h2>
          <button onClick={() => {
            localStorage.removeItem('currentUser');
            setPage('login');
          }}>Go to Login</button>
        </div>
      );
  }
};

export default HomePage; 