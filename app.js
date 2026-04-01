// === Data ===

const WARMUP = [
  { name: 'Band Pull-Apart', hasWeight: false },
  { name: 'Wall Slides', hasWeight: false },
  { name: 'YTLIs', hasWeight: true },
  { name: 'Seated Face Pull', hasWeight: true },
  { name: 'KB Swing', hasWeight: true },
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
      { name: 'Overhead Cable Extension', startWeight: 'Light', note: 'Tricep triset exercise 1' },
      { name: 'Cable Extension', startWeight: 'Light', note: 'Tricep triset exercise 2' },
      { name: 'Cross Face Extension', startWeight: 'Light', note: 'Tricep triset exercise 3' },
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
      { name: 'Seated DB Curl', startWeight: '12–15 lbs' },
      { name: 'EZbar Rolling Extension', startWeight: 'Light' },
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
  startDate: load('startDate', '2026-03-31'),
  nextSession: load('nextSession', 1),
  logs: load('logs', []),
  completedSessions: load('completedSessions', 0),
};

if (!localStorage.getItem('startDate')) {
  save('startDate', state.startDate);
}

// Seed data for first two sessions
if (state.logs.length === 0) {
  state.logs = [
    {
      date: "2026-03-31T09:00:00.000Z",
      sessionId: 1,
      sessionName: "Pull + Hinge",
      exercises: [
        { name: "Pendlay Row", sets: [
          { weight: "55", reps: "12" },
          { weight: "55", reps: "12" },
          { weight: "55", reps: "12" },
          { weight: "55", reps: "12" }
        ], notes: "Effort 7/10. Last 2 sets working hard to get to 12 reps." },
        { name: "RDL", sets: [
          { weight: "64", reps: "12" },
          { weight: "74", reps: "12" },
          { weight: "74", reps: "12" },
          { weight: "74", reps: "10" }
        ], notes: "Grip strength weak by rep 8 at 74lb." },
        { name: "Reverse Deficit Lunge", sets: [
          { weight: "BW", reps: "15/15" },
          { weight: "BW", reps: "12/12" }
        ], notes: "Bodyweight." },
        { name: "Smith Machine Calf Raise", sets: [
          { weight: "BW", reps: "15" },
          { weight: "BW", reps: "15" },
          { weight: "BW", reps: "15" }
        ], notes: "Switched to seated calf raise machine." },
        { name: "Lat Pulldown", sets: [
          { weight: "40", reps: "" }
        ], notes: "" }
      ],
      warmup: [
        { name: "Band Pull-Apart", reps: "10", weight: "" },
        { name: "Wall Slides", reps: "8", weight: "" },
        { name: "YTLIs", reps: "8", weight: "2.5" },
        { name: "Seated Face Pull", reps: "", weight: "", notes: "skipped" },
        { name: "KB Swing", reps: "8", weight: "20" }
      ]
    },
    {
      date: "2026-04-01T09:00:00.000Z",
      sessionId: 2,
      sessionName: "Press",
      exercises: [
        { name: "Half Kneeling Landmine Press", sets: [], notes: "" },
        { name: "DB Z Press", sets: [], notes: "" },
        { name: "DB Floor Press", sets: [], notes: "" },
        { name: "Overhead Cable Extension", sets: [
          { weight: "5", reps: "9" },
          { weight: "5", reps: "12" }
        ], notes: "" },
        { name: "Cable Extension", sets: [
          { weight: "5", reps: "15" },
          { weight: "10", reps: "15" }
        ], notes: "" },
        { name: "Cross Face Extension", sets: [], notes: "Ran out of time" }
      ],
      warmup: []
    }
  ];
  state.nextSession = 3;
  state.completedSessions = 2;
  saveState();
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
    return {
      month: 1, week: weekNumber,
      label: `Month 1 — Week ${weekNumber}`,
      sets: '5–6', reps: '12–15',
      detail: '5–6 sets × 12–15 reps, NOT to failure, 60s rest',
    };
  } else if (weekNumber <= 11) {
    const m2week = weekNumber - 4;
    const subWeeks = [
      { label: 'Week 1A', sets: 3, reps: '10–12' },
      { label: 'Week 1B', sets: 4, reps: '10–12' },
      { label: 'Week 2A', sets: 5, reps: '10–12' },
      { label: 'Week 2B', sets: 6, reps: '10–12' },
      { label: 'Week 3A', sets: 7, reps: '10–12' },
      { label: 'Week 3B', sets: 8, reps: '10–12' },
      { label: 'Deload', sets: 3, reps: '10–12' },
    ];
    const subIdx = Math.min(m2week - 1, 6);
    const sub = subWeeks[subIdx];
    const isDeload = subIdx === 6;
    return {
      month: 2, week: m2week, subWeek: sub.label,
      label: `Month 2 — ${sub.label}${isDeload ? ' 🔄' : ''}`,
      sets: String(sub.sets), reps: sub.reps,
      detail: `${sub.sets} sets × ${sub.reps} reps${isDeload ? ' — DELOAD WEEK' : ''}, 60s rest`,
    };
  } else {
    const m3week = weekNumber - 8;
    return {
      month: 3, week: m3week,
      label: `Month 3 — Week ${m3week}`,
      sets: 'Varies', reps: 'Varies',
      detail: 'Trisets & finishers — see plan',
    };
  }
}

function isMonth1() { return getPhaseInfo().month === 1; }

function getSessionExercises(sessionId) {
  const session = SESSIONS.find(s => s.id === sessionId);
  if (!session) return [];
  return session.exercises.filter(e => !(e.month1Only && !isMonth1()));
}

// === Previous data lookup ===

function getPreviousLog(exerciseName) {
  for (let i = state.logs.length - 1; i >= 0; i--) {
    const ex = state.logs[i].exercises.find(e => e.name === exerciseName);
    if (ex && ex.sets && ex.sets.length > 0 && ex.sets.some(s => s.weight)) {
      return { ...ex, date: state.logs[i].date };
    }
  }
  return null;
}

function getPersonalBest(exerciseName) {
  let best = null;
  for (const log of state.logs) {
    const ex = log.exercises.find(e => e.name === exerciseName);
    if (ex && ex.sets) {
      for (const s of ex.sets) {
        const w = parseFloat(s.weight);
        if (!isNaN(w) && (best === null || w > best)) best = w;
      }
    }
  }
  return best;
}

function getExerciseHistory(exerciseName, limit = 10) {
  const results = [];
  for (let i = state.logs.length - 1; i >= 0 && results.length < limit; i--) {
    const ex = state.logs[i].exercises.find(e => e.name === exerciseName);
    if (ex && ex.sets && ex.sets.length > 0) {
      results.push({ ...ex, date: state.logs[i].date });
    }
  }
  return results;
}

function getAllExerciseNames() {
  const names = new Set();
  SESSIONS.forEach(s => s.exercises.forEach(e => names.add(e.name)));
  // Also add any names from logs that might not be in current sessions
  state.logs.forEach(l => l.exercises.forEach(e => names.add(e.name)));
  return [...names];
}

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

// Track active session set data
let activeSessionSets = {};

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
    <div class="next-session-card">
      <div class="session-number">Session ${nextSess.id}</div>
      <div class="session-title">${nextSess.name}</div>
      <div class="session-exercises-preview">
        ${exercises.map(e => e.name).join(' · ')}
      </div>
      <button class="start-btn" id="btn-start-session">Start Workout</button>
    </div>
  `;
  document.getElementById('btn-start-session').addEventListener('click', () => {
    activeSessionSets = {};
    navigate('session');
  });
}

function renderSession() {
  const el = document.getElementById('view-session');
  const phase = getPhaseInfo();
  const sess = SESSIONS.find(s => s.id === state.nextSession);
  const exercises = getSessionExercises(state.nextSession);

  // Initialize set data for each exercise if not already
  exercises.forEach((ex, i) => {
    if (!activeSessionSets[i]) {
      const prev = getPreviousLog(ex.name);
      if (prev && prev.sets && prev.sets.length > 0) {
        // Pre-populate with previous session's number of sets (empty values)
        activeSessionSets[i] = prev.sets.map(() => ({ weight: '', reps: '' }));
      } else {
        activeSessionSets[i] = [{ weight: '', reps: '' }];
      }
    }
  });

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
            <div class="warmup-name">
              <label class="warmup-check">
                <input type="checkbox" id="warmup-check-${i}">
                <span class="check-box">✓</span>
                ${w.name}
              </label>
            </div>
            ${w.hasWeight ? `
              <div class="warmup-inputs">
                <input type="number" inputmode="decimal" id="warmup-weight-${i}" placeholder="lbs" class="warmup-input">
                <span class="warmup-x">×</span>
                <input type="number" inputmode="numeric" id="warmup-reps-${i}" placeholder="reps" class="warmup-input">
              </div>
            ` : `
              <div class="warmup-inputs">
                <input type="number" inputmode="numeric" id="warmup-reps-${i}" placeholder="reps" class="warmup-input" style="max-width:80px">
              </div>
            `}
          </div>
        `).join('')}
      </div>
    </div>

    ${exercises.map((ex, i) => {
      const prev = getPreviousLog(ex.name);
      const pb = getPersonalBest(ex.name);
      let prevText = ex.startWeight ? `Starting: ${ex.startWeight}` : '';
      if (prev && prev.sets && prev.sets.length > 0) {
        const prevSummary = prev.sets.map(s => `${s.weight || '?'}×${s.reps || '?'}`).join(', ');
        prevText = `Last: ${prevSummary}`;
      }
      const pbText = pb ? `PB: ${pb} lbs` : '';
      const exerciseNote = ex.note ? `<div class="exercise-target" style="color:var(--orange)">${ex.note}</div>` : '';
      const sets = activeSessionSets[i] || [{ weight: '', reps: '' }];

      return `
        <div class="exercise-card" data-exercise="${i}">
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-target">Target: ${phase.sets} sets × ${phase.reps} reps</div>
          ${exerciseNote}
          <div class="exercise-previous">${prevText}${pbText ? `<span class="pb"> · ${pbText}</span>` : ''}</div>
          
          <div class="sets-header">
            <span class="sets-label">Set</span>
            <span class="sets-label">Weight (lbs)</span>
            <span class="sets-label">Reps</span>
            <span class="sets-label"></span>
          </div>
          <div class="sets-container" id="sets-container-${i}">
            ${sets.map((s, si) => `
              <div class="set-row" data-exercise="${i}" data-set="${si}">
                <span class="set-number">${si + 1}</span>
                <input type="number" inputmode="decimal" class="set-input set-weight" data-exercise="${i}" data-set="${si}" value="${s.weight}" placeholder="—" step="0.5">
                <input type="number" inputmode="numeric" class="set-input set-reps" data-exercise="${i}" data-set="${si}" value="${s.reps}" placeholder="—">
                <button class="set-remove" data-exercise="${i}" data-set="${si}" ${sets.length <= 1 ? 'style="visibility:hidden"' : ''}>✕</button>
              </div>
            `).join('')}
          </div>
          <button class="add-set-btn" data-exercise="${i}">+ Add Set</button>
          
          <div class="input-group" style="margin-top:8px">
            <label>Notes</label>
            <textarea id="notes-${i}" placeholder="Optional" class="exercise-notes"></textarea>
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

  // Add set buttons
  el.querySelectorAll('.add-set-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const exIdx = parseInt(btn.dataset.exercise);
      saveCurrentSets();
      activeSessionSets[exIdx].push({ weight: '', reps: '' });
      renderSession();
      // Scroll to the new set
      const container = document.getElementById(`sets-container-${exIdx}`);
      if (container) container.lastElementChild.querySelector('.set-weight').focus();
    });
  });

  // Remove set buttons
  el.querySelectorAll('.set-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const exIdx = parseInt(btn.dataset.exercise);
      const setIdx = parseInt(btn.dataset.set);
      saveCurrentSets();
      if (activeSessionSets[exIdx].length > 1) {
        activeSessionSets[exIdx].splice(setIdx, 1);
        renderSession();
      }
    });
  });

  // Save set data on input change
  el.querySelectorAll('.set-input').forEach(input => {
    input.addEventListener('change', saveCurrentSets);
    input.addEventListener('blur', saveCurrentSets);
  });

  // Complete session
  document.getElementById('btn-complete').addEventListener('click', () => {
    saveCurrentSets();
    
    const exerciseData = exercises.map((ex, i) => ({
      name: ex.name,
      sets: (activeSessionSets[i] || []).filter(s => s.weight || s.reps),
      notes: document.getElementById(`notes-${i}`).value || '',
    }));

    const hasData = exerciseData.some(e => e.sets.length > 0);
    if (!hasData) {
      if (!confirm('No exercises logged. Complete anyway?')) return;
    }

    // Collect warmup data
    const warmupData = WARMUP.map((w, i) => {
      const checked = document.getElementById(`warmup-check-${i}`).checked;
      const repsEl = document.getElementById(`warmup-reps-${i}`);
      const weightEl = document.getElementById(`warmup-weight-${i}`);
      return {
        name: w.name,
        done: checked,
        reps: repsEl ? repsEl.value : '',
        weight: weightEl ? weightEl.value : '',
      };
    });

    const log = {
      date: new Date().toISOString(),
      sessionId: state.nextSession,
      sessionName: sess.name,
      exercises: exerciseData,
      warmup: warmupData,
    };

    state.logs.push(log);
    state.completedSessions++;
    state.nextSession = state.nextSession === 3 ? 1 : state.nextSession + 1;
    activeSessionSets = {};
    saveState();
    navigate('dashboard');
  });
}

function saveCurrentSets() {
  document.querySelectorAll('.sets-container').forEach(container => {
    const exIdx = parseInt(container.id.split('-')[2]);
    const sets = [];
    container.querySelectorAll('.set-row').forEach(row => {
      const weightInput = row.querySelector('.set-weight');
      const repsInput = row.querySelector('.set-reps');
      sets.push({
        weight: weightInput ? weightInput.value : '',
        reps: repsInput ? repsInput.value : '',
      });
    });
    activeSessionSets[exIdx] = sets;
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

  // Chart data
  const chartData = [];
  history.slice(0, 10).reverse().forEach(h => {
    if (h.sets) {
      const maxW = h.sets.reduce((m, s) => Math.max(m, parseFloat(s.weight) || 0), 0);
      if (maxW > 0) chartData.push({ weight: maxW, date: h.date });
    }
  });
  const maxWeight = chartData.reduce((m, e) => Math.max(m, e.weight), 0) || 1;

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
            const pct = (e.weight / maxWeight) * 100;
            const d = new Date(e.date);
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            return `
              <div class="chart-bar-wrapper">
                <span class="chart-value">${e.weight}</span>
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
          const setsStr = e.sets ? e.sets.map(s => `${s.weight || '?'}lbs × ${s.reps || '?'}`).join(' | ') : 'No data';
          return `
            <li class="progress-entry">
              <div>
                <div class="progress-date">${dateStr}</div>
                ${e.notes ? `<div class="progress-note">${e.notes}</div>` : ''}
              </div>
              <div style="text-align:right">
                <div class="progress-sets-detail">${setsStr}</div>
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
      ${logs.map(log => {
        const d = new Date(log.date);
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const exerciseSummary = log.exercises
          .filter(e => e.sets && e.sets.length > 0 && e.sets.some(s => s.weight))
          .map(e => {
            const topWeight = e.sets.reduce((m, s) => Math.max(m, parseFloat(s.weight) || 0), 0);
            return `${e.name}: ${topWeight}lbs`;
          })
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
      ${log.warmup && log.warmup.length > 0 ? `
        <div style="margin-bottom:12px">
          <div style="font-size:13px;color:var(--text-dim);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Warm-up</div>
          ${log.warmup.map(w => `
            <div class="modal-exercise" style="padding:6px 0">
              <span>${w.name}</span>
              <span style="color:var(--text-dim);font-size:13px;float:right">
                ${w.notes === 'skipped' ? 'Skipped' : `${w.weight ? w.weight + 'lbs' : ''} ${w.reps ? '× ' + w.reps : ''}`}
              </span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${log.exercises.map(ex => `
        <div class="modal-exercise">
          <div class="modal-exercise-name">${ex.name}</div>
          ${ex.sets && ex.sets.length > 0 ? `
            <div class="modal-exercise-data">
              ${ex.sets.map((s, i) => `Set ${i+1}: ${s.weight || '?'} lbs × ${s.reps || '?'} reps`).join('<br>')}
            </div>
          ` : '<div class="modal-exercise-data">Not logged</div>'}
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
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
render();
