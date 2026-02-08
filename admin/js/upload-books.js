// ===========================================
// EasyLearn - Admin Book Upload JS
// ===========================================

(async function () {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '../index.html'; return; }

    // Populate Programs
    const progSelect = document.getElementById('bookProgram');
    PROGRAMS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        progSelect.appendChild(opt);
    });

    // File Dropzones
    setupDropzone('bookFileZone', 'bookFile', 'bookFileName');
    setupDropzone('coverFileZone', 'coverFile', 'coverFileName');

    document.getElementById('uploadBookForm').addEventListener('submit', handleBookUpload);
    loadBooksList();
})();

function setupDropzone(zoneId, inputId, textId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    const text = document.getElementById(textId);

    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
        if (input.files.length) text.textContent = input.files[0].name;
    });
}

async function handleBookUpload(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBookBtn');
    const progress = document.getElementById('uploadProgress');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');

    const bookFile = document.getElementById('bookFile').files[0];
    const coverFile = document.getElementById('coverFile').files[0];

    if (!bookFile) return alert('Please select a book PDF');

    btn.disabled = true;
    progress.classList.remove('hidden');

    try {
        // 1. Upload PDF
        const pdfName = `${Date.now()}_book.pdf`;
        const { error: pdfErr } = await supabase.storage.from('books').upload(`pdfs/${pdfName}`, bookFile);
        if (pdfErr) throw pdfErr;
        const pdfUrl = supabase.storage.from('books').getPublicUrl(`pdfs/${pdfName}`).data.publicUrl;

        // 2. Upload Cover (Optional)
        let coverUrl = null;
        if (coverFile) {
            const coverName = `${Date.now()}_cover.${coverFile.name.split('.').pop()}`;
            await supabase.storage.from('books').upload(`covers/${coverName}`, coverFile);
            coverUrl = supabase.storage.from('books').getPublicUrl(`covers/${coverName}`).data.publicUrl;
        }

        // 3. Insert Row
        const { error: dbErr } = await supabase.from('books').insert({
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            program_id: parseInt(document.getElementById('bookProgram').value),
            isbn: document.getElementById('bookISBN').value,
            description: document.getElementById('bookDescription').value,
            file_url: pdfUrl,
            cover_image_url: coverUrl
        });

        if (dbErr) throw dbErr;

        alert('Book successfully added to library!');
        window.location.reload();

    } catch (err) {
        console.error(err);
        alert('Failed to upload book: ' + err.message);
    } finally {
        btn.disabled = false;
        progress.classList.add('hidden');
    }
}

async function loadBooksList() {
    const tbody = document.getElementById('booksTable');
    const { data } = await supabase.from('books').select('*, programs(name)').order('created_at', { ascending: false });

    if (data) {
        tbody.innerHTML = data.map(b => `
            <tr>
                <td>${b.title}</td>
                <td>${b.author}</td>
                <td>${b.programs?.name || 'N/A'}</td>
                <td><button class="btn btn-secondary btn-sm" onclick="deleteBook(${b.id})">Remove</button></td>
            </tr>
        `).join('');
    }
}

window.deleteBook = async function (id) {
    if (confirm('Permanently remove this book?')) {
        await supabase.from('books').delete().eq('id', id);
        loadBooksList();
    }
}
