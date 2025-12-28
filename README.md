# Assignments and Homework Tracker

This is a fully-featured academic productivity web application built on Django 4.2.27, helping students organize assignments, track grades by course, visualize progress, receive deadline reminders, and export deadlines to external calendars—all through a clean, responsive interface.

Unlike generic to-do list applications, this system achieves efficient and clear organization and management of personal academic work through four tightly integrated data domains: User, Course, Assignment, and Grade.

## Project Structure Explanation

- `accounts/`: User authentication, login/registration, avatar upload, and password change  
- `courses/`: Course creation, editing, deletion, and listing  
- `assignments/`: CRUD operations for assignments, associating assignments with courses, and setting deadlines  
- `grades/`: Grade and reflection (Reflection) entry; automatically marks assignment as completed upon grade submission  
- `core/`: Homepage dashboard, calendar view, reminder logic, and .ics export  
- `templates/`: All HTML templates, based on `base.html` inheritance for consistent layout  
- `static/`: Custom CSS, JavaScript, and icon resources  
- `media`: Stores user-uploaded avatar files  
- `requirements.txt`: List of project dependencies  

## Running Instructions

Create a virtual environment inside the `homeworktracker` folder.  
Install dependencies: `pip install -r requirements.txt`  
Initialize the database: `python manage.py migrate`  
Create admin account: `python manage.py createsuperuser`  
Start development server: `python manage.py runserver`  
Access in local browser: http://127.0.0.1:8000/

## Core Features

**User Account Management**: Users can register, log in, reset passwords, and set personal avatars (processed using Pillow 11.3.0).  

**Course Management**: Users can create and manage courses within the application. The app provides editing, re-editing, and deletion of course details.  

**Assignment Management and Tracking**: Users can create assignments on a dedicated page, setting title, description, and deadline. Users can also associate assignments with courses and record assignment grades.  

**Grade Management Module**: This module is highly integrated with the assignment management module. Users can enter assignment grades on the assignment detail page. Once a grade is entered, the assignment is automatically marked as completed. The app also provides grade visualization: after entering a grade, users can see the current score’s percentage of the total possible points, and can add comments on the grade.  

**Dashboard Module**: After registering and logging in, users are automatically redirected to the homepage (dashboard). Here, users can clearly understand assignment progress across all courses through visual charts, a calendar, and KPI cards. The dashboard also integrates a reminder feature for assignments due in the next seven days.  

**Notification and Reminder Module**: If the user has any uncompleted urgent tasks whose deadline is only one hour away from the current time, a browser popup notification will remind them.  

**Calendar Reminder Module**: The app integrates a calendar module into the dashboard, allowing users to clearly see the current date and assignment deadlines. Assignment deadlines are marked in different colors on the calendar. The app also provides .ics file download, enabling users to export assignment data to their personal calendar software.  

**Fully Responsive Interface**: Built with Bootstrap’s responsive framework combined with CSS media queries, the app runs seamlessly on mobile phones, tablets, and desktop computers.  

**Admin Backend Module**: For administrators, the app uses Django’s built-in admin module, allowing managers to easily control data and manage the website from the backend.

## Distinctiveness and Complexity Explanation

The complexity and distinctiveness of this project are mainly reflected in the following aspects:

- **Data Modeling**  
  The four modules of this application are tightly coupled—mutually independent yet interdependent.  
  The user management module is the foundation of the entire system, providing essential user authentication services for all other modules.  
  The assignment management module allows users to add, edit, and delete assignment information, which is used for progress tracking and reminder settings.  
  The grade module depends on the assignment module and serves as its extension and enhancement, optimizing user experience.  
  The progress tracking module (`core`) uses data from the assignment management module to display users’ assignment completion status, presenting it more clearly and intuitively through visualization.

- **Functional Integration**  
  This project goes beyond simple assignment recording and integrates rich functional modules to improve user experience.  
  **Dashboard**: Combined with Chart.js, it dynamically tracks users’ assignment progress. Set as the homepage, it clearly and prominently displays key metrics such as total assignments, completed assignments, and overdue assignments in a timely manner.  
  Through categorization and multi-dimensional charts, it comprehensively presents assignment completion status.  
  **Overdue Warning**: The app uses JavaScript to dynamically calculate assignment deadlines, identifies assignments that are about to be overdue, and reminds users via pop-up notifications.  
  **Calendar Integration**: To optimize and enhance user experience, the app displays assignment deadlines on a calendar using different colors for distinction, and provides .ics calendar export functionality, allowing users to easily sync assignment data with other calendar apps.  
  **Assignment Detail View**: This is the core feature of the application. On this page, users can mark, edit, add assignment content and deadlines, record grades, and add reflections on assignments (or grades).