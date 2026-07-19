# Development Methodology — Misleading Label Analysis

## What the Report Says

The report (p.9) states:

> "For this project, our team adopted an **Incremental Development** approach.
> Because requirements often evolve during the process, which allows us to
> remain flexible. We initially focused on finishing up the backend
> infrastructure. But during the frontend building phase, we adopted an
> **iterative loop regularly, back and forth updating the backend as the
> frontend became clearer**. Also, this Incremental approach allows us to
> manage strict timelines, like near the end of the month, our team evaluates
> the remaining workload and decides to cut out some secondary features."

---

## The Problem

The report labels the methodology as **Incremental Development**, but the
description contradicts this by describing **Iterative (Agile) Development**.
These are two different software process models and should not be conflated.

---

## Incremental vs Iterative — What's the Difference?

| Aspect | Incremental Development | Iterative Development |
|--------|------------------------|-----------------------|
| **Core idea** | Build the system in **slices (increments)**, each delivering a working subset of the final product | Build the system through **repeated cycles (iterations)**, each refining the same evolving product |
| **How it works** | Increment 1 = auth, Increment 2 = listings, Increment 3 = chat. Each is built **once, top to bottom**, then stacked. | Iteration 1 = rough auth + rough listings, Iteration 2 = polish auth + add chat, Iteration 3 = refine everything + add admin. |
| **Feedback loop** | Feedback comes **between increments** (after a feature is "done") | Feedback comes **within each iteration** (constant refinement) |
| **Typical label** | "Build feature by feature" | "Build a little, learn, rebuild, improve" |
| **Relationship** | Often combined with iterative — you can do both | Often combined with incremental — you can do both |

The team's own description — "back and forth updating the backend as the
frontend became clearer" — is the textbook definition of **iterative
refinement**, not incremental delivery.

---

## Evidence from the Report's Own Sprint Table

| Sprint | Duration | What Happened | Process Type |
|--------|----------|---------------|-------------|
| Sprint 1 | Week 2 | Planning, requirements, Use Case diagram, DB design | Planning (both) |
| Sprint 2 | Week 4 | Backend: auth, DB integration, REST API, activity diagram, class diagram | Incremental (new backend) |
| Sprint 3 | Week 6 | Frontend: home, browse, search, room detail, Google Maps | Incremental (new frontend) |
| Sprint 4 | Week 8 | Owner dashboard, viewing request, chat | **Iterative** — going back to refine viewing request, chat integration requires reworking backend |
| Sprint 5 | Week 9 | Admin dashboard, testing, bug fixing, documentation | **Iterative** — fixing bugs means revisiting previously "done" work |

Sprints 2-3 look incremental (new features added). But Sprints 4-5 clearly
show iterative behavior — revisiting, refining, and fixing earlier work.

---

## What the Gantt Chart Reveals

The Gantt chart (p.25-26) shows tasks overlapping across weeks with no clear
"slice" boundaries. For example, "Backend Development" runs Week 3-4 while
"Frontend Development" runs Week 5-6, and then "Owner Dashboard" and "Chat
Integration" span Week 7-8, which touches both frontend and backend
simultaneously.

This is **not** the pattern of incremental delivery (where each increment
would be a complete vertical slice). It is the pattern of iterative layering
— build backend first, then frontend on top, then refine both together.

---

## Why This Matters for the Report

1. **Academic correctness** — Software Engineering courses specifically test
   whether students can distinguish process models. Using the wrong term
   signals confusion about the methodology.

2. **Consistency** — If the report says "Incremental" but describes
   "Iterative", the reader questions whether other claims are also imprecise.

3. **The description is actually good** — The paragraph honestly describes
   what the team did. The only problem is the label. The fix is simple.

---

## Recommended Fix

### Option A: Change label to "Iterative Development"

> "For this project, our team adopted an **Iterative Development** approach.
> Because requirements often evolve during the process, which allows us to
> remain flexible. We initially focused on finishing up the backend
> infrastructure. But during the frontend building phase, we adopted an
> iterative loop regularly, back and forth updating the backend as the
> frontend became clearer. This iterative approach also allowed us to manage
> strict timelines — near the end of the month, our team evaluated the
> remaining workload and decided to cut out some secondary features."

### Option B: Use the combined term "Incremental-InIterative Development"

If the team truly did both (delivered features incrementally AND refined them
iteratively), the most accurate term is:

> "For this project, our team adopted an **Incremental-Iterative** approach.
> We delivered the system in increments (auth → listings → owner dashboard →
> admin), while iteratively refining each layer as frontend-backend
> integration revealed new requirements and bugs."

### Option C: Keep "Incremental" but fix the description

If the team prefers to keep "Incremental", the description must change to
match. For example:

> "We built the system incrementally, delivering one feature slice at a time:
> first authentication, then room listings, then the viewing system, and
> finally the admin dashboard. Each increment was completed before the next
> began."

---

## Verdict

The description in the report is **honest and accurate** about what the team
did. The only error is the **label**. Changing "Incremental" to "Iterative"
(or "Incremental-Iterative") would make the methodology section fully
consistent with the described practice.

| Element | Current State | Recommended Fix |
|---------|--------------|-----------------|
| Label | "Incremental Development" | "Iterative Development" or "Incremental-Iterative" |
| Description | Accurate (describes iterative process) | Keep as-is, minor wording cleanup |
| Sprint table | Accurate | Keep as-is |
| Gantt chart | Accurate but incomplete for Sprint 5 | Add Sprint 5 bars |
