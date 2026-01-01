// StudentDashboard Component
const StudentDashboard = ({ 
  currentUser, 
  assessments, 
  submissions, 
  questions, 
  setSubmissions, 
  setQuestions, 
  handleLogout, 
  goToProfile,
  // ADD THESE MISSING PROPS:
  modules = [],
  classes = [],
  setClasses = () => {}
}) => {
  const [questionData, setQuestionData] = useState({ assessmentId: '', text: '' });
  const [invitationCode, setInvitationCode] = useState('');
  const [userModules, setUserModules] = useState([]);

  // Load user's modules on component mount
  useEffect(() => {
    loadUserModules();
  }, [classes, currentUser, modules]);

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
    
    try {
      // Find module by invitation_code
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
      
      // Get classes for this module
      const moduleClasses = await SupabaseService.getClassesForModule(module.code);
      
      if (moduleClasses.length === 0) {
        alert(`Module "${module.name}" has no classes set up yet. Please contact the instructor.`);
        return;
      }
      
      // Add student to all classes in the module
      let enrolledCount = 0;
      let alreadyEnrolledCount = 0;
      
      for (const classItem of moduleClasses) {
        try {
          const result = await SupabaseService.addStudentToClass(classItem.id, currentUser.id);
          
          // Check if student was newly added
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
      
      // Update local state
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
      
      // Reload user modules
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

  // ... rest of the StudentDashboard functions remain the same ...

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
          <div className="quick-actions">
            {assessments.map(a => (
              <div key={a.id} className="item-card">
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                <p><strong>Deadline:</strong> {a.deadline}</p>
                <button 
                  onClick={() => submitAssessment(a.id)}
                  className="btn-primary"
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  Submit Assessment
                </button>
              </div>
            ))}
          </div>
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
            <h4>My Enrolled Modules</h4>
            {userModules.length > 0 ? (
              <div className="quick-actions">
                {userModules.map(module => (
                  <div key={module.code} className="item-card">
                    <h5>{module.name}</h5>
                    <p><strong>Module Code:</strong> {module.code}</p>
                    <p><strong>Invitation Code:</strong> {module.invitation_code}</p>
                    <p><strong>Classes enrolled:</strong> {module.classCount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>You haven't joined any modules yet. Enter an invitation code above.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};