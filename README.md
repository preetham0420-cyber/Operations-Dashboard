# Operations Dashboard - Internal Team & Task Management

A modern, responsive web application for internal team operations, task dispatching, attendance tracking, shift monitoring, and real-time notifications.

---

## Overview

The Operations Dashboard is built with pure web standards (HTML5, CSS3 with modern design tokens, and modular ES6+ JavaScript). It features reactive client-side state management, `localStorage` persistence, dynamic cache-busting, and role-based permissions for managers and agents.

No external backend installation or database configuration is required to run this full-fidelity simulation.

---

## Team & Roles Structure

The platform provides role-aware capabilities for **Agent Managers** and **Field / Operations Agents**:

| Employee | Role | Department | Shift Hours | Email | Default Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sarah (Lead)** | **Manager** | Operations Management | 10:00 AM - 5:00 PM | `sarah@company.com` | `Password123!` |
| **Alex** | **Technical Agent** | Technical Support | 10:00 AM - 5:00 PM | `alex@company.com` | `Password123!` |
| **David** | **Field Agent** | Field Operations | 10:00 AM - 5:00 PM | `david@company.com` | `Password123!` |
| **Elena** | **Field Agent** | Field Operations | 10:00 AM - 5:00 PM | `elena@company.com` | `Password123!` |
| **Marcus** | **Operations Agent** | Operations Support | 10:00 AM - 5:00 PM | `marcus@company.com` | `Password123!` |

*(Quick 1-click demo login buttons are available on the Sign In screen to switch between any user instantly.)*

---

## Core Features & Simulation Modules

### 1. Attendance & Shift Management
* **Operations & Field Agents**:
  * Live digital clock with active shift timer.
  * 1-click **Clock In** and **Clock Out** tracking with audit logging.
  * **Meal / Rest Break** toggle with real-time indicator.
  * Personal shift history table with status badges (*Present*, *Late*, *On Break*).
  * **Time Off Application Modal** with date range selection, day count, and validation.
* **Agent Manager (Sarah)**:
  * Team KPIs: **Active / Clocked In**, **Currently on Break**, **Late Arrivals Today**, and **Pending Leaves**.
  * Filterable team attendance table (by agent and date).
  * **Pending Leave Queue**: Review incoming leave requests with 1-click **Approve** (green checkmark) and **Reject** (red cross) actions that immediately notify the employee.

### 2. Task & Workload Management
* **Global Search & Multi-filtering**:
  * Real-time query search across Title, Task ID, and Assignee.
  * Filter chips for Status (*Open*, *In Progress*, *Under Review*, *Resolved*), Priority (*Critical*, *High*, *Medium*, *Low*), and Department.
* **Dual View Modes**: High-density table view with progress bars, or card grid view.
* **Create Task Modal**: Form with auto-generated IDs, SLA due-date pickers, and assignee selectors.

### 3. Task Detail, Progress & Discussion
* **Interactive Progress Upgrade**:
  * Range slider (0% to 100%) and quick presets (**0%**, **25%**, **50%**, **75%**, **100%**).
  * Automatically synchronizes status (e.g., 100% sets *Resolved*, >0% sets *In Progress*).
* **Live Discussion & Progress Notes**:
  * Post progress updates and comments in real-time.
  * Posts instantly trigger team-wide notifications with direct links back to the task.
* **Lifecycle Stepper & Chronological Audit Timeline**.

### 4. Notifications Center
* Categorized alerts with tab switching (*All*, *Unread*, *Read*).
* Direct task deep-links (**View TSK-XXX ->**) that take you straight to the task detail discussion.
* Unread counter badges synced live across the top navigation bar and sidebar.

### 5. Responsive Mobile Navigation
* Mobile drawer navigation with hamburger toggle and backdrop dismiss.
* Bottom quick-touch bar on mobile viewports.
* Responsive desktop collapsible sidebar.

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

---

## Project Structure

```
Operations-Dashboard/
|-- index.html                 # Main single-page application shell
|-- README.md                  # System overview, team structure & setup guide
|-- docs/
|   `-- RESEARCH_AND_DESIGN.md  # UI design guidelines, color system & architecture
|-- css/
|   |-- design-tokens.css      # HSL color palette, typography & theme variables
|   |-- layout.css             # App shell, responsive sidebar, mobile navigation drawer
|   |-- components.css         # Buttons, badges, tables, modal dialogs, toasts
|   `-- views.css              # Screen-specific layouts, task grids, attendance cards
`-- js/
    |-- app.js                 # Router, dynamic view imports with cache-busting
    |-- services/
    |   `-- store.js           # Central state store with localStorage & notifications
    |-- data/
    |   |-- mock-auth.js       # 5 active team users (Sarah, Alex, David, Elena, Marcus)
    |   |-- mock-tasks.js      # Tasks dataset with timeline & discussion comments
    |   |-- mock-attendance.js # Daily attendance logs & leave approval queue
    |   |-- mock-notifications.js # Alert broadcasts & priority triggers
    |   `-- mock-activity.js   # Audit stream entries
    |-- components/
    |   |-- navigation.js      # Sidebar, topbar, mobile drawer & badge counters
    |   |-- modal.js           # Accessible dialog controller
    |   `-- toast.js           # Toast notification engine
    `-- views/
        |-- auth-view.js       # Authentication & 1-click demo switcher
        |-- dashboard-view.js  # Executive metrics & operational pipeline
        |-- tasks-view.js      # Task catalog with table/card view toggle
        |-- task-detail-view.js# Interactive progress slider, discussion notes & lifecycle
        |-- attendance-view.js # Live clock-in, manager review & leave approval queue
        |-- notifications-view.js # Alerts with read/unread tracking & deep links
        `-- profile-view.js    # User ID badge, theme switcher & role details
```
