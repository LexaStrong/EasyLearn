// ===========================================
// EasyLearn - Resources Module
// ===========================================

let allResources = [];
let currentUser = null;

(async function () {
    // Protect this page
    const session = await requireAuth();
    if (!session) return;

    // Get current user
    currentUser = await getCurrentUser();
    if (!currentUser) {
        const loading = document.getElementById('loadingResources');
        if (loading) loading.style.display = 'none';
        return;
    }

    // Update user info
    document.getElementById('userName').textContent = currentUser.full_name;
    document.getElementById('userProgram').textContent = `${currentUser.programs?.name || 'Program'} - Semester ${currentUser.semester}`;
    if (currentUser.avatar_url) {
        document.getElementById('userAvatar').src = currentUser.avatar_url;
    }

    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            await logout();
        }
    });

    // Populate Program Filter
    const progSelect = document.getElementById('programFilter');
    PROGRAMS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        if (p.id === currentUser.program_id) opt.selected = true;
        progSelect.appendChild(opt);
    });

    // Setup Listeners
    progSelect.addEventListener('change', () => {
        updateCourseFilter();
        loadResources();
    });
    document.getElementById('courseFilter').addEventListener('change', filterLocal);
    document.getElementById('typeFilter').addEventListener('change', filterLocal);
    document.getElementById('semesterFilter').addEventListener('change', filterLocal);

    document.getElementById('closeViewer').addEventListener('click', () => {
        document.getElementById('pdfViewerModal').classList.add('hidden');
        document.getElementById('viewerFrame').src = '';
    });

    // Initial Load
    updateCourseFilter();
    await loadResources();
})();

function updateCourseFilter() {
    const progId = parseInt(document.getElementById('programFilter').value);
    const courseSelect = document.getElementById('courseFilter');
    courseSelect.innerHTML = '<option value="">All Courses</option>';

    const prog = PROGRAMS.find(p => p.id === progId);
    if (prog && COURSES[prog.code]) {
        const courses = [...COURSES[prog.code][1], ...COURSES[prog.code][2]];
        courses.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.code;
            opt.textContent = `${c.code} - ${c.name}`;
            courseSelect.appendChild(opt);
        });
    }
}

async function loadResources() {
    const loading = document.getElementById('loadingResources');
    const list = document.getElementById('resourceList');
    const empty = document.getElementById('noResources');

    loading.style.display = 'block';
    list.style.display = 'none';
    empty.classList.add('hidden');

    try {
        const progId = document.getElementById('programFilter').value;

        const { data, error } = await supabase
            .from('resources')
            .select('*, courses!inner(name, code, program_id)')
            .eq('courses.program_id', progId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allResources = data || [];
        filterLocal();

    } catch (err) {
        console.error('Error loading resources:', err);
        loading.innerHTML = '<p class="text-accent">Failed to load resources.</p>';
    } finally {
        loading.style.display = 'none';
    }
}

function filterLocal() {
    const courseCode = document.getElementById('courseFilter').value;
    const typeValue = document.getElementById('typeFilter').value;
    const semester = document.getElementById('semesterFilter').value;

    let filtered = allResources;

    if (courseCode) {
        filtered = filtered.filter(r => r.courses?.code === courseCode);
    }
    if (typeValue) {
        filtered = filtered.filter(r => r.type === typeValue);
    }
    if (semester) {
        filtered = filtered.filter(r => r.semester === parseInt(semester));
    }

    renderResources(filtered);
}

function renderResources(data) {
    const list = document.getElementById('resourceList');
    const empty = document.getElementById('noResources');

    if (data.length === 0) {
        list.style.display = 'none';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    list.style.display = 'flex';
    list.innerHTML = data.map(res => {
        const icon = res.type === 'past_question' ? '📝' : '🎞️';
        const typeLabel = res.type === 'past_question' ? 'Past Question' : 'Lecture Slide';

        return `
      <div class="resource-card-long">
        <div class="res-icon-box">${icon}</div>
        <div class="res-details">
          <h4>${res.title}</h4>
          <p>${res.courses?.code} - ${res.courses?.name}</p>
        </div>
        <div class="res-meta-item">
          <strong>${typeLabel}</strong><br>
          Semester ${res.semester}
        </div>
        <div class="res-actions">
          <button class="btn btn-secondary btn-sm" onclick="viewResource('${res.file_url}', '${res.title.replace(/'/g, "\\'")}')">View</button>
          <button class="btn btn-primary btn-sm" onclick="downloadFile('${res.file_url}', '${res.title.replace(/'/g, "\\'")}')">Download</button>
        </div>
      </div>
    `;
    }).join('');
}

window.viewResource = function (url, title) {
    document.getElementById('viewerTitle').textContent = title;
    document.getElementById('viewerFrame').src = `${url}#toolbar=0`;
    document.getElementById('pdfViewerModal').classList.remove('hidden');
};

window.downloadFile = function (url, title) {
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
