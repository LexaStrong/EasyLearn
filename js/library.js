// ===================================
// EasyLearn - Library Module
// ===================================

let allBooks = [];
let currentUser = null;
let selectedBook = null;

(async function () {
  // Protect this page
  const session = await requireAuth();
  if (!session) return;

  // Get current user
  currentUser = await getCurrentUser();
  if (!currentUser) {
    document.getElementById('loadingBooks').style.display = 'none';
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

  // Load programs for filter
  await loadProgramFilters();

  // Load books
  await loadBooks();

  // Setup search
  document.getElementById('searchInput').addEventListener('input', filterBooks);
  document.getElementById('programFilter').addEventListener('change', filterBooks);
})();

// Load programs for filter dropdown
async function loadProgramFilters() {
  const select = document.getElementById('programFilter');

  PROGRAMS.forEach(program => {
    const option = document.createElement('option');
    option.value = program.id;
    option.textContent = program.name;
    if (program.id === currentUser.program_id) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

// Load all books
async function loadBooks() {
  const loadingDiv = document.getElementById('loadingBooks');
  const gridDiv = document.getElementById('booksGrid');

  try {
    const { data: books, error } = await supabase
      .from('books')
      .select('*, programs(name, code)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    allBooks = books || [];

    // Initially filter to show user's program books
    filterBooks();

    loadingDiv.style.display = 'none';
    gridDiv.style.display = 'grid';

  } catch (error) {
    console.error('Error loading books:', error);
    loadingDiv.innerHTML = `
      <div class="empty-state">
        <p style="color: var(--accent-danger);">Error loading books. Please try again.</p>
      </div>
    `;
  }
}

// Filter and display books
function filterBooks() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const programFilter = document.getElementById('programFilter').value;
  const gridDiv = document.getElementById('booksGrid');

  let filtered = allBooks;

  // Filter by program
  if (programFilter) {
    filtered = filtered.filter(book => book.program_id === parseInt(programFilter));
  }

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author?.toLowerCase().includes(searchTerm) ||
      book.isbn?.toLowerCase().includes(searchTerm)
    );
  }

  if (filtered.length === 0) {
    gridDiv.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📚</div>
        <p>No books found</p>
      </div>
    `;
    return;
  }

  gridDiv.innerHTML = filtered.map(book => `
    <div class="resource-item" onclick="openBookModal(${book.id})">
      <img 
        class="resource-cover" 
        src="${book.cover_image_url || 'https://via.placeholder.com/180x240/2d3142/ffc107?text=' + encodeURIComponent(book.title.substring(0, 20))}" 
        alt="${book.title}"
        onerror="this.src='https://via.placeholder.com/180x240/2d3142/ffc107?text=Book'"
      >
      <div class="resource-info">
        <div class="resource-title" title="${book.title}">${book.title}</div>
        <div class="resource-meta">${book.author || 'Unknown Author'}</div>
      </div>
    </div>
  `).join('');
}

// Open book detail modal
function openBookModal(bookId) {
  selectedBook = allBooks.find(b => b.id === bookId);
  if (!selectedBook) return;

  document.getElementById('modalTitle').textContent = 'Book Details';
  document.getElementById('modalBookTitle').textContent = selectedBook.title;
  document.getElementById('modalAuthor').textContent = selectedBook.author || 'Unknown Author';
  document.getElementById('modalISBN').textContent = selectedBook.isbn || 'N/A';
  document.getElementById('modalProgram').textContent = selectedBook.programs?.name || 'N/A';
  document.getElementById('modalDescription').textContent = selectedBook.description || 'No description available.';
  document.getElementById('modalCover').src = selectedBook.cover_image_url || 'https://via.placeholder.com/300x400/2d3142/ffc107?text=' + encodeURIComponent(selectedBook.title);

  // Setup action buttons
  const viewBtn = document.getElementById('viewBookBtn');
  const downloadBtn = document.getElementById('downloadBookBtn');

  if (selectedBook.file_url) {
    viewBtn.onclick = () => viewBook(selectedBook.file_url, selectedBook.title);
    downloadBtn.onclick = () => downloadBook(selectedBook.file_url, selectedBook.title);
    viewBtn.disabled = false;
    downloadBtn.disabled = false;
  } else {
    viewBtn.disabled = true;
    downloadBtn.disabled = true;
    viewBtn.textContent = 'Not Available';
    downloadBtn.textContent = 'Not Available';
  }

  document.getElementById('bookModal').classList.remove('hidden');
}

// Close book modal
function closeBookModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('bookModal').classList.add('hidden');
  selectedBook = null;
}

// View book in browser
function viewBook(fileUrl, title) {
  // Create PDF viewer overlay
  const viewerHTML = `
    <div class="pdf-viewer-container" id="pdfViewer">
      <div class="pdf-viewer-header">
        <div class="pdf-viewer-title">${title}</div>
        <button class="btn btn-secondary" onclick="closePDFViewer()">✕ Close</button>
      </div>
      <div class="pdf-viewer-content">
        <iframe src="${fileUrl}#toolbar=1" allowfullscreen></iframe>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', viewerHTML);
  closeBookModal();
}

//  Close PDF viewer
function closePDFViewer() {
  const viewer = document.getElementById('pdfViewer');
  if (viewer) {
    viewer.remove();
  }
}

// Download book
function downloadBook(fileUrl, title) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = `${title}.pdf`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Make functions globally accessible
window.openBookModal = openBookModal;
window.closeBookModal = closeBookModal;
window.closePDFViewer = closePDFViewer;
