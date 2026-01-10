import React, { useState, useEffect } from 'react';

const StudentDashboard = ({ 
  currentUser, 
  assessments, 
  submissions, 
  questions, 
  setSubmissions, 
  setQuestions, 
  handleLogout, 
  goToProfile,
  modules = [],
  classes = [],
  setClasses = () => {}
}) => {
  const [questionData, setQuestionData] = useState({ assessmentId: '', text: '' });
  const [invitationCode, setInvitationCode] = useState('');
  const [userModules, setUserModules] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadUserModules();
  }, [classes, currentUser, modules]);

  const loadUserModules = () => {
    const enrolledModules = [];
    modules.forEach(module => {
      const moduleClasses = classes.filter(c => 
        c.module_code === module.code && 
        c.students && 
        c.students.includes(parseInt(currentUser.id))
      );
      if (moduleClasses.length > 0) {
        enrolledModules.push({
          ...module,
          classCount: moduleClasses.length
        });
      }
    });
    setUserModules(enrolledModules);
  };

  const submitAssessment = async (assessmentId) => {
    if (!selectedFile) {
      alert('Please select a file to submit');
      return;
    }

    try {
      const submission = {
        id: Date.now(),
        assessmentId,
        studentId: currentUser.id,
        fileName: selectedFile.name,
        fileUrl: URL.createObjectURL(selectedFile),
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        grade: null,
        feedback: '',
        markedBy: null,
        markedAt: null,
        approvedByExamAdmin: false,
        releasedToStudent: false
      };
      
      const createdSubmission = await SupabaseService.createSubmission(submission);
      const updatedSubmissions = [...submissions, createdSubmission];
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      alert('Submission successful');
      setSelectedFile(null);
    } catch (error) {
      const submission = {
        id: Date.now(),
        assessmentId,
        studentId: currentUser.id,
        fileName: selectedFile.name,
        fileUrl: URL.createObjectURL(selectedFile),
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        grade: null,
        feedback: '',
        markedBy: null,
        markedAt: null,
        approvedByExamAdmin: false,
        releasedToStudent: false
      };
      const updatedSubmissions = [...submissions, submission];
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      alert('Submission successful');
      setSelectedFile(null);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const question = {
        id: Date.now(),
        assessmentId: parseInt(questionData.assessmentId),
        studentId: currentUser.id,
        question: questionData.text,
        answers: []
      };
      
      const createdQuestion = await SupabaseService.createQuestion(question);
      const updatedQuestions = [...questions, createdQuestion];
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      setQuestionData({ assessmentId: '', text: '' });
      alert('Question submitted');
    } catch (error) {
      const question = {
        id: Date.now(),
        assessmentId: parseInt(questionData.assessmentId),
        studentId: currentUser.id,
        question: questionData.text,
        answers: []
      };
      const updatedQuestions = [...questions, question];
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      setQuestionData({ assessmentId: '', text: '' });
      alert('Question submitted');
    }
  };

  const handleJoinModule = async (e) => {
    e.preventDefault();
    const noClassElement = document.getElementById('no-class-found');
    noClassElement.style.display = 'none';
    
    if (!invitationCode || invitationCode.length < 6) {
      noClassElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> 
        <strong> Invalid invitation code.</strong>
        <div style="font-size: 14px; margin-top: 5px;">
          Please enter a valid invitation code (8 characters).
        </div>
      `;
      noClassElement.style.display = 'block';
      return;
    }
    
    try {
      const module = await SupabaseService.findModuleByInvitationCode(invitationCode);
      
      if (!module) {
        noClassElement.innerHTML = `
          <i class="fas fa-exclamation-circle"></i> 
          <strong> No module found with invitation code: ${invitationCode}</strong>
          <div style="font-size: 14px; margin-top: 5px;">
            Please check the code and try again, or contact your instructor.
          </div>
        `;
        noClassElement.style.display = 'block';
        return;
      }
      
      const moduleClasses = await SupabaseService.getClassesForModule(module.code);
      
      if (moduleClasses.length === 0) {
        alert(`Module "${module.name}" has no classes set up yet. Please contact the instructor.`);
        return;
      }
      
      let enrolledCount = 0;
      let alreadyEnrolledCount = 0;
      
      for (const classItem of moduleClasses) {
        try {
          const result = await SupabaseService.addStudentToClass(classItem.id, currentUser.id);
          
          const students = result.students || [];
          if (students.includes(parseInt(currentUser.id))) {
            enrolledCount++;
          } else {
            alreadyEnrolledCount++;
          }
        } catch (error) {
          console.error(`Error adding to class ${classItem.id}:`, error);
        }
      }
      
      const updatedClasses = [...classes];
      moduleClasses.forEach(classItem => {
        const index = updatedClasses.findIndex(c => c.id === classItem.id);
        if (index !== -1) {
          const students = updatedClasses[index].students || [];
          if (!students.includes(parseInt(currentUser.id))) {
            students.push(parseInt(currentUser.id));
            updatedClasses[index] = { ...updatedClasses[index], students };
          }
        }
      });
      
      setClasses(updatedClasses);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
      
      loadUserModules();
      
      setInvitationCode('');
      
      let message = `Successfully joined module: ${module.name}\n`;
      message += `Module Code: ${module.code}\n`;
      message += `Invitation Code: ${module.invitation_code}\n\n`;
      
      if (enrolledCount > 0) {
        message += `You've been added to ${enrolledCount} new class(es).\n`;
      }
      if (alreadyEnrolledCount > 0) {
        message += `You were already enrolled in ${alreadyEnrolledCount} class(es).\n`;
      }
      
      alert(message);
      
    } catch (error) {
      console.error('Error joining module:', error);
      alert('Failed to join module. Please try again or contact support.');
    }
  };

  const openModule = (moduleCode) => {
    window.location.href = `?page=module&module=${moduleCode}`;
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (Student)</h1>
        </div>
        <div>
          <button onClick={goToProfile} className="btn-secondary">Profile</button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </header>
      <main>
        <section className="welcome-banner">
          <h2 className="welcome-title">Student Dashboard</h2>
          <p className="welcome-subtitle">
            View assessments, submit work, and ask questions
          </p>
        </section>
        
        <section>
          <h3>My Assessments ({assessments.length})</h3>
          {assessments.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-tasks" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h4>No assessments yet</h4>
              <p>Your instructors haven't created any assessments yet.</p>
            </div>
          ) : (
            <div className="quick-actions">
              {assessments.map(a => {
                const submission = submissions.find(s => s.assessmentId === a.id && s.studentId === currentUser.id);
                return (
                  <div key={a.id} className="item-card">
                    <h4>{a.title}</h4>
                    <p>{a.description}</p>
                    <p><strong>Deadline:</strong> {new Date(a.deadline).toLocaleDateString()}</p>
                    {submission ? (
                      <div style={{ marginTop: '10px' }}>
                        <p><strong>Status:</strong> 
                          <span className={`status-badge status-${submission.status}`} style={{ marginLeft: '10px' }}>
                            {submission.status}
                          </span>
                        </p>
                        {submission.grade && (
                          <p><strong>Grade:</strong> {submission.grade}/100</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          style={{ width: '100%', padding: '8px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <button 
                          onClick={() => submitAssessment(a.id)}
                          className="btn-primary"
                          style={{ marginTop: '10px', width: '100%' }}
                          disabled={!selectedFile}
                        >
                          Submit Assessment
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
        
        <section>
          <h3>Ask a Question</h3>
          <form onSubmit={handleQuestionSubmit} className="form-container" style={{ maxWidth: '600px' }}>
            <select 
              value={questionData.assessmentId} 
              onChange={e => setQuestionData({ ...questionData, assessmentId: e.target.value })} 
              required
            >
              <option value="">Select Assessment</option>
              {assessments.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
            <textarea 
              placeholder="Enter your question here..." 
              value={questionData.text} 
              onChange={e => setQuestionData({ ...questionData, text: e.target.value })} 
              required
              rows="4"
            />
            <button type="submit" className="btn-primary">Submit Question</button>
          </form>
        </section>

        <section>
          <h3>Join a Module</h3>
          <div className="join-module-form">
            <form onSubmit={handleJoinModule} style={{ marginBottom: '15px' }}>
              <input 
                type="text" 
                placeholder="Enter invitation code (e.g., ABC123XY)" 
                value={invitationCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setInvitationCode(value.slice(0, 8));
                }}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 15px',
                  marginBottom: '10px',
                  fontSize: '16px',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}
                maxLength="8"
              />
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                <i className="fas fa-sign-in-alt"></i> Join Module
              </button>
            </form>
            
            <div id="no-class-found" className="no-class-found">
              <i className="fas fa-exclamation-circle"></i> No module found with this invitation code.
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>My Enrolled Modules ({userModules.length})</h4>
            {userModules.length > 0 ? (
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
                        Student
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
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Classes</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#3498db' }}>
                          {module.classCount}
                        </p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Your Submissions</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#2ecc71' }}>
                          {submissions.filter(s => s.studentId === currentUser.id && 
                            assessments.find(a => a.id === s.assessmentId && 
                            (a.course === module.name || a.moduleCode === module.code))).length}
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
            ) : (
              <div className="empty-state">
                <i className="fas fa-book" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                <h4>No modules enrolled</h4>
                <p>Join a module using an invitation code above.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;