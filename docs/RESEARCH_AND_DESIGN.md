# UI & Design Architecture - Operations Dashboard

This document details the design system, color palette, responsive layout, and role-based permissions matrix for the Operations Dashboard.

---

## 1. Role-Based Permissions Matrix

| Feature / Capability | Manager (Sarah) | Team Head (Alex / David) | Standard Agent (Others) |
| :--- | :---: | :---: | :---: |
| **Approve / Reject Leave Requests** | ✅ **Exclusive Authority** | ❌ Restricted | ❌ Restricted |
| **Apply for Personal Time Off** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Create New Personnel / Agents** | ✅ **Exclusive Authority** | ❌ Restricted | ❌ Restricted |
| **Transfer Agents Between Teams** | ✅ **Exclusive Authority** | ❌ Restricted | ❌ Restricted |
| **Appoint / Change Team Heads** | ✅ **Exclusive Authority** | ❌ Restricted | ❌ Restricted |
| **Edit Task Progress Slider (0–100%)** | ❌ **Locked** *(Unless assigned)* | ❌ **Locked** *(Unless assigned)* | ✅ **Assignee Only** |
| **Manager Force-Close Task** | ✅ **Yes (At Any Time)** | ❌ Restricted | ❌ Restricted |
| **Change Own Password** | ✅ In Profile & Settings | ✅ In Profile & Settings | ✅ In Profile & Settings |
| **Access Team Management in Settings**| ✅ Full Access | ❌ Hidden | ❌ Hidden |

---

## 2. Color System & Design Tokens

| Semantic Role | Token / Color | Usage Example |
| :--- | :--- | :--- |
| **Primary Accent / Cyan** | `#00F0FF` / Cyan | Active navigation items, Team A badges, slider accent, action highlights |
| **Success / Emerald** | `#10B981` / Emerald | Team B badges, Resolved tasks, Approve leave button, Clocked-in state |
| **Warning / Amber** | `#F59E0B` / Amber | Progress lock notice, Team Head badges, On Break status |
| **Danger / Coral Red** | `#EF4444` / Coral | Manager Force Close button, Reject leave button, Critical priority |
| **Neutral Slate** | Dark Grayscale | Card backgrounds (`#111726`), sidebars (`#0B0F19`), borders |
