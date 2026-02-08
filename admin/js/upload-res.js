// ===========================================
// EasyLearn - Admin Resource Upload JS
// ===========================================

(async function () {
    // Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '../index.html'; return; }

    // Populate Programs
    const progSelect = document.getElementById('resProgram');
    PROGRAMS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        progSelect.appendChild(opt);
    });

    progSelect.addEventListener('change', updateCourses);
    updateCourses();

    // File Selection Logic
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('resFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) fileNameDisplay.textContent = fileInput.files[0].name;
    });

    // Form Submit
    document.getElementById('uploadResourceForm').addEventListener('submit', handleUpload);

    loadRecentList();
})();

function updateCourses() {
    const progId = parseInt(document.getElementById('resProgram').value);
    const courseSelect = document.getElementById('resCourse');
    courseSelect.innerHTML = '';

    const prog = PROGRAMS.find(p => p.id === progId);
    if (prog && COURSES[prog.code]) {
        const semester = 1; // Default
        const allC = [...COURSES[prog.code][1], ...COURSES[prog.code][2]];
        allC.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.code; // We'll look up DB ID in real scenario
            opt.textContent = `${c.code} - ${c.name}`;
            courseSelect.appendChild(opt);
        });
    }
}

async function handleUpload(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const progress = document.getElementById('uploadProgress');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    const file = document.getElementById('resFile').files[0];

    if (!file) return alert('Select a file');

    btn.disabled = true;
    progress.classList.remove('hidden');

    try {
        // 1. Upload File to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `resources/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('course-files')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('course-files')
            .getPublicUrl(filePath);

        // 2. Insert Metadata into Table
        // For simplicity, we assume course ID 1 exists in DB if matching code logic isn't here
        // In real use, we'd fetch actual record ID for the course code
        const { data: courseRecord } = await supabase
            .from('courses')
            .select('id')
            .eq('code', document.getElementById('resCourse').value)
            .single();

        const { error: dbError } = await supabase.from('resources').insert({
            title: document.getElementById('resTitle').value,
            type: document.getElementById('resType').value,
            course_id: courseRecord?.id || 1, // Fallback placeholder
            semester: parseInt(document.getElementById('resSemester').value),
            year: parseInt(document.getElementById('resYear').value),
            file_url: publicUrl,
            file_type: fileExt
        });

        if (dbError) throw dbError;

        alert('Resource uploaded successfully!');
        window.location.reload();

    } catch (err) {
        console.error(err);
        alert('Upload failed: ' + err.message);
    } finally {
        btn.disabled = false;
        progress.classList.add('hidden');
    }
}

async function loadRecentList() {
    const list = document.getElementById('recentResourcesTable');
    const { data } = await supabase.from('resources').select('*, courses(name, code)').limit(10).order('created_at', { ascending: false });

    if (data) {
        list.innerHTML = data.map(r => `
            <tr>
                <td>${r.title}</td>
                <td>${r.courses?.code || 'N/A'}</td>
                <td>${r.type}</td>
                <td>${new Date(r.created_at).toLocaleDateString()}</td>
                <td><button class="btn btn-secondary btn-sm" onclick="deleteRes(${r.id})">Delete</button></td>
            </tr>
        `).join('');
    }
}

window.deleteRes = async function (id) {
    if (confirm('Delete this resource?')) {
        await supabase.from('resources').delete().eq('id', id);
        loadRecentList();
    }
}
