import React, { useState } from 'react';

const StudentDashboard = ({ 
  currentUser, 
  assessments, 
  submissions, 
  questions, 
  setSubmissions, 
  setQuestions, 
  handleLogout, 
  goToProfile 
}) => {
  const [questionData, setQuestionData] = useState({ assessmentId: '', text: '' });
  const [invitationCode, setInvitationCode] = useState('');
  const [userModules, setUserModules] = useState([]);

  // Load user's modules on component mount
  useEffect(() => {
    loadUserModules();
  }, [classes, currentUser]);

  const loadUserModules = () => {
    // Find modules where user is enrolled in any class
    const enrolledModules = [];
    modules.forEach(module => {
      const moduleClasses = classes.filter(c => 
        c.module_code === module.code && 
        c.students && 
        c.students.includes(currentUser.id)
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

  const handleJoinModule = async (e) => {
    e.preventDefault();
    const noClassElement = document.getElementById('no-class-found');
      noClassElement.style.display = 'none';
      
      if (!invitationCode || invitationCode.length !== 6 || !/^[A-Z0-9]{6}$/.test(invitationCode)) {
      noClassElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> 
        <strong> Invalid invitation code format.</strong>
        <div style="font-size: 14px; margin-top: 5px;">
          Invitation code must be exactly 6 characters (letters A-Z and numbers 0-9).
          <br>Example: <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">A1B2C3</code>
        </div>
      `;
      noClassElement.style.display = 'block';
      return;
    }
      
      // Get classes for this module
      const moduleClasses = await SupabaseService.getClassesForModule(module.code);
      
      if (moduleClasses.length === 0) {
        alert('This module has no classes set up yet.');
        return;
      }
      
      // Add student to all classes in the module
      let enrolledCount = 0;
      for (const classItem of moduleClasses) {
        try {
          await SupabaseService.addStudentToClass(classItem.id, currentUser.id);
          enrolledCount++;
        } catch (error) {
          console.error(`Error adding to class ${classItem.id}:`, error);
        }
      }
      
      // Update local state
      const updatedClasses = [...classes];
      moduleClasses.forEach(classItem => {
        const index = updatedClasses.findIndex(c => c.id === classItem.id);
        if (index !== -1) {
          const students = updatedClasses[index].students || [];
          if (!students.includes(currentUser.id)) {
            students.push(currentUser.id);
            updatedClasses[index] = { ...updatedClasses[index], students };
          }
        }
      });
      
      setClasses(updatedClasses);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
      
      // Reload user modules
      loadUserModules();
      
      setInvitationCode('');
      alert(`Successfully joined ${module.name}! You've been added to ${enrolledCount} class(es).`);
      
    } catch (error) {
      console.error('Error joining module:', error);
      alert('Failed to join module. Please try again.');
    }
  };

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