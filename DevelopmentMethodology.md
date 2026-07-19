# 3. Development Methodology

## 3.1 Methodology Selection

For this project, our team adopted an **Iterative Development** approach.
Rather than planning the entire system upfront and building it in one pass
(Waterfall), or delivering isolated feature slices with no revisiting
(Strict Incremental), our team worked in short cycles — each cycle producing
a working version of the system that was reviewed, tested, and refined in
the next cycle.

This approach was chosen because:

- Requirements evolved as the team learned more about what renters and
  owners actually needed during development.
- Frontend and backend development happened in parallel, requiring constant
  adjustment on both sides.
- Strict semester timelines demanded flexibility — the team needed to
  evaluate remaining work regularly and reprioritize or cut secondary
  features when necessary.

## 3.2 How It Was Applied

The project was divided into five sprints over nine weeks. Each sprint
followed the same iterative loop:

1. **Plan** — Identify the highest-priority features for the sprint.
2. **Build** — Implement backend APIs and frontend interfaces together.
3. **Review** — Test the integrated system, identify bugs and gaps.
4. **Refine** — Fix issues, update the backend based on frontend
   discoveries, and adjust scope for the next sprint.

This loop was not strictly sequential. During Sprint 3 (Frontend
Development), the team discovered that several backend endpoints needed
adjustment — additional fields, different response shapes, or new validation
rules. The backend was updated accordingly, and the frontend was rebuilt
against the corrected APIs. This back-and-forth refinement is the defining
characteristic of iterative development.

## 3.3 Sprint Summary

| Sprint | Duration | Focus | Key Activities |
|--------|----------|-------|----------------|
| Sprint 1 | Week 1-2 | Planning & Design | Requirement gathering, user stories, Use Case diagram, database schema design |
| Sprint 2 | Week 3-4 | Backend Foundation | Authentication (JWT & Google OAuth), database integration, REST API implementation, Activity diagram, Class diagram |
| Sprint 3 | Week 5-6 | Frontend Core | Home page, Browse page, Search & filtering, Room detail page, Google Maps integration, Sequence diagram |
| Sprint 4 | Week 7-8 | Features & Integration | Owner dashboard, Room management (CRUD), Viewing request system, Chat integration |
| Sprint 5 | Week 9 | Polish & Delivery | Admin dashboard, User moderation, Bug fixing, Documentation |

## 3.4 Iterative Refinement Examples

**Example 1 — Viewing Request System:**
Sprint 2 implemented the basic viewing request API (create, accept, reject).
During Sprint 4, frontend testing revealed that owners needed the ability
to suggest alternative times, and renters needed to confirm or decline
suggested times. The backend was updated with a `SUGGESTED` status and
`reschedule` endpoint, and the frontend was rebuilt to handle the new
negotiation flow.

**Example 2 — Room Listing API:**
Sprint 2 built the room CRUD endpoints. Sprint 3 revealed that the frontend
needed amenities, nearby universities, and image thumbnails included in
room responses. The backend queries were updated with eager-loading and
the new `amenitiesInclude`, `thumbnailInclude`, and `nearbyUniversities`
includes were added — changes that were not planned in Sprint 2.

**Example 3 — Admin Dashboard:**
Sprint 5 added the admin dashboard. During testing, the team discovered
that the admin needed to verify owner identities (`verifyOwner`), not
just ban/unban users. The backend route and frontend UI were extended
within the same sprint.

## 3.5 Why Not Waterfall?

Waterfall was considered but rejected for several reasons:

- The team did not have complete requirements at the start. Feature details
  (e.g., the exact viewing request negotiation flow) only became clear
  during frontend development.
- A linear front-then-back approach would have forced the team to guess API
  shapes before building the UI, leading to rework.
- The 9-week timeline was too short for a full Waterfall cycle with
  separate design, implementation, testing, and deployment phases.

## 3.6 Tools & Collaboration

| Category | Tool |
|----------|------|
| Version Control | Git / GitHub |
| Backend Runtime | Node.js + Express |
| Frontend Framework | React (Vite) |
| Database | MySQL (Sequelize ORM) |
| API Documentation | Swagger (OpenAPI) |
| Image Storage | Cloudinary |
| Map Services | Google Maps JavaScript API |
| Auth | JWT + Google OAuth 2.0 |
