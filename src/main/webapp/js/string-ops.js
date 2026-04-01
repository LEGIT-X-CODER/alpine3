/**
 * string-ops.js — Frontend logic for Feature 1: String Operations
 * Sends AJAX POST to /api/string servlet and renders result.
 */

let selectedOp = null;

const opsConfig = [
  { op:'length',     label:'Length',      icon:'📏', needsS2:false },
  { op:'reverse',    label:'Reverse',     icon:'🔄', needsS2:false },
  { op:'palindrome', label:'Palindrome',  icon:'🪞', needsS2:false },
  { op:'concat',     label:'Concatenate', icon:'🔗', needsS2:true  },
  { op:'initials',   label:'Initials',    icon:'🔡', needsS2:false },
  { op:'wordcount',  label:'Word Count',  icon:'🔢', needsS2:false },
  { op:'togglecase', label:'Toggle Case', icon:'🔁', needsS2:false },
  { op:'vowels',     label:'Vowels',      icon:'🎵', needsS2:false },
  { op:'consonants', label:'Consonants',  icon:'🎶', needsS2:false },
  { op:'uppercase',  label:'Uppercase',   icon:'⬆️', needsS2:false },
  { op:'lowercase',  label:'Lowercase',   icon:'⬇️', needsS2:false },
];

function buildOpsGrid() {
  const grid = document.getElementById('ops-grid');
  grid.innerHTML = '';
  opsConfig.forEach(cfg => {
    const btn = document.createElement('button');
    btn.className = 'op-btn';
    btn.id = `op-${cfg.op}`;
    btn.innerHTML = `<span class="oi">${cfg.icon}</span>${cfg.label}`;
    btn.onclick = () => selectOp(cfg);
    grid.appendChild(btn);
  });
}

function selectOp(cfg) {
  selectedOp = cfg.op;
  // highlight selected
  document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById(`op-${cfg.op}`).classList.add('selected');
  // show/hide second string input
  const s2wrap = document.getElementById('s2-wrap');
  s2wrap.style.display = cfg.needsS2 ? 'block' : 'none';
  // update run button label
  document.getElementById('run-btn').textContent = `Run: ${cfg.label}`;
  document.getElementById('run-btn').disabled = false;
  clearResult();
}

async function runOperation() {
  const s1 = document.getElementById('s1').value;
  const s2 = document.getElementById('s2').value;

  if (!selectedOp) return showToast('Please select an operation first.', 'error');
  if (!s1.trim()) return showToast('Please enter a string.', 'error');

  setLoading(true);
  try {
    const res = await fetch(API.STRING, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: selectedOp, s1, s2 })
    });
    const data = await res.json();
    if (data.error) showError(data.error);
    else showResult(data.result, data.operation);
  } catch (e) {
    showError('Cannot connect to server. Is Tomcat running?');
  }
  setLoading(false);
}

function showResult(value, operation) {
  const box = document.getElementById('result-box');
  box.className = 'result-box success';
  box.innerHTML = `
    <div class="result-label">Result</div>
    <div class="result-val">${escapeHtml(value)}</div>
    <div class="result-op">${escapeHtml(operation)}</div>`;
}

function showError(msg) {
  const box = document.getElementById('result-box');
  box.className = 'result-box error';
  box.innerHTML = `
    <div class="result-label">Error</div>
    <div class="result-val error-txt">⚠️ ${escapeHtml(msg)}</div>`;
}

function clearResult() {
  const box = document.getElementById('result-box');
  box.className = 'result-box';
  box.innerHTML = `<div class="result-placeholder">Select an operation and click Run</div>`;
}

function setLoading(on) {
  const btn = document.getElementById('run-btn');
  btn.disabled = on;
  btn.innerHTML = on ? '<span class="spinner"></span> Running…' : `Run: ${opsConfig.find(o=>o.op===selectedOp)?.label||'Operation'}`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Toast helper
function showToast(msg, type='success') {
  const stack = document.getElementById('toast-stack');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${type==='success'?'✅':'⚠️'}</span>${msg}`;
  stack.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  buildOpsGrid();
  // Enter key triggers run
  document.getElementById('s1').addEventListener('keydown', e => {
    if (e.key === 'Enter' && selectedOp) runOperation();
  });
});
