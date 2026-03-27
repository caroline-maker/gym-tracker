# Workout Tracker App — Brief for Scotty

## What we're building
A simple, clean web app for Caroline to track her gym workouts. Mobile-friendly (she'll use it on her phone at the gym).

## The Training Plan

### Weekly Schedule
- Mon: Swim (no tracking needed)
- Tue: Gym — Session 1
- Wed: Swim (no tracking needed)
- Thu: Gym — Session 2
- Fri: Gym — Session 3
- Sat/Sun: Walk (no tracking needed)

Sessions rotate continuously: 1→2→3→1→2→3 (regardless of day — if she misses a session, she picks up where she left off)

---

### SESSION 1 — Pull + Hinge

**Warm-up (every session):**
- Band Pull-Apart
- Wall Slides
- Seated Face Pull
- YTLIs
- KB Swing

**Main work:**
- Pendlay Row — starting weight: 55 lbs
- RDL — starting weight: 75 lbs
- Reverse Deficit Lunge — starting weight: Bodyweight
- Smith Machine Calf Raise — starting weight: BW
- Lat Pulldown (Month 1 only) — starting weight: 40 lbs

---

### SESSION 2 — Press

**Warm-up:** (same as above)

**Main work:**
- Half Kneeling Landmine Press — starting weight: bar only
- DB Z Press — starting weight: 10–12 lbs each
- DB Floor Press (high rep finisher: 20–25 reps) — starting weight: 10–12 lbs each
- Tricep Triset: EZbar Extensions → Overhead Cable Extension → Cross Face Extension — starting weight: light

---

### SESSION 3 — Deadlift + Legs + Arms

**Warm-up:** (same as above)

**Main work:**
- Conventional Deadlift — starting weight: 85 lbs
- Box Squat / Split Squat — starting weight: BW or 10 lbs each
- Cable Pull-Through — starting weight: light
- Leg Extensions (3 × 25) — starting weight: 45–55 lbs
- Seated DB Curl + EZbar Rolling Extension superset — starting weight: 12–15 lbs
- Overhead Cable Extension — starting weight: light

---

### Volume Progression (Month 1 → Month 2)

**Month 1:** 5–6 sets × 12–15 reps, NOT to failure, 60 sec rest
**Month 2:** Adds one set per week:
- Week 1A: 3 sets × 10–12
- Week 1B: 4 sets × 10–12
- Week 2A: 5 sets × 10–12
- Week 2B: 6 sets × 10–12
- Week 3A: 7 sets × 10–12
- Week 3B: 8 sets × 10–12
- Week 4: DELOAD

**Month 3:** Changes structure significantly (trisets, finishers — see plan for full details)

---

## App Requirements

### Core Features

1. **Dashboard / Home screen**
   - Shows today's session (or next upcoming session)
   - Weekly schedule at a glance (Mon–Sun with swim/gym/walk icons)
   - Current week number + phase (e.g. "Month 2 — Week 3A — 7 sets")
   - Streak / sessions completed this week

2. **Session view**
   - Shows the current session (1, 2, or 3) with all exercises
   - For each exercise, shows:
     - Exercise name
     - Target sets × reps (auto-calculated based on current week/phase)
     - Previous weight used (from last time this exercise was done)
     - Input fields to log: weight (lbs), reps, sets completed
   - "Complete session" button that marks it done and advances to next session

3. **Exercise logging**
   - Log weight, reps, sets for each exercise per session
   - Notes field per exercise (optional)
   - Simple, fast input — she's logging between sets at the gym

4. **Progress tracking**
   - Per exercise: chart/list of weight over time
   - Ability to see last 5 sessions for any exercise
   - Personal bests highlighted

5. **Session history**
   - Calendar view of completed sessions
   - Tap to see full log of any past session

### Design Requirements
- **Mobile-first** — she'll use this on her phone at the gym
- Clean, minimal UI — no clutter
- Dark mode preferred (easier on the eyes in a gym)
- Large tap targets for logging weights between sets
- Fast — should load instantly, work offline if possible

### Tech Stack
- Keep it simple: a single HTML/CSS/JS app is fine, or React if preferred
- Local storage for data persistence (no backend needed for now)
- Could also be a PWA so it can be installed on her phone

### Nice to haves (not required for v1)
- Ability to edit/delete past logs
- Export data
- Nutrition tracker (daily protein target: 96–120g)

---

## Deliverable
A working web app in this directory (/Users/seven/.openclaw/workspace/health/tracker).
Single file or small set of files — keep it simple.
When done, run: openclaw system event --text "Done: Workout tracker app built and ready for review in /Users/seven/.openclaw/workspace/health/tracker" --mode now
