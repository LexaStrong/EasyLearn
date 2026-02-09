# EasyLearn - Academic Resource Hub

EasyLearn is a comprehensive academic resource platform designed for students to access textbooks, past questions, and practice quizzes. Built with a focus on ease of use and security, it leverages Supabase for real-time data and authentication.

## 🚀 Key Features

- **Student Portal**: Access to academic resources organized by Program, Year, and Semester.
- **Admin Dashboard**: Centralized management of resources, books, and quizzes.
- **Practice Quizzes**: Interactive self-assessment tools with instant feedback (answers protected from client-side discovery).
- **Secure File Storage**: Dedicated buckets for course materials, books, and profile avatars.
- **Enterprise-Grade Security**: Database-level Row Level Security (RLS) and cryptographic authentication.

## 🏗️ Architecture

- **Frontend**: Modular ES6+ JavaScript, HTML5, and CSS3.
- **Backend**: Supabase (PostgreSQL, Auth, Storage).
- **Architecture Style**: Standalone/CDN-based (No build tools required for deployment).

## 🛡️ Security Implementation

EasyLearn implements multiple layers of security to protect academic integrity:

1.  **Role Escalation Protection**: RLS policies prevent users from promoting themselves to Admin by restricting updates to the `is_admin` column.
2.  **Quiz Answer Integrity**: column-level permissions ensure students can fetch questions but **never** the `correct_answer` field, preventing client-side leaks.
3.  **Ownership Enforcement**: Students can only view their own submissions and profiles. Resources can only be managed by Admins or the original uploader.
4.  **Database Triggers**: Automatic profile synchronization on signup ensures consistency between Supabase Auth and the `public.users` table.

## 🚦 Getting Started

1.  **Database Setup**:
    - Run the contents of `setup_database.sql` in your Supabase SQL Editor.
    - This will initialize all tables, seed the curriculum (including the full IT program), and set up security policies.

2.  **Configuration**:
    - Open `js/config.js`.
    - Replace the `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project credentials.

3.  **Deployment**:
    - Simply host the project directory on any static web server (GitHub Pages, Vercel, Netlify) or run it locally by opening `index.html`.

## 📚 Curriculum Data

The platform comes pre-seeded with a complete **Information Technology (IT)** curriculum covering all 4 years and 8 semesters, mapping traditional University of Ghana / AIT course codes and titles.

---
*Created with ❤️ by CalexDev*
