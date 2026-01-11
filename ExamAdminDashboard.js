import React, { useState, useEffect } from 'react';

const ExamAdminDashboard = ({ 
  currentUser, 
  assessments, 
  submissions, 
  users, 
  handleLogout, 
  goToProfile,
  modules = []
}) => {
  const [userModules, setUserModules] = useState([]);

  useEffect(() => {
    loadUserModules();
  }, [modules, currentUser]);

  const loadUserModules = () => {
    const examAdminModules = modules.filter(m => 
      m.exam_admin_id === currentUser.id || m.examAdminId === currentUser.id
    );
    setUserModules(examAdminModules);
  };

  const groupedSubmissions = {};
  assessments.forEach(assessment => {
    const assessmentSubmissions = submissions.filter(s => s.assessmentId === assessment.id);
    if (assessmentSubmissions.length > 0) {
      groupedSubmissions[assessment.id] = {
        assessment,
        submissions: assessmentSubmissions
      };
    }
  });

  const assessmentStats = assessments.map(assessment => {
    const assessmentSubmissions = submissions.filter(s => s.assessmentId === assessment.id && s.grade);
    const totalGrade = assessmentSubmissions.reduce((sum, s) => sum + parseFloat(s.grade || 0), 0);
    const averageGrade = assessmentSubmissions.length > 0 ? totalGrade / assessmentSubmissions.length : 0;
    
    return {
      ...assessment,
      submissionCount: assessmentSubmissions.length,
      averageGrade: averageGrade.toFixed(2)
    };
  });

  const openModule = (moduleCode) => {
    window.location.href = `?page=module&module=${moduleCode}`;
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (Exam Administrator)</h1>
        </div>
        <div>
          <button onClick={goToProfile} className="btn-secondary">Profile</button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </header>
      <main>
        <section className="welcome-banner">
          <h2 className="welcome-title">Exam Administration Dashboard</h2>
          <p className="welcome-subtitle">
            Monitor assessment results, grades, and feedback across all courses
          </p>
        </section>
        
        <section>
          <h3>My Modules ({userModules.length})</h3>
          {userModules.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-book" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h4>No modules assigned</h4>
              <p>Contact the system administrator to get assigned to modules.</p>
            </div>
          ) : (
            <div className="quick-actions">
              {userModules.map(module => (
                <div key={module.code} className="item-card" onClick={() => openModule(module.code)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4>{module.name}</h4>
                      <p style={{ color: '#666', marginBottom: '10px' }}>{module.code}</p>
                      <p style={{ fontSize: '14px', marginBottom: '15px' }}>{module.description}</p>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Exam Admin
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '10px',
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid #eee'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Assessments</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#3498db' }}>
                        {assessments.filter(a => a.moduleCode === module.code || a.course === module.name).length}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>To Approve</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#e74c3c' }}>
                        {submissions.filter(s => {
                          const assessment = assessments.find(a => a.id === s.assessmentId);
                          return assessment && (assessment.moduleCode === module.code || assessment.course === module.name) && 
                                 s.status === 'graded' && !s.approvedByExamAdmin;
                        }).length}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Approved</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#2ecc71' }}>
                        {submissions.filter(s => {
                          const assessment = assessments.find(a => a.id === s.assessmentId);
                          return assessment && (assessment.moduleCode === module.code || assessment.course === module.name) && 
                                 s.approvedByExamAdmin;
                        }).length}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <button className="btn-primary" style={{ width: '100%' }}>
                      <i className="fas fa-external-link-alt"></i> Open Module
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section>
          <h3>Assessment Statistics ({assessments.length})</h3>
          {assessments.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-chart-bar" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h4>No assessments yet</h4>
              <p>Assessment statistics will appear here once instructors create assessments.</p>
            </div>
          ) : (
            <div className="quick-actions">
              // Find the assessment statistics section
              {assessmentStats.map(stat => (
                <div key={stat.id} className="item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ cursor: 'pointer' }} 
                          onClick={() => window.location.href = `?page=assessment-view&assessment=${stat.id}`}>
                        {stat.title}
                      </h4>
                      <p><strong>Course:</strong> {stat.course}</p>
                      <p><strong>Submissions:</strong> {stat.submissionCount}</p>
                      <p><strong>Average Grade:</strong> {stat.averageGrade}%</p>
                      <p><strong>Deadline:</strong> {new Date(stat.deadline).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => window.location.href = `?page=assessment-view&assessment=${stat.id}`}
                      className="btn-primary"
                      style={{ padding: '8px 16px' }}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section>
          <h3>Detailed Submission Results ({submissions.length})</h3>
          {submissions.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-file-upload" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h4>No submissions yet</h4>
              <p>Submission results will appear here once students submit their work.</p>
            </div>
          ) : (
            <div className="quick-actions">
              {Object.values(groupedSubmissions).map(({ assessment, submissions: assessmentSubmissions }) => (
                <div key={assessment.id} className="item-card">
                  <h4>{assessment.title}</h4>
                  <p><strong>Grading Criteria:</strong> {assessment.criteria}</p>
                  <div style={{ marginTop: '15px' }}>
                    <h5>Student Submissions:</h5>
                    {assessmentSubmissions.map(submission => {
                      const student = users.find(u => u.id === submission.studentId);
                      return (
                        <div key={submission.id} style={{ 
                          padding: '10px', 
                          margin: '5px 0', 
                          backgroundColor: 'rgba(102, 126, 234, 0.05)',
                          borderRadius: '5px'
                        }}>
                          <p><strong>Student:</strong> {student?.name || 'Unknown'}</p>
                          <p><strong>Grade:</strong> {submission.grade || 'Not graded'}</p>
                          <p><strong>Status:</strong> 
                            <span className={`status-badge status-${submission.status}`} style={{ marginLeft: '10px' }}>
                              {submission.status}
                            </span>
                          </p>
                          {submission.feedback && (
                            <p><strong>Feedback:</strong> {submission.feedback}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ExamAdminDashboard;