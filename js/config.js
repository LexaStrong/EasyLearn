import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase Configuration
const SUPABASE_URL = 'https://cmkcthswmritjvtjpcel.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNta2N0aHN3bXJpdGp2dGpwY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjM3NzYsImV4cCI6MjA4NjA5OTc3Nn0.0mTbT64d1cqlFvZXCt212AAG-ZRm3qDkssk3ppDyWmY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Academic Programs Configuration (Initial defaults, will be updated from DB)
export let PROGRAMS = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Computer Engineering', code: 'CPE' },
  { id: 3, name: 'Information Technology', code: 'IT' },
  { id: 4, name: 'Business Administration', code: 'BA' },
  { id: 5, name: 'Electrical & Electronic Engineering', code: 'EEE' },
  { id: 6, name: 'Civil Engineering', code: 'CE' }
];

// Courses by program and semester (Initial defaults)
export let COURSES = {};

/**
 * Fetch programs and courses from Supabase to ensure the app is in sync with the DB.
 */
export async function initAppData() {
  try {
    console.log('Initializing dynamic application data...');

    // 1. Fetch Programs
    const { data: dbPrograms, error: progError } = await supabase
      .from('programs')
      .select('*')
      .order('name');

    if (progError) throw progError;
    if (dbPrograms && dbPrograms.length > 0) {
      PROGRAMS = dbPrograms;
      console.log('Programs synced from DB:', PROGRAMS.length);
    }

    // 2. Fetch Courses
    const { data: dbCourses, error: courseError } = await supabase
      .from('courses')
      .select('*, programs(code)');

    if (courseError) throw courseError;
    if (dbCourses) {
      // Rebuild the COURSES object structure: { CODE: { 1: [], 2: [] } }
      const newCourses = {};
      dbCourses.forEach(c => {
        const pCode = c.programs?.code;
        if (!pCode) return;

        if (!newCourses[pCode]) {
          newCourses[pCode] = { 1: [], 2: [] };
        }

        newCourses[pCode][c.semester].push({
          id: c.id,
          code: c.code,
          name: c.name
        });
      });
      COURSES = newCourses;
      console.log('Courses synced from DB');
    }

    return true;
  } catch (err) {
    console.warn('Failed to fetch dynamic data, using hardcoded defaults:', err.message);
    return false;
  }
}

// Global promise that other scripts can await
export const appReady = initAppData();

// Helper function to get program by ID
export function getProgramById(id) {
  return PROGRAMS.find(p => p.id === parseInt(id));
}

// Helper function to get courses by program code and semester
export function getCoursesByProgramAndSemester(programCode, semester) {
  return COURSES[programCode]?.[semester] || [];
}
