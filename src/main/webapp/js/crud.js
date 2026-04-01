/**
 * crud.js — Frontend logic for Feature 3: Derby CRUD via CrudServlet
 * GET /api/students       → list all
 * POST /api/students      → create
 * PUT /api/students?id=N  → update
 * DELETE /api/students?id=N → delete
 */

let editingId = null;

// ── READ ──────────────────────────────────────────────────────
async function loadStudents() {
  const tbody = document.getElementById('student-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="no-data"><span class="spinner"></span> Loading…</td></tr>';
  try {
    const res = await fetch(API.STUDENTS);
    const students = await res.json();
    if (!Array.isArray(students) || students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">No students found. Add one above!</td></tr>';
      updateStats(0);
      return;
    }
    tbody.innerHTML = students.map(s => `
      <tr id="row-${s.id}">
        <td class="col-id">#${s.id}</td>
        <td class="col-name">${esc(s.name)}</td>
        <td>${esc(s.roll_no)}</td>
        <td>${esc(s.branch)}</td>
        <td class="col-cgpa">${s.cgpa.toFixed(2)}</td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-success-outline btn-sm" onclick="openEdit(${s.id},'${esc(s.name)}','${esc(s.roll_no)}','${esc(s.branch)}',${s.cgpa})">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">🗑️ Delete</button>
          </div>
        </td>
      </tr>`).join('');
    updateStats(students.length);
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="6" class="no-data" style="color:var(--red)">⚠️ Cannot connect to server. Is Tomcat running?</td></tr>`;
  }
}

function updateStats(count) {
  document.getElementById('total-count').textContent = count;
}

// ── CREATE ────────────────────────────────────────────────────
async function createStudent(e) {
  e.preventDefault();
  const payload = getFormValues('c');
  if (!validatePayload(payload)) return;

  setFormLoading('create-btn', true, 'Creating…');
  try {
    const res = await fetch(API.STUDENTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showToast(`✅ Student created (ID: ${data.id})`, 'success');
    resetForm('c');
    loadStudents();
  } catch(err) {
    showToast('⚠️ ' + err.message, 'error');
  }
  setFormLoading('create-btn', false, '➕ Add Student');
}

// ── UPDATE ────────────────────────────────────────────────────
function openEdit(id, name, roll_no, branch, cgpa) {
  editingId = id;
  document.getElementById('e-name').value    = name;
  document.getElementById('e-roll').value    = roll_no;
  document.getElementById('e-branch').value  = branch;
  document.getElementById('e-cgpa').value    = cgpa;
  document.getElementById('edit-modal-title').textContent = `Edit Student #${id}`;
  document.getElementById('edit-modal').classList.add('open');
}
function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
  editingId = null;
}

async function updateStudent(e) {
  e.preventDefault();
  if (!editingId) return;
  const payload = getFormValues('e');
  if (!validatePayload(payload)) return;

  setFormLoading('update-btn', true, 'Updating…');
  try {
    const res = await fetch(`${API.STUDENTS}?id=${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showToast('✅ Student updated', 'success');
    closeEditModal();
    loadStudents();
  } catch(err) {
    showToast('⚠️ ' + err.message, 'error');
  }
  setFormLoading('update-btn', false, '💾 Save Changes');
}

// ── DELETE ────────────────────────────────────────────────────
async function deleteStudent(id) {
  if (!confirm(`Delete student #${id}? This cannot be undone.`)) return;
  try {
    const res = await fetch(`${API.STUDENTS}?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showToast('🗑️ Student deleted', 'success');
    document.getElementById(`row-${id}`)?.remove();
    // recount
    const rows = document.querySelectorAll('#student-tbody tr:not(.no-data-row)');
    updateStats(rows.length);
    if (rows.length === 0) loadStudents();
  } catch(err) {
    showToast('⚠️ ' + err.message, 'error');
  }
}

// ── Helpers ───────────────────────────────────────────────────
function getFormValues(prefix) {
  return {
    name:    document.getElementById(`${prefix}-name`).value.trim(),
    roll_no: document.getElementById(`${prefix}-roll`).value.trim(),
    branch:  document.getElementById(`${prefix}-branch`).value.trim(),
    cgpa:    parseFloat(document.getElementById(`${prefix}-cgpa`).value),
  };
}
function validatePayload(p) {
  if (!p.name)    { showToast('⚠️ Name is required', 'error'); return false; }
  if (!p.roll_no) { showToast('⚠️ Roll No is required', 'error'); return false; }
  if (!p.branch)  { showToast('⚠️ Branch is required', 'error'); return false; }
  if (isNaN(p.cgpa) || p.cgpa < 0 || p.cgpa > 10) { showToast('⚠️ CGPA must be 0–10', 'error'); return false; }
  return true;
}
function resetForm(prefix) {
  ['name','roll','branch','cgpa'].forEach(f => document.getElementById(`${prefix}-${f}`).value='');
}
function setFormLoading(btnId, on, label) {
  const btn = document.getElementById(btnId);
  btn.disabled = on;
  btn.innerHTML = on ? `<span class="spinner"></span> ${label}` : label;
}
function esc(str) {
  return String(str).replace(/'/g,"\\'").replace(/</g,'&lt;');
}
function showToast(msg, type='success') {
  const stack = document.getElementById('toast-stack');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  stack.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

document.addEventListener('DOMContentLoaded', loadStudents);
