// ===========================================
// EasyLearn - Admin Dashboard JS
// ===========================================

(async function () {
    // Requires Admin check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '../index.html'; return; }

    const { data: user } = await supabase.from('users').select('is_admin').eq('id', session.user.id).single();
    if (!user?.is_admin) {
        alert('Access Denied: Admin privileges required.');
        window.location.href = '../dashboard.html';
        return;
    }

    loadGlobalStats();
})();

async function loadGlobalStats() {
    const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: res } = await supabase.from('resources').select('*', { count: 'exact', head: true });
    const { count: books } = await supabase.from('books').select('*', { count: 'exact', head: true });

    document.getElementById('totalUsers').textContent = users || 0;
    document.getElementById('totalResources').textContent = res || 0;
    document.getElementById('totalBooks').textContent = books || 0;

    // Activity Feed & Program Stats could be implemented here
    document.getElementById('activityFeed').innerHTML = '<p class="text-muted">No recent activity logged.</p>';
    document.getElementById('programStats').innerHTML = '<p class="text-muted">Data visualization coming soon.</p>';
}
