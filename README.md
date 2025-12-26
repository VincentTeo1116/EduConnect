# EduConnect Learning Centre

A React-based learning management system for students, instructors, and administrators.

## Features

- User authentication (Login/Register)
- Role-based dashboards:
  - **Student**: Enroll in classes, view enrolled modules, submit assessments, give feedback to lecturers, ask questions
  - **Instructor**: Create assessments, grade submissions, answer questions, view student feedback for their modules
  - **Admin**: CRUD users, manage modules, manage classes
  - **Exam Administrator**: View module results, feedback from students to lecturers, feedback from lecturers to students, view grading criteria
- Moodle-like feedback system: Students can give comments to lecturers based on enrolled modules
- Class enrollment system
- Profile management
- Local storage for data persistence

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/VincentTeo1116/EduConnect.git
   cd EduConnect
   ```

2. Open `index.html` in a web browser or serve with a local server:
   ```
   python -m http.server 8000
   ```
   Then open http://localhost:8000

## Moodle-like Feedback System

Following Moodle's concept, students can provide feedback/comments to lecturers based on the modules they are enrolled in:

- **Student Enrollment**: Students can enroll in available classes
- **Module-based Feedback**: Only enrolled students can give feedback on their modules
- **Lecturer Feedback View**: Instructors can view feedback for modules they teach
- **Administrator Oversight**: Exam Administrators can monitor all feedback across the system

## Technologies Used

- React (with Babel for JSX)
- CSS for styling
- Local Storage for data persistence

## File Structure

- `index.html`: Main HTML file with inline React components and Moodle-like feedback system
- `App.js`: Main React component (not used, components inlined)
- `HomePage.js`: State management and routing (not used, inlined)
- `LoginPage.js`: Login form (not used, inlined)
- `RegisterPage.js`: Registration form (not used, inlined)
- `StudentDashboard.js`: Student interface with enrollment and feedback features (not used, inlined)
- `InstructorDashboard.js`: Instructor interface with feedback viewing (not used, inlined)
- `AdminDashboard.js`: Admin interface (CRUD users, modules, classes)
- `ExamAdminDashboard.js`: Exam Administrator interface (view results, feedback, criteria)
- `ProfilePage.js`: Profile management (not used, inlined)
- `App.css`: Styles
- `Images/`: Logo and images

## Notes

- NavigationBar.js contains a class-based implementation that can be integrated if needed.
- Data is stored in localStorage for demo purposes.