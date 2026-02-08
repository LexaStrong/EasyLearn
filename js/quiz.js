// ===========================================
// EasyLearn - Quiz Module
// ===========================================

let currentQuiz = null;
let quizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval = null;
let timeLeft = 0;
let startTime = 0;

(async function () {
    const session = await requireAuth();
    if (!session) return;
    const user = await getCurrentUser();
    if (!user) {
        const loader = document.getElementById('loadingQuizzes');
        if (loader) loader.style.display = 'none';
        return;
    }

    document.getElementById('userName').textContent = user.full_name;
    document.getElementById('userProgram').textContent = `${user.programs?.name || 'Program'} - Semester ${user.semester}`;
    if (user.avatar_url) {
        document.getElementById('userAvatar').src = user.avatar_url;
    }

    loadAvailableQuizzes(user);

    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('prevBtn').addEventListener('click', prevQuestion);
    document.getElementById('submitQuizBtn').addEventListener('click', submitQuiz);

    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) await logout();
    });
})();

async function loadAvailableQuizzes(user) {
    const grid = document.getElementById('quizGrid');
    const loader = document.getElementById('loadingQuizzes');
    const empty = document.getElementById('noQuizzes');

    try {
        const { data: courses } = await supabase
            .from('courses')
            .select('id')
            .eq('program_id', user.program_id);

        const courseIds = courses?.map(c => c.id) || [];

        if (courseIds.length === 0) {
            loader.style.display = 'none';
            empty.classList.remove('hidden');
            return;
        }

        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select('*, courses(name, code)')
            .in('course_id', courseIds);

        if (error) throw error;

        loader.style.display = 'none';
        if (!quizzes || quizzes.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        grid.innerHTML = quizzes.map(q => `
      <div class="card quiz-card">
        <div class="icon">🎯</div>
        <h3>${q.title}</h3>
        <p class="text-secondary">${q.courses?.code} - ${q.courses?.name}</p>
        <div class="quiz-meta">
          <span>${q.total_questions} Questions</span> • 
          <span>${q.duration_minutes} Mins</span>
        </div>
        <button class="btn btn-primary w-full" onclick="startQuiz(${q.id})">Start Quiz</button>
      </div>
    `).join('');

    } catch (err) {
        console.error('Error:', err);
        loader.innerHTML = '<p class="text-accent">Error loading quizzes.</p>';
    }
}

window.startQuiz = async function (quizId) {
    const container = document.getElementById('quizSelection');
    const activeInt = document.getElementById('activeQuiz');

    try {
        const { data: quiz, error: qErr } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();

        if (qErr) throw qErr;
        currentQuiz = quiz;

        const { data: questions, error: qsErr } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quizId);

        if (qsErr) throw qsErr;
        quizQuestions = questions;

        if (quizQuestions.length === 0) {
            alert('This quiz has no questions yet.');
            return;
        }

        // Initialize UI
        container.classList.add('hidden');
        activeInt.classList.remove('hidden');
        document.getElementById('currentQuizTitle').textContent = currentQuiz.title;

        currentQuestionIndex = 0;
        userAnswers = {};
        startTime = Date.now();
        startTimer(currentQuiz.duration_minutes * 60);
        showQuestion();

    } catch (err) {
        console.error('Quiz start failed:', err);
        alert('Failed to start quiz.');
    }
}

function startTimer(seconds) {
    timeLeft = seconds;
    updateTimerUI();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time is up!');
            submitQuiz();
        }
    }, 1000);
}

function updateTimerUI() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('quizTimer').textContent =
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function showQuestion() {
    const q = quizQuestions[currentQuestionIndex];
    document.getElementById('questionText').textContent = q.question_text;
    document.getElementById('questionCounter').textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;

    const progressPercent = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('progressBar').style.width = `${progressPercent}%`;
    document.getElementById('progressPercent').textContent = `${Math.round(progressPercent)}%`;

    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = `
    <div class="quiz-option ${userAnswers[q.id] === 'A' ? 'selected' : ''}" onclick="selectOption('${q.id}', 'A')">
        <span class="option-prefix">A</span>
        <span>${q.option_a}</span>
    </div>
    <div class="quiz-option ${userAnswers[q.id] === 'B' ? 'selected' : ''}" onclick="selectOption('${q.id}', 'B')">
        <span class="option-prefix">B</span>
        <span>${q.option_b}</span>
    </div>
    <div class="quiz-option ${userAnswers[q.id] === 'C' ? 'selected' : ''}" onclick="selectOption('${q.id}', 'C')">
        <span class="option-prefix">C</span>
        <span>${q.option_c}</span>
    </div>
    <div class="quiz-option ${userAnswers[q.id] === 'D' ? 'selected' : ''}" onclick="selectOption('${q.id}', 'D')">
        <span class="option-prefix">D</span>
        <span>${q.option_d}</span>
    </div>
  `;

    // Update Nav Buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    if (currentQuestionIndex === quizQuestions.length - 1) {
        document.getElementById('nextBtn').classList.add('hidden');
        document.getElementById('submitQuizBtn').classList.remove('hidden');
    } else {
        document.getElementById('nextBtn').classList.remove('hidden');
        document.getElementById('submitQuizBtn').classList.add('hidden');
    }
}

window.selectOption = function (qId, label) {
    userAnswers[qId] = label;
    showQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

async function submitQuiz() {
    clearInterval(timerInterval);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    // Calculate Score
    let correct = 0;
    quizQuestions.forEach(q => {
        if (userAnswers[q.id] === q.correct_answer) correct++;
    });

    const percent = Math.round((correct / quizQuestions.length) * 100);

    // Save Result
    try {
        const user = await getCurrentUser();
        await supabase.from('quiz_submissions').insert({
            quiz_id: currentQuiz.id,
            user_id: user.id,
            score: correct,
            total_questions: quizQuestions.length,
            time_taken_seconds: timeTaken,
            answers: userAnswers
        });

        // Show Results UI
        document.getElementById('activeQuiz').classList.add('hidden');
        document.getElementById('quizResults').classList.remove('hidden');

        document.getElementById('resultScore').textContent = `${percent}%`;
        document.getElementById('resultDetails').textContent = `You scored ${correct} out of ${quizQuestions.length}`;
        document.getElementById('resCorrect').textContent = correct;
        document.getElementById('resWrong').textContent = quizQuestions.length - correct;

        const m = Math.floor(timeTaken / 60);
        const s = timeTaken % 60;
        document.getElementById('resTime').textContent = `${m}:${s.toString().padStart(2, '0')}`;

    } catch (err) {
        console.error('Submit error:', err);
        alert('Error saving your score.');
    }
}
