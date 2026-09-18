# God's Eye Security Force (GESF) — Operations Dashboard

An enterprise-grade internal operations command center and personnel management platform designed for security force operations, multi-division task dispatching, shift attendance monitoring, leave approvals, real-time in-app notifications, and role-governed access control.

Built as a full-stack architecture combining a high-performance Vanilla JavaScript frontend, an Express REST API backend, a PostgreSQL relational database with Prisma ORM, and secure Gmail SMTP two-factor password recovery.

---

## System Architecture

The platform follows a decoupled, service-oriented client-server architecture:

```
+---------------------------------------------------------------+
|              FRONTEND (Browser Client / Port 5500)            |
|  - Vanilla ES6+ Modules (SPA Architecture)                    |
|  - Custom Design System (CSS Custom Properties, Glassmorphism)|
|  - API Client Adapter (js/services/api.js)                    |
|  - Reactive Store with Offline Resilience (js/services/store.js)
+-------------------------------+-------------------------------+
                                | JSON / REST (Bearer JWT)
                                v
+---------------------------------------------------------------+
|               BACKEND API (Node.js Express / Port 5000)       |
|  - Express REST API with Modular Route Controllers            |
|  - JWT Authentication & 3-Tier RBAC Middleware                |
|  - Team Boundary & Lifecycle Transition Guards                |
|  - Nodemailer SMTP Service for 2FA Password Recovery          |
+-------------------------------+-------------------------------+
                                | Prisma ORM
                                v
+---------------------------------------------------------------+
|               DATABASE (PostgreSQL 18 / Port 5432)            |
|  - Normalized Relational Schema (gesf_operations)             |
|  - Roles, Departments, Teams, Users, Tasks, Task Activity     |
|  - Attendance Records, Breaks, Leave Requests, Notifications  |
+---------------------------------------------------------------+
```

---

## Repository Directory Structure

```text
Operations-Dashboard/
├── backend/                               # Node.js + Express REST API
│   ├── prisma/
│   │   ├── migrations/                    # SQL migration history
│   │   │   └── 20260917000000_init/
│   │   │       └── migration.sql
│   │   ├── migration_lock.toml
│   │   ├── schema.prisma                  # Prisma ORM relational schema
│   │   └── seed.js                        # Database seeder (9 users, 2 teams, 13 tasks)
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js                    # JWT verification & RBAC authorization
│   │   ├── routes/
│   │   │   ├── attendance.js              # Clock in/out, meal breaks & roster
│   │   │   ├── auth.js                    # Login, JWT, session & OTP recovery
│   │   │   ├── dashboard.js               # KPI metrics aggregation
│   │   │   ├── leaves.js                  # Leave requests & approval workflows
│   │   │   ├── notifications.js           # Notification feed & read receipts
│   │   │   ├── tasks.js                   # Task lifecycle, progress, comments
│   │   │   ├── teams.js                   # Team hierarchy & member queries
│   │   │   └── users.js                   # User directory & profile lookups
│   │   ├── services/
│   │   │   └── mailer.js                  # Nodemailer Gmail SMTP integration
│   │   ├── db.js                          # PrismaClient singleton instance
│   │   └── server.js                      # Express app setup, CORS, route mounting
│   ├── tests/
│   │   ├── day3_auth_rbac.test.js         # Automated auth & RBAC permission suite
│   │   ├── day4_tasks_dashboard.test.js   # Automated task lifecycle & KPI suite
│   │   └── day5_operations.test.js        # Automated attendance, leaves & reassignment suite
│   ├── .env.example                       # Environment variables template
│   ├── .gitignore                         # Backend git ignore rules (node_modules, .env)
│   ├── package.json                       # Backend dependencies & script definitions
│   ├── package-lock.json
│   └── verify_roundtrip.js                # Full-stack API roundtrip verification script
├── css/                                   # Frontend styling architecture
│   ├── components.css                     # Buttons, badges, cards, inputs, modals, toasts
│   ├── design-tokens.css                  # Color palette, spacing, typography, radii
│   ├── layout.css                         # App shell, sidebar navigation, top bar, grid
│   └── views.css                          # View-specific rules (tasks, shifts, profile)
├── docs/                                  # Engineering documentation & testing artifacts
│   ├── DAILY_PROGRESS_REPORTS.md          # Day 1 to Day 7 comprehensive progress reports
│   ├── ER_DIAGRAM.md                      # Database entity-relationship specifications
│   ├── GESF_Operations_Dashboard_Testing_Record.docx # Formal Word test record artifact
│   ├── RESEARCH_AND_DESIGN.md             # UI/UX design rationale & visual specifications
│   ├── ROLE_PERMISSION_MATRIX.md          # 3-tier RBAC permission definitions
│   └── TESTING_RECORD.md                  # Test catalog, test cases & execution logs
├── js/                                    # Frontend application logic (ES Modules)
│   ├── components/
│   │   ├── modal.js                       # Reusable modal component
│   │   ├── navigation.js                  # View router & navigation state
│   │   └── toast.js                       # Real-time toast feedback banners
│   ├── data/                              # Seed datasets & fallback structures
│   │   ├── mock-activity.js
│   │   ├── mock-attendance.js
│   │   ├── mock-auth.js
│   │   ├── mock-notifications.js
│   │   └── mock-tasks.js
│   ├── services/
│   │   ├── api.js                         # Centralized REST API client adapter
│   │   └── store.js                       # Reactive state store with API synchronization
│   ├── views/
│   │   ├── attendance-view.js             # Live shift clock, breaks & team roster
│   │   ├── auth-view.js                   # Sign-in & in-page 3-step OTP recovery
│   │   ├── dashboard-view.js              # Command overview, KPI summary & quick actions
│   │   ├── notifications-view.js          # In-app notification center
│   │   ├── profile-view.js                # Personnel profile & password management
│   │   ├── settings-view.js               # Theme customization (4 themes) & system controls
│   │   ├── task-detail-view.js            # Task inspector, progress lock & audit log
│   │   └── tasks-view.js                  # 13-task workload catalog & multi-filters
│   └── app.js                             # Root application boot & lifecycle coordinator
├── .gitignore                             # Global git ignore configuration
├── index.html                             # Main HTML5 entry point & app mount
└── README.md                              # Project overview & evaluator guide
```

---

## Organizational Hierarchy & Personnel Directory

The application models an executive hierarchy with Sarah Chen as the Operations Manager supervising two distinct squads:

```text
Sarah Chen (Operations Manager / Super Admin)
+-- Team Alpha: Tactical Response (Team A)
|   +-- Alex Rivera (Team Leader / Technical Lead)
|   +-- Marcus Vance (Field Agent / Operations Specialist)
|   +-- Chloe Bennett (Field Agent / Systems & DevOps)
|   +-- Liam Harper (Field Agent / Support Specialist)
+-- Team Bravo: Perimeter Surveillance (Team B)
    +-- David Kim (Team Leader / Field Supervisor)
    +-- Elena Rostova (Field Agent / Field Operations)
    +-- Maya Lin (Field Agent / Logistics Coordinator)
    +-- Noah Miller (Field Agent / Emergency Dispatch)
```

### Credentials Reference

| Personnel | Title | Role Code | Team | Authority | Email | Default Password |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sarah Chen** | Operations Manager | `MANAGER` | All Teams | Organization Oversight | `sarah@company.com` | `Password123!` |
| **Alex Rivera** | Technical Lead | `TEAM_LEADER` | Team Alpha | Team Leader (Alpha) | `alex@company.com` | `Password123!` |
| **Marcus Vance** | Operations Specialist | `AGENT` | Team Alpha | Field Personnel | `marcus@company.com` | `Password123!` |
| **Chloe Bennett** | Systems & DevOps | `AGENT` | Team Alpha | Field Personnel | `chloe@company.com` | `Password123!` |
| **Liam Harper** | Support Specialist | `AGENT` | Team Alpha | Field Personnel | `liam@company.com` | `Password123!` |
| **David Kim** | Field Supervisor | `TEAM_LEADER` | Team Bravo | Team Leader (Bravo) | `david@company.com` | `Password123!` |
| **Elena Rostova** | Field Operations | `AGENT` | Team Bravo | Field Personnel | `elena@company.com` | `Password123!` |
| **Maya Lin** | Logistics Coordinator | `AGENT` | Team Bravo | Field Personnel | `maya@company.com` | `Password123!` |
| **Noah Miller** | Emergency Dispatch | `AGENT` | Team Bravo | Field Personnel | `noah@company.com` | `Password123!` |

*(Note: The login view includes a 1-click **Demo Accounts** accordion allowing evaluators to switch between personas instantly.)*

---

## Core Implemented Features

### 1. Authentication & 3-Tier Role-Based Access Control (RBAC)
* **JWT Authentication**: Passwords securely hashed with `bcryptjs` (10 rounds); sessions protected via signed JSON Web Tokens.
* **3-Tier Permission Hierarchy**:
  * **Manager (`MANAGER`)**: Full cross-team visibility, organization-wide task force-close, cross-team task reassignments, and leave approvals.
  * **Team Leader (`TEAM_LEADER`)**: Team-scoped task management, intra-team task reassignment for `OPEN` tasks, and team shift monitoring.
  * **Agent (`AGENT`)**: Personal task execution, assignee-only progress adjustment, personal shift clocking, and leave submission.
* **Team Boundaries**: Team Leaders and Agents are scoped to their assigned division. Cross-team reassignments by non-managers are strictly blocked (`403 Forbidden`).

### 2. Password Recovery via Real Gmail SMTP OTP
* **Dedicated 3-Step In-Page Flow**:
  1. **Step 1 (Request)**: Employee submits registered email.
  2. **Step 2 (Fill Security OTP)**: A random 6-digit OTP (10-minute expiry) is generated and dispatched via **Nodemailer** using **Gmail SMTP SSL (Port 465)**.
  3. **Step 3 (Set Password)**: After matching the code, the session is authorized to set a new password, which is hashed and updated in PostgreSQL.
* **Strict Two-Factor Security (Zero On-Screen Exposure)**: The verification code is **never** displayed on screen or returned in client API responses. The input field is initialized empty (`• • • • • •`) and requires manual typing from the user's Gmail message.

### 3. Task Management & Workload Catalog
* **13 Seed Tasks**: Full lifecycle tracking across `PENDING`, `IN_PROGRESS`, `UNDER_REVIEW`, and `COMPLETED`.
* **Multi-Filter Controls**: Filter by Status, Priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), Team, or search keyword.
* **Assignee-Only Progress Lock**: Only the assigned employee can adjust the progress slider (0%–100%) or quick presets. Non-assignees see a locked indicator (`🔒 Progress is locked`).
* **Controlled Reassignment Rule**: Team Leaders can reassign `OPEN` tasks within their own squad, but cannot reassign tasks already `IN_PROGRESS` or `UNDER_REVIEW`.
* **Discussion & Activity Timeline**: Real-time comments with audit trail logging in PostgreSQL.

### 4. Shift Attendance & Real-Time Tracking
* **One-Click Shift Clocking**: Live digital clock with instantaneous **Clock In** and **Clock Out** tracking.
* **Break Management**: Dedicated **Start Break** and **End Break** toggles with accumulated duration calculation.
* **Team Roster (Supervisors)**: Real-time table displaying current shift states (Active, On Break, Offline) for squad members.

### 5. Leave Request & Supervisory Approval Workflows
* **Leave Application**: Agents submit leave requests specifying type (Annual, Sick, Emergency), date ranges, and justification.
* **Manager & Leader Approval Queue**: Pending leaves appear in a supervisory queue with one-click **Approve** and **Reject** actions and custom review remarks.
* **In-App Alerts**: Automated notifications are dispatched to applicants upon decision.

### 6. Notifications & UI Personalization
* **Real-Time Notification Feed**: Shows alerts for task assignments, leave decisions, and shift updates with unread count badges.
* **Theme Switching**: 4 high-contrast themes (Dark Slate, Midnight Blue, Crisp Light, OLED Pitch Black).

---

## Setup & Installation Instructions

### Prerequisites
* **Node.js**: v18.x or v20.x+ (Tested on Node v22)
* **PostgreSQL**: v14+ (Tested on PostgreSQL 18)
* **npm**: v9+

---

### Step 1: Database Setup
1. Ensure your PostgreSQL service is running on port `5432`.
2. Create the target database:
   ```sql
   CREATE DATABASE gesf_operations;
   ```

---

### Step 2: Backend Configuration
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@localhost:5432/gesf_operations?schema=public"
   JWT_SECRET="your_secure_jwt_secret_key_here"
   NODE_ENV="development"
   FRONTEND_ORIGIN="http://localhost:5500"

   # Optional: Real Gmail SMTP Configuration for Password Recovery OTP
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER="your_email@gmail.com"
   SMTP_PASS="your_16_digit_google_app_password"
   ```
   *(Note: If SMTP credentials are left as default or omitted, the server logs generated OTPs to the console for testing.)*

5. Run database migrations and seed baseline data:
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

6. Start the backend API server:
   ```bash
   npm start
   ```
   *Backend will listen on: `http://localhost:5000`*
   *Health Check: `http://localhost:5000/api/health`*

---

### Step 3: Frontend Launch
1. From the project root, launch a local web server on port `5500`:
   ```bash
   # Using Node.js (recommended zero-cache server)
   npx serve -l 5500 .
   
   # Or using Python 3
   python -m http.server 5500 --bind 127.0.0.1
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5500
   ```

---

## Testing & Verification

The repository includes automated integration test suites validating business rules, RBAC authorization, and data integrity:

### Running Test Suites
From the `backend` directory (with the backend server running):

1. **Day 3: Authentication & RBAC Test Suite**
   ```bash
   node tests/day3_auth_rbac.test.js
   ```
   *Validates: Login credentials, JWT generation, 3-tier role authorization, and unauthorized endpoint rejection.*

2. **Day 4: Task Lifecycle & Dashboard Metrics Suite**
   ```bash
   node tests/day4_tasks_dashboard.test.js
   ```
   *Validates: 13-task queries, status transitions, progress updates, assignee locking, and KPI metric calculations.*

3. **Day 5: Operations, Leaves & Controlled Reassignment Suite**
   ```bash
   node tests/day5_operations.test.js
   ```
   *Validates: 38/38 assertions covering shift clock cycles, break intervals, leave approvals, and controlled intra-team reassignment constraints.*

4. **Full-Stack Live Roundtrip Verification**
   ```bash
   node verify_roundtrip.js
   ```
   *Executes an end-to-end simulation across auth, task creation, attendance, and leave workflows against the live PostgreSQL database.*

---

## Project Documentation Catalog (`docs/`)

Comprehensive engineering documentation is maintained in the `docs/` directory:

| Document | Description |
| :--- | :--- |
| [`docs/DAILY_PROGRESS_REPORTS.md`](docs/DAILY_PROGRESS_REPORTS.md) | Chronological progress reports covering all 7 development days, architectural milestones, issue resolutions, and delivery status. |
| [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) | Relational database schema diagram, foreign key definitions, indexing strategy, and table specifications. |
| [`docs/ROLE_PERMISSION_MATRIX.md`](docs/ROLE_PERMISSION_MATRIX.md) | Detailed 3-tier authorization matrix specifying route-level permissions for Managers, Team Leaders, and Agents. |
| [`docs/TESTING_RECORD.md`](docs/TESTING_RECORD.md) | Formal testing log detailing test objectives, execution steps, expected outcomes, and pass/fail audit results. |
| [`docs/RESEARCH_AND_DESIGN.md`](docs/RESEARCH_AND_DESIGN.md) | Architectural analysis, UI design token documentation, and UX flow specifications. |
| [`docs/GESF_Operations_Dashboard_Testing_Record.docx`](docs/GESF_Operations_Dashboard_Testing_Record.docx) | Formal Microsoft Word deliverable of the project testing record. |

---

## License & Attribution

Internal software developed for the **God's Eye Security Force (GESF)** Operational Command Center.
All rights reserved.
