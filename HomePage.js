import React, { useState, useEffect } from 'react';
import './App.css';

// Debug wrapper for components
const createDebugComponent = (name, Component) => {
  return (props) => {
    try {
      console.log(`Rendering ${name} with props:`, props);
      return <Component {...props} />;
    } catch (error) {
      console.error(`Error rendering ${name}:`, error);
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828' }}>
          <h2>⚠️ Error in {name}</h2>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
  };
};

// Try to import components with error handling
let LoginPage, RegisterPage, StudentDashboard, InstructorDashboard, AdminDashboard, ProfilePage, ExamAdminDashboard;

try {
  LoginPage = require('./LoginPage.js').default;
  LoginPage = createDebugComponent('LoginPage', LoginPage);
} catch (error) {
  console.error('Error loading LoginPage:', error);
  LoginPage = () => <div>Error loading LoginPage: {error.message}</div>;
}

try {
  RegisterPage = require('./RegisterPage.js').default;
  RegisterPage = createDebugComponent('RegisterPage', RegisterPage);
} catch (error) {
  console.error('Error loading RegisterPage:', error);
  RegisterPage = () => <div>Error loading RegisterPage: {error.message}</div>;
}

try {
  StudentDashboard = require('./StudentDashboard.js').default;
  StudentDashboard = createDebugComponent('StudentDashboard', StudentDashboard);
} catch (error) {
  console.error('Error loading StudentDashboard:', error);
  StudentDashboard = () => <div>Error loading StudentDashboard: {error.message}</div>;
}

try {
  InstructorDashboard = require('./InstructorDashboard.js').default;
  InstructorDashboard = createDebugComponent('InstructorDashboard', InstructorDashboard);
} catch (error) {
  console.error('Error loading InstructorDashboard:', error);
  InstructorDashboard = () => <div>Error loading InstructorDashboard: {error.message}</div>;
}

try {
  AdminDashboard = require('./AdminDashboard.js').default;
  AdminDashboard = createDebugComponent('AdminDashboard', AdminDashboard);
} catch (error) {
  console.error('Error loading AdminDashboard:', error);
  AdminDashboard = () => <div>Error loading AdminDashboard: {error.message}</div>;
}

try {
  ProfilePage = require('./ProfilePage.js').default;
  ProfilePage = createDebugComponent('ProfilePage', ProfilePage);
} catch (error) {
  console.error('Error loading ProfilePage:', error);
  ProfilePage = () => <div>Error loading ProfilePage: {error.message}</div>;
}

try {
  ExamAdminDashboard = require('./ExamAdminDashboard.js').default;
  ExamAdminDashboard = createDebugComponent('ExamAdminDashboard', ExamAdminDashboard);
} catch (error) {
  console.error('Error loading ExamAdminDashboard:', error);
  ExamAdminDashboard = () => <div>Error loading ExamAdminDashboard: {error.message}</div>;
}

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
  const [error, setError] = useState(null);

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
      setError('Error loading application: ' + error.message);
      setPage('login');
    } finally {
      setIsLoading(false);
      console.log('Initialization complete, page:', page);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', loginData.email);
    
    try {
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
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + error.message);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    try {
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
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration error: ' + error.message);
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

  // Show error screen
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#ffebee',
        color: '#c62828'
      }}>
        <h1>⚠️ Application Error</h1>
        <p>{error}</p>
        <p>Check browser console for details</p>
        <button onClick={() => window.location.reload()} style={{
          padding: '10px 20px',
          backgroundColor: '#c62828',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Reload Application
        </button>
      </div>
    );
  }

  // Show loading screen
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>Loading EduConnect System...</h2>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  console.log('Rendering page:', page);

  // Simple fallback components for testing
  const SimpleLoginPage = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      padding: '20px'
    }}>
      <h1>EduConnect Login (Fallback)</h1>
      <p>This is a fallback login page</p>
      <button onClick={() => {
        const testUser = {
          id: Date.now(),
          name: 'Test User',
          email: 'test@test.com',
          password: 'test123',
          role: 'Student',
          active: true
        };
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        setCurrentUser(testUser);
        setPage('student-dashboard');
      }}>
        Test Login as Student
      </button>
      <button onClick={() => {
        const testAdmin = {
          id: Date.now(),
          name: 'System Admin',
          email: 'admin@educonnect.com',
          password: 'admin123',
          role: 'System Administrator',
          active: true
        };
        localStorage.setItem('currentUser', JSON.stringify(testAdmin));
        setCurrentUser(testAdmin);
        setPage('admin-dashboard');
      }}>
        Test Login as System Admin
      </button>
    </div>
  );

  // Render the appropriate page based on state
  try {
    switch(page) {
      case 'login':
        return <LoginPage 
          loginData={loginData} 
          setLoginData={setLoginData} 
          handleLogin={handleLogin} 
          goToRegister={goToRegister} 
        />;
        
      case 'register':
        return <RegisterPage 
          registerData={registerData} 
          setRegisterData={setRegisterData} 
          handleRegister={handleRegister} 
          goToLogin={goToLogin} 
        />;
        
      case 'student-dashboard':
        return <StudentDashboard 
          currentUser={currentUser} 
          assessments={assessments} 
          submissions={submissions} 
          questions={questions} 
          setSubmissions={setSubmissions} 
          setQuestions={setQuestions} 
          handleLogout={handleLogout} 
          goToProfile={goToProfile} 
        />;
        
      case 'instructor-dashboard':
        return <InstructorDashboard 
          currentUser={currentUser} 
          assessments={assessments} 
          submissions={submissions} 
          questions={questions} 
          setAssessments={setAssessments} 
          setSubmissions={setSubmissions} 
          setQuestions={setQuestions} 
          handleLogout={handleLogout} 
          goToProfile={goToProfile} 
        />;
        
      case 'exam-admin-dashboard':
        return <ExamAdminDashboard 
          currentUser={currentUser} 
          assessments={assessments} 
          submissions={submissions} 
          questions={questions} 
          setAssessments={setAssessments} 
          setSubmissions={setSubmissions} 
          setQuestions={setQuestions} 
          handleLogout={handleLogout} 
          goToProfile={goToProfile} 
        />;
        
      case 'admin-dashboard':
        return <AdminDashboard 
          currentUser={currentUser} 
          users={users} 
          assessments={assessments} 
          submissions={submissions} 
          setUsers={setUsers} 
          handleLogout={handleLogout} 
          goToProfile={goToProfile} 
        />;
        
      case 'profile':
        return <ProfilePage 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          users={users} 
          setUsers={setUsers} 
          goBack={goBack} 
          handleLogout={handleLogout} 
        />;
        
      default:
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2>Page Not Found: {page}</h2>
            <button onClick={goToLogin} style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}>
              Go to Login Page
            </button>
          </div>
        );
    }
  } catch (renderError) {
    console.error('Error rendering page:', renderError);
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#fff3cd',
        color: '#856404'
      }}>
        <h1>⚠️ Render Error</h1>
        <p>Error rendering page "{page}": {renderError.message}</p>
        <button onClick={() => {
          localStorage.removeItem('currentUser');
          setPage('login');
        }} style={{
          padding: '10px 20px',
          backgroundColor: '#856404',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Reset to Login
        </button>
      </div>
    );
  }
};

export default HomePage;