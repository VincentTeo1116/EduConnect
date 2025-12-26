# EduConnect Learning Centre

A React-based learning management system for students, instructors, and administrators.

## Features

- User authentication (Login/Register)
- Role-based dashboards:
  - **Student**: View assessments, submit work, ask questions
  - **Instructor**: Create assessments, grade submissions, answer questions
  - **Admin**: CRUD users, manage modules, manage classes
  - **Exam Administrator**: View module results, feedback from students to lecturers, view grading criteria
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

## Technologies Used

- React (with Babel for JSX)
- CSS for styling
- Local Storage for data persistence

## File Structure

- `index.html`: Main HTML file with inline React components
- `App.js`: Main React component (not used, components inlined)
- `HomePage.js`: State management and routing (not used, inlined)
- `LoginPage.js`: Login form (not used, inlined)
- `RegisterPage.js`: Registration form (not used, inlined)
- `StudentDashboard.js`: Student interface (not used, inlined)
- `InstructorDashboard.js`: Instructor interface (not used, inlined)
- `AdminDashboard.js`: Admin interface (CRUD users, modules, classes)
- `ExamAdminDashboard.js`: Exam Administrator interface (view results, feedback, criteria)
- `ProfilePage.js`: Profile management (not used, inlined)
- `App.css`: Styles
- `Images/`: Logo and images

## Notes

- NavigationBar.js contains a class-based implementation that can be integrated if needed.
- Data is stored in localStorage for demo purposes.