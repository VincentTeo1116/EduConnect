import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './LoginPage.js';
import RegisterPage from './RegisterPage.js';
import StudentDashboard from './StudentDashboard.js';
import InstructorDashboard from './InstructorDashboard.js';
import { AdminDashboard } from './AdminDashboard.js';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('HomePage useEffect running...');
    
    try {
      // Load all data from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
      const storedAssessments = JSON.parse(localStorage.getItem('assessments')) || [];
      const storedSubmissions = JSON.parse(localStorage.getItem('submissions')) || [];
      const storedQuestions = JSON.parse(localStorage.getItem('questions')) || [];
      
      console.log('Loaded users from localStorage:', storedUsers);
      
      // Create default admin if no users exist
      let updatedUsers = storedUsers;
      if (storedUsers.length === 0) {
        console.log('No users found, creating default admin...');
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
        if (storedUser.role === 'Student') {
          setPage('student-dashboard');
        } else if (storedUser.role === 'Instructor') {
          setPage('instructor-dashboard');
        } else if (storedUser.role === 'Exam Administrator') {
          setPage('exam-admin-dashboard');
        } else if (storedUser.role === 'System Administrator') {
          setPage('admin-dashboard');
        } else {
          console.warn('Unknown role:', storedUser.role);
          setPage('login');
        }
      } else {
        console.log('No stored user found');
        const hasAdmin = updatedUsers.some(u => u.role === 'System Administrator');
        if (updatedUsers.length === 0 || !hasAdmin) {
          setPage('register');
        } else {
          setPage('login');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPage('login');
    } finally {
      setIsLoading(false);
      console.log('Initialization complete, page:', page);
    }
  }, []);

  const saveData = () => {
    try {
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('assessments', JSON.stringify(assessments));
      localStorage.setItem('submissions', JSON.stringify(submissions));
      localStorage.setItem('questions', JSON.stringify(questions));
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
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
      
      if (user.role === 'Student') {
        setPage('student-dashboard');
      } else if (user.role === 'Instructor') {
        setPage('instructor-dashboard');
      } else if (user.role === 'Exam Administrator') {
        setPage('exam-admin-dashboard');
      } else if (user.role === 'System Administrator') {
        setPage('admin-dashboard');
      } else {
        console.warn('Unknown role after login:', user.role);
        setPage('login');
      }
    } else {
      console.log('Login failed - no matching user found');
      alert('Invalid credentials or account deactivated');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === registerData.email);
    if (existingUser) {
      alert('User already exists with this email');
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
    
    console.log('New user registered:', newUser);
    
    if (newUser.role === 'Student') {
      setPage('student-dashboard');
    } else if (newUser.role === 'Instructor') {
      setPage('instructor-dashboard');
    } else if (newUser.role === 'Exam Administrator') {
      setPage('exam-admin-dashboard');
    } else if (newUser.role === 'System Administrator') {
      setPage('admin-dashboard');
    } else {
      console.warn('Unknown role after registration:', newUser.role);
      setPage('login');
    }
  };

  const handleLogout = () => {
    console.log('Logging out user:', currentUser?.name);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setPage('login');
    setLoginData({ email: '', password: '' });
  };

  const goToRegister = () => {
    console.log('Going to register page');
    setPage('register');
    setRegisterData({ name: '', email: '', password: '', role: '' });
  };

  const goToLogin = () => {
    console.log('Going to login page');
    setPage('login');
    setLoginData({ email: '', password: '' });
  };

  const goToProfile = () => {
    console.log('Going to profile page');
    setPage('profile');
  };

  const goBack = () => {
    console.log('Going back from profile');
    if (!currentUser) {
      setPage('login');
      return;
    }
    
    if (currentUser.role === 'Student') {
      setPage('student-dashboard');
    } else if (currentUser.role === 'Instructor') {
      setPage('instructor-dashboard');
    } else if (currentUser.role === 'Exam Administrator') {
      setPage('exam-admin-dashboard');
    } else if (currentUser.role === 'System Administrator') {
      setPage('admin-dashboard');
    } else {
      setPage('login');
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>Loading EduConnect System...</h2>
      </div>
    );
  }

  // Render the appropriate page based on state
  switch(page) {
    case 'login':
      return (
        <LoginPage 
          loginData={loginData} 
          setLoginData={setLoginData} 
          handleLogin={handleLogin} 
          goToRegister={goToRegister} 
        />
      );
      
    case 'register':
      return (
        <RegisterPage 
          registerData={registerData} 
          setRegisterData={setRegisterData} 
          handleRegister={handleRegister} 
          goToLogin={goToLogin} 
        />
      );
      
    case 'student-dashboard':
      return (
        <StudentDashboard 
          currentUser={currentUser} 
          assessments={assessments} 
          submissions={submissions} 
          questions={questions} 
          setSubmissions={setSubmissions} 
          setQuestions={setQuestions} 
          handleLogout={handleLogout} 
          goToProfile={goToProfile} 
        />
      );
      
    case 'instructor-dashboard':
      return (
        <InstructorDashboard 
          currentUser={currentUser} 
          assessments={assessments} 
          submissions={submissions} 
          questions={questions} 
          setAssessments={setAssessments} 
          setSubmissions={setSubmissions} 
          setQuestions={setQuestions} 
          handleLogout={handleLogout} 
          goToProfile={goToProfile} 
        />
      );
      
    case 'exam-admin-dashboard':
      return (
        <ExamAdminDashboard 
          currentUser={currentUser} 
          assessments={assessments} 
          submissions={submissions} 
          questions={questions} 
          setAssessments={setAssessments} 
          setSubmissions={setSubmissions} 
          setQuestions={setQuestions} 
          handleLogout={handleLogout} 
          goToProfile={goToProfile} 
        />
      );
      
    case 'admin-dashboard':
      return (
        <AdminDashboard 
          currentUser={currentUser} 
          users={users} 
          assessments={assessments} 
          submissions={submissions} 
          setUsers={setUsers} 
          handleLogout={handleLogout} 
          goToProfile={goToProfile} 
        />
      );
      
    case 'profile':
      return (
        <ProfilePage 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          users={users} 
          setUsers={setUsers} 
          goBack={goBack} 
          handleLogout={handleLogout} 
        />
      );
      
    default:
      return (
        <div className="error-page">
          <h2>Page Not Found</h2>
          <p>The page "{page}" could not be found.</p>
          <button onClick={goToLogin} className="btn-primary">
            Go to Login Page
          </button>
        </div>
      );
  }
};

export default HomePage;