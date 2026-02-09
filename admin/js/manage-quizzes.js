// ===========================================
// EasyLearn - Admin Quiz Management JS
// ===========================================

(async function () {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '../index.html'; return; }

    // Populate Courses
    const courseSelect = document.getElementById('qCourse');
    // Simplified: Show all courses from all programs
    Object.keys(COURSES).forEach(progCode => {
        [1, 2].forEach(sem => {
            COURSES[progCode][sem].forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.code; // In real use case, lookup DB course ID
                opt.textContent = `${progCode} - ${c.name}`;
                courseSelect.appendChild(opt);
            });
        });
    });

    document.getElementById('createQuizForm').addEventListener('submit', createQuiz);
    document.getElementById('addQuestionForm').addEventListener('submit', addQuestion);

    loadQuizzes();
    loadQuizzesForDropdown();
})();

async function createQuiz(e) {
    e.preventDefault();
    const code = document.getElementById('qCourse').value;

    // Find course ID
    const { data: course } = await supabase.from('courses').select('id').eq('code', code).single();

    const { error } = await supabase.from('quizzes').insert({
        title: document.getElementById('qTitle').value,
        course_id: course?.id || 1,
        duration_minutes: parseInt(document.getElementById('qDuration').value),
        total_questions: parseInt(document.getElementById('qTotal').value)
    });

    if (error) alert(error.message);
    else {
        alert('Quiz created!');
        window.location.reload();
    }
}

async function addQuestion(e) {
    e.preventDefault();
    const { error } = await supabase.from('quiz_questions').insert({
        quiz_id: parseInt(document.getElementById('targetQuiz').value),
        question_text: document.getElementById('qsText').value,
        option_a: document.getElementById('optA').value,
        option_b: document.getElementById('optB').value,
        option_c: document.getElementById('optC').value,
        option_d: document.getElementById('optD').value,
        correct_answer: document.getElementById('correctOpt').value
    });

    if (error) alert(error.message);
    else {
        alert('Question added!');
        document.getElementById('addQuestionForm').reset();
    }
}

async function loadQuizzes() {
    const list = document.getElementById('quizzesTable');
    const { data } = await supabase.from('quizzes').select('*, courses(code)').order('created_at', { ascending: false });

    if (data) {
        list.innerHTML = data.map(q => `
            <tr>
                <td>${q.title}</td>
                <td>${q.courses?.code || 'N/A'}</td>
                <td>${q.total_questions}</td>
                <td><button class="btn btn-secondary btn-sm" onclick="deleteQuiz(${q.id})">Delete</button></td>
            </tr>
        `).join('');
    }
}

async function loadQuizzesForDropdown() {
    const select = document.getElementById('targetQuiz');
    const { data } = await supabase.from('quizzes').select('id, title');
    if (data) {
        select.innerHTML = data.map(q => `<option value="${q.id}">${q.title}</option>`).join('');
    }
}

window.deleteQuiz = async function (id) {
    if (confirm('Delete this quiz and all its questions?')) {
        await supabase.from('quizzes').delete().eq('id', id);
        window.location.reload();
    }
}
