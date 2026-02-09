import { supabase, appReady, PROGRAMS } from './config.js';

// Cache for current user to avoid redundant fetches
let cachedUser = null;

// Check if user is already logged in
async function checkAuthStatus() {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            // Check if user is admin
            const { data: userData } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();

            const isAdminPath = window.location.pathname.includes('/admin/');
            if (userData?.is_admin) {
                window.location.href = isAdminPath ? 'dashboard.html' : 'admin/dashboard.html';
            } else {
                window.location.href = isAdminPath ? '../dashboard.html' : 'dashboard.html';
            }
        }
    } catch (err) {
        console.error('Auth status check failed:', err);
    }
}

// ========== Login Functionality ==========
if (document.getElementById('loginForm')) {
    // Check if already logged in
    checkAuthStatus();

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Validate inputs
        if (!identifier) {
            showError('identifierError', 'Please enter your School ID, email or phone');
            return;
        }

        if (!password) {
            showError('passwordError', 'Please enter your password');
            return;
        }

        // Show loading
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';

        try {
            console.log('Attempting login for:', identifier);
            // Determine if identifier is email or find email from school ID/phone
            let email = identifier;

            if (!identifier.includes('@')) {
                console.log('Fetching email for school_id/phone...');
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('email')
                    .or(`school_id.eq.${identifier},phone.eq.${identifier}`)
                    .single();

                if (userError || !userData) {
                    console.warn('User lookup failed:', userError);
                    showError('formError', 'Invalid credentials');
                    return;
                }

                email = userData.email;
            }

            console.log('Signing in with email:', email);
            // Sign in with Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.warn('Auth sign-in failed:', error);
                showError('formError', 'Invalid credentials. Please try again.');
                return;
            }

            console.log('Sign-in successful, checking profile for admin status...');
            // Check if user is admin
            const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
                // Continue to dashboard anyway if login succeeded but profile lookup failed?
                // Or show error. Let's redirect to dashboard as fallback.
            }

            // Redirect based on role
            const isAdminPath = window.location.pathname.includes('/admin/');
            if (userProfile?.is_admin) {
                window.location.href = isAdminPath ? 'dashboard.html' : 'admin/dashboard.html';
            } else {
                window.location.href = isAdminPath ? '../dashboard.html' : 'dashboard.html';
            }

        } catch (err) {
            console.error('Critical login error:', err);
            alert('A critical error occurred: ' + err.message);
            showError('formError', 'An error occurred. Please try again.');
        } finally {
            console.log('Login attempt finished, hiding loader.');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
    });
}

// ========== Signup Functionality ==========
if (document.getElementById('signupForm')) {
    // Check if already logged in
    checkAuthStatus();

    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const programGrid = document.getElementById('programGrid');

    let selectedProgram = null;

    // Wait for dynamic data (programs/courses)
    await appReady;

    // Populate program selection
    PROGRAMS.forEach(program => {
        const programCard = document.createElement('div');
        programCard.className = 'program-card';
        programCard.innerHTML = `
      <input type="radio" name="program" value="${program.id}" id="program${program.id}">
      <div class="program-code">${program.code}</div>
      <div class="program-name">${program.name}</div>
    `;

        programCard.addEventListener('click', () => {
            document.querySelectorAll('.program-card').forEach(card => {
                card.classList.remove('selected');
            });
            programCard.classList.add('selected');
            document.getElementById(`program${program.id}`).checked = true;
            selectedProgram = program.id;
            clearError('programError');
        });

        programGrid.appendChild(programCard);
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        const fullName = document.getElementById('fullName').value.trim();
        const schoolId = document.getElementById('schoolId').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const semester = document.getElementById('semester').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const profileImage = document.getElementById('profileImage').files[0];

        // Validate inputs
        let hasError = false;

        if (!fullName) {
            showError('nameError', 'Please enter your full name');
            hasError = true;
        }

        if (!schoolId) {
            showError('schoolIdError', 'Please enter your school ID');
            hasError = true;
        }

        if (!email) {
            showError('emailError', 'Please enter your email');
            hasError = true;
        } else if (!isValidEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            hasError = true;
        }

        if (!phone) {
            showError('phoneError', 'Please enter your phone number');
            hasError = true;
        }

        if (!selectedProgram) {
            showError('programError', 'Please select your program');
            hasError = true;
        }

        if (!semester) {
            showError('semesterError', 'Please select your semester');
            hasError = true;
        }

        if (!password) {
            showError('passwordError', 'Please enter a password');
            hasError = true;
        } else if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            hasError = true;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        // Show loading
        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating account...';

        try {
            // Check if school ID already exists
            const { data: existingSchoolId } = await supabase
                .from('users')
                .select('id')
                .eq('school_id', schoolId)
                .single();

            if (existingSchoolId) {
                showError('schoolIdError', 'This school ID is already registered');
                return;
            }

            // Call the new signUp function
            await signUp(email, password, fullName, schoolId, phone, selectedProgram, parseInt(semester), profileImage);

        } catch (err) {
            console.error('Signup error:', err);
            showError('formError', 'An error occurred. Please try again.');
        } finally {
            signupBtn.disabled = false;
            signupBtn.textContent = 'Create Account';
        }
    });
}

// ========== Logout Functionality ==========
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        cachedUser = null;
        window.location.href = 'index.html';
    }
}

// ========== Helper Functions ==========
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
    }
}

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========== Protected Page Check ==========
async function requireAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'index.html';
        return null;
    }

    return session;
}

// ========== Get Current User Profile ==========
async function getCurrentUser() {
    if (cachedUser) return cachedUser;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
        .from('users')
        .select('*, programs(*)')
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        if (error.code === 'PGRST116') {
            console.warn('User profile not found in database. Did you run the setup_database.sql script?');
        }
        return null;
    }

    cachedUser = data;
    return data;
}

// Export functions for use in other modules
export {
    requireAuth,
    getCurrentUser,
    logout,
    checkAuthStatus
};
