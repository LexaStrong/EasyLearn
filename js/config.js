// ===================================
// EasyLearn - Supabase Configuration
// ===================================

const SUPABASE_URL = 'https://cmkcthswmritjvtjpcel.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNta2N0aHN3bXJpdGp2dGpwY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjM3NzYsImV4cCI6MjA4NjA5OTc3Nn0.0mTbT64d1cqlFvZXCt212AAG-ZRm3qDkssk3ppDyWmY';

// Initialize Supabase client
let supabase;
try {
  const supabaseUrl = SUPABASE_URL;
  const supabaseKey = SUPABASE_ANON_KEY;
  // Use window.supabase if defined by CDN, otherwise try global supabase
  const lib = window.supabase || supabase;
  if (!lib) throw new Error('Supabase SDK not loaded. Check your internet connection or CDN link.');

  supabase = lib.createClient(supabaseUrl, supabaseKey);
} catch (err) {
  console.error('Supabase initialization failed:', err);
  alert('Configuration Error: ' + err.message);
}

// Academic Programs Configuration
const PROGRAMS = [
  {
    id: 1,
    name: 'Computer Science',
    code: 'CS',
    description: 'Study of computational systems, algorithms, and software development'
  },
  {
    id: 2,
    name: 'Computer Engineering',
    code: 'CPE',
    description: 'Integration of computer science and electrical engineering'
  },
  {
    id: 3,
    name: 'Information Technology',
    code: 'IT',
    description: 'Application of computing technology to solve business problems'
  },
  {
    id: 4,
    name: 'Business Administration',
    code: 'BA',
    description: 'Management, leadership, and business strategy'
  },
  {
    id: 5,
    name: 'Electrical & Electronic Engineering',
    code: 'EEE',
    description: 'Study of electrical systems, electronics, and power engineering'
  },
  {
    id: 6,
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Design and construction of infrastructure and buildings'
  }
];

// Sample courses by program and semester
const COURSES = {
  CS: {
    1: [
      { code: 'CS101', name: 'Programming Fundamentals' },
      { code: 'CS102', name: 'Discrete Mathematics' },
      { code: 'CS103', name: 'Computer Architecture' },
      { code: 'CS104', name: 'Introduction to Algorithms' }
    ],
    2: [
      { code: 'CS201', name: 'Data Structures' },
      { code: 'CS202', name: 'Database Systems' },
      { code: 'CS203', name: 'Web Development' },
      { code: 'CS204', name: 'Object-Oriented Programming' }
    ]
  },
  CPE: {
    1: [
      { code: 'CPE101', name: 'Digital Logic Design' },
      { code: 'CPE102', name: 'Circuit Analysis' },
      { code: 'CPE103', name: 'Programming in C' },
      { code: 'CPE104', name: 'Engineering Mathematics' }
    ],
    2: [
      { code: 'CPE201', name: 'Microprocessors' },
      { code: 'CPE202', name: 'Computer Networks' },
      { code: 'CPE203', name: 'Embedded Systems' },
      { code: 'CPE204', name: 'Computer Organization' }
    ]
  },
  IT: {
    1: [
      { code: 'IT101', name: 'IT Fundamentals' },
      { code: 'IT102', name: 'Network Systems' },
      { code: 'IT103', name: 'Web Engineering' },
      { code: 'IT104', name: 'Programming Basics' }
    ],
    2: [
      { code: 'IT201', name: 'Database Management' },
      { code: 'IT202', name: 'Cybersecurity' },
      { code: 'IT203', name: 'Software Development' },
      { code: 'IT204', name: 'Cloud Computing' }
    ]
  },
  BA: {
    1: [
      { code: 'BA101', name: 'Principles of Management' },
      { code: 'BA102', name: 'Financial Accounting' },
      { code: 'BA103', name: 'Marketing Fundamentals' },
      { code: 'BA104', name: 'Business Communication' }
    ],
    2: [
      { code: 'BA201', name: 'Human Resource Management' },
      { code: 'BA202', name: 'Business Statistics' },
      { code: 'BA203', name: 'Entrepreneurship' },
      { code: 'BA204', name: 'Operations Management' }
    ]
  },
  EEE: {
    1: [
      { code: 'EEE101', name: 'Circuit Theory' },
      { code: 'EEE102', name: 'Electronics I' },
      { code: 'EEE103', name: 'Electromagnetic Fields' },
      { code: 'EEE104', name: 'Engineering Mathematics' }
    ],
    2: [
      { code: 'EEE201', name: 'Power Systems' },
      { code: 'EEE202', name: 'Control Systems' },
      { code: 'EEE203', name: 'Digital Electronics' },
      { code: 'EEE204', name: 'Electrical Machines' }
    ]
  },
  CE: {
    1: [
      { code: 'CE101', name: 'Engineering Mechanics' },
      { code: 'CE102', name: 'Surveying' },
      { code: 'CE103', name: 'Building Materials' },
      { code: 'CE104', name: 'Engineering Drawing' }
    ],
    2: [
      { code: 'CE201', name: 'Structural Analysis' },
      { code: 'CE202', name: 'Geotechnical Engineering' },
      { code: 'CE203', name: 'Hydraulics' },
      { code: 'CE204', name: 'Transportation Engineering' }
    ]
  }
};

// Helper function to get program by ID
function getProgramById(id) {
  return PROGRAMS.find(p => p.id === id);
}

// Helper function to get courses by program code and semester
function getCoursesByProgramAndSemester(programCode, semester) {
  return COURSES[programCode]?.[semester] || [];
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabase, PROGRAMS, COURSES, getProgramById, getCoursesByProgramAndSemester };
}
