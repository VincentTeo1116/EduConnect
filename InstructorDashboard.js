import React, { useState, useEffect } from 'react';

const InstructorDashboard = ({ 
  currentUser, 
  assessments, 
  submissions, 
  questions, 
  setAssessments, 
  setSubmissions, 
  setQuestions, 
  handleLogout, 
  goToProfile,
  modules = [],
  setModules = () => {},
  teachingMaterials = [],
  setTeachingMaterials = () => {}
}) => {
  const [assessmentData, setAssessmentData] = useState({ 
    title: '', 
    description: '', 
    course: '', 
    deadline: '', 
    criteria: '' 
  });
  const [userModules, setUserModules] = useState([]);

  useEffect(() => {
    loadUserModules();
  }, [modules, currentUser]);

  const loadUserModules = () => {
    const instructorModules = modules.filter(m => 
      m.instructor_id === currentUser.id || m.instructorId === currentUser.id
    );
    setUserModules(instructorModules);
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const assessment = {
        id: Date.now(),
        title: assessmentData.title,
        description: assessmentData.description,
        course: assessmentData.course,
        deadline: assessmentData.deadline,
        criteria: assessmentData.criteria,
        instructorId: currentUser.id,
        files: [],
        status: 'draft',
        approvedByExamAdmin: false
      };
      
      const createdAssessment = await SupabaseService.createAssessment(assessment);
      const updatedAssessments = [...assessments, createdAssessment];
      setAssessments(updatedAssessments);
      localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
      setAssessmentData({ title: '', description: '', course: '', deadline: '', criteria: '' });
      alert('Assessment created successfully');
    } catch (error) {
      const assessment = {
        id: Date.now(),
        title: assessmentData.title,
        description: assessmentData.description,
        course: assessmentData.course,
        deadline: assessmentData.deadline,
        criteria: assessmentData.criteria,
        instructorId: currentUser.id,
        files: [],
        status: 'draft',
        approvedByExamAdmin: false
      };
      const updatedAssessments = [...assessments, assessment];
      setAssessments(updatedAssessments);
      localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
      setAssessmentData({ title: '', description: '', course: '', deadline: '', criteria: '' });
      alert('Assessment created');
    }
  };

  const gradeSubmission = async (submissionId, grade) => {
    try {
      const updatedSubmission = await SupabaseService.updateSubmission(submissionId, { 
        grade, 
        status: 'graded' 
      });
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? updatedSubmission : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      alert('Submission graded successfully');
    } catch (error) {
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? { ...s, grade, status: 'graded' } : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      alert('Submission graded');
    }
  };

  const updateFeedback = async (submissionId, feedback) => {
    try {
      const updatedSubmission = await SupabaseService.updateSubmission(submissionId, { feedback });
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? updatedSubmission : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
    } catch (error) {
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? { ...s, feedback } : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
    }
  };

  const answerQuestion = async (questionId, answer) => {
    try {
      const question = questions.find(q => q.id === questionId);
      const updatedAnswers = [...(question.answers || []), { 
        instructorId: currentUser.id, 
        answer, 
        official: true, 
        resolved: false 
      }];
      
      const updatedQuestion = await SupabaseService.updateQuestion(questionId, { 
        answers: updatedAnswers 
      });
      
      const updatedQuestions = questions.map(q => 
        q.id === questionId ? updatedQuestion : q
      );
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      alert('Answer submitted successfully');
    } catch (error) {
      const updatedQuestions = questions.map(q => 
        q.id === questionId ? { 
          ...q, 
          answers: [...(q.answers || []), { 
            instructorId: currentUser.id, 
            answer, 
            official: true, 
            resolved: false 
          }] 
        } : q
      );
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      alert('Answer submitted');
    }
  };

  const generateInvitationCode = async (moduleCode) => {
    try {
      const newCode = await SupabaseService.generateUniqueInvitationCode();
      const updatedModule = await SupabaseService.updateModuleInvitationCode(moduleCode, newCode);
      
      const updatedModules = modules.map(m => 
        m.code === moduleCode ? { ...m, invitation_code: newCode } : m
      );
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
      
      alert(`Invitation code generated: ${newCode}`);
    } catch (error) {
      alert('Failed to generate invitation code');
    }
  };

  const regenerateInvitationCode = async (moduleCode) => {
    if (!confirm('Are you sure you want to regenerate the invitation code? The old code will no longer work.')) {
      return;
    }
    
    try {
      const newCode = await SupabaseService.generateUniqueInvitationCode();
      const updatedModule = await SupabaseService.updateModuleInvitationCode(moduleCode, newCode);
      
      const updatedModules = modules.map(m => 
        m.code === moduleCode ? { ...m, invitation_code: newCode } : m
      );
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
      
      alert(`New invitation code generated: ${newCode}\n\nShare this new code with students.`);
    } catch (error) {
      alert('Failed to regenerate invitation code');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Invitation code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Invitation code copied!');
      });
  };

  const openModule = (moduleCode) => {
    window.location.href = `?page=module&module=${moduleCode}`;
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (Instructor)</h1>
        </div>
        <div>
          <button onClick={goToProfile} className="btn-secondary">Profile</button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </header>
      
      <main>
        <section className="welcome-banner">
          <h2 className="welcome-title">Instructor Dashboard</h2>
          <p className="welcome-subtitle">
            Create assessments, grade submissions, manage modules, and answer student questions
          </p>
        </section>
        
        <section>
          <h3>Create New Assessment</h3>
          <form onSubmit={handleAssessmentSubmit} className="form-container" style={{ maxWidth: '600px' }}>
            <input 
              type="text" 
              placeholder="Assessment Title" 
              value={assessmentData.title} 
              onChange={e => setAssessmentData({ ...assessmentData, title: e.target.value })} 
              required 
            />
            <textarea 
              placeholder="Assessment Description" 
              value={assessmentData.description} 
              onChange={e => setAssessmentData({ ...assessmentData, description: e.target.value })} 
              required 
              rows="3"
            />
            <input 
              type="text" 
              placeholder="Course Name" 
              value={assessmentData.course} 
              onChange={e => setAssessmentData({ ...assessmentData, course: e.target.value })} 
              required 
            />
            <input 
              type="datetime-local" 
              value={assessmentData.deadline} 
              onChange={e => setAssessmentData({ ...assessmentData, deadline: e.target.value })} 
              required 
            />
            <textarea 
              placeholder="Grading Criteria" 
              value={assessmentData.criteria} 
              onChange={e => setAssessmentData({ ...assessmentData, criteria: e.target.value })} 
              required 
              rows="3"
            />
            <button type="submit" className="btn-primary">Create Assessment</button>
          </form>
        </section>
        
        <section>
          <h3>Student Submissions ({submissions.filter(s => 
            assessments.find(a => a.id === s.assessmentId && a.instructorId === currentUser.id)
          ).length})</h3>
          {submissions.filter(s => 
            assessments.find(a => a.id === s.assessmentId && a.instructorId === currentUser.id)
          ).length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h4>No submissions yet</h4>
              <p>Student submissions will appear here once they submit their work.</p>
            </div>
          ) : (
            <div className="quick-actions">
              {submissions.filter(s => 
                assessments.find(a => a.id === s.assessmentId && a.instructorId === currentUser.id)
              ).map(s => (
                <div key={s.id} className="item-card">
                  <h4>Submission #{s.id}</h4>
                  <p><strong>Student ID:</strong> {s.studentId}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge status-${s.status}`} style={{ marginLeft: '10px' }}>
                      {s.status}
                    </span>
                  </p>
                  <p><strong>Current Grade:</strong> {s.grade || 'Not graded'}</p>
                  <div style={{ marginTop: '15px' }}>
                    <input 
                      type="number" 
                      placeholder="Enter grade" 
                      onChange={e => gradeSubmission(s.id, e.target.value)}
                      style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
                    />
                    <textarea 
                      placeholder="Provide feedback..." 
                      value={s.feedback || ''}
                      onChange={e => updateFeedback(s.id, e.target.value)}
                      style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                      rows="3"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
                <div key={module.code} className="item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4>{module.name}</h4>
                      <p><strong>Code:</strong> {module.code}</p>
                      <p><strong>Description:</strong> {module.description}</p>
                    </div>
                    <button 
                      onClick={() => openModule(module.code)}
                      className="btn-primary"
                      style={{ padding: '8px 16px' }}
                    >
                      <i className="fas fa-external-link-alt"></i> Open Module
                    </button>
                  </div>
                  
                  {module.invitation_code ? (
                    <>
                      <div className="invitation-code-display">
                        {module.invitation_code}
                      </div>
                      <div className="invite-actions">
                        <button 
                          onClick={() => regenerateInvitationCode(module.code)}
                          className="refresh-btn"
                        >
                          <i className="fas fa-sync-alt"></i> Regenerate Code
                        </button>
                        <button 
                          onClick={() => copyToClipboard(module.invitation_code)}
                          className="copy-btn"
                        >
                          <i className="fas fa-copy"></i> Copy
                        </button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p style={{ color: '#666', marginBottom: '10px' }}>
                        No invitation code generated yet.
                      </p>
                      <button 
                        onClick={() => generateInvitationCode(module.code)}
                        className="btn-primary"
                        style={{ width: '100%' }}
                      >
                        <i className="fas fa-key"></i> Generate Invitation Code
                      </button>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                    <p><strong>How to invite students:</strong></p>
                    <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                      <li>Generate an invitation code</li>
                      <li>Share the code with students</li>
                      <li>Students enter the code in their dashboard</li>
                      <li>Students are automatically added to all classes in this module</li>
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section>
          <h3>Student Questions ({questions.length})</h3>
          {questions.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-question-circle" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h4>No questions yet</h4>
              <p>Student questions will appear here once they ask them.</p>
            </div>
          ) : (
            <div className="quick-actions">
              {questions.map(q => (
                <div key={q.id} className="item-card">
                  <h4>Question #{q.id}</h4>
                  <p><strong>Question:</strong> {q.question}</p>
                  <p><strong>Assessment ID:</strong> {q.assessmentId}</p>
                  {q.answers && q.answers.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <p><strong>Previous Answers:</strong></p>
                      {q.answers.map((answer, idx) => (
                        <div key={idx} style={{ 
                          padding: '8px', 
                          margin: '5px 0', 
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>
                          <p><strong>Answer {idx + 1}:</strong> {answer.answer}</p>
                          <p><em>{answer.official ? '(Official Answer)' : '(Peer Answer)'}</em></p>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea 
                    placeholder="Type your answer here..." 
                    onChange={(e) => {
                      const textarea = e.target;
                      textarea.dataset.answer = e.target.value;
                    }}
                    style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                    rows="3"
                  />
                  <button 
                    onClick={(e) => {
                      const textarea = e.target.previousElementSibling;
                      if (textarea && textarea.dataset.answer) {
                        answerQuestion(q.id, textarea.dataset.answer);
                        alert('Answer submitted!');
                        textarea.value = '';
                        textarea.dataset.answer = '';
                      }
                    }}
                    className="btn-primary"
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    Submit Answer
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default InstructorDashboard;