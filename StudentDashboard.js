import React, { useState } from 'react';

const StudentDashboard = ({ currentUser, assessments, submissions, questions, setSubmissions, setQuestions, handleLogout, goToProfile }) => {
  const [questionData, setQuestionData] = useState({ assessmentId: '', text: '' });

  const submitAssessment = (assessmentId) => {
    const submission = {
      id: Date.now(),
      assessmentId,
      studentId: currentUser.id,
      files: 'file.pdf',
      drafts: [{ version: 1, content: 'file.pdf', timestamp: new Date().toISOString() }],
      grade: null,
      feedback: '',
      status: 'submitted'
    };
    setSubmissions(prev => [...prev, submission]);
    localStorage.setItem('submissions', JSON.stringify([...submissions, submission]));
    alert('Submission successful');
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    const q = { id: Date.now(), assessmentId: parseInt(questionData.assessmentId), studentId: currentUser.id, question: questionData.text, answers: [] };
    setQuestions(prev => [...prev, q]);
    localStorage.setItem('questions', JSON.stringify([...questions, q]));
    setQuestionData({ assessmentId: '', text: '' });
    alert('Question submitted');
  };

  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (Student)</h1>
        </div>
        <div>
          <button onClick={goToProfile}>Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <section>
          <h3>My Assessments</h3>
          <div>
            {assessments.map(a => (
              <div key={a.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                <p>Deadline: {a.deadline}</p>
                <button onClick={() => submitAssessment(a.id)}>Submit</button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Ask a Question</h3>
          <form onSubmit={handleQuestionSubmit}>
            <select
              value={questionData.assessmentId}
              onChange={(e) => setQuestionData({ ...questionData, assessmentId: e.target.value })}
              required
            >
              <option value="">Select Assessment</option>
              {assessments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <textarea
              placeholder="Question"
              value={questionData.text}
              onChange={(e) => setQuestionData({ ...questionData, text: e.target.value })}
              required
            />
            <button type="submit">Ask</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;