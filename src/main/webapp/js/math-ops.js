/**
 * math-ops.js — Frontend logic for Feature 2: Math Operations
 * Sends AJAX POST to /api/math servlet and renders result.
 */

let selectedMathOp = null;

const mathOps = [
  // Trig
  { op:'sin',       label:'sin',       icon:'〽️', needsB:false, hint:'angle in degrees' },
  { op:'cos',       label:'cos',       icon:'📉', needsB:false, hint:'angle in degrees' },
  { op:'tan',       label:'tan',       icon:'📈', needsB:false, hint:'angle in degrees' },
  // Unary
  { op:'sqrt',      label:'√ sqrt',    icon:'√',  needsB:false, hint:'non-negative number' },
  { op:'log',       label:'ln',        icon:'ℓ',  needsB:false, hint:'natural log, value > 0' },
  { op:'log10',     label:'log₁₀',     icon:'🔟', needsB:false, hint:'value > 0' },
  { op:'abs',       label:'|abs|',     icon:'±',  needsB:false, hint:'absolute value' },
  { op:'ceil',      label:'⌈ceil⌉',    icon:'⤴', needsB:false, hint:'round up' },
  { op:'floor',     label:'⌊floor⌋',   icon:'⤵', needsB:false, hint:'round down' },
  { op:'factorial', label:'n!',        icon:'❗', needsB:false, hint:'integer 0–20' },
  // Binary
  { op:'add', label:'A + B', icon:'+', needsB:true },
  { op:'sub', label:'A − B', icon:'−', needsB:true },
  { op:'mul', label:'A × B', icon:'×', needsB:true },
  { op:'div', label:'A ÷ B', icon:'÷', needsB:true },
  { op:'pow', label:'A ^ B', icon:'^', needsB:true },
  { op:'mod', label:'A mod B', icon:'%', needsB:true },
];

function buildMathOps() {
  const grid = document.getElementById('math-ops-grid');
  grid.innerHTML = '';
  mathOps.forEach(cfg => {
    const btn = document.createElement('button');
    btn.className = 'op-btn';
    btn.id = `mop-${cfg.op}`;
    btn.innerHTML = `<span class="oi">${cfg.icon}</span>${cfg.label}`;
    btn.onclick = () => selectMathOp(cfg);
    grid.appendChild(btn);
  });
}

function selectMathOp(cfg) {
  selectedMathOp = cfg.op;
  document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById(`mop-${cfg.op}`).classList.add('selected');

  const bWrap = document.getElementById('b-wrap');
  const aLabel = document.getElementById('a-label');
  bWrap.style.display = cfg.needsB ? 'block' : 'none';
  aLabel.textContent = cfg.needsB ? 'Value A' : `Value A (${cfg.hint || 'number'})`;

  document.getElementById('math-run-btn').textContent = `Calculate: ${cfg.label}`;
  document.getElementById('math-run-btn').disabled = false;
  clearMathResult();
}

async function runMathOp() {
  if (!selectedMathOp) return showMathToast('Please select an operation.', 'error');
  const aVal = document.getElementById('a-val').value;
  const bVal = document.getElementById('b-val').value;
  if (aVal === '') return showMathToast('Please enter a value for A.', 'error');

  const cfg = mathOps.find(o => o.op === selectedMathOp);
  setMathLoading(true);
  try {
    const body = { op: selectedMathOp, a: parseFloat(aVal) };
    if (cfg.needsB) body.b = parseFloat(bVal);

    const res = await fetch(API.MATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.error) showMathError(data.error);
    else showMathResult(data.result, data.operation);
  } catch (e) {
    showMathError('Cannot reach server. Is Tomcat running?');
  }
  setMathLoading(false);
}

function showMathResult(val, op) {
  const box = document.getElementById('math-result-box');
  box.className = 'result-box success';
  box.innerHTML = `
    <div class="result-label">Result</div>
    <div class="result-val">${val}</div>
    <div class="result-op">${op}</div>`;
}
function showMathError(msg) {
  const box = document.getElementById('math-result-box');
  box.className = 'result-box error';
  box.innerHTML = `
    <div class="result-label">Error</div>
    <div class="result-val error-txt">⚠️ ${msg}</div>`;
}
function clearMathResult() {
  const box = document.getElementById('math-result-box');
  box.className = 'result-box';
  box.innerHTML = '<div class="result-placeholder">Select an operation and click Calculate</div>';
}
function setMathLoading(on) {
  const btn = document.getElementById('math-run-btn');
  btn.disabled = on;
  const cfg = mathOps.find(o => o.op === selectedMathOp);
  btn.innerHTML = on ? '<span class="spinner"></span> Calculating…' : `Calculate: ${cfg?.label||''}`;
}
function showMathToast(msg, type='success') {
  const stack = document.getElementById('toast-stack');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${type==='success'?'✅':'⚠️'}</span>${msg}`;
  stack.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

document.addEventListener('DOMContentLoaded', buildMathOps);
