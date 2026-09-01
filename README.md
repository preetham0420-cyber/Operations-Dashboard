# Operations Dashboard — Internal Team & Task Management
A clean, responsive frontend application for internal team operations, task dispatch, attendance tracking, and activity monitoring.

---

## 🎯 Overview
This project is an internal employee operations dashboard built using vanilla web standards (HTML5, CSS3 with custom properties, and ES6+ Modules) with client-side reactive state management and `localStorage` persistence.

No backend setup or external database is required to run the prototype.

---

## 👥 Team & Roles Structure

The application supports **Agent Manager** and **Operations Agents** with role-based access control:

| Employee | Role | Email | Login Password |
| :--- | :--- | :--- | :--- |
| **Sarah (Lead)** | **Agent Manager** | `sarah@company.com` | `Password123!` |
| **Alex** | **Operations Agent** | `alex@company.com` | `Password123!` |
| **David** | **Field Agent** | `david@company.com` | `Password123!` |
| **Elena** | **Dispatch Agent** | `elena@company.com` | `Password123!` |
| **Marcus** | **Support Agent** | `marcus@company.com` | `Password123!` |

*(On the sign-in screen, you can also use the 1-click demo accounts for quick testing.)*

---

## 🌟 Key Features

1. **Role-Based Attendance & Shifts**:
   - **Agents**: Live shift clock-in/out button with active timer, break toggle, personal attendance history, and time-off request modal.
   - **Agent Manager**: Team-wide live overview (who's active, on break, or late), filterable team attendance records, and a leave approval queue with 1-click Approve/Reject actions.
2. **Executive Dashboard**:
   - Dynamic KPIs (Total Tasks, In Progress, Completed, Overdue, Active Shifts).
   - Multi-segment pipeline progress bar and urgent tasks watchlist.
3. **Task & Workload Management**:
   - Real-time search across title, ID, and assignee.
   - Multi-filtering by Status, Priority, and Department.
   - Dual view modes: High-density Table View (with task progress bars) and Card Grid View.
   - Dedicated "My Tasks" view for agents with global search capability.
   - Create Task modal with client-side validation.
4. **Task Detail & Investigation**:
   - Interactive 4-stage operational lifecycle stepper (*Open ➔ In Progress ➔ Under Review ➔ Resolved*).
   - Chronological audit timeline and discussion notes thread.
5. **Notifications & Alerts**:
   - Categorized alerts with read/unread tracking and direct task links.
6. **Profile & Customization**:
   - Employee ID badge card, dark/light theme switcher, and instant demo user profile switcher.

---

## 🚀 How to Run Locally

### Option 1: VS Code Live Server (Recommended)
1. Open **Visual Studio Code**.
2. Open this directory in VS Code (`File > Open Folder...`).
3. Right-click `index.html` and click **"Open with Live Server"**.
4. The application will open in your browser at `http://127.0.0.1:5500/index.html`.

### Option 2: Run via Terminal
```bash
npx serve .
# or
python -m http.server 5500
```

---

## 📁 Project Architecture

```
operations-dashboard/
├── index.html                    # Application entry HTML5 shell
├── README.md                     # Setup, roles & overview
├── css/
│   ├── design-tokens.css         # HSL colors, dark/light themes, typography
│   ├── layout.css                # App shell, collapsible sidebar, topbar, mobile nav
│   ├── components.css            # Buttons, cards, tables, badges, modals, toasts
│   └── views.css                 # Screen-specific styles & attendance layouts
└── js/
    ├── app.js                    # Router & application bootstrap
    ├── services/
    │   └── store.js              # Reactive state store with LocalStorage & SHA-256
    ├── data/
    │   ├── mock-auth.js          # User accounts & role configurations
    │   ├── mock-attendance.js    # Daily attendance logs & leave requests
    │   ├── mock-tasks.js         # Operations dataset & comments
    │   ├── mock-notifications.js # Alert broadcasts
    │   └── mock-activity.js      # Audit log & activity stream
    ├── components/
    │   ├── navigation.js         # Sidebar, topbar, mobile nav, route manager
    │   ├── modal.js              # Reusable modal controller
    │   └── toast.js              # Toast feedback service
    └── views/
        ├── auth-view.js          # Login screen with validation
        ├── dashboard-view.js     # Consolidated KPI summary & active shift count
        ├── tasks-view.js         # Search, multi-filtering, table/card toggle
        ├── task-detail-view.js   # Incident record, lifecycle stepper, comments
        ├── attendance-view.js    # Manager team overview vs. Agent clock & log
        ├── notifications-view.js # Categorized alerts & unread badges
        └── profile-view.js       # Employee ID card, user switcher, theme toggle
```
