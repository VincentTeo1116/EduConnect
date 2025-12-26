# EduConnect Learning Centre

A React-based learning management system for students, instructors, and administrators.

## Features

- User authentication (Login/Register)
- Role-based dashboards:
  - Student: View assessments, submit assessments, ask questions
  - Instructor: Create assessments, grade submissions, answer questions
  - Admin: Manage users, approve grades
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

- `index.html`: Main HTML file
- `App.js`: Main React component
- `HomePage.js`: State management and routing
- `LoginPage.js`: Login form
- `RegisterPage.js`: Registration form
- `StudentDashboard.js`: Student interface
- `InstructorDashboard.js`: Instructor interface
- `AdminDashboard.js`: Admin interface
- `ProfilePage.js`: Profile management
- `App.css`: Styles
- `NavigationBar.js`: Alternative navigation (not currently used)

## Notes

- NavigationBar.js contains a class-based implementation that can be integrated if needed.
- Data is stored in localStorage for demo purposes.