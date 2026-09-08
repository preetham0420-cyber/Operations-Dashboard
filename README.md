# Operations Dashboard - Internal Operations & Task Management

A modern, responsive web application for internal team operations, multi-division task dispatching, attendance tracking, shift monitoring, real-time notifications, and organizational governance.

---

## Overview

The Operations Dashboard is built with pure web standards (HTML5, CSS3 with modern design tokens, and modular ES6+ JavaScript). It features reactive client-side state management, `localStorage` persistence, dynamic cache-busting, and role-based permissions for managers, team heads, and operational agents.

No external backend installation or database configuration is required to run this full-fidelity simulation.

---

## Organizational Structure: 8 Agents + 1 Manager

The platform models an executive hierarchy with **Sarah as the Operations Manager (Head of All)** overseeing two operational divisions of 4 agents each:

```
👑 Sarah (Operations Manager / Head of All)
├── 🟦 Team A: Tech & Operations (4 Agents)
│   ├── ⭐ Alex (Team Head / Technical Lead)
│   ├── Marcus (Operations Specialist)
│   ├── Chloe (Systems & DevOps Specialist)
│   └── Liam (Support & Incident Specialist)
└── 🟩 Team B: Field & Logistics (4 Agents)
    ├── ⭐ David (Team Head / Field Supervisor)
    ├── Elena (Field Operations Agent)
    ├── Maya (Logistics & Fleet Coordinator)
    └── Noah (Emergency Dispatch Specialist)
```

### Complete Personnel Directory

| Employee | Position / Role | Division | Authority | Email | Default Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sarah** | **Operations Manager** | **Head of All Teams** | **Super Admin** | `sarah@company.com` | `Password123!` |
| **Alex** | **Technical Lead** | **Team A** | **Team Head** | `alex@company.com` | `Password123!` |
| **Marcus** | Operations Specialist | **Team A** | Agent | `marcus@company.com` | `Password123!` |
| **Chloe** | Systems & DevOps | **Team A** | Agent | `chloe@company.com` | `Password123!` |
| **Liam** | Support Specialist | **Team A** | Agent | `liam@company.com` | `Password123!` |
| **David** | **Field Supervisor** | **Team B** | **Team Head** | `david@company.com` | `Password123!` |
| **Elena** | Field Operations Agent | **Team B** | Agent | `elena@company.com` | `Password123!` |
| **Maya** | Logistics Coordinator | **Team B** | Agent | `maya@company.com` | `Password123!` |
| **Noah** | Emergency Dispatch | **Team B** | Agent | `noah@company.com` | `Password123!` |

*(Quick 1-click demo login buttons are available on the Sign In screen to switch between any of the 9 personas instantly.)*

---

## Core Features & Role Governance

### 1. Attendance & Leave Approvals (Manager-Exclusive)
* **Manager (Sarah)**:
  * Team KPIs: Active/Clocked In, Currently on Break, Late Arrivals Today, and Pending Leaves.
  * Filterable team attendance table across all 8 agents.
  * **Pending Leave Queue**: Exclusive authority to **Approve** (green checkmark) or **Reject** (coral cross) leave applications. Actions trigger instant notifications to the applying employee.
* **Team Heads & Agents**:
  * Live digital clock with active shift timer.
  * 1-click **Clock In** and **Clock Out** tracking with audit logging.
  * **Meal / Rest Break** toggle with real-time indicator.
  * Personal shift history table and Leave Balance card with **Time Off Application Modal**.
  * Zero review/approval controls (leave queues are strictly hidden and protected).

### 2. Task Workload & Assignee-Only Progress Controls
* **Assignee-Only Progress Slider**:
  * Only the assigned agent can drag the 0%–100% progress slider and click quick presets (0%, 25%, 50%, 75%, 100%).
  * For non-assignees (and the Manager), progress controls are locked and read-only with an informative lock badge: `🔒 Progress is locked. Only assigned agent can update progress.`
* **Manager Force-Close**:
  * Sarah has an exclusive **"🛡️ Manager Close Task"** action button.
  * Prompts for closing resolution remarks, sets task to 100% Closed, logs audit entry in discussion, and dispatches a high-priority alert to the assigned agent.
* **Discussion & Live Notes**:
  * Real-time progress comments with instant team notifications and deep links.

### 3. Settings Hub & Account Security
* **Appearance & Themes**: 4 curated themes (Dark Slate, Midnight Blue, Crisp Light, OLED Pitch Black).
* **Security & Change Password**: Embedded in both **Profile** and **Settings** with current password validation, 8+ character strength check, and persistent `localStorage` synchronization.
* **Team Management (Manager Only)**:
  * Visual cards for Team A and Team B.
  * Dropdown selector to appoint/change Team Heads.
  * 1-click transfer buttons to move agents between Team A and Team B.
  * **"+ Create New Agent"** modal to onboard new personnel.
* **System Controls**: Audio alerts and 1-click Demo State Reset.

---

## How to Run Locally

### Option 1: Live Server / VS Code
1. Open this directory in **Visual Studio Code**.
2. Right-click `index.html` and choose **"Open with Live Server"**.
3. Access at: `http://127.0.0.1:5500`

### Option 2: Python HTTP Server (Zero-Cache)
```bash
python -m http.server 5500 --bind 127.0.0.1
```
Then visit **`http://localhost:5500`** in your browser.
