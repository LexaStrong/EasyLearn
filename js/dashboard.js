// ===========================================
// EasyLearn - Dashboard Module
// ===========================================

(async function () {
  try {
    // Protect this page - require authentication
    const session = await requireAuth();
    if (!session) return;

    // Get current user data
    const user = await getCurrentUser();
    if (!user) return;

    // Update user info in sidebar
    document.getElementById('userName').textContent = user.full_name;
    document.getElementById('userProgram').textContent = `${user.programs?.name || 'Program'} - Semester ${user.semester}`;

    if (user.avatar_url) {
      document.getElementById('userAvatar').src = user.avatar_url;
    }

    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        await logout();
      }
    });

    // Load dashboard data in parallel
    await Promise.all([
      loadDashboardStats(user),
      loadRecentBooks(user),
      loadRecentResources(user)
    ]);
  } catch (error) {
    console.error('Dashboard initialization error:', error);
  }
})();

// Load dashboard statistics
async function loadDashboardStats(user) {
  try {
    // Fetch stats in parallel
    const [booksRes, coursesRes, quizRes] = await Promise.all([
      supabase.from('books').select('*', { count: 'exact', head: true }).eq('program_id', user.program_id),
      supabase.from('courses').select('id').eq('program_id', user.program_id),
      supabase.from('quiz_submissions').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ]);

    const bookCount = booksRes.count || 0;
    const courseIds = coursesRes.data?.map(c => c.id) || [];
    const quizCount = quizRes.count || 0;

    let resourceCount = 0;
    if (courseIds.length > 0) {
      const { count } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds);
      resourceCount = count;
    }

    // Update UI
    document.getElementById('bookCount').textContent = bookCount;
    document.getElementById('resourceCount').textContent = resourceCount;
    document.getElementById('quizCount').textContent = quizCount;

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load recent books for user's program
async function loadRecentBooks(user) {
  const container = document.getElementById('recentBooks');

  try {
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .eq('program_id', user.program_id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    if (!books || books.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <p>No books available yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = books.map(book => `
      <div class="resource-item" onclick="window.location.href='library.html?book=${book.id}'">
        <img 
          class="resource-cover" 
          src="${book.cover_image_url || 'https://via.placeholder.com/180x240/2d3142/ffffff?text=No+Cover'}" 
          alt="${book.title}"
          onerror="this.src='https://via.placeholder.com/180x240/2d3142/ffffff?text=No+Cover'"
        >
        <div class="resource-info">
          <div class="resource-title">${book.title}</div>
          <div class="resource-meta">${book.author || 'Unknown Author'}</div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading books:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p>Error loading books</p>
      </div>
    `;
  }
}

// Load recent resources
async function loadRecentResources(user) {
  const container = document.getElementById('recentResources');

  try {
    // Get courses for user's program
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('program_id', user.program_id);

    const courseIds = courses?.map(c => c.id) || [];

    if (courseIds.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p>No resources available yet</p>
        </div>
      `;
      return;
    }

    const { data: resources, error } = await supabase
      .from('resources')
      .select('*, courses(name, code)')
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    if (!resources || resources.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p>No resources available yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = resources.map(resource => {
      const icon = resource.type === 'past_question' ? '📝' :
        resource.type === 'lecture_slide' ? '🎞️' : '📄';

      return `
        <div class="resource-item" onclick="window.location.href='resources.html?id=${resource.id}'">
          <div class="resource-cover" style="display: flex; align-items: center; justify-content: center; font-size: 3rem;">
            ${icon}
          </div>
          <div class="resource-info">
            <div class="resource-title">${resource.title}</div>
            <div class="resource-meta">${resource.courses?.code || 'Unknown'}</div>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error loading resources:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p>Error loading resources</p>
      </div>
    `;
  }
}
