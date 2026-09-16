# GESF Operations Platform — Role & Permission Matrix
**Document Code:** GESF-SD-BE-01 | **Milestone:** Day 3 Delivery
**Classification:** Internal Operational Security Architecture

---

## 1. Architectural Principle: Security Role vs. Job Title Decoupling
Per Section 5 of **GESF-SD-BE-01**, security authorization logic strictly evaluates normalized authorization roles (`MANAGER`, `TEAM_LEADER`, `AGENT`) rather than dynamic job title strings.

* **Authorization Role:** Controls systemic access boundaries, API route authorization, and data filtering scopes.
* **Job Title:** Display-only organizational designation (e.g. *Technical Lead*, *Systems Specialist*, *Field Supervisor*, *Dispatch Specialist*).

---

## 2. Three-Tier Role Authorization Matrix

| Operational Capability / Endpoint | Manager (`MANAGER`) | Team Leader (`TEAM_LEADER`) | Agent (`AGENT`) | Server-Side Enforcement Rule |
| :--- | :---: | :---: | :---: | :--- |
| **Authentication & Profile (`/api/auth/me`)** | Full Access | Full Access | Full Access | `authenticateToken` |
| **View Directory (`/api/users`)** | Org-Wide (All Teams) | Own Team Only | Permitted Directory | Role-filtered query (`where: { teamId }`) |
| **View Squad Roster (`/api/teams`)** | All Teams | Assigned Team Only | Assigned Team Only | Team boundary guard (`requireTeamAccess`) |
| **Cross-Team Access (`/api/teams/:id`)** | Allowed | **DENIED (HTTP 403)** | **DENIED (HTTP 403)** | Blocked with `CROSS_TEAM_ACCESS_DENIED` |
| **Create Operational Task (`POST /api/tasks`)** | Allowed (Any Team) | Allowed (Own Team) | Denied | `requireRole(['MANAGER', 'TEAM_LEADER'])` |
| **Reassign Task (`PATCH /tasks/:id/assignee`)** | Allowed (Any Agent) | Allowed (**Within Own Team Only**) | Denied | Reassignment boundary validation |
| **Update Task Progress (`PATCH /tasks/:id/progress`)** | Allowed | Allowed (Own Team) | **Assignee Only** | Progress ownership check (`assigneeId === user.id`) |
| **Close Task / Final Sign-off (`POST /tasks/:id/close`)** | **Manager Only** | Denied | Denied | Strictly enforced by `requireRole(['MANAGER'])` |
| **Clock-In / Clock-Out (`/api/attendance`)** | Personal Session | Personal Session | Personal Session | Verified duty session tracking |
| **Team Attendance Audit (`/api/attendance/team`)** | Org-Wide | Own Team Only | Denied | Role-filtered attendance query |
| **Submit Leave Request (`POST /api/leaves`)** | Allowed | Allowed | Allowed | Linked to authenticated user ID |
| **Approve / Reject Leave (`PATCH /leaves/:id/...`)** | **Manager Only** | Denied | Denied | Strictly enforced by `requireRole(['MANAGER'])` |
| **Aggregate Dashboard (`/api/dashboard/summary`)** | Organization-Wide | Team-Aggregated | Personal Metrics | Dynamic SQL aggregation by scope |

---

## 3. Boundary & Error Handling Specifications

### A. Authentication Failures
* Missing token on protected routes: `401 Unauthorized` with error code `UNAUTHORIZED`.
* Invalid or expired token: `403 Forbidden` with error code `INVALID_TOKEN`.
* Incorrect password credentials: `401 Unauthorized` with error code `INVALID_CREDENTIALS`.

### B. Role & Boundary Violations
* Unauthorized role attempting restricted operation: `403 Forbidden` with error code `FORBIDDEN`.
* Team Leader attempting cross-team inspection or task manipulation: `403 Forbidden` with error code `CROSS_TEAM_ACCESS_DENIED`.

### C. Cryptographic & Credential Sanitization
* All passwords hashed using `bcrypt` with 10 salt rounds.
* Under no circumstances is the `password` hash field returned in any API response payload (`sanitizeUser` filter applied to all user models).
