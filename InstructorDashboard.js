import React, { useState } from 'react';

const InstructorDashboard = ({ currentUser, assessments, submissions, questions, setAssessments, setSubmissions, setQuestions, handleLogout, goToProfile }) => {
  const [assessmentData, setAssessmentData] = useState({ title: '', description: '', course: '', deadline: '', criteria: '' });

  const handleAssessmentSubmit = (e) => {
    e.preventDefault();
    const assessment = { id: Date.now(), title: assessmentData.title, description: assessmentData.description, course: assessmentData.course, deadline: assessmentData.deadline, criteria: assessmentData.criteria, instructorId: currentUser.id, files: [] };
    setAssessments(prev => [...prev, assessment]);
    localStorage.setItem('assessments', JSON.stringify([...assessments, assessment]));
    setAssessmentData({ title: '', description: '', course: '', deadline: '', criteria: '' });
    alert('Assessment created');
  };

  const gradeSubmission = (submissionId, grade) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, grade, status: 'graded' } : s));
    const updated = submissions.map(s => s.id === submissionId ? { ...s, grade, status: 'graded' } : s);
    localStorage.setItem('submissions', JSON.stringify(updated));
  };

  const updateFeedback = (submissionId, feedback) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, feedback } : s));
    const updated = submissions.map(s => s.id === submissionId ? { ...s, feedback } : s);
    localStorage.setItem('submissions', JSON.stringify(updated));
  };

  const answerQuestion = (questionId, answer) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answers: [...q.answers, { instructorId: currentUser.id, answer, official: true, resolved: false }] } : q));
    const updated = questions.map(q => q.id === questionId ? { ...q, answers: [...q.answers, { instructorId: currentUser.id, answer, official: true, resolved: false }] } : q);
    localStorage.setItem('questions', JSON.stringify(updated));
  };

  const generateInvitationCode = async (moduleCode) => {
    try {
      const newCode = SupabaseService.generateInvitationCode();
      const updatedModule = await SupabaseService.updateModuleInvitationCode(moduleCode, newCode);
      
      // Update local modules
      const updatedModules = modules.map(m => 
        m.code === moduleCode ? { ...m, invitation_code: newCode } : m
      );
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
      
      alert(`Invitation code generated: ${newCode}`);
    } catch (error) {
      console.error('Error generating invitation code:', error);
      alert('Failed to generate invitation code');
    }
  };

  const regenerateInvitationCode = async (moduleCode) => {
    if (!confirm('Are you sure you want to regenerate the invitation code? The old code will no longer work.')) {
      return;
    }
    
    try {
      const newCode = SupabaseService.generateInvitationCode();
      const updatedModule = await SupabaseService.updateModuleInvitationCode(moduleCode, newCode);
      
      // Update local modules
      const updatedModules = modules.map(m => 
        m.code === moduleCode ? { ...m, invitation_code: newCode } : m
      );
      setModules(updatedModules);
      localStorage.setItem('modules', JSON.stringify(updatedModules));
      
      alert(`New invitation code generated: ${newCode}\n\nShare this new code with students.`);
    } catch (error) {
      console.error('Error regenerating invitation code:', error);
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
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Invitation code copied!');
      });
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (Instructor)</h1>
        </div>
        <div>
          <button onClick={goToProfile}>Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <section>
          <h3>Create Assessment</h3>
          <form onSubmit={handleAssessmentSubmit}>
            <input type="text" placeholder="Title" value={assessmentData.title} onChange={(e) => setAssessmentData({ ...assessmentData, title: e.target.value })} required />
            <textarea placeholder="Description" value={assessmentData.description} onChange={(e) => setAssessmentData({ ...assessmentData, description: e.target.value })} required />
            <input type="text" placeholder="Course" value={assessmentData.course} onChange={(e) => setAssessmentData({ ...assessmentData, course: e.target.value })} required />
            <input type="datetime-local" value={assessmentData.deadline} onChange={(e) => setAssessmentData({ ...assessmentData, deadline: e.target.value })} required />
            <textarea placeholder="Grading Criteria" value={assessmentData.criteria} onChange={(e) => setAssessmentData({ ...assessmentData, criteria: e.target.value })} required />
            <button type="submit">Create</button>
          </form>
        </section>
        <section>
          <h3>Submissions</h3>
          <div>
            {submissions.filter(s => assessments.find(a => a.id === s.assessmentId && a.instructorId === currentUser.id)).map(s => (
              <div key={s.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <p>Student: {s.studentId}</p>
                <input type="number" placeholder="Grade" onChange={(e) => gradeSubmission(s.id, e.target.value)} />
                <textarea placeholder="Feedback" value={s.feedback} onChange={(e) => updateFeedback(s.id, e.target.value)} />
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>My Modules</h3>
          <div className="quick-actions">
            {modules.filter(m => m.instructor_id === currentUser.id).map(module => (
              <div key={module.code} className="item-card">
                <h4>{module.name}</h4>
                <p><strong>Code:</strong> {module.code}</p>
                
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
                  <p><strong>Share this code with students to join your module.</strong></p>
                  <p>Students will be automatically added to all classes in this module.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Questions</h3>
          <div>
            {questions.map(q => (
              <div key={q.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <p>{q.question}</p>
                <textarea placeholder="Answer" onChange={(e) => answerQuestion(q.id, e.target.value)} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default InstructorDashboard;