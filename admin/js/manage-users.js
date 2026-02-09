import { supabase } from '../../js/config.js';

(async function () {
    const { data } = await supabase.from('users').select('*, programs(name)').order('created_at', { ascending: false });
    const tbody = document.getElementById('usersTable');
    if (data) {
        tbody.innerHTML = data.map(u => `
        <tr>
            <td>${u.full_name}</td>
            <td>${u.email}</td>
            <td>${u.programs?.name || 'N/A'}</td>
            <td>${u.is_admin ? '<span class="badge badge-info">Admin</span>' : '<span class="badge badge-success">Student</span>'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="toggleAdmin('${u.id}', ${u.is_admin})">
                    ${u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                </button>
            </td>
        </tr>
    `).join('');
    }
})();

window.toggleAdmin = async function (id, current) {
    if (confirm(`Change this user's role?`)) {
        await supabase.from('users').update({ is_admin: !current }).eq('id', id);
        window.location.reload();
    }
}
