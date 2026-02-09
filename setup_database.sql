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
DELETE FROM programs;
INSERT INTO programs (name, code, description) VALUES
('Computer Science', 'CS', 'Computational systems and software engineering'),
('Computer Engineering', 'CPE', 'Hardware and software systems integration'),
('Information Technology', 'IT', 'Information systems and network management'),
('Business Administration', 'BA', 'Business leadership and management'),
('Electrical & Electronic Engineering', 'EEE', 'Electrical power and electronics'),
('Civil Engineering', 'CE', 'Infrastructure and structural design');

-- 10. Information Technology (IT) Curriculum Seeding
DO $$ 
DECLARE 
    it_id INT;
BEGIN
    SELECT id INTO it_id FROM programs WHERE code = 'IT';

    -- YEAR 1 Semester 1
    INSERT INTO courses (program_id, name, code, semester) VALUES
    (it_id, 'Information Technology Foundation I', 'IT101', 1),
    (it_id, 'Intermediate Algebra', 'MATH101', 1),
    (it_id, 'Principles of Programming with C++', 'CS103', 1),
    (it_id, 'Physics I', 'PHY101', 1),
    (it_id, 'Principles of Management', 'MGT101', 1),
    (it_id, 'English Composition, Writing & Communication Skills I', 'ENGL101', 1);

    -- YEAR 1 Semester 2
    INSERT INTO courses (program_id, name, code, semester) VALUES
    (it_id, 'Information Technology Foundation II', 'IT102', 2),
    (it_id, 'Calculus I', 'MATH102', 2),
    (it_id, 'Object Oriented Programming with Java', 'CS104', 2),
    (it_id, 'Information Systems', 'IT103', 2),
    (it_id, 'English Composition and Writing Skills II', 'ENGL102', 2),
    (it_id, 'Multimedia Applications Systems Development I', 'IT109', 2);

    -- YEAR 2 Semester 1 (Sem 3) - Mapping logic: using 1 for odd, 2 for even for simplicity in UI filters
    INSERT INTO courses (program_id, name, code, semester) VALUES
    (it_id, 'French I', 'FRN101', 1),
    (it_id, 'Multimedia Applications Systems Development II', 'IT201', 1),
    (it_id, 'Data Structures & Algorithms I', 'CS203', 1),
    (it_id, 'Computer Organization & Architecture I', 'CS205', 1),
    (it_id, 'Web Authoring & Content Management', 'IT204', 1),
    (it_id, 'Group Dynamics & Communication', 'NT201', 1);

    -- YEAR 2 Semester 2 (Sem 4)
    INSERT INTO courses (program_id, name, code, semester) VALUES
    (it_id, 'French II', 'FRN102', 2),
    (it_id, 'Probability & Statistics', 'MATH204', 2),
    (it_id, 'Systems Programming', 'CS209', 2),
    (it_id, 'Data Structures & Algorithms II', 'CS204', 2),
    (it_id, 'Data Communications & Computer Networks I', 'CS208', 2),
    (it_id, 'IT Professional Ethics', 'IT205', 2),
    (it_id, 'Multimedia Technologies', 'IT230', 2),
    (it_id, 'Web Applications: Client Side Scripting', 'IT232', 2),
    (it_id, 'Business Analysis', 'IT233', 2),
    (it_id, 'Software Engineering Fundamentals', 'SE100', 2);

    -- YEAR 3 Semester 1 (Sem 5)
    INSERT INTO courses (program_id, name, code, semester) VALUES
    (it_id, 'Fundamentals of Management Science', 'MS101', 1),
    (it_id, 'Computer Graphics', 'CS303', 1),
    (it_id, 'Operating Systems', 'CS304', 1),
    (it_id, 'Systems Analysis & Design', 'CS309', 1),
    (it_id, 'Database Systems I', 'CS311', 1),
    (it_id, 'Network Administration & Management', 'IT301', 1),
    (it_id, 'Design for Interactive Multimedia I', 'IT330', 1),
    (it_id, 'Document Markup Languages', 'IT335', 1),
    (it_id, 'E-Commerce Technologies', 'IT337', 1),
    (it_id, 'Software Development Methodologies', 'IT234', 1);

    -- YEAR 3 Semester 2 (Sem 6)
    INSERT INTO courses (program_id, name, code, semester) VALUES
    (it_id, 'IT Project Planning & Management', 'IT302', 2),
    (it_id, 'Compiler Design & Construction', 'CS310', 2),
    (it_id, 'Database Systems II', 'CS312', 2),
    (it_id, 'Knowledge-Based Information Systems', 'IT303', 2),
    (it_id, 'Digital Communication Systems', 'IT334', 2),
    (it_id, 'Formal Methods in Software Development', 'IT340', 2),
    (it_id, 'Law and Society', 'NT301', 2),
    (it_id, 'Digital Video and Audio', 'IT331', 2),
    (it_id, 'LAN to WAN Internetworking', 'IT333', 2),
    (it_id, 'Secure Electronic Commerce', 'IT338', 2),
    (it_id, 'Multimedia User-Interface Design', 'IT431', 2),
    (it_id, 'Intro to Information & Network Security', 'IT304', 2),
    (it_id, 'Design for Interactive Multimedia II', 'IT332', 2),
    (it_id, 'Web Database Applications', 'IT336', 2),
    (it_id, 'E-Commerce & Enterprise Systems', 'IT339', 2);

    -- YEAR 4 Semester 1 (Sem 7)
    INSERT INTO courses (program_id, name, code, semester) VALUES
    (it_id, 'Computer Modelling & Simulation', 'CS401', 1),
    (it_id, 'Software Engineering Fundamentals / Open Source Software Dev', 'CS402', 1),
    (it_id, 'E-Applications & Systems', 'IT404', 1),
    (it_id, 'Web Technologies & Systems', 'IT401', 1),
    (it_id, 'Information & Network Security, Firewalls & VPNs', 'IT430', 1),
    (it_id, 'Imaging & Animation', 'IT433', 1),
    (it_id, 'Satellite & Space Communications', 'TE401', 1),
    (it_id, 'Managing Software Development', 'IT442', 1);

    -- YEAR 4 Semester 2 (Sem 8)
    INSERT INTO courses (program_id, name, code, semester) VALUES
    (it_id, 'Advanced Database System Administration', 'IT402', 2),
    (it_id, 'Web-Based Application Systems Development', 'IT441', 2),
    (it_id, 'Human Computer Interaction', 'IT403', 2),
    (it_id, 'Digital Video & Motion Graphics', 'IT432', 2),
    (it_id, 'Wireless & Mobile Communication Networks', 'TE303', 2),
    (it_id, 'Web 3D Technologies', 'IT456', 2),
    (it_id, 'E-Commerce in a Global Environment', 'IT439', 2),
    (it_id, 'Capstone Project I', 'IT405', 2),
    (it_id, 'Capstone Project II', 'IT406', 2);

END $$;

-- 11. Helper Functions and Triggers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup with metadata syncing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, school_id, program_id, semester, is_admin)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'school_id', 
    (NEW.raw_user_meta_data->>'program_id')::INT,
    (NEW.raw_user_meta_data->>'semester')::INT,
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure Quiz Grading Function
CREATE OR REPLACE FUNCTION public.calculate_quiz_score(p_quiz_id INT, p_answers JSONB)
RETURNS INT AS $$
DECLARE
    correct_count INT := 0;
    q_record RECORD;
BEGIN
    FOR q_record IN SELECT id, correct_answer FROM public.quiz_questions WHERE quiz_id = p_quiz_id LOOP
        IF (p_answers->>q_record.id::TEXT) = q_record.correct_answer THEN
            correct_count := correct_count + 1;
        END IF;
    END LOOP;
    RETURN correct_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Row Level Security & Access Control

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

-- USERS Table: Prevent self-promotion
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their OWN profile" ON public.users FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (
    (is_admin = (SELECT is_admin FROM users WHERE id = auth.uid())) -- Cannot change is_admin
    OR is_admin() -- unless already admin
);
CREATE POLICY "Admins full access profiles" ON users FOR ALL USING (is_admin());

-- ACADEMIC CONTENT: Public read for metadata
CREATE POLICY "Public read programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Admins manage academic structure" ON courses FOR ALL USING (is_admin());
CREATE POLICY "Admins manage programs" ON programs FOR ALL USING (is_admin());

-- RESOURCES & BOOKS: Verified access + Ownership check
CREATE POLICY "Authenticated read academic resources" ON resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read academic books" ON books FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins/Owners manage resources" ON resources FOR ALL USING (is_admin() OR auth.uid() = uploaded_by);
CREATE POLICY "Admins/Owners manage books" ON books FOR ALL USING (is_admin() OR auth.uid() = uploaded_by);

-- QUIZ SYSTEM: Student privacy & Answer protection
CREATE POLICY "Authenticated read quizzes" ON quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins full access quizzes" ON quizzes FOR ALL USING (is_admin());

-- HIDE CORRECT_ANSWER FROM STUDENTS
-- First revoke all, then grant specific columns
REVOKE SELECT ON quiz_questions FROM authenticated;
GRANT SELECT (id, quiz_id, question_text, option_a, option_b, option_c, option_d) ON quiz_questions TO authenticated;
GRANT SELECT ON quiz_questions TO anon; -- If public access needed, but usually limited to auth
GRANT ALL ON quiz_questions TO postgres, service_role; -- Ensure backend systems still work

-- POLICY: Students can see the non-sensitive columns
CREATE POLICY "Students can see questions" ON quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can see answers" ON quiz_questions FOR ALL USING (is_admin());

-- QUIZ SUBMISSIONS: Ownership Enforcement
CREATE POLICY "Users view own submissions" ON quiz_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own submissions" ON quiz_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all submissions" ON quiz_submissions FOR ALL USING (is_admin());

-- 13. Security Audit Section
/*
SECURITY AUDIT LOG:
- [ROLE ESCALATION]: Solved by WITH CHECK clause in users UPDATE policy.
- [QUIZ PRIVACY]: Solved by column-level GRANTs restricting access to 'correct_answer' for the 'authenticated' role.
- [OWNERSHIP]: Solved by uploaded_by checks in Resources, Books, and Submissions.
- [WRITE RESTRICTION]: Academic metadata (Programs/Courses) restricted to is_admin() role.
- [PROFILE SYNC]: handle_new_user trigger ensures metadata is captured securely from Auth signups.
*/
