-- EasyLearn Database Initialization Script
-- Run this in the Supabase SQL Editor

-- 1. Programs Table
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    program_id INT REFERENCES programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    semester INT NOT NULL CHECK (semester IN (1, 2)),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users Table (Extension of Auth.Users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT,
    program_id INT REFERENCES programs(id),
    semester INT CHECK (semester IN (1, 2)),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Resources Table (Past Questions & Slides)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('past_question', 'lecture_slide', 'other')),
    file_url TEXT NOT NULL,
    file_type TEXT,
    semester INT CHECK (semester IN (1, 2)),
    year INT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Books Table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    program_id INT REFERENCES programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    cover_image_url TEXT,
    file_url TEXT NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quizzes Table
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration_minutes INT DEFAULT 20,
    total_questions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quiz Questions Table
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Quiz Submissions Table
CREATE TABLE quiz_submissions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    time_taken_seconds INT,
    answers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Initial Seed Data (Programs)
INSERT INTO programs (name, code, description) VALUES
('Computer Science', 'CS', 'Computational systems and software engineering'),
('Computer Engineering', 'CPE', 'Hardware and software systems integration'),
('Information Technology', 'IT', 'Information systems and network management'),
('Business Administration', 'BA', 'Business leadership and management'),
('Electrical & Electronic Engineering', 'EEE', 'Electrical power and electronics'),
('Civil Engineering', 'CE', 'Infrastructure and structural design');

-- 10. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

-- 11. Basic Policies (Public read for resources, private profile)
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public read resources" ON resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read books" ON books FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read quizzes" ON quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin full access" ON resources FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = TRUE
);
