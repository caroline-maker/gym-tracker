// === Data ===

const WARMUP = [
  'Band Pull-Apart',
  'Wall Slides',
  'Seated Face Pull',
  'YTLIs',
  'KB Swing',
];

const SESSIONS = [
  {
    id: 1,
    name: 'Pull + Hinge',
    exercises: [
      { name: 'Pendlay Row', startWeight: '55 lbs' },
      { name: 'RDL', startWeight: '75 lbs' },
      { name: 'Reverse Deficit Lunge', startWeight: 'BW' },
      { name: 'Smith Machine Calf Raise', startWeight: 'BW' },
      { name: 'Lat Pulldown', startWeight: '40 lbs', month1Only: true },
    ],
  },
  {
    id: 2,
    name: 'Press',
    exercises: [
      { name: 'Half Kneeling Landmine Press', startWeight: 'Bar only' },
      { name: 'DB Z Press', startWeight: '10–12 lbs each' },
      { name: 'DB Floor Press', startWeight: '10–12 lbs each', note: 'High rep finisher: 20–25 reps' },
      { name: 'Tricep Triset: EZbar Ext → Overhead Cable → Cross Face', startWeight: 'Light' },
    ],
  },
  {
    id: 3,
    name: 'Deadlift + Legs + Arms',
    exercises: [
      { name: 'Conventional Deadlift', startWeight: '85 lbs' },
      { name: 'Box Squat / Split Squat', startWeight: 'BW or 10 lbs each' },
      { name: 'Cable Pull-Through', startWeight: 'Light' },
      { name: 'Leg Extensions', startWeight: '45–55 lbs', note: '3 × 25 reps' },
      { name: 'Seated DB Curl + EZbar Rolling Ext (superset)', startWeight: '12–15 lbs' },
      { name: 'Overhead Cable Extension', startWeight: 'Light' },
    ],
  },
];

// === Storage ===

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// State
let state = {
  startDate: load('startDate', new Date().toISOString().slice(0, 10)),
  nextSession: load('nextSession', 1),       // 1, 2, or 3
  logs: load('logs', []),                     // [{date, sessionId, exercises: [{name, weight, reps, sets, notes}]}]
  completedSessions: load('completedSessions', 0),
};

// First run: set start date
if (!localStorage.getItem('startDate')) {
  save('startDate', state.startDate);
}

function saveState() {
  save('nextSession', state.nextSession);
  save('logs', state.logs);
  save('completedSessions', state.completedSessions);
}

// === Phase Calculation ===

function getPhaseInfo() {
  const start = new Date(state.startDate);
  const now = new Date();
  const daysDiff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysDiff / 7) + 1;

  if (weekNumber <= 4) {
    // Month 1: weeks 1-4
    return {
      month: 1,
      week: weekNumber,
      label: `Month 1 — Week ${weekNumber}`,
      sets: '5–6',
      reps: '12–15',
      detail: '5–6 sets × 12–15 reps, NOT to failure, 60s rest',
    };
  } else if (weekNumber <= 8) {
    // Month 2: weeks 5-8
    const m2week = weekNumber - 4;
    const subWeeks = [
      { label: 'Week 1A', sets: 3, reps: '10–12' },
      { label: 'Week 1B', sets: 4, reps: '10–12' },
      { label: 'Week 2A', sets: 5, reps: '10–12' },
      { label: 'Week 2B', sets: 6, reps: '10–12' },
      { label: 'Week 3A', sets: 7, reps: '10–12' },
      { label: 'Week 3B', sets: 8, reps: '10–12' },
      { label: 'Week 4', sets: 3, reps: '10–12' },
    ];
    // Map 4 weeks to 7 sub-phases: ~2 sub-phases per week
    // Simplify: each week = 2 sub-phases, week 4 = deload
    let subIdx;
    if (m2week === 4) {
      subIdx = 6; // deload
    } else {
      // week 1 -> sub 0,1; week 2 -> sub 2,3; week 3 -> sub 4,5
      const halfWeek = now.getDay(); // use day of week to determine A/B
      subIdx = (m2week - 1) * 2 + (halfWeek >= 4 ? 1 : 0);
    }
    subIdx = Math.min(subIdx, 6);
    const sub = subWeeks[subIdx];
    const isDeload = m2week === 4;
    return {
      month: 2,
      week: m2week,
      subWeek: sub.label,
      label: `Month 2 — ${sub.label}${isDeload ? ' (DELOAD)' : ''}`,
      sets: String(sub.sets),
      reps: sub.reps,
      detail: `${sub.sets} sets × ${sub.reps} reps${isDeload ? ' — DELOAD' : ''}`,
    };
  } else {
    // Month 3+
    const m3week = weekNumber - 8;
    return {
      month: 3,
      week: m3week,
      label: `Month 3 — Week ${m3week}`,
      sets: 'Varies',
      reps: 'Varies',
      detail: 'Trisets & finishers — see plan',
    };
  }
}

function isMonth1() {
  return getPhaseInfo().month === 1;
}

function getSessionExercises(sessionId) {
  const session = SESSIONS.find(s => s.id === sessionId);
  if (!session) return [];
  return session.exercises.filter(e => {
    if (e.month1Only && !isMonth1()) return false;
    return true;
  });
}

// === Previous data lookup ===

function getPreviousLog(exerciseName) {
  // Search logs from newest to oldest
  for (let i = state.logs.length - 1; i >= 0; i--) {
    const log = state.logs[i];
    const ex = log.exercises.find(e => e.name === exerciseName);
    if (ex && ex.weight) return { ...ex, date: log.date };
  }
  return null;
}

function getPersonalBest(exerciseName) {
  let best = null;
  for (const log of state.logs) {
    const ex = log.exercises.find(e => e.name === exerciseName);
    if (ex && ex.weight) {
      const w = parseFloat(ex.weight);
      if (!isNaN(w) && (best === null || w > best)) best = w;
    }
  }
  return best;
}

function getExerciseHistory(exerciseName, limit = 10) {
  const results = [];
  for (let i = state.logs.length - 1; i >= 0 && results.length < limit; i--) {
    const log = state.logs[i];
    const ex = log.exercises.find(e => e.name === exerciseName);
    if (ex && ex.weight) {
      results.push({ ...ex, date: log.date });
    }
  }
  return results;
}

function getAllExerciseNames() {
  const names = new Set();
  SESSIONS.forEach(s => s.exercises.forEach(e => names.add(e.name)));
  return [...names];
}

// Get sessions completed this week (Mon-Sun)
function getWeekSessions() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  return state.logs.filter(l => new Date(l.date) >= monday);
}

// === Navigation ===

let currentView = 'dashboard';

function navigate(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.querySelector(`.nav-btn[data-view="${view}"]`).classList.add('active');
  render();
  window.scrollTo(0, 0);
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.view));
});

// === Render Functions ===

function render() {
  switch (currentView) {
    case 'dashboard': renderDashboard(); break;
    case 'session': renderSession(); break;
    case 'progress': renderProgress(); break;
    case 'history': renderHistory(); break;
  }
}

function renderDashboard() {
  const el = document.getElementById('view-dashboard');
  const phase = getPhaseInfo();
  const weekSessions = getWeekSessions();
  const nextSess = SESSIONS.find(s => s.id === state.nextSession);
  const exercises = getSessionExercises(state.nextSession);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayTypes = ['🏊', '🏋️', '🏊', '🏋️', '🏋️', '🚶', '🚶'];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  // Check which days have logged sessions this week
  const weekDaysDone = new Set();
  weekSessions.forEach(s => {
    const d = new Date(s.date).getDay();
    weekDaysDone.add(d === 0 ? 6 : d - 1);
  });

  el.innerHTML = `
    <h1>Gym Tracker</h1>
    <p class="subtitle">Caroline's Training</p>

    <div class="phase-banner">
      <div class="phase-title">${phase.label}</div>
      <div class="phase-detail">${phase.detail}</div>
    </div>

    <div class="week-strip">
      ${days.map((d, i) => `
        <div class="week-day ${i === todayIdx ? 'today' : ''} ${weekDaysDone.has(i) ? 'completed' : ''}">
          <span class="day-label">${d}</span>
          <span class="day-icon">${dayTypes[i]}</span>
        </div>
      `).join('')}
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${weekSessions.length}</div>
        <div class="stat-label">This Week</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${state.logs.length}</div>
        <div class="stat-label">Total Sessions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${state.nextSession}</div>
        <div class="stat-label">Next Session</div>
      </div>
    </div>

    <h2>Next Up</h2>
    <div class="next-session-card" id="start-session-card">
      <div class="session-number">Session ${nextSess.id}</div>
      <div class="session-title">${nextSess.name}</div>
      <div class="session-exercises-preview">
        ${exercises.map(e => e.name).join(' · ')}
      </div>
      <button class="start-btn" id="btn-start-session">Start Workout</button>
    </div>
  `;

  document.getElementById('btn-start-session').addEventListener('click', () => {
    navigate('session');
  });
}

function renderSession() {
  const el = document.getElementById('view-session');
  const phase = getPhaseInfo();
  const sess = SESSIONS.find(s => s.id === state.nextSession);
  const exercises = getSessionExercises(state.nextSession);

  el.innerHTML = `
    <div class="session-header">
      <div>
        <h1>Session ${sess.id}</h1>
        <p class="subtitle" style="margin-bottom:0">${sess.name}</p>
      </div>
      <span class="badge badge-accent">${phase.sets} × ${phase.reps}</span>
    </div>

    <div class="warmup-toggle">
      <div class="warmup-header" id="warmup-toggle-btn">
        <h3>Warm-up</h3>
        <span id="warmup-arrow">▶</span>
      </div>
      <div class="warmup-list" id="warmup-list">
        ${WARMUP.map((w, i) => `
          <div class="warmup-item">
            <label class="warmup-check">
              <input type="checkbox" id="warmup-${i}">
              <span class="check-box">✓</span>
              ${w}
            </label>
          </div>
        `).join('')}
      </div>
    </div>

    ${exercises.map((ex, i) => {
      const prev = getPreviousLog(ex.name);
      const pb = getPersonalBest(ex.name);
      const prevText = prev
        ? `Last: ${prev.weight} lbs × ${prev.reps} reps × ${prev.sets} sets`
        : `Starting: ${ex.startWeight}`;
      const pbText = pb ? ` · PB: ${pb} lbs` : '';
      const exerciseNote = ex.note ? `<div class="exercise-target" style="color:var(--orange)">${ex.note}</div>` : '';

      return `
        <div class="exercise-card" data-exercise="${i}">
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-target">Target: ${phase.sets} sets × ${phase.reps} reps</div>
          ${exerciseNote}
          <div class="exercise-previous">${prevText}${pbText ? `<span class="pb">${pbText}</span>` : ''}</div>
          <div class="input-row">
            <div class="input-group">
              <label>Weight (lbs)</label>
              <input type="number" inputmode="decimal" id="weight-${i}" placeholder="${prev ? prev.weight : '—'}" step="0.5">
            </div>
            <div class="input-group">
              <label>Reps</label>
              <input type="number" inputmode="numeric" id="reps-${i}" placeholder="${prev ? prev.reps : '—'}">
            </div>
            <div class="input-group">
              <label>Sets</label>
              <input type="number" inputmode="numeric" id="sets-${i}" placeholder="${prev ? prev.sets : '—'}">
            </div>
          </div>
          <div class="input-group">
            <label>Notes</label>
            <textarea id="notes-${i}" placeholder="Optional"></textarea>
          </div>
        </div>
      `;
    }).join('')}

    <button class="complete-session-btn" id="btn-complete">Complete Session ✓</button>
  `;

  // Warmup toggle
  document.getElementById('warmup-toggle-btn').addEventListener('click', () => {
    const list = document.getElementById('warmup-list');
    const arrow = document.getElementById('warmup-arrow');
    list.classList.toggle('open');
    arrow.textContent = list.classList.contains('open') ? '▼' : '▶';
  });

  // Complete session
  document.getElementById('btn-complete').addEventListener('click', () => {
    const exerciseData = exercises.map((ex, i) => ({
      name: ex.name,
      weight: document.getElementById(`weight-${i}`).value || '',
      reps: document.getElementById(`reps-${i}`).value || '',
      sets: document.getElementById(`sets-${i}`).value || '',
      notes: document.getElementById(`notes-${i}`).value || '',
    }));

    // Check if at least one exercise has data
    const hasData = exerciseData.some(e => e.weight || e.reps || e.sets);
    if (!hasData) {
      if (!confirm('No exercises logged. Complete anyway?')) return;
    }

    const log = {
      date: new Date().toISOString(),
      sessionId: state.nextSession,
      sessionName: sess.name,
      exercises: exerciseData,
    };

    state.logs.push(log);
    state.completedSessions++;
    state.nextSession = state.nextSession === 3 ? 1 : state.nextSession + 1;
    saveState();
    navigate('dashboard');
  });
}

// Progress view state
let selectedExercise = null;

function renderProgress() {
  const el = document.getElementById('view-progress');
  const allNames = getAllExerciseNames();

  if (!selectedExercise) selectedExercise = allNames[0];

  const history = getExerciseHistory(selectedExercise, 20);
  const pb = getPersonalBest(selectedExercise);

  // Chart data (last 10, in chronological order)
  const chartData = history.slice(0, 10).reverse();
  const maxWeight = chartData.reduce((m, e) => Math.max(m, parseFloat(e.weight) || 0), 0) || 1;

  el.innerHTML = `
    <h1>Progress</h1>
    <p class="subtitle">Track your gains</p>

    <select class="exercise-select" id="exercise-select">
      ${allNames.map(n => `<option value="${n}" ${n === selectedExercise ? 'selected' : ''}>${n}</option>`).join('')}
    </select>

    ${pb ? `<div class="card" style="text-align:center;margin-bottom:16px">
      <div style="font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px">Personal Best</div>
      <div style="font-size:28px;font-weight:700;color:var(--orange)">${pb} lbs</div>
    </div>` : ''}

    ${chartData.length > 1 ? `
      <div class="progress-chart">
        <h3 style="margin-bottom:8px">Weight Over Time</h3>
        <div class="chart-bar-container">
          ${chartData.map(e => {
            const w = parseFloat(e.weight) || 0;
            const pct = (w / maxWeight) * 100;
            const d = new Date(e.date);
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            return `
              <div class="chart-bar-wrapper">
                <span class="chart-value">${w}</span>
                <div class="chart-bar" style="height:${Math.max(pct, 3)}%"></div>
                <span class="chart-label">${label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    ${history.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>No data yet for this exercise.<br>Complete a session to start tracking!</p>
      </div>
    ` : `
      <h2>History</h2>
      <ul class="progress-list">
        ${history.map(e => {
          const d = new Date(e.date);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const isPB = parseFloat(e.weight) === pb;
          return `
            <li class="progress-entry">
              <div>
                <div class="progress-date">${dateStr}</div>
                ${e.notes ? `<div class="progress-note">${e.notes}</div>` : ''}
              </div>
              <div style="text-align:right">
                <div class="progress-weight">${e.weight} lbs ${isPB ? '<span class="progress-pb">PB</span>' : ''}</div>
                <div class="progress-detail">${e.reps} reps × ${e.sets} sets</div>
              </div>
            </li>
          `;
        }).join('')}
      </ul>
    `}
  `;

  document.getElementById('exercise-select').addEventListener('change', (e) => {
    selectedExercise = e.target.value;
    renderProgress();
  });
}

function renderHistory() {
  const el = document.getElementById('view-history');

  if (state.logs.length === 0) {
    el.innerHTML = `
      <h1>History</h1>
      <p class="subtitle">Past sessions</p>
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <p>No sessions logged yet.<br>Complete your first workout to see it here!</p>
      </div>
    `;
    return;
  }

  // Group by month
  const grouped = {};
  [...state.logs].reverse().forEach(log => {
    const d = new Date(log.date);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  el.innerHTML = `
    <h1>History</h1>
    <p class="subtitle">Past sessions</p>

    ${Object.entries(grouped).map(([month, logs]) => `
      <div class="history-month-label">${month}</div>
      ${logs.map((log, idx) => {
        const d = new Date(log.date);
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const exerciseSummary = log.exercises
          .filter(e => e.weight)
          .map(e => `${e.name}: ${e.weight}lbs`)
          .slice(0, 3)
          .join(', ');
        return `
          <div class="history-entry" data-log-date="${log.date}">
            <div class="history-entry-header">
              <span class="history-entry-date">${dateStr}</span>
              <span class="history-entry-session">Session ${log.sessionId} — ${log.sessionName}</span>
            </div>
            <div class="history-entry-exercises">${exerciseSummary || 'No weights logged'}</div>
          </div>
        `;
      }).join('')}
    `).join('')}
  `;

  // Click to view detail
  el.querySelectorAll('.history-entry').forEach(entry => {
    entry.addEventListener('click', () => {
      const logDate = entry.dataset.logDate;
      const log = state.logs.find(l => l.date === logDate);
      if (log) showLogDetail(log);
    });
  });
}

function showLogDetail(log) {
  const d = new Date(log.date);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2 style="margin-bottom:2px">Session ${log.sessionId}</h2>
          <div style="font-size:13px;color:var(--text-dim)">${dateStr}</div>
        </div>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      ${log.exercises.map(ex => `
        <div class="modal-exercise">
          <div class="modal-exercise-name">${ex.name}</div>
          <div class="modal-exercise-data">
            ${ex.weight ? `${ex.weight} lbs × ${ex.reps} reps × ${ex.sets} sets` : 'Not logged'}
          </div>
          ${ex.notes ? `<div class="modal-exercise-note">${ex.notes}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'modal-close' || e.target.closest('#modal-close')) {
      overlay.remove();
    }
  });
}

// === Init ===

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Initial render
render();
