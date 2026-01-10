// ModuleCard.js
import React from 'react';

const ModuleCard = ({ 
  module, 
  userRole, 
  currentUser, 
  classes = [], 
  assessments = [],
  submissions = []
}) => {
  // Get module stats based on user role
  const getModuleStats = () => {
    const moduleAssessments = assessments.filter(a => 
      a.moduleCode === module.code || a.course === module.name
    );
    const moduleClasses = classes.filter(c => c.module_code === module.code);
    
    if (userRole === 'Student') {
      const studentSubmissions = submissions.filter(s => 
        s.studentId === currentUser.id && 
        moduleAssessments.some(a => a.id === s.assessmentId)
      );
      const pendingGrades = studentSubmissions.filter(s => !s.releasedToStudent && s.grade !== null);
      const releasedGrades = studentSubmissions.filter(s => s.releasedToStudent);
      
      return {
        totalAssessments: moduleAssessments.length,
        yourSubmissions: studentSubmissions.length,
        pendingGrades: pendingGrades.length,
        releasedGrades: releasedGrades.length,
        classesEnrolled: moduleClasses.filter(c => 
          c.students && c.students.includes(parseInt(currentUser.id))
        ).length
      };
    } else if (userRole === 'Instructor') {
      const moduleSubmissions = submissions.filter(s => 
        moduleAssessments.some(a => a.id === s.assessmentId)
      );
      const pendingGrading = moduleSubmissions.filter(s => s.status === 'submitted');
      const needsRevision = moduleSubmissions.filter(s => s.status === 'needs_revision');
      
      return {
        totalAssessments: moduleAssessments.length,
        totalClasses: moduleClasses.length,
        pendingGrading: pendingGrading.length,
        needsRevision: needsRevision.length,
        graded: moduleSubmissions.filter(s => s.status === 'graded').length
      };
    } else if (userRole === 'Exam Administrator') {
      const moduleSubmissions = submissions.filter(s => 
        moduleAssessments.some(a => a.id === s.assessmentId)
      );
      const pendingApproval = moduleSubmissions.filter(s => s.status === 'graded' && !s.approvedByExamAdmin);
      const approved = moduleSubmissions.filter(s => s.approvedByExamAdmin);
      
      return {
        totalAssessments: moduleAssessments.length,
        pendingApproval: pendingApproval.length,
        approved: approved.length,
        released: moduleSubmissions.filter(s => s.releasedToStudent).length
      };
    }
    
    return {};
  };

  const stats = getModuleStats();
  
  const goToModule = () => {
    window.location.href = `?page=module&module=${module.code}`;
  };

  return (
    <div className="item-card" onClick={goToModule} style={{ cursor: 'pointer' }}>
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
          {userRole}
        </span>
      </div>
      
      {/* Module Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '10px',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #eee'
      }}>
        {userRole === 'Student' && (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Assessments</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#3498db' }}>
                {stats.totalAssessments}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Your Submissions</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#2ecc71' }}>
                {stats.yourSubmissions}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Pending Grades</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#f39c12' }}>
                {stats.pendingGrades}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Released</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#9b59b6' }}>
                {stats.releasedGrades}
              </p>
            </div>
          </>
        )}
        
        {userRole === 'Instructor' && (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Classes</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#3498db' }}>
                {stats.totalClasses}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>To Grade</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#e74c3c' }}>
                {stats.pendingGrading}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Needs Revision</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#f39c12' }}>
                {stats.needsRevision}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Graded</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#2ecc71' }}>
                {stats.graded}
              </p>
            </div>
          </>
        )}
        
        {userRole === 'Exam Administrator' && (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Assessments</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#3498db' }}>
                {stats.totalAssessments}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>To Approve</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#e74c3c' }}>
                {stats.pendingApproval}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Approved</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#2ecc71' }}>
                {stats.approved}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Released</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#9b59b6' }}>
                {stats.released}
              </p>
            </div>
          </>
        )}
      </div>
      
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button className="btn-primary" style={{ width: '100%' }}>
          <i className="fas fa-external-link-alt"></i> Open Module
        </button>
      </div>
    </div>
  );
};

export default ModuleCard;