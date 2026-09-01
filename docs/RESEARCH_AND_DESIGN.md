# UI & Design Notes

A simple overview of the layout, color choices, and structure for the Operations Dashboard.

---

## 🎨 1. Design Goals

The dashboard is built to be simple, fast, and easy for any employee to use:
* **Clean & Modern Look**: A dark mode interface that is comfortable on the eyes, with a light mode toggle.
* **Easy Navigation**: A left sidebar to quickly switch between pages without getting lost.
* **Clear Task Views**: Users can view tasks either as a detailed table list or as visual cards.

---

## 🌈 2. Color Meanings

Standard, common colors are used so everything is immediately clear:

| Color | Meaning | Where It's Used |
| :--- | :--- | :--- |
| **Blue / Cyan** | Active / Primary | Action buttons, active navigation tab, "In Progress" tasks |
| **Green** | Completed / Present | "Resolved" tasks, "Present" attendance status |
| **Red** | Urgent / Overdue | "Critical" priority tasks, overdue task alerts |
| **Purple** | Under Review | Tasks submitted for manager check |
| **Dark Charcoal** | Background | Main application background |

---

## 📱 3. Layout Structure

1. **Top Header**:
   - Live system status (Online).
   - Search bar to quickly find any task by number or name.
   - "New Task" button to create tasks.
   - Theme toggle button (Dark / Light mode).
   - User profile button.

2. **Left Sidebar Navigation**:
   - **Dashboard**: Main overview of daily numbers and active tasks.
   - **Task Management**: Full list of tasks with search and filters.
   - **Attendance & Shifts**: Clock in/out and leave requests.
   - **Notifications**: Updates and alerts.
   - **Profile**: User details and theme settings.

3. **Main Screen**:
   - Fast Single-Page Application (SPA) where pages load instantly without refreshing the browser.

---

## 👥 4. Simple Roles

* **Agent Manager**:
  - Views all team tasks and team progress.
  - Checks live attendance for all 4 team agents.
  - Approves or rejects time-off / leave applications.

* **Operations Agent**:
  - Views their own assigned tasks by default.
  - Can search by task number to find other tasks.
  - Clocks in and out for their daily work shift.
  - Submits leave requests to the manager.
