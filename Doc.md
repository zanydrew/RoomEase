# SEG1_T8 Report Analysis — RoomEase

Comparison of the submitted PDF report (`SEG1_T8.pdf`) against the course
requirements (ReportRequment.png / reportRequment2.png) and the actual
codebase.

---

## 1. Required Structure vs Actual Report

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | **Cover Page** — Project Title, Group & Team Number, Team Members, Course, Submission Date | **Pass** | All five fields present (p.1). |
| 2 | **Table of Contents** | **Pass** | Present (p.2). |
| 3 | **Introduction** — Project Background | **Pass** | Well written (p.3). |
| 4 | **Introduction** — Objectives | **Pass** | 7 specific objectives listed (p.3). |
| 5 | **Introduction** — Scope | **Pass** | Includes core features table, user roles, system boundaries, database type, data entities (p.4-7). |
| 6 | **Requirements** — Functional Requirements | **Pass** | Covers Auth, Owner Dashboard, Admin Dashboard, Communicating & Booking (p.7-8). |
| 7 | **Requirements** — Non-functional Requirements | **Pass** | Security, Performance, UX (p.8). |
| 8 | **Development Methodology** — Scrum or Waterfall + Brief explanation | **Pass** | States "Incremental Development" with explanation (p.9). |
| 9 | **User Stories** — List of user stories | **Pass** | 4 Renter + 3 Owner + 2 Admin stories (p.9-10). |
| 10 | **User Stories** — Team responsibilities | **Pass** | Per-member table present (p.10-11). |
| 11 | **UML Diagrams** — Use Case Diagram + Description | **Pass** | Diagram + detailed description (p.11-13). |
| 12 | **UML Diagrams** — Activity Diagram + Description | **Pass** | Two diagrams: Post Room + Viewing Request (p.13-17). |
| 13 | **UML Diagrams** — Class Diagram + Description | **Pass** | Diagram + full description (p.17-20). |
| 14 | **UML Diagrams** — Sequence Diagram + Description | **Pass** | Authentication sequence diagram (p.20-24). |
| 15 | **Development Planning** — Timeline / Sprint Plan / Gantt Chart | **Pass** | Sprint table (5 sprints) + Gantt chart (p.24-26). |
| 16 | **Conclusion** | **Pass** | Present (p.26-27). |
| 17 | **References** (if applicable) | **Missing** | No references section. |

**Structure verdict: 16/17 requirements met. Only References is missing (low priority since it says "if applicable").**

---

## 2. Report vs Actual Codebase — Feature Accuracy

### Features that match (reported correctly)

| Feature | Report Says | Actual Code | Verdict |
|---------|-------------|-------------|---------|
| JWT Authentication | Described in scope + sequence diagram | Fully implemented | **Accurate** |
| Google OAuth/SSO | Listed as core feature | Fully implemented (`auth.service.js`, `GoogleSignInButton.jsx`) | **Accurate** |
| Role-based access (Renter/Owner/Admin) | Described in scope + user roles | Implemented via `requireRole()` middleware | **Accurate** |
| Browsing & Filtering | Described with price, district, room type, amenities, university filters | All filters exist in `room.service.js` | **Accurate** |
| Google Maps Integration | Listed as core feature | Implemented in `MapPreview.jsx` | **Accurate** |
| Book Viewing Appointment | Described with PENDING/APPROVED/REJECTED/SUGGESTED flow | Full flow in `viewing.service.js` | **Accurate** |
| Chat System | Described as non-realtime, requires page refresh | Accurately described limitation | **Accurate** |
| Save/Favorite Rooms | Listed as core feature | Fully implemented (model, routes, frontend) | **Accurate** |
| Owner Dashboard | Post rooms, edit, delete, toggle status | All implemented | **Accurate** |
| Admin Dashboard | Statistics, ban/unban, delete users, filter by role | All implemented | **Accurate** |
| Cloudinary image storage | Mentioned in Owner Dashboard scope | Config + upload/delete utils exist | **Accurate** |
| MySQL database | Described in system boundaries | Confirmed in backend config | **Accurate** |
| Room Amenities | Listed in data entities | Many-to-many model, frontend component | **Accurate** |
| Nearby University | Listed in data entities | Join model with distance/walk time | **Accurate** |
| Mark as Rented toggle | Listed in functional requirements | `PATCH /owner/rooms/:roomId/status` exists | **Accurate** |

### Features with issues or inaccuracies

#### A. Reviews & Ratings — Reported as implemented, but NOT functional

**Report claims (p.8):** "Reviews & Ratings: Renter reviews with a 5-star rating system."

**Actual state:** The `Review` model exists in `backend/src/models/Review.js` with rating validation (1-5), and associations are defined. However:
- No review routes exist
- No review controller exists
- No review service exists
- No frontend UI for submitting reviews
- The `StarRating.jsx` component itself notes: "There's currently no review API"
- `RoomDetail.jsx` renders `{room.reviews_count}` but this data is never computed

**Verdict: The report lists this as an implemented functional requirement, but it is only a database schema stub with zero functionality.**

#### B. Owner Report Page — Exists but NOT wired into the router

**Report claims:** Owner Dashboard includes reporting/statistics.

**Actual state:** `Report.jsx` exists and computes stats, BUT:
- The import in `AppRouter.jsx` is **commented out**
- The route `/dashboard/owner/reports` renders `<PagePlaceholder>` instead
- The backend has a proper `/api/owner/statistics` endpoint but the page uses `getMyRooms({ limit: 9999 })` and counts client-side

**Verdict: The feature exists in code but is not accessible to users.**

#### C. Class Diagram — ViewingStatus enum says "ACCEPTED" but code uses "APPROVED"

**Report states (p.19):** `ViewingStatus (enumeration): PENDING, ACCEPTED, REJECTED, SUGGESTED`

**Actual code:** The enum is `PENDING, APPROVED, REJECTED, SUGGESTED` — the status is "APPROVED", not "ACCEPTED".

**Verdict: Minor naming inconsistency between diagram and implementation.**

#### D. Class Diagram — RoomStatus missing "APPROVED"

**Report states (p.19):** `RoomStatus (enumeration): PENDING, AVAILABLE, RENTED`

**Actual code:** Rooms also have an `approval_status` field with values `PENDING, APPROVED, REJECTED` (separate from `status: AVAILABLE/RENTED`). The class diagram only shows the `status` field and omits `approval_status`.

**Verdict: Incomplete class diagram — misses the admin approval workflow field.**

#### E. User Story — Admin "Verify Owner" mentioned but not in user stories list

**Report user stories (p.10):** Admin stories only mention ban/unban and verify owner identification.

**Actual code:** The admin can verify owners (`PUT /api/admin/users/:id/verify`), but the report's Admin User Story only says "ban or unban users." The verify story is mentioned but as a separate point about reviewing identification.

**Verdict: Minor gap — the verify feature is described in the user story section but could be more explicit.**

---

## 3. Missing or Weak Areas

### 3.1 No References Section
The requirement template lists "References (if applicable)". The report uses concepts like JWT, OAuth, Cloudinary, MySQL, and Google Maps but provides no references or bibliography.

### 3.2 Development Methodology — Misleading label
The report says "Incremental Development" but describes what is essentially **Iterative/Agile** development (sprints, backlog refinement, cutting features). The term "Incremental" typically means building distinct chunks sequentially, while the description mentions going "back and forth updating the backend as the frontend became clearer." Consider using "Iterative Development" or "Agile (Scrum-like)" instead.

### 3.3 Non-functional Requirements — Too thin
Only 3 items listed (bcrypt, JWT, Cloudinary, pagination, loading spinners). Missing:
- Error handling strategy (toast notifications, error boundaries)
- Responsive design / mobile support
- Input validation (react-hook-form, backend validation)
- API response format consistency

### 3.4 Sequence Diagram — Only Authentication
Only one sequence diagram is provided (Authentication). The requirement asks for "Sequence Diagram + Description" (singular or plural unclear), but a project of this complexity would benefit from diagrams for at least:
- Viewing Request flow
- Chat messaging flow
- Room listing creation

### 3.5 Gantt Chart — Missing admin/testing sprints
The Gantt chart (p.25-26) ends at Week 8 tasks (Chat Integration). Sprint 5 (Admin Dashboard, testing, documentation) has no corresponding Gantt bars.

### 3.6 Sprint 5 deliverables not represented in Gantt
The sprint table lists Sprint 5 (Week 9) with "Admin dashboard, user moderation, sequence diagram testing, bug fixing, documentation" but the Gantt chart does not show bars for these tasks.

### 3.7 System Boundaries — Honest but could be stronger
The report honestly describes Google Maps limitations and lack of real-time messaging. This is good transparency. However, it could also mention:
- Reviews not being implemented
- The owner report page not being wired up
- The `renter_note` field being lost in the viewing request flow

---

## 4. Summary Scorecard

| Criteria | Score | Notes |
|----------|-------|-------|
| Structure completeness | **16/17** | Only References missing |
| Cover page & formatting | **Pass** | Professional layout, proper page numbers |
| Introduction quality | **Strong** | Background, objectives, scope all well covered |
| Requirements coverage | **Good** | Functional + non-functional listed, but NFR too thin |
| Methodology | **Acceptable** | Label is debatable, but explanation is clear |
| User stories | **Good** | Cover all 3 roles, INVEST format used |
| UML diagrams | **Good** | 4 diagrams with descriptions, but only 1 sequence diagram |
| Development planning | **Good** | Sprint table + Gantt chart, but Gantt incomplete for Sprint 5 |
| Conclusion | **Acceptable** | Summarizes project, mentions exclusions |
| Feature accuracy vs codebase | **Mostly accurate** | 1 major inaccuracy (Reviews), 1 minor (ViewingStatus naming) |
| References | **Missing** | Should cite technologies used |

---

## 5. Action Items to Fix

1. **Reviews & Ratings** — Either implement the review system before submission OR remove it from the functional requirements list in the report. Currently listed as implemented but has zero functionality.
2. **Owner Report page** — Uncomment the import in `AppRouter.jsx` and wire up the route, or remove the claim from the report.
3. **Add References** — Add a references section citing JWT, Google OAuth, Cloudinary, React, Sequelize, MySQL.
4. **Gantt Chart** — Add bars for Sprint 5 tasks (Admin Dashboard, testing, documentation).
5. **Class Diagram** — Fix "ACCEPTED" to "APPROVED" in ViewingStatus enum. Add `approval_status` field to Room.
6. **Consider adding** a second sequence diagram (e.g., Viewing Request flow) for completeness.
