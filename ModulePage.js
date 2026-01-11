// ModulePage.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';

const ModulePage = ({ 
  currentUser, 
  modules = [], 
  assessments = [], 
  submissions = [], 
  questions = [], 
  users = [],
  teachingMaterials = [],
  setAssessments = () => {},
  setSubmissions = () => {},
  setTeachingMaterials = () => {},
  setQuestions = () => {},
  handleLogout = () => {},
  goToProfile = () => {},
  goBack = () => {}
}) => {
  const [currentModule, setCurrentModule] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', file: null });
  const [newAssessment, setNewAssessment] = useState({ 
    title: '', 
    description: '', 
    type: 'assignment', 
    dueDate: '', 
    maxMarks: 100,
    criteria: '',
    file: null 
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [gradingData, setGradingData] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});

  // Debug: Log everything on component mount
  useEffect(() => {
    console.log('=== MODULE PAGE MOUNTED ===');
    console.log('Current user:', currentUser);
    console.log('All modules:', modules);
    console.log('All assessments:', assessments);
    console.log('Assessments count:', assessments.length);
    
    // Check each assessment's module reference
    if (assessments.length > 0) {
      console.log('=== ASSESSMENT MODULE REFERENCES ===');
      assessments.forEach((a, i) => {
        console.log(`Assessment ${i} (ID: ${a.id}):`, {
          title: a.title,
          module_code: a.module_code,
          moduleCode: a.moduleCode,
          course: a.course,
          instructor_id: a.instructor_id,
          instructorId: a.instructorId
        });
      });
    }
  }, []);

  // Get module from URL parameter
  useEffect(() => {
    console.log('=== GETTING MODULE FROM URL ===');
    const urlParams = new URLSearchParams(window.location.search);
    const moduleCode = urlParams.get('module');
    console.log('URL module parameter:', moduleCode);
    
    if (moduleCode) {
      const module = modules.find(m => m.code === moduleCode);
      console.log('Found module in modules array:', module);
      
      if (module) {
        setCurrentModule(module);
        
        // Check if user has access to this module
        if (currentUser.role === 'Student') {
          // Student: Check if enrolled in any class of this module
          console.log('Student access check - module found');
        } else if (currentUser.role === 'Instructor') {
          // Instructor: Check if assigned to this module
          const instructorId = module.instructor_id || module.instructorId;
          console.log('Module instructor ID:', instructorId, 'Current user ID:', currentUser.id);
          if (instructorId !== currentUser.id) {
            alert('You are not assigned to this module');
            goBack();
          }
        } else if (currentUser.role === 'Exam Administrator') {
          // Exam Admin: Check if assigned to this module
          const examAdminId = module.exam_admin_id || module.examAdminId || module.examAdminId;
          console.log('Module exam admin ID check:', {
            exam_admin_id: module.exam_admin_id,
            examAdminId: module.examAdminId,
            currentUserId: currentUser.id,
            type: typeof currentUser.id,
            typeExamAdminId: typeof examAdminId
          });
          
          if (examAdminId && parseInt(examAdminId) !== parseInt(currentUser.id)) {
            alert('You are not assigned to this module');
            goBack();
          }
        }
      } else {
        console.log('Module not found in modules array');
        alert('Module not found');
        goBack();
      }
    }
  }, [modules, currentUser, goBack]);

  // Filter module-specific data with SIMPLE, WORKING filter
  const moduleAssessments = assessments.filter(a => {
    // Get module reference from ANY possible field
    const assessmentModuleRef = a.module_code || a.moduleCode || a.course;
    
    console.log('Filtering - Assessment:', a.id, a.title);
    console.log('  - Assessment module ref:', assessmentModuleRef);
    console.log('  - Current module code:', currentModule?.code);
    
    // Simple exact match
    const match = assessmentModuleRef === currentModule?.code;
    console.log('  - Match result:', match);
    
    return match;
  });

  console.log('=== FILTER RESULTS ===');
  console.log('Current module:', currentModule);
  console.log('Module assessments found:', moduleAssessments.length);
  console.log('Module assessments:', moduleAssessments);

  const moduleTeachingMaterials = teachingMaterials.filter(tm => 
    tm.moduleCode === currentModule?.code || tm.module_code === currentModule?.code
  );
  
  const moduleSubmissions = submissions.filter(s => 
    moduleAssessments.some(a => a.id === s.assessmentId)
  );
  
  const moduleQuestions = questions.filter(q => 
    moduleAssessments.some(a => a.id === q.assessmentId)
  );

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Add teaching material (Instructor only)
  const addTeachingMaterial = async (e) => {
    e.preventDefault();
    
    if (!newMaterial.title || !newMaterial.description) {
      alert('Please fill in all required fields');
      return;
    }

    const material = {
      id: Date.now(),
      moduleCode: currentModule.code,
      title: newMaterial.title,
      description: newMaterial.description,
      type: newMaterial.file ? 'file' : 'text',
      fileName: newMaterial.file ? newMaterial.file.name : null,
      fileUrl: newMaterial.file ? URL.createObjectURL(newMaterial.file) : null,
      uploadedBy: currentUser.id,
      uploadedAt: new Date().toISOString(),
      views: 0
    };

    try {
      const createdMaterial = await SupabaseService.createTeachingMaterial(material);
      const updatedMaterials = [...teachingMaterials, createdMaterial];
      setTeachingMaterials(updatedMaterials);
      localStorage.setItem('teachingMaterials', JSON.stringify(updatedMaterials));
      alert('Teaching material added successfully');
      setNewMaterial({ title: '', description: '', file: null });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error adding teaching material:', error);
      const updatedMaterials = [...teachingMaterials, material];
      setTeachingMaterials(updatedMaterials);
      localStorage.setItem('teachingMaterials', JSON.stringify(updatedMaterials));
      alert('Teaching material added (local)');
      setNewMaterial({ title: '', description: '', file: null });
      setSelectedFile(null);
    }
  };

  const addAssessment = async (e) => {
    e.preventDefault();
    
    if (!newAssessment.title || !newAssessment.dueDate) {
        alert('Please fill in all required fields');
        return;
    }

    console.log('Creating assessment for module:', currentModule.code);

    // Convert to snake_case for database
    const assessment = {
        module_code: currentModule.code,
        title: newAssessment.title,
        description: newAssessment.description,
        type: newAssessment.type,
        due_date: newAssessment.dueDate,
        max_marks: parseInt(newAssessment.maxMarks),
        criteria: newAssessment.criteria,
        instructor_id: currentUser.id,
        file_name: newAssessment.file ? newAssessment.file.name : null,
        file_path: newAssessment.file ? URL.createObjectURL(newAssessment.file) : null,
        status: 'draft',
        approved_by_exam_admin: false,
        created_at: new Date().toISOString()
    };

    try {
        const createdAssessment = await SupabaseService.createAssessment(assessment);
        
        // Convert back to camelCase for frontend
        const frontendAssessment = {
            ...createdAssessment,
            moduleCode: createdAssessment.module_code,
            dueDate: createdAssessment.due_date,
            maxMarks: createdAssessment.max_marks,
            instructorId: createdAssessment.instructor_id,
            fileName: createdAssessment.file_name,
            fileUrl: createdAssessment.file_path,
            createdAt: createdAssessment.created_at,
            approvedByExamAdmin: createdAssessment.approved_by_exam_admin
        };
        
        const updatedAssessments = [...assessments, frontendAssessment];
        setAssessments(updatedAssessments);
        localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
        alert('Assessment created successfully');
        
        setNewAssessment({ 
            title: '', 
            description: '', 
            type: 'assignment', 
            dueDate: '', 
            maxMarks: 100,
            criteria: '',
            file: null 
        });
        setActiveTab('assessments');
    } catch (error) {
        console.error('Error creating assessment:', error);
        
        const fallbackAssessment = {
            id: Date.now(),
            moduleCode: currentModule.code,
            title: newAssessment.title,
            description: newAssessment.description,
            type: newAssessment.type,
            dueDate: newAssessment.dueDate,
            maxMarks: parseInt(newAssessment.maxMarks),
            criteria: newAssessment.criteria,
            instructorId: currentUser.id,
            fileName: newAssessment.file ? newAssessment.file.name : null,
            fileUrl: newAssessment.file ? URL.createObjectURL(newAssessment.file) : null,
            createdAt: new Date().toISOString(),
            status: 'draft',
            approvedByExamAdmin: false
        };
        
        const updatedAssessments = [...assessments, fallbackAssessment];
        setAssessments(updatedAssessments);
        localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
        alert('Assessment created (local)');
        
        setNewAssessment({ 
            title: '', 
            description: '', 
            type: 'assignment', 
            dueDate: '', 
            maxMarks: 100,
            criteria: '',
            file: null 
        });
        setActiveTab('assessments');
    }
  };

  // Submit assessment (Student only)
  const submitAssessment = async (assessmentId) => {
    if (!selectedFile) {
      alert('Please select a file to submit');
      return;
    }

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

  // Grade submission (Instructor only)
  const gradeSubmission = async (submissionId, grade, feedback) => {
    try {
      const submission = submissions.find(s => s.id === submissionId);
      const updatedSubmission = {
        ...submission,
        grade: parseFloat(grade),
        feedback,
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
      alert('Submission graded successfully');
    } catch (error) {
      console.error('Error grading submission:', error);
      const updatedSubmissions = submissions.map(s => 
        s.id === submissionId ? { 
          ...s, 
          grade: parseFloat(grade), 
          feedback,
          markedBy: currentUser.id,
          markedAt: new Date().toISOString(),
          status: 'graded',
          approvedByExamAdmin: false
        } : s
      );
      setSubmissions(updatedSubmissions);
      localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
      alert('Submission graded (local)');
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
      
      setApprovalStatus(prev => ({
        ...prev,
        [submissionId]: approved ? 'approved' : 'rejected'
      }));
      
      alert(`Grade ${approved ? 'approved and released' : 'rejected'}`);
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
      
      setApprovalStatus(prev => ({
        ...prev,
        [submissionId]: approved ? 'approved' : 'rejected'
      }));
      
      alert(`Grade ${approved ? 'approved (local)' : 'rejected (local)'}`);
    }
  };

  // Delete teaching material (Instructor only)
  const deleteTeachingMaterial = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this teaching material?')) {
      try {
        await SupabaseService.deleteTeachingMaterial(materialId);
        const updatedMaterials = teachingMaterials.filter(tm => tm.id !== materialId);
        setTeachingMaterials(updatedMaterials);
        localStorage.setItem('teachingMaterials', JSON.stringify(updatedMaterials));
        alert('Teaching material deleted');
      } catch (error) {
        console.error('Error deleting material:', error);
        const updatedMaterials = teachingMaterials.filter(tm => tm.id !== materialId);
        setTeachingMaterials(updatedMaterials);
        localStorage.setItem('teachingMaterials', JSON.stringify(updatedMaterials));
        alert('Teaching material deleted (local)');
      }
    }
  };

  // Delete assessment (Instructor only)
  const deleteAssessment = async (assessmentId) => {
    if (window.confirm('Are you sure you want to delete this assessment? All submissions will also be deleted.')) {
      try {
        await SupabaseService.deleteAssessment(assessmentId);
        const updatedAssessments = assessments.filter(a => a.id !== assessmentId);
        setAssessments(updatedAssessments);
        localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
        
        const updatedSubmissions = submissions.filter(s => s.assessmentId !== assessmentId);
        setSubmissions(updatedSubmissions);
        localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
        
        alert('Assessment and related submissions deleted');
      } catch (error) {
        console.error('Error deleting assessment:', error);
        const updatedAssessments = assessments.filter(a => a.id !== assessmentId);
        setAssessments(updatedAssessments);
        localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
        
        const updatedSubmissions = submissions.filter(s => s.assessmentId !== assessmentId);
        setSubmissions(updatedSubmissions);
        localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
        
        alert('Assessment deleted (local)');
      }
    }
  };

  if (!currentModule) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading module...</p>
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
            <h1>{currentModule.name}</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '16px' }}>
              Code: {currentModule.code} • {currentUser.role}
            </p>
          </div>
        </div>
        <div>
          <button onClick={goToProfile} className="btn-secondary">Profile</button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </header>

      <main>
        {/* Module Overview */}
        <section className="welcome-banner">
          <h2 className="welcome-title">{currentModule.name}</h2>
          <p className="welcome-subtitle">{currentModule.description}</p>
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
              <strong>Assessments:</strong> {moduleAssessments.length}
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '10px 20px', 
              borderRadius: '8px' 
            }}>
              <strong>Materials:</strong> {moduleTeachingMaterials.length}
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '10px 20px', 
              borderRadius: '8px' 
            }}>
              <strong>Your Submissions:</strong> {moduleSubmissions.filter(s => s.studentId === currentUser.id).length}
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
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-home"></i> Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <i className="fas fa-book"></i> Teaching Materials
          </button>
          <button
            className={`tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assessments')}
          >
            <i className="fas fa-tasks"></i> Assessments
          </button>
          {(currentUser.role === 'Instructor' || currentUser.role === 'Exam Administrator') && (
            <button
              className={`tab-btn ${activeTab === 'grading' ? 'active' : ''}`}
              onClick={() => setActiveTab('grading')}
            >
              <i className="fas fa-graduation-cap"></i> Grading
            </button>
          )}
          {currentUser.role === 'Student' && (
            <button
              className={`tab-btn ${activeTab === 'my-work' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-work')}
            >
              <i className="fas fa-user-check"></i> My Work
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <section>
              <h3>Module Overview</h3>
              <div className="quick-actions">
                <div className="item-card">
                  <h4><i className="fas fa-info-circle" style={{ color: '#667eea' }}></i> Module Information</h4>
                  <p><strong>Code:</strong> {currentModule.code}</p>
                  <p><strong>Name:</strong> {currentModule.name}</p>
                  <p><strong>Description:</strong> {currentModule.description}</p>
                </div>
                
                <div className="item-card">
                  <h4><i className="fas fa-chart-line" style={{ color: '#2ecc71' }}></i> Quick Stats</h4>
                  <p><strong>Total Assessments:</strong> {moduleAssessments.length}</p>
                  <p><strong>Teaching Materials:</strong> {moduleTeachingMaterials.length}</p>
                  <p><strong>Pending Submissions:</strong> {moduleSubmissions.filter(s => s.status === 'submitted').length}</p>
                  <p><strong>Released Grades:</strong> {moduleSubmissions.filter(s => s.releasedToStudent).length}</p>
                </div>

                {(currentUser.role === 'Instructor' || currentUser.role === 'Exam Administrator') && (
                  <div className="item-card">
                    <h4><i className="fas fa-bell" style={{ color: '#e74c3c' }}></i> Action Required</h4>
                    {currentUser.role === 'Instructor' && (
                      <>
                        <p><strong>Submissions to grade:</strong> {moduleSubmissions.filter(s => s.status === 'submitted').length}</p>
                        <p><strong>Grades needing revision:</strong> {moduleSubmissions.filter(s => s.status === 'needs_revision').length}</p>
                      </>
                    )}
                    {currentUser.role === 'Exam Administrator' && (
                      <>
                        <p><strong>Grades to approve:</strong> {moduleSubmissions.filter(s => s.status === 'graded' && !s.approvedByExamAdmin).length}</p>
                        <p><strong>Approved grades:</strong> {moduleSubmissions.filter(s => s.approvedByExamAdmin).length}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Teaching Materials Tab */}
          {activeTab === 'materials' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Teaching Materials</h3>
                {currentUser.role === 'Instructor' && (
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('add-material')}
                  >
                    <i className="fas fa-plus"></i> Add Material
                  </button>
                )}
              </div>
              
              {moduleTeachingMaterials.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-book-open" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                  <h4>No teaching materials yet</h4>
                  <p>Check back later or contact your instructor.</p>
                </div>
              ) : (
                <div className="quick-actions">
                  {moduleTeachingMaterials.map(material => (
                    <div key={material.id} className="item-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4>{material.title}</h4>
                          <p>{material.description}</p>
                          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                            <i className="far fa-calendar"></i> Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {material.fileUrl && (
                            <a href={material.fileUrl} download className="btn-secondary" style={{ padding: '8px 12px' }}>
                              <i className="fas fa-download"></i>
                            </a>
                          )}
                          {currentUser.role === 'Instructor' && (
                            <button 
                              onClick={() => deleteTeachingMaterial(material.id)}
                              className="btn-danger"
                              style={{ padding: '8px 12px' }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Add Teaching Material Tab (Instructor only) */}
          {activeTab === 'add-material' && currentUser.role === 'Instructor' && (
            <section>
              <h3>Add Teaching Material</h3>
              <form onSubmit={addTeachingMaterial} className="form-container">
                <input
                  type="text"
                  placeholder="Title *"
                  value={newMaterial.title}
                  onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description *"
                  value={newMaterial.description}
                  onChange={e => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  rows="4"
                  required
                />
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                    Upload File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files[0] })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    <i className="fas fa-upload"></i> Upload Material
                  </button>
                  <button type="button" onClick={() => setActiveTab('materials')} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Assessments Tab */}
          {activeTab === 'assessments' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Assessments</h3>
                {currentUser.role === 'Instructor' && (
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('add-assessment')}
                  >
                    <i className="fas fa-plus"></i> Create Assessment
                  </button>
                )}
              </div>
              
              {moduleAssessments.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-tasks" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
                  <h4>No assessments yet</h4>
                  <p>Check back later or contact your instructor.</p>
                </div>
              ) : (
                <div className="quick-actions">
                  {moduleAssessments.map(assessment => {
                    const studentSubmission = moduleSubmissions.find(s => 
                      s.assessmentId === assessment.id && s.studentId === currentUser.id
                    );
                    
                    return (
                      <div key={assessment.id} className="item-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <h4 style={{ margin: 0, cursor: 'pointer' }} 
                                  onClick={() => window.location.href = `?page=assessment-view&assessment=${assessment.id}`}>
                                {assessment.title}
                              </h4>
                              <span style={{
                                padding: '4px 8px',
                                backgroundColor: assessment.type === 'exam' ? '#e74c3c' : '#3498db',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {assessment.type.toUpperCase()}
                              </span>
                            </div>
                            <p>{assessment.description}</p>
                            
                            {/* Add a quick view button */}
                            <button 
                              onClick={() => window.location.href = `?page=assessment-view&assessment=${assessment.id}`}
                              className="btn-secondary"
                              style={{ marginTop: '10px', padding: '8px 12px' }}
                            >
                              <i className="fas fa-info-circle"></i> View Details
                            </button>
                            <div style={{ 
                              display: 'flex', 
                              gap: '20px', 
                              marginTop: '15px',
                              fontSize: '14px',
                              color: '#666'
                            }}>
                              <div>
                                <i className="far fa-calendar"></i> Due: {new Date(assessment.dueDate || assessment.due_date).toLocaleDateString()}
                              </div>
                              <div>
                                <i className="fas fa-star"></i> Max Marks: {assessment.maxMarks || assessment.max_marks}
                              </div>
                              {studentSubmission && (
                                <div style={{
                                  color: studentSubmission.status === 'released' ? '#2ecc71' : 
                                         studentSubmission.status === 'graded' ? '#f39c12' : '#3498db'
                                }}>
                                  <i className="fas fa-check-circle"></i> Status: {studentSubmission.status}
                                </div>
                              )}
                            </div>
                            
                            {/* Student Actions */}
                            {currentUser.role === 'Student' && (
                              <div style={{ marginTop: '20px' }}>
                                {!studentSubmission ? (
                                  <>
                                    <div style={{ marginBottom: '10px' }}>
                                      <input
                                        type="file"
                                        id={`file-${assessment.id}`}
                                        onChange={handleFileUpload}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                      />
                                    </div>
                                    <button 
                                      onClick={() => submitAssessment(assessment.id)}
                                      className="btn-primary"
                                      style={{ width: '100%' }}
                                      disabled={!selectedFile}
                                    >
                                      Submit Assessment
                                    </button>
                                  </>
                                ) : (
                                  <div style={{ 
                                    padding: '15px', 
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    <h5>Your Submission</h5>
                                    <p><strong>Submitted:</strong> {new Date(studentSubmission.submittedAt).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> {studentSubmission.status}</p>
                                    {studentSubmission.grade !== null && (
                                      <p><strong>Grade:</strong> {studentSubmission.grade}/{assessment.maxMarks || assessment.max_marks}</p>
                                    )}
                                    {studentSubmission.feedback && (
                                      <p><strong>Feedback:</strong> {studentSubmission.feedback}</p>
                                    )}
                                    <a 
                                      href={studentSubmission.fileUrl} 
                                      download 
                                      className="btn-secondary"
                                      style={{ marginTop: '10px' }}
                                    >
                                      <i className="fas fa-download"></i> Download Submission
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Instructor Actions */}
                          {currentUser.role === 'Instructor' && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button 
                                onClick={() => {
                                  setActiveTab('grading');
                                }}
                                className="btn-secondary"
                                style={{ padding: '8px 12px' }}
                              >
                                <i className="fas fa-graduation-cap"></i> Grade
                              </button>
                              <button 
                                onClick={() => deleteAssessment(assessment.id)}
                                className="btn-danger"
                                style={{ padding: '8px 12px' }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Add Assessment Tab (Instructor only) */}
          {activeTab === 'add-assessment' && currentUser.role === 'Instructor' && (
            <section>
              <h3>Create Assessment</h3>
              <form onSubmit={addAssessment} className="form-container">
                <input
                  type="text"
                  placeholder="Assessment Title *"
                  value={newAssessment.title}
                  onChange={e => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description *"
                  value={newAssessment.description}
                  onChange={e => setNewAssessment({ ...newAssessment, description: e.target.value })}
                  rows="4"
                  required
                />
                <select
                  value={newAssessment.type}
                  onChange={e => setNewAssessment({ ...newAssessment, type: e.target.value })}
                  required
                >
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                </select>
                <input
                  type="datetime-local"
                  placeholder="Due Date *"
                  value={newAssessment.dueDate}
                  onChange={e => setNewAssessment({ ...newAssessment, dueDate: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Maximum Marks *"
                  value={newAssessment.maxMarks}
                  onChange={e => setNewAssessment({ ...newAssessment, maxMarks: e.target.value })}
                  min="0"
                  max="1000"
                  required
                />
                <textarea
                  placeholder="Grading Criteria"
                  value={newAssessment.criteria}
                  onChange={e => setNewAssessment({ ...newAssessment, criteria: e.target.value })}
                  rows="3"
                />
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                    Assessment File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setNewAssessment({ ...newAssessment, file: e.target.files[0] })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    <i className="fas fa-plus-circle"></i> Create Assessment
                  </button>
                  <button type="button" onClick={() => setActiveTab('assessments')} className="btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Grading Tab (Instructor & Exam Admin) */}
          {(activeTab === 'grading' && (currentUser.role === 'Instructor' || currentUser.role === 'Exam Administrator')) && (
            <section>
              <h3>Grading & Approval</h3>
              
              {currentUser.role === 'Instructor' && (
                <>
                  <div className="quick-actions">
                    {moduleSubmissions.filter(s => s.status === 'submitted' || s.status === 'needs_revision').map(submission => {
                      const assessment = moduleAssessments.find(a => a.id === submission.assessmentId);
                      const student = users.find(u => u.id === submission.studentId);
                      
                      return (
                        <div key={submission.id} className="item-card">
                          <h4>{assessment?.title || 'Unknown Assessment'}</h4>
                          <p><strong>Student:</strong> {student?.name || 'Unknown'}</p>
                          <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</p>
                          <p><strong>Current Status:</strong> {submission.status}</p>
                          
                          <div style={{ marginTop: '15px' }}>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Grade (/{assessment?.maxMarks || assessment?.max_marks || 100})</label>
                              <input
                                type="number"
                                placeholder="Enter grade"
                                min="0"
                                max={assessment?.maxMarks || assessment?.max_marks || 100}
                                value={gradingData[submission.id]?.grade || submission.grade || ''}
                                onChange={e => setGradingData(prev => ({
                                  ...prev,
                                  [submission.id]: { ...prev[submission.id], grade: e.target.value }
                                }))}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            </div>
                            
                            <div style={{ marginBottom: '10px' }}>
                              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Feedback</label>
                              <textarea
                                placeholder="Provide feedback..."
                                value={gradingData[submission.id]?.feedback || submission.feedback || ''}
                                onChange={e => setGradingData(prev => ({
                                  ...prev,
                                  [submission.id]: { ...prev[submission.id], feedback: e.target.value }
                                }))}
                                rows="3"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => gradeSubmission(
                                  submission.id,
                                  gradingData[submission.id]?.grade || submission.grade,
                                  gradingData[submission.id]?.feedback || submission.feedback
                                )}
                                className="btn-primary"
                                style={{ flex: 1 }}
                              >
                                <i className="fas fa-check"></i> Submit Grade
                              </button>
                              <a href={submission.fileUrl} download className="btn-secondary" style={{ padding: '8px 16px' }}>
                                <i className="fas fa-download"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ marginTop: '30px' }}>
                    <h4>Graded Submissions</h4>
                    <div className="quick-actions">
                      {moduleSubmissions.filter(s => s.status === 'graded').map(submission => {
                        const assessment = moduleAssessments.find(a => a.id === submission.assessmentId);
                        const student = users.find(u => u.id === submission.studentId);
                        
                        return (
                          <div key={submission.id} className="item-card">
                            <h4>{assessment?.title || 'Unknown Assessment'}</h4>
                            <p><strong>Student:</strong> {student?.name || 'Unknown'}</p>
                            <p><strong>Grade:</strong> {submission.grade}/{assessment?.maxMarks || assessment?.max_marks || 100}</p>
                            <p><strong>Status:</strong> 
                              {submission.approvedByExamAdmin ? ' Approved by Exam Admin' : ' Pending Exam Admin Approval'}
                            </p>
                            <p><strong>Feedback:</strong> {submission.feedback || 'No feedback provided'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {currentUser.role === 'Exam Administrator' && (
                <>
                  <div className="quick-actions">
                    {moduleSubmissions.filter(s => s.status === 'graded' && !s.approvedByExamAdmin).map(submission => {
                      const assessment = moduleAssessments.find(a => a.id === submission.assessmentId);
                      const student = users.find(u => u.id === submission.studentId);
                      const instructor = users.find(u => u.id === submission.markedBy);
                      
                      return (
                        <div key={submission.id} className="item-card">
                          <h4>{assessment?.title || 'Unknown Assessment'}</h4>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '10px',
                            marginBottom: '15px'
                          }}>
                            <div>
                              <p><strong>Student:</strong> {student?.name || 'Unknown'}</p>
                              <p><strong>Instructor:</strong> {instructor?.name || 'Unknown'}</p>
                            </div>
                            <div>
                              <p><strong>Grade:</strong> {submission.grade}/{assessment?.maxMarks || assessment?.max_marks || 100}</p>
                              <p><strong>Marked:</strong> {new Date(submission.markedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div style={{ 
                            padding: '15px', 
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            marginBottom: '15px'
                          }}>
                            <h5 style={{ marginTop: '0' }}>Instructor Feedback</h5>
                            <p>{submission.feedback || 'No feedback provided'}</p>
                          </div>
                          
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
                            <a href={submission.fileUrl} download className="btn-secondary" style={{ padding: '8px 16px' }}>
                              <i className="fas fa-download"></i>
                            </a>
                          </div>
                          
                          {approvalStatus[submission.id] && (
                            <div style={{
                              marginTop: '10px',
                              padding: '10px',
                              backgroundColor: approvalStatus[submission.id] === 'approved' ? '#d4edda' : '#f8d7da',
                              color: approvalStatus[submission.id] === 'approved' ? '#155724' : '#721c24',
                              borderRadius: '4px',
                              textAlign: 'center'
                            }}>
                              <i className={`fas fa-${approvalStatus[submission.id] === 'approved' ? 'check' : 'times'}`}></i>
                              {' '}
                              Grade {approvalStatus[submission.id]} successfully
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ marginTop: '30px' }}>
                    <h4>Approved Grades</h4>
                    <div className="quick-actions">
                      {moduleSubmissions.filter(s => s.approvedByExamAdmin).map(submission => {
                        const assessment = moduleAssessments.find(a => a.id === submission.assessmentId);
                        const student = users.find(u => u.id === submission.studentId);
                        
                        return (
                          <div key={submission.id} className="item-card">
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center' 
                            }}>
                              <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{assessment?.title || 'Unknown Assessment'}</h4>
                                <p style={{ margin: '0', color: '#666' }}>{student?.name || 'Unknown'}</p>
                              </div>
                              <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#2ecc71',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                RELEASED
                              </span>
                            </div>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '10px',
                              marginTop: '10px'
                            }}>
                              <div>
                                <p><strong>Grade:</strong> {submission.grade}/{assessment?.maxMarks || assessment?.max_marks || 100}</p>
                                <p><strong>Approved:</strong> {new Date(submission.markedAt).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p><strong>Status:</strong> Released to Student</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Student My Work Tab */}
          {activeTab === 'my-work' && currentUser.role === 'Student' && (
            <section>
              <h3>My Work & Grades</h3>
              
              <div className="quick-actions">
                {moduleSubmissions.filter(s => s.studentId === currentUser.id).map(submission => {
                  const assessment = moduleAssessments.find(a => a.id === submission.assessmentId);
                  
                  return (
                    <div key={submission.id} className="item-card">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '15px'
                      }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0' }}>{assessment?.title || 'Unknown Assessment'}</h4>
                          <p style={{ margin: '0', color: '#666' }}>
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: submission.status === 'released' ? '#2ecc71' : 
                                         submission.status === 'graded' ? '#f39c12' : 
                                         submission.status === 'submitted' ? '#3498db' : '#e74c3c',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {submission.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        {submission.releasedToStudent ? (
                          <>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '15px',
                              marginBottom: '15px'
                            }}>
                              <div>
                                <p style={{ margin: '0 0 5px 0', color: '#666' }}>Your Grade</p>
                                <h3 style={{ margin: '0', color: '#2ecc71' }}>
                                  {submission.grade}/{assessment?.maxMarks || assessment?.max_marks || 100}
                                </h3>
                              </div>
                              <div>
                                <p style={{ margin: '0 0 5px 0', color: '#666' }}>Percentage</p>
                                <h3 style={{ margin: '0', color: '#3498db' }}>
                                  {((submission.grade / (assessment?.maxMarks || assessment?.max_marks || 100)) * 100).toFixed(1)}%
                                </h3>
                              </div>
                            </div>
                            
                            {submission.feedback && (
                              <div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Instructor Feedback</h5>
                                <p style={{ margin: '0', color: '#666' }}>{submission.feedback}</p>
                              </div>
                            )}
                          </>
                        ) : submission.status === 'graded' ? (
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <i className="fas fa-clock" style={{ fontSize: '48px', color: '#f39c12', marginBottom: '15px' }}></i>
                            <h4>Grade Pending Approval</h4>
                            <p>Your grade has been marked but is awaiting exam administrator approval.</p>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <i className="fas fa-hourglass-half" style={{ fontSize: '48px', color: '#3498db', marginBottom: '15px' }}></i>
                            <h4>Submission Received</h4>
                            <p>Your submission has been received and is awaiting grading.</p>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                        <a href={submission.fileUrl} download className="btn-secondary" style={{ flex: 1 }}>
                          <i className="fas fa-download"></i> Download Submission
                        </a>
                        {assessment?.fileUrl && (
                          <a href={assessment.fileUrl} download className="btn-primary" style={{ flex: 1 }}>
                            <i className="fas fa-file-download"></i> Download Assessment
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {moduleSubmissions.filter(s => s.studentId === currentUser.id && s.releasedToStudent).length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h4>Overall Performance</h4>
                  <div className="item-card">
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '20px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>Total Submissions</p>
                        <h3 style={{ margin: '0', color: '#3498db' }}>
                          {moduleSubmissions.filter(s => s.studentId === currentUser.id).length}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>Released Grades</p>
                        <h3 style={{ margin: '0', color: '#2ecc71' }}>
                          {moduleSubmissions.filter(s => s.studentId === currentUser.id && s.releasedToStudent).length}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>Average Grade</p>
                        <h3 style={{ margin: '0', color: '#9b59b6' }}>
                          {(() => {
                            const releasedGrades = moduleSubmissions.filter(s => 
                              s.studentId === currentUser.id && s.releasedToStudent && s.grade !== null
                            );
                            if (releasedGrades.length === 0) return 'N/A';
                            const total = releasedGrades.reduce((sum, s) => sum + parseFloat(s.grade), 0);
                            return (total / releasedGrades.length).toFixed(1);
                          })()}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ModulePage;