import React from 'react';

const ExamAdminDashboard = ({ currentUser, assessments, submissions, users, handleLogout, goToProfile }) => {
  return (
    <div className="main-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="Images/Logo.png" alt="EduConnect Logo" className="logo" />
          <h1>Welcome, {currentUser.name} (Exam Administrator)</h1>
        </div>
        <div>
          <button onClick={goToProfile}>Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <section>
          <h3>Module Results</h3>
          <div>
            {assessments.map(a => (
              <div key={a.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <h4>{a.title} - {a.course}</h4>
                <p>Submissions:</p>
                <ul>
                  {submissions.filter(s => s.assessmentId === a.id).map(s => (
                    <li key={s.id}>
                      Student: {users.find(u => u.id === s.studentId)?.name} - Grade: {s.grade} - Status: {s.status}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Feedback from Students to Lecturers</h3>
          <div>
            {submissions.filter(s => s.feedback).map(s => (
              <div key={s.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <p>Assessment: {assessments.find(a => a.id === s.assessmentId)?.title}</p>
                <p>Student: {users.find(u => u.id === s.studentId)?.name}</p>
                <p>Feedback: {s.feedback}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Grading Criteria</h3>
          <div>
            {assessments.map(a => (
              <div key={a.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                <h4>{a.title}</h4>
                <p>Criteria: {a.criteria}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ExamAdminDashboard;