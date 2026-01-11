import React, { useState, useEffect } from 'react';

const AssessmentViewPage = ({
  currentUser,
  assessments = [],
  submissions = [],
  questions = [],
  modules = [],
  users = [],
  setSubmissions = () => {},
  setQuestions = () => {},
  handleLogout = () => {},
  goToProfile = () => {},
  goBack = () => {}
}) => {
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [answers, setAnswers] = useState({});

  // Get assessment ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const assessmentId = urlParams.get('assessment');
    
    if (assessmentId) {
      const assessment = assessments.find(a => a.id === parseInt(assessmentId) || a.id === assessmentId);
      if (assessment) {
        setCurrentAssessment(assessment);
        
        // Check if user has access to this assessment
        const module = modules.find(m => 
          m.code === assessment.module_code || 
          m.code === assessment.moduleCode ||
          (assessment.course && m.name.includes(assessment.course))
        );
        
        if (currentUser.role === 'Student') {
          // Student: Check if enrolled in the module
          if (!module) {
            alert('You do not have access to this assessment');
            goBack();
            return;
          }
          
          // Check if student is enrolled in any class of this module
          const hasAccess = true; // You should implement proper access check
          if (!hasAccess) {
            alert('You are not enrolled in this module');
            goBack();
          }
        }
      } else {
        alert('Assessment not found');
        goBack();
      }
    }
  }, [assessments, currentUser, modules, goBack]);

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

  // Get module
  const module = modules.find(m => 
    m.code === currentAssessment?.module_code || 
    m.code === currentAssessment?.moduleCode ||
    (currentAssessment?.course && m.name.includes(currentAssessment.course))
  );

  // Handle file selection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
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
    } catch (error) {
      console.error('Error submitting assessment:', error);
      const updatedSubmissions = [...submissions, submission];
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      alert('Assessment submitted (local)');
      setSelectedFile(null);
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
    } catch (error) {
      console.error('Error asking question:', error);
      const updatedQuestions = [...questions, question];
      setQuestions(updatedQuestions);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      alert('Question submitted (local)');
      setNewQuestion('');
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
        {/* Assessment Overview */}
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
              <strong>Status:</strong> {currentAssessment.status || 'draft'}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginTop: '30px'
        }}>
          {/* Left Column - Assessment Details */}
          <div>
            <section style={{ marginBottom: '30px' }}>
              <h3><i className="fas fa-info-circle" style={{ color: '#667eea' }}></i> Assessment Details</h3>
              <div className="item-card">
                <h4>Description</h4>
                <p>{currentAssessment.description}</p>
                
                {currentAssessment.criteria && (
                  <>
                    <h4 style={{ marginTop: '20px' }}>Grading Criteria</h4>
                    <p>{currentAssessment.criteria}</p>
                  </>
                )}
                
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                  <h4>Assessment Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div>
                      <p><strong>Type:</strong> {currentAssessment.type?.toUpperCase() || 'ASSIGNMENT'}</p>
                      <p><strong>Max Marks:</strong> {currentAssessment.maxMarks || currentAssessment.max_marks || 100}</p>
                    </div>
                    <div>
                      <p><strong>Due Date:</strong> {new Date(currentAssessment.dueDate || currentAssessment.due_date).toLocaleString()}</p>
                      <p><strong>Created:</strong> {new Date(currentAssessment.createdAt || currentAssessment.created_at).toLocaleDateString()}</p>
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
            </section>

            {/* Questions Section */}
            <section>
              <h3><i className="fas fa-question-circle" style={{ color: '#9b59b6' }}></i> Questions & Answers ({assessmentQuestions.length})</h3>
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
          </div>

          {/* Right Column - Submission & Status */}
          <div>
            {/* Student Submission Section */}
            {currentUser.role === 'Student' && (
              <section style={{ marginBottom: '30px' }}>
                <h3><i className="fas fa-upload" style={{ color: '#2ecc71' }}></i> Your Submission</h3>
                {!studentSubmission ? (
                  <div className="item-card">
                    <h4>Submit Your Work</h4>
                    <p>Please upload your completed assessment file.</p>
                    
                    <div style={{ margin: '20px 0' }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                        Select File
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
                    
                    <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                      <p><strong>Submission Guidelines:</strong></p>
                      <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                        <li>Only upload the required file types (PDF, DOC, DOCX, ZIP)</li>
                        <li>Maximum file size: 10MB</li>
                        <li>Make sure to include your name and student ID in the submission</li>
                        <li>You can only submit once</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="item-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0 }}>Submission Status</h4>
                      <span className={`status-badge status-${studentSubmission.status}`}>
                        {studentSubmission.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '15px'
                    }}>
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
                          <div style={{
                            padding: '12px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                          }}>
                            <p style={{ margin: 0, color: '#333' }}>{studentSubmission.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a
                        href={studentSubmission.fileUrl}
                        download
                        className="btn-primary"
                        style={{ flex: 1 }}
                      >
                        <i className="fas fa-download"></i> Download Your Submission
                      </a>
                      {currentAssessment.fileUrl && (
                        <a
                          href={currentAssessment.fileUrl}
                          download
                          className="btn-secondary"
                        >
                          <i className="fas fa-file-download"></i> Assessment
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Instructor View - Submissions */}
            {currentUser.role === 'Instructor' && (
              <section style={{ marginBottom: '30px' }}>
                <h3><i className="fas fa-users" style={{ color: '#e74c3c' }}></i> Student Submissions ({assessmentSubmissions.length})</h3>
                {assessmentSubmissions.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                    <h4>No submissions yet</h4>
                    <p>Student submissions will appear here once they submit their work.</p>
                  </div>
                ) : (
                  <div>
                    {assessmentSubmissions.map(submission => {
                      const student = users.find(u => u.id === submission.studentId);
                      return (
                        <div key={submission.id} className="item-card" style={{ marginBottom: '15px' }}>
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
                          
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            marginBottom: '10px'
                          }}>
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
                              <div style={{
                                padding: '10px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                marginTop: '10px'
                              }}>
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
                          
                          <button
                            onClick={() => {
                              window.location.href = `?page=module&module=${module?.code}&tab=grading`;
                            }}
                            className="btn-primary"
                            style={{ width: '100%' }}
                          >
                            <i className="fas fa-graduation-cap"></i> Grade Submission
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Module Information */}
            <section>
              <h3><i className="fas fa-book" style={{ color: '#3498db' }}></i> Module Information</h3>
              <div className="item-card">
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
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentViewPage;