// AssessmentViewPage.js
import React, { useState, useEffect } from 'react';

const AssessmentViewPage = ({
  currentUser,
  assessments = [],
  submissions = [],
  questions = [],
  modules = [],
  users = [],
  classes = [],
  setSubmissions = () => {},
  setQuestions = () => {},
  setAssessments = () => {},
  handleLogout = () => {},
  goToProfile = () => {},
  goBack = () => {}
}) => {
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [answers, setAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [editing, setEditing] = useState(false);
  const [editedAssessment, setEditedAssessment] = useState(null);
  
  // Grading Popup State
  const [showGradePopup, setShowGradePopup] = useState(false);
  const [submissionToGrade, setSubmissionToGrade] = useState(null);
  const [popupGrade, setPopupGrade] = useState('');
  const [popupFeedback, setPopupFeedback] = useState('');

  // Get assessment ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const assessmentId = urlParams.get('assessment');
    
    if (assessmentId) {
      const assessment = assessments.find(a => 
        a.id === parseInt(assessmentId) || a.id === assessmentId
      );
      
      if (assessment) {
        setCurrentAssessment(assessment);
        setEditedAssessment({...assessment});
        
        // Check access
        checkAccess(assessment);
      } else {
        alert('Assessment not found');
        goBack();
      }
    }
  }, [assessments, currentUser, modules, goBack]);

  // Add keyboard shortcuts for grading popup
    useEffect(() => {
    const handleKeyDown = (e) => {
        if (showGradePopup) {
        if (e.key === 'Escape') {
            closeGradePopup();
        }
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            // You could auto-submit the form here
        }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showGradePopup]);

  const checkAccess = (assessment) => {
    const module = getAssessmentModule(assessment);
    
    if (!module) {
      alert('Module not found for this assessment! ');
      goBack();
      return;
    }

    switch(currentUser.role) {
      case 'Student':
        const classAccess = classes.filter(c => 
          c.module_code === module.code && 
          c.students && 
          c.students.includes(parseInt(currentUser.id))
        );
        
        if (classAccess.length === 0) {
          alert('You are not enrolled in this module');
          goBack();
        }
        break;
        
      case 'Instructor':
        const instructorId = module.instructor_id || module.instructorId;
        if (instructorId !== currentUser.id) {
          alert('You are not assigned to this module! ');
          goBack();
        }
        break;
        
      case 'Exam Administrator':
        const examAdminId = module.exam_admin_id || module.examAdminId;
        if (examAdminId !== currentUser.id) {
          alert('You are not assigned to this module! ');
          goBack();
        }
        break;
        
      default:
        break;
    }
  };

  const getAssessmentModule = (assessment) => {
    return modules.find(m => 
      m.code === assessment?.module_code || 
      m.code === assessment?.moduleCode ||
      (assessment?.course && m.name.includes(assessment.course))
    );
  };

  // Get module
  const module = getAssessmentModule(currentAssessment);

  // Get assessment submissions
  const assessmentSubmissions = submissions.filter(s => 
    s.assessmentId === currentAssessment?.id
  );

  // Get student's submission
  const studentSubmission = assessmentSubmissions.find(s => 
    s.studentId === currentUser.id
  );

  // Get assessment questions
  const assessmentQuestions = questions.filter(q => 
    q.assessmentId === currentAssessment?.id
  );

  // Handle file selection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Open Grading Popup
  const openGradePopup = (submission) => {
    setSubmissionToGrade(submission);
    setPopupGrade(submission.grade || '');
    setPopupFeedback(submission.feedback || '');
    setShowGradePopup(true);
  };

  // Close Grading Popup
  const closeGradePopup = () => {
    setShowGradePopup(false);
    setSubmissionToGrade(null);
    setPopupGrade('');
    setPopupFeedback('');
  };

  // Submit assessment (Student only)
  const submitAssessment = async () => {
    if (!selectedFile) {
      alert('Please select a file to submit');
      return;
    }

    const submission = {
      id: Date.now(),
      assessmentId: currentAssessment.id,
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

    try {
      const createdSubmission = await SupabaseService.createSubmission(submission);
      const updatedSubmissions = [...submissions, createdSubmission];
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      alert('Assessment submitted successfully');
      setSelectedFile(null);
      window.location.reload();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      const updatedSubmissions = [...submissions, submission];
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      alert('Assessment submitted (local)');
      setSelectedFile(null);
      window.location.reload();
    }
  };

  // Ask a question (Student only)
  const askQuestion = async () => {
    if (!newQuestion.trim()) {
      alert('Please enter a question');
      return;
    }

    const question = {
      id: Date.now(),
      assessmentId: currentAssessment.id,
      studentId: currentUser.id,
      question: newQuestion,
      answers: []
    };

    try {
      const createdQuestion = await SupabaseService.createQuestion(question);
      const updatedQuestions = [...questions, createdQuestion];
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      alert('Question submitted successfully');
      setNewQuestion('');
      window.location.reload();
    } catch (error) {
      console.error('Error asking question:', error);
      const updatedQuestions = [...questions, question];
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      alert('Question submitted (local)');
      setNewQuestion('');
      window.location.reload();
    }
  };

  // Answer a question (Instructor only)
  const answerQuestion = async (questionId) => {
    const answer = answers[questionId];
    if (!answer || !answer.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      const question = questions.find(q => q.id === questionId);
      const updatedAnswers = [...(question.answers || []), {
        instructorId: currentUser.id,
        answer,
        official: true,
        resolved: false,
        answeredAt: new Date().toISOString()
      }];

      const updatedQuestion = await SupabaseService.updateQuestion(questionId, {
        answers: updatedAnswers
      });

      const updatedQuestions = questions.map(q =>
        q.id === questionId ? updatedQuestion : q
      );
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      
      setAnswers(prev => ({ ...prev, [questionId]: '' }));
      alert('Answer submitted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error answering question:', error);
      const updatedQuestions = questions.map(q =>
        q.id === questionId ? {
          ...q,
          answers: [...(q.answers || []), {
            instructorId: currentUser.id,
            answer,
            official: true,
            resolved: false,
            answeredAt: new Date().toISOString()
          }]
        } : q
      );
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      
      setAnswers(prev => ({ ...prev, [questionId]: '' }));
      alert('Answer submitted (local)');
      window.location.reload();
    }
  };

  // Update assessment (Instructor only)
  const updateAssessment = async () => {
    try {
      const updatedAssessment = await SupabaseService.updateAssessment(currentAssessment.id, {
        title: editedAssessment.title,
        description: editedAssessment.description,
        due_date: editedAssessment.dueDate || editedAssessment.due_date,
        max_marks: editedAssessment.maxMarks || editedAssessment.max_marks,
        criteria: editedAssessment.criteria,
        type: editedAssessment.type
      });

      const updatedAssessments = assessments.map(a =>
        a.id === currentAssessment.id ? updatedAssessment : a
      );
      setAssessments(updatedAssessments);
      setCurrentAssessment(updatedAssessment);
      localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
      
      setEditing(false);
      alert('Assessment updated successfully');
    } catch (error) {
      console.error('Error updating assessment:', error);
      const updatedAssessments = assessments.map(a =>
        a.id === currentAssessment.id ? editedAssessment : a
      );
      setAssessments(updatedAssessments);
      setCurrentAssessment(editedAssessment);
      localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
      
      setEditing(false);
      alert('Assessment updated (local)');
    }
  };

  // Grade submission (Instructor only - FROM POPUP)
  const submitGrade = async (e) => {
    e.preventDefault();
    
    if (!submissionToGrade) return;

    if (!popupGrade || isNaN(popupGrade)) {
      alert('Please enter a valid grade');
      return;
    }
    
    const submissionId = submissionToGrade.id;

    try {
      const submission = submissions.find(s => s.id === submissionId);
      const updatedSubmission = {
        ...submission,
        grade: parseFloat(popupGrade),
        feedback: popupFeedback,
        markedBy: currentUser.id,
        markedAt: new Date().toISOString(),
        status: 'graded',
        approvedByExamAdmin: false
      };

      const supabaseUpdated = await SupabaseService.updateSubmission(submissionId, updatedSubmission);
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? supabaseUpdated : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      
      alert('Submission graded successfully. It is now pending Exam Admin approval.');
      closeGradePopup();
      window.location.reload();
    } catch (error) {
      console.error('Error grading submission:', error);
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? { 
          ...s, 
          grade: parseFloat(popupGrade), 
          feedback: popupFeedback,
          markedBy: currentUser.id,
          markedAt: new Date().toISOString(),
          status: 'graded',
          approvedByExamAdmin: false
        } : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      
      alert('Submission graded (local)');
      closeGradePopup();
      window.location.reload();
    }
  };

  // Approve/reject grade (Exam Admin only)
  const handleGradeApproval = async (submissionId, approved) => {
    try {
      const submission = submissions.find(s => s.id === submissionId);
      const updatedSubmission = {
        ...submission,
        approvedByExamAdmin: approved,
        releasedToStudent: approved,
        status: approved ? 'released' : 'needs_revision'
      };

      const supabaseUpdated = await SupabaseService.updateSubmission(submissionId, updatedSubmission);
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? supabaseUpdated : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      
      alert(`Grade ${approved ? 'approved and released' : 'rejected'}`);
      window.location.reload();
    } catch (error) {
      console.error('Error updating approval:', error);
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? { 
          ...s, 
          approvedByExamAdmin: approved,
          releasedToStudent: approved,
          status: approved ? 'released' : 'needs_revision'
        } : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      
      alert(`Grade ${approved ? 'approved (local)' : 'rejected (local)'}`);
      window.location.reload();
    }
  };

  // Download assessment file
  const downloadAssessmentFile = () => {
    if (currentAssessment?.fileUrl) {
      const link = document.createElement('a');
      link.href = currentAssessment.fileUrl;
      link.download = currentAssessment.fileName || 'assessment_file';
      link.click();
    } else {
      alert('No file available for download');
    }
  };

  // Delete assessment (Instructor only)
  const deleteAssessment = async () => {
    if (window.confirm('Are you sure you want to delete this assessment? All submissions will also be deleted.')) {
      try {
        await SupabaseService.deleteAssessment(currentAssessment.id);
        const updatedAssessments = assessments.filter(a => a.id !== currentAssessment.id);
        setAssessments(updatedAssessments);
        localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
        
        const updatedSubmissions = submissions.filter(s => s.assessmentId !== currentAssessment.id);
        setSubmissions(updatedSubmissions);
        localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
        
        alert('Assessment and related submissions deleted');
        goBack();
      } catch (error) {
        console.error('Error deleting assessment:', error);
        const updatedAssessments = assessments.filter(a => a.id !== currentAssessment.id);
        setAssessments(updatedAssessments);
        localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
        
        const updatedSubmissions = submissions.filter(s => s.assessmentId !== currentAssessment.id);
        setSubmissions(updatedSubmissions);
        localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
        
        alert('Assessment deleted (local)');
        goBack();
      }
    }
  };

  if (!currentAssessment) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading assessment...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={goBack} className="btn-secondary" style={{ padding: '8px 16px' }}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <div>
            <h1>{currentAssessment.title}</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '16px' }}>
              {module ? `${module.name} (${module.code})` : 'Unknown Module'} • {currentUser.role}
            </p>
          </div>
        </div>
        <div>
          <button onClick={goToProfile} className="btn-secondary">Profile</button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </header>

      <main>
        {/* Assessment Overview Banner */}
        <section className="welcome-banner">
          <h2 className="welcome-title">{currentAssessment.title}</h2>
          <p className="welcome-subtitle">{currentAssessment.description}</p>
          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '8px'
            }}>
              <strong>Type:</strong> {currentAssessment.type?.toUpperCase() || 'ASSIGNMENT'}
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '8px'
            }}>
              <strong>Due:</strong> {new Date(currentAssessment.dueDate || currentAssessment.due_date).toLocaleDateString()}
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '8px'
            }}>
              <strong>Max Marks:</strong> {currentAssessment.maxMarks || currentAssessment.max_marks || 100}
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '10px 20px',
              borderRadius: '8px'
            }}>
              <strong>Submissions:</strong> {assessmentSubmissions.length}
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #ddd',
          marginBottom: '30px',
          overflowX: 'auto'
        }}>
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <i className="fas fa-info-circle"></i> Details
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <i className="fas fa-upload"></i> Submissions ({assessmentSubmissions.length})
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            <i className="fas fa-question-circle"></i> Q&A ({assessmentQuestions.length})
          </button>
          
          {currentUser.role === 'Instructor' && (
            <button
              className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <i className="fas fa-cog"></i> Manage
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '30px',
              marginTop: '20px'
            }}>
              {/* Left Column - Assessment Content */}
              <div>
                <section className="item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Assessment Details</h3>
                    {currentUser.role === 'Instructor' && (
                      <button
                        onClick={() => setEditing(!editing)}
                        className="btn-secondary"
                        style={{ padding: '8px 16px' }}
                      >
                        <i className="fas fa-edit"></i> {editing ? 'Cancel Edit' : 'Edit'}
                      </button>
                    )}
                  </div>
                  
                  {editing ? (
                    <div>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title</label>
                        <input
                          type="text"
                          value={editedAssessment.title}
                          onChange={(e) => setEditedAssessment({...editedAssessment, title: e.target.value})}
                          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                        <textarea
                          value={editedAssessment.description}
                          onChange={(e) => setEditedAssessment({...editedAssessment, description: e.target.value})}
                          rows="4"
                          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Type</label>
                          <select
                            value={editedAssessment.type || 'assignment'}
                            onChange={(e) => setEditedAssessment({...editedAssessment, type: e.target.value})}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                          >
                            <option value="assignment">Assignment</option>
                            <option value="quiz">Quiz</option>
                            <option value="exam">Exam</option>
                            <option value="project">Project</option>
                          </select>
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Max Marks</label>
                          <input
                            type="number"
                            value={editedAssessment.maxMarks || editedAssessment.max_marks || 100}
                            onChange={(e) => setEditedAssessment({...editedAssessment, maxMarks: e.target.value})}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                          />
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Due Date</label>
                        <input
                          type="datetime-local"
                          value={editedAssessment.dueDate || editedAssessment.due_date}
                          onChange={(e) => setEditedAssessment({...editedAssessment, dueDate: e.target.value})}
                          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Grading Criteria</label>
                        <textarea
                          value={editedAssessment.criteria || ''}
                          onChange={(e) => setEditedAssessment({...editedAssessment, criteria: e.target.value})}
                          rows="3"
                          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button onClick={updateAssessment} className="btn-primary" style={{ flex: 1 }}>
                          <i className="fas fa-save"></i> Save Changes
                        </button>
                        <button onClick={() => setEditing(false)} className="btn-secondary" style={{ flex: 1 }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4>Description</h4>
                      <p style={{ marginBottom: '20px' }}>{currentAssessment.description}</p>
                      
                      {currentAssessment.criteria && (
                        <>
                          <h4>Grading Criteria</h4>
                          <p style={{ marginBottom: '20px' }}>{currentAssessment.criteria}</p>
                        </>
                      )}
                      
                      <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '20px', 
                        borderRadius: '8px',
                        marginTop: '20px'
                      }}>
                        <h4>Assessment Information</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                          <div>
                            <p><strong>Type:</strong> {currentAssessment.type?.toUpperCase() || 'ASSIGNMENT'}</p>
                            <p><strong>Status:</strong> {currentAssessment.status || 'draft'}</p>
                            <p><strong>Created:</strong> {new Date(currentAssessment.createdAt || currentAssessment.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p><strong>Max Marks:</strong> {currentAssessment.maxMarks || currentAssessment.max_marks || 100}</p>
                            <p><strong>Due Date:</strong> {new Date(currentAssessment.dueDate || currentAssessment.due_date).toLocaleString()}</p>
                            {currentAssessment.approvedByExamAdmin && (
                              <p><strong>Approved:</strong> <i className="fas fa-check-circle" style={{ color: '#2ecc71' }}></i> Yes</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {currentAssessment.fileUrl && (
                        <div style={{ marginTop: '20px' }}>
                          <button onClick={downloadAssessmentFile} className="btn-primary" style={{ width: '100%' }}>
                            <i className="fas fa-download"></i> Download Assessment File
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
                
                {/* Student Submission Section */}
                {currentUser.role === 'Student' && (
                  <section className="item-card" style={{ marginTop: '20px' }}>
                    <h3>Your Submission</h3>
                    {!studentSubmission ? (
                      <div>
                        <p>Submit your work before the deadline.</p>
                        
                        <div style={{ margin: '20px 0' }}>
                          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                            Upload Your File
                          </label>
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            style={{ width: '100%', padding: '12px', border: '2px dashed #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}
                          />
                          {selectedFile && (
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '6px' }}>
                              <i className="fas fa-check-circle" style={{ color: '#2ecc71', marginRight: '8px' }}></i>
                              <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button
                            onClick={submitAssessment}
                            className="btn-primary"
                            style={{ flex: 1 }}
                            disabled={!selectedFile}
                          >
                            <i className="fas fa-paper-plane"></i> Submit Assessment
                          </button>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="btn-secondary"
                            disabled={!selectedFile}
                          >
                            <i className="fas fa-times"></i> Clear
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <h4 style={{ margin: 0 }}>Submission Status</h4>
                          <span className={`status-badge status-${studentSubmission.status}`}>
                            {studentSubmission.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Submitted On</p>
                              <p style={{ margin: 0, fontWeight: '600' }}>
                                {new Date(studentSubmission.submittedAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>File</p>
                              <p style={{ margin: 0, fontWeight: '600' }}>{studentSubmission.fileName}</p>
                            </div>
                          </div>
                          
                          {studentSubmission.grade !== null && (
                            <div style={{
                              padding: '12px',
                              backgroundColor: studentSubmission.releasedToStudent ? '#e8f5e9' : '#fff3cd',
                              borderRadius: '6px',
                              marginBottom: '10px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Grade</p>
                                  <h3 style={{ margin: 0, color: studentSubmission.releasedToStudent ? '#2ecc71' : '#f39c12' }}>
                                    {studentSubmission.grade}/{currentAssessment.maxMarks || currentAssessment.max_marks || 100}
                                  </h3>
                                </div>
                                <div>
                                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Percentage</p>
                                  <h3 style={{ margin: 0, color: '#3498db' }}>
                                    {((studentSubmission.grade / (currentAssessment.maxMarks || currentAssessment.max_marks || 100)) * 100).toFixed(1)}%
                                  </h3>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {studentSubmission.feedback && (
                            <div>
                              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Instructor Feedback</p>
                              <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                                <p style={{ margin: 0, color: '#333' }}>{studentSubmission.feedback}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <a
                            href={studentSubmission.fileUrl}
                            download
                            className="btn-primary"
                            style={{ flex: 1 }}
                          >
                            <i className="fas fa-download"></i> Download Your Submission
                          </a>
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* Right Column - Info & Actions */}
              <div>
                {/* Module Information */}
                <section className="item-card">
                  <h3>Module Information</h3>
                  {module ? (
                    <>
                      <h4>{module.name}</h4>
                      <p><strong>Code:</strong> {module.code}</p>
                      <p><strong>Description:</strong> {module.description}</p>
                      
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                          <div>
                            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Total Submissions</p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#3498db' }}>
                              {assessmentSubmissions.length}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Pending Grading</p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#f39c12' }}>
                              {assessmentSubmissions.filter(s => s.status === 'submitted').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          window.location.href = `?page=module&module=${module.code}`;
                        }}
                        className="btn-secondary"
                        style={{ width: '100%', marginTop: '15px' }}
                      >
                        <i className="fas fa-external-link-alt"></i> Go to Module
                      </button>
                    </>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-exclamation-circle" style={{ fontSize: '32px', color: '#ccc', marginBottom: '10px' }}></i>
                      <p>Module information not available</p>
                    </div>
                  )}
                </section>

                {/* Quick Stats */}
                <section className="item-card" style={{ marginTop: '20px' }}>
                  <h3>Quick Stats</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Submitted</p>
                      <h3 style={{ margin: 0, color: '#3498db' }}>{assessmentSubmissions.length}</h3>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Graded</p>
                      <h3 style={{ margin: 0, color: '#2ecc71' }}>
                        {assessmentSubmissions.filter(s => s.status === 'graded' || s.status === 'released').length}
                      </h3>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Released</p>
                      <h3 style={{ margin: 0, color: '#9b59b6' }}>
                        {assessmentSubmissions.filter(s => s.releasedToStudent).length}
                      </h3>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Avg Grade</p>
                      <h3 style={{ margin: 0, color: '#e74c3c' }}>
                        {(() => {
                          const gradedSubmissions = assessmentSubmissions.filter(s => s.grade !== null);
                          if (gradedSubmissions.length === 0) return 'N/A';
                          const total = gradedSubmissions.reduce((sum, s) => sum + parseFloat(s.grade), 0);
                          return (total / gradedSubmissions.length).toFixed(1);
                        })()}
                      </h3>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <section>
              <h3>Submissions ({assessmentSubmissions.length})</h3>
              
              {assessmentSubmissions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                  <h4>No submissions yet</h4>
                  <p>Student submissions will appear here once they submit their work.</p>
                </div>
              ) : (
                <div className="quick-actions">
                  {assessmentSubmissions.map(submission => {
                    const student = users.find(u => u.id === submission.studentId);
                    
                    return (
                      <div key={submission.id} className="item-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0' }}>
                              <i className="fas fa-user-graduate" style={{ color: '#3498db', marginRight: '8px' }}></i>
                              {student?.name || 'Unknown Student'}
                            </h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                              Submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <span className={`status-badge status-${submission.status}`}>
                            {submission.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>File</p>
                              <p style={{ margin: 0, fontWeight: '600' }}>{submission.fileName}</p>
                            </div>
                            <a href={submission.fileUrl} download className="btn-secondary" style={{ padding: '6px 12px' }}>
                              <i className="fas fa-download"></i>
                            </a>
                          </div>
                          
                          {submission.grade !== null && (
                            <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', marginTop: '10px' }}>
                              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Grade</p>
                              <h4 style={{ margin: 0, color: '#2ecc71' }}>
                                {submission.grade}/{currentAssessment.maxMarks || currentAssessment.max_marks || 100}
                              </h4>
                            </div>
                          )}
                          
                          {submission.feedback && (
                            <div style={{ marginTop: '10px' }}>
                              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Feedback</p>
                              <p style={{ margin: 0, color: '#333' }}>{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* In the submission card - Replace existing grading button */}
                        {currentUser.role === 'Instructor' && submission.status === 'submitted' && (
                            <div style={{ marginTop: '15px' }}>
                                <button
                                    onClick={() => openGradePopup(submission)}
                                    className="btn-primary"
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        fontSize: '15px'
                                    }}
                                    >
                                    <i className="fas fa-graduation-cap"></i> Grade This Submission
                                </button>
                            </div>
                        )}
                        
                        {/* Exam Admin Approval */}
                        {currentUser.role === 'Exam Administrator' && submission.status === 'graded' && !submission.approvedByExamAdmin && (
                          <div style={{ marginTop: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => handleGradeApproval(submission.id, true)}
                                className="btn-success"
                                style={{ flex: 1 }}
                              >
                                <i className="fas fa-check-circle"></i> Approve & Release
                              </button>
                              <button
                                onClick={() => handleGradeApproval(submission.id, false)}
                                className="btn-danger"
                                style={{ flex: 1 }}
                              >
                                <i className="fas fa-times-circle"></i> Reject & Return
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Exam Admin View */}
                        {currentUser.role === 'Exam Administrator' && submission.approvedByExamAdmin && (
                          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                            <p style={{ margin: 0, color: '#155724', textAlign: 'center' }}>
                              <i className="fas fa-check-circle"></i> Grade Approved and Released
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <section>
              <h3>Questions & Answers ({assessmentQuestions.length})</h3>
              
              {currentUser.role === 'Student' && (
                <div className="item-card" style={{ marginBottom: '20px' }}>
                  <h4>Ask a Question</h4>
                  <textarea
                    placeholder="Type your question here..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows="4"
                    style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                  <button onClick={askQuestion} className="btn-primary" style={{ width: '100%' }}>
                    <i className="fas fa-paper-plane"></i> Submit Question
                  </button>
                </div>
              )}

              {assessmentQuestions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-comments" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                  <h4>No questions yet</h4>
                  <p>Be the first to ask a question about this assessment.</p>
                </div>
              ) : (
                <div>
                  {assessmentQuestions.map(question => {
                    const student = users.find(u => u.id === question.studentId);
                    return (
                      <div key={question.id} className="item-card" style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>
                              <i className="fas fa-user-graduate" style={{ color: '#3498db', marginRight: '8px' }}></i>
                              {student?.name || 'Unknown Student'}
                            </h4>
                            <p style={{ margin: '0 0 15px 0', color: '#333' }}>{question.question}</p>
                            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                              <i className="far fa-clock"></i> Asked on {new Date(question.createdAt || question.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Answers */}
                        {question.answers && question.answers.length > 0 && (
                          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <h5 style={{ margin: '0 0 10px 0', color: '#666' }}>Answers:</h5>
                            {question.answers.map((answer, idx) => {
                              const instructor = users.find(u => u.id === answer.instructorId);
                              return (
                                <div key={idx} style={{
                                  padding: '10px',
                                  marginBottom: '10px',
                                  backgroundColor: 'white',
                                  borderRadius: '6px',
                                  border: '1px solid #e9ecef'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                      <strong style={{ color: answer.official ? '#2ecc71' : '#f39c12' }}>
                                        <i className={`fas fa-${answer.official ? 'user-tie' : 'user-graduate'}`}></i>
                                        {answer.official ? ' Official Answer' : ' Peer Answer'}
                                      </strong>
                                      {instructor && (
                                        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                                          by {instructor.name}
                                        </span>
                                      )}
                                    </div>
                                    {answer.answeredAt && (
                                      <span style={{ fontSize: '12px', color: '#999' }}>
                                        {new Date(answer.answeredAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ margin: '5px 0 0 0', color: '#333' }}>{answer.answer}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Instructor Answer Input */}
                        {currentUser.role === 'Instructor' && (
                          <div style={{ marginTop: '15px' }}>
                            <textarea
                              placeholder="Type your answer here..."
                              value={answers[question.id] || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                              rows="3"
                              style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <button onClick={() => answerQuestion(question.id)} className="btn-primary" style={{ width: '100%' }}>
                              <i className="fas fa-reply"></i> Submit Answer
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Manage Tab (Instructor only) */}
          {activeTab === 'manage' && currentUser.role === 'Instructor' && (
            <section>
              <h3>Manage Assessment</h3>
              
              <div className="quick-actions">
                <div className="item-card">
                  <h4><i className="fas fa-file-upload" style={{ color: '#667eea' }}></i> Upload Assessment File</h4>
                  <p>Upload a file for students to download (instructions, template, etc.)</p>
                  <input
                    type="file"
                    style={{ width: '100%', padding: '10px', margin: '15px 0', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                  <button className="btn-primary" style={{ width: '100%' }}>
                    <i className="fas fa-upload"></i> Upload File
                  </button>
                </div>
                
                <div className="item-card">
                  <h4><i className="fas fa-chart-bar" style={{ color: '#2ecc71' }}></i> Statistics</h4>
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span>Total Submissions:</span>
                      <strong>{assessmentSubmissions.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span>Pending Grading:</span>
                      <strong style={{ color: '#e74c3c' }}>
                        {assessmentSubmissions.filter(s => s.status === 'submitted').length}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span>Graded:</span>
                      <strong style={{ color: '#f39c12' }}>
                        {assessmentSubmissions.filter(s => s.status === 'graded').length}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Released:</span>
                      <strong style={{ color: '#2ecc71' }}>
                        {assessmentSubmissions.filter(s => s.releasedToStudent).length}
                      </strong>
                    </div>
                  </div>
                </div>
                
                <div className="item-card">
                  <h4><i className="fas fa-exclamation-triangle" style={{ color: '#e74c3c' }}></i> Danger Zone</h4>
                  <p style={{ margin: '15px 0', color: '#666' }}>
                    Deleting this assessment will also delete all associated submissions and questions. This action cannot be undone.
                  </p>
                  <button onClick={deleteAssessment} className="btn-danger" style={{ width: '100%' }}>
                    <i className="fas fa-trash"></i> Delete Assessment
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      
      {/* Enhanced Grade Popup Modal */}
        {showGradePopup && submissionToGrade && (
        <div className="global-popup-overlay">
            <div className="global-popup-content">
            <div className="popup-header">
                <h2>Grade Submission</h2>
                <button 
                onClick={closeGradePopup}
                className="close-popup-btn"
                >
                ×
                </button>
            </div>
            
            <div className="popup-body">
                {/* Student Information */}
                <div className="submission-info-card">
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                    <i className="fas fa-user-graduate" style={{ color: '#667eea', marginRight: '10px' }}></i>
                    Student Submission
                </h3>
                
                <div className="info-grid">
                    <div className="info-item">
                    <span className="info-label">Student Name</span>
                    <span className="info-value">
                        {users.find(u => u.id === submissionToGrade.studentId)?.name || 'Unknown Student'}
                    </span>
                    </div>
                    <div className="info-item">
                    <span className="info-label">Student ID</span>
                    <span className="info-value">{submissionToGrade.studentId}</span>
                    </div>
                    <div className="info-item">
                    <span className="info-label">Submitted On</span>
                    <span className="info-value">
                        {new Date(submissionToGrade.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(submissionToGrade.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    </div>
                    <div className="info-item">
                    <span className="info-label">File</span>
                    <span className="info-value">
                        <i className="fas fa-file" style={{ marginRight: '8px', color: '#3498db' }}></i>
                        {submissionToGrade.fileName}
                    </span>
                    </div>
                </div>
                
                <div className="download-btn-container">
                    <a 
                    href={submissionToGrade.fileUrl} 
                    download 
                    className="btn-primary"
                    style={{ textDecoration: 'none', padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                    <i className="fas fa-download"></i> Download Submission
                    </a>
                    <button 
                    onClick={() => window.open(submissionToGrade.fileUrl, '_blank')}
                    className="btn-secondary"
                    style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                    <i className="fas fa-eye"></i> Preview
                    </button>
                </div>
                </div>

                {/* Grading Form */}
                <form onSubmit={submitGrade} className="grading-form">
                <div className="form-group">
                    <label htmlFor="grade-input">
                    Grade (Max: {currentAssessment.maxMarks || currentAssessment.max_marks || 100} marks)
                    </label>
                    <div style={{ position: 'relative' }}>
                    <input
                        id="grade-input"
                        type="number"
                        value={popupGrade}
                        onChange={e => setPopupGrade(e.target.value)}
                        min="0"
                        max={currentAssessment.maxMarks || currentAssessment.max_marks || 100}
                        step="0.5"
                        required
                        placeholder="Enter grade (e.g., 85.5)"
                        style={{ width: '100%', paddingRight: '60px' }}
                    />
                    <span style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                        fontWeight: '500'
                    }}>
                        / {currentAssessment.maxMarks || currentAssessment.max_marks || 100}
                    </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                    Enter a value between 0 and {currentAssessment.maxMarks || currentAssessment.max_marks || 100}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="feedback-input">
                    Feedback <span style={{ color: '#666', fontWeight: 'normal' }}>(Optional but recommended)</span>
                    </label>
                    <textarea
                    id="feedback-input"
                    value={popupFeedback}
                    onChange={e => setPopupFeedback(e.target.value)}
                    rows="6"
                    placeholder="Provide constructive feedback to help the student improve. Consider mentioning strengths, areas for improvement, and specific suggestions..."
                    style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                    {popupFeedback.length}/1000 characters
                    </div>
                </div>

                {/* Grade Preview */}
                {popupGrade && !isNaN(popupGrade) && (
                    <div className="grade-preview">
                    <h4>Grade Preview</h4>
                    <div className="preview-row">
                        <span className="preview-label">Raw Score</span>
                        <span className="preview-value">{popupGrade} marks</span>
                    </div>
                    <div className="preview-row">
                        <span className="preview-label">Percentage</span>
                        <span className="preview-value">
                        {((popupGrade / (currentAssessment.maxMarks || currentAssessment.max_marks || 100)) * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="preview-row">
                        <span className="preview-label">Assessment Type</span>
                        <span className="preview-value">{currentAssessment.type?.toUpperCase() || 'ASSIGNMENT'}</span>
                    </div>
                    {popupGrade < (currentAssessment.maxMarks || currentAssessment.max_marks || 100) * 0.5 && (
                        <div style={{ 
                        marginTop: '10px', 
                        padding: '10px', 
                        backgroundColor: '#fff3cd', 
                        borderRadius: '6px',
                        borderLeft: '4px solid #ffc107'
                        }}>
                        <i className="fas fa-exclamation-triangle" style={{ color: '#ffc107', marginRight: '8px' }}></i>
                        This grade is below 50%. Consider adding specific improvement suggestions.
                        </div>
                    )}
                    </div>
                )}

                {/* Quick Stats */}
                <div className="quick-stats-popup">
                    <div className="stat-item">
                    <div className="stat-label">Total Submissions</div>
                    <div className="stat-value">{assessmentSubmissions.length}</div>
                    </div>
                    <div className="stat-item">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value" style={{ color: '#f39c12' }}>
                        {assessmentSubmissions.filter(s => s.status === 'submitted').length}
                    </div>
                    </div>
                    <div className="stat-item">
                    <div className="stat-label">Graded</div>
                    <div className="stat-value" style={{ color: '#2ecc71' }}>
                        {assessmentSubmissions.filter(s => s.status === 'graded' || s.status === 'released').length}
                    </div>
                    </div>
                    <div className="stat-item">
                    <div className="stat-label">Average</div>
                    <div className="stat-value" style={{ color: '#3498db' }}>
                        {(() => {
                        const gradedSubmissions = assessmentSubmissions.filter(s => s.grade !== null);
                        if (gradedSubmissions.length === 0) return 'N/A';
                        const total = gradedSubmissions.reduce((sum, s) => sum + parseFloat(s.grade), 0);
                        return (total / gradedSubmissions.length).toFixed(1);
                        })()}
                    </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="popup-actions">
                    <button type="submit" className="btn-primary">
                    <i className="fas fa-check-circle"></i> Submit Grade & Mark as Graded
                    </button>
                    <button type="button" onClick={closeGradePopup} className="btn-secondary">
                    <i className="fas fa-times"></i> Cancel
                    </button>
                </div>

                <div style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '15px' }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
                    Once submitted, this grade will be sent to the Exam Administrator for approval.
                </div>
                </form>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default AssessmentViewPage;