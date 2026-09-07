# UI & Design Architecture - Operations Dashboard

This document details the design system, color palette, responsive behavior, and user flow architectures implemented across the Operations Dashboard.

---

## 1. Design Principles

* **High Information Density with Visual Clarity**: Designed for operations managers and field agents to monitor shifts, resolve incidents, and manage workload without visual fatigue.
* **Modern Dark-First Aesthetic**: Tailored dark mode using deep slate and charcoal tones with crisp high-contrast text and luminous cyan, emerald, amber, and purple accents.
* **Zero External Dependencies**: Built entirely using pure HTML5, vanilla CSS3 custom properties, and native ES6+ modules.
* **Instant Interaction Feedback**: Immediate UI updates for progress upgrades, comment additions, leave approvals, and unread notification badge counts.

---

## 2. Color System & Design Tokens

| Semantic Role | Token / Color | Usage Example |
| :--- | :--- | :--- |
| **Primary Accent / Cyan** | `#00F0FF` / Cyan | Active navigation items, task progress bars, action highlights |
| **Success / Emerald** | `#10B981` / Emerald | Resolved tasks, Present attendance, Approve button, Clock-in state |
| **Warning / Amber** | `#F59E0B` / Amber | Under Review tasks, On Break indicator, Pending leave badges |
| **Danger / Coral Red** | `#EF4444` / Coral | Critical priority, Late arrivals, Reject leave button, Overdue alerts |
| **Purple / Review** | `#8B5CF6` / Purple | Manager review status, Leave balance card highlight |
| **Neutral Slate** | Dark Grayscale | Card backgrounds (`#111726`), sidebars (`#0B0F19`), subtle borders |

---

## 3. Layout & Responsive Architecture

1. **Top Header (`app-topbar`)**:
   * Global task search bar with shortcut key (`/`).
   * **+ New Task** quick-action modal trigger.
   * Real-time notifications bell with dynamic red unread counter badge.
   * Mobile hamburger toggle button.

2. **Collapsible Sidebar & Mobile Navigation**:
   * **Desktop**: Collapsible left sidebar with active view indicators and live task & notification counters.
   * **Mobile Viewports (< 768px)**: Slide-out drawer menu with touch backdrop dismiss and dedicated bottom navigation bar for high-frequency actions.

3. **Single-Page Application (SPA) Router**:
   * Hash-based navigation (`#dashboard`, `#tasks`, `#task-detail`, `#attendance`, `#notifications`, `#profile`).
   * Dynamic ES module loading with automatic cache-busting version query parameters.

---

## 4. Role-Based Permissions & Simulation

* **Manager Persona (`Sarah (Lead)`)**:
  * Full access to team attendance logs and live agent status (*Clocked In*, *On Break*, *Late*).
  * Leave approval queue with 1-click **Approve** / **Reject** controls.
  * Task creation, assignment, and status approvals.

* **Agent Personas (`Alex`, `David`, `Elena`, `Marcus`)**:
  * Personal shift clock with live ticking timer, break toggle, and time-off request modal.
  * Task workload view (filterable by "My Tasks" or all tasks).
  * Task discussion participation with live comments and progress slider updates.

---

## 5. State Management & Storage

* **Store Architecture (`store.js`)**: Single source of truth with publish-subscribe pattern.
* **Persistence**: Synchronized to browser `localStorage` for demo continuity.
* **Auto Cache-Busting**: Server sends `Cache-Control: no-cache, no-store` headers and dynamic timestamped module imports prevent stale browser cache issues.
