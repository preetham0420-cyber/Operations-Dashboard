# GESF Internal Operations Platform — PostgreSQL ER Diagram & Data Model
**Document Code:** GESF-SD-BE-01 | **Milestone:** Day 2 Delivery

---

## 1. Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    DEPARTMENTS ||--o{ TEAMS : "groups"
    DEPARTMENTS ||--o{ USERS : "belongs to"
    TEAMS ||--o{ USERS : "contains"
    TEAMS ||--o| USERS : "headed by (Team Leader)"
    
    USERS ||--o{ TASKS : "assigned (Agent)"
    USERS ||--o{ TASKS : "created by"
    TEAMS ||--o{ TASKS : "allocated to"
    
    TASKS ||--o{ TASK_COMMENTS : "has"
    USERS ||--o{ TASK_COMMENTS : "authored by"
    
    TASKS ||--o{ TASK_ACTIVITY : "produces history"
    USERS ||--o{ TASK_ACTIVITY : "performed by"
    
    USERS ||--o{ ATTENDANCE_RECORDS : "logs daily shift"
    ATTENDANCE_RECORDS ||--o{ ATTENDANCE_BREAKS : "includes"
    
    USERS ||--o{ LEAVE_REQUESTS : "submits"
    USERS ||--o{ LEAVE_REQUESTS : "reviewed by (Manager)"
    
    USERS ||--o{ NOTIFICATIONS : "receives"

    ROLES {
        string id PK
        string code UK "MANAGER, TEAM_LEADER, AGENT"
        string name "Display Name"
        string description
    }

    DEPARTMENTS {
        string id PK
        string name UK "Tech & Operations, Field & Logistics"
        string description
    }

    TEAMS {
        string id PK
        string name "Team A, Team B"
        string displayName
        string departmentId FK
        string leaderId FK "Team Leader"
    }

    USERS {
        string id PK
        string email UK "Unique login identity"
        string employeeCode UK "EMP-XXXX"
        string name "Full Name"
        string passwordHash "Bcrypt hashed"
        string roleId FK "Authorization Role"
        string jobTitle "e.g. Technical Lead, Field Agent"
        string departmentId FK
        string teamId FK
        string shift "e.g. 10:00 AM - 5:00 PM"
        string avatar
        boolean isActive
    }

    TASKS {
        string id PK
        string taskCode UK "TSK-101"
        string title
        string description
        string priority "Low, Medium, High, Critical"
        string status "OPEN, IN_PROGRESS, UNDER_REVIEW, CLOSED"
        int progress "Constrained 0-100"
        string assigneeId FK
        string teamId FK
        string createdById FK
        timestamp dueDate
        timestamp createdAt
        timestamp updatedAt
    }

    TASK_COMMENTS {
        string id PK
        string taskId FK
        string authorId FK
        string comment
        timestamp createdAt
    }

    TASK_ACTIVITY {
        string id PK
        string taskId FK
        string userId FK
        string action "STATUS_CHANGE, REASSIGNMENT, PROGRESS_UPDATE"
        string detail
        timestamp createdAt
    }

    ATTENDANCE_RECORDS {
        string id PK
        string userId FK
        date date "YYYY-MM-DD"
        time clockIn
        time clockOut
        string status "Present, Late, Absent"
        float totalHours
    }

    ATTENDANCE_BREAKS {
        string id PK
        string attendanceId FK
        timestamp startTime
        timestamp endTime
        int durationMinutes
    }

    LEAVE_REQUESTS {
        string id PK
        string userId FK
        string leaveType "Annual, Medical, Personal"
        date startDate
        date endDate
        int daysCount
        string reason
        string status "PENDING, APPROVED, REJECTED"
        string reviewedById FK
        string reviewNotes
    }

    NOTIFICATIONS {
        string id PK
        string userId FK
        string title
        string message
        string category "task, leave, attendance, security"
        boolean isRead
        timestamp createdAt
    }
```

---

## 2. Canonical Task Lifecycle

```mermaid
stateDiagram-v2
    [*] --> OPEN: Created by Manager / Team Leader
    OPEN --> IN_PROGRESS: Agent begins work (Progress 1%-89%)
    IN_PROGRESS --> UNDER_REVIEW: Work completed / Submitted (Progress 90%-99%)
    UNDER_REVIEW --> CLOSED: Manager review & sign-off (Progress 100%)
    UNDER_REVIEW --> IN_PROGRESS: Manager requests rework
    CLOSED --> [*]
```

---

## 3. Relational Table Specifications

1. **`roles`**: Decouples authorization privileges (`MANAGER`, `TEAM_LEADER`, `AGENT`) from variable job title strings.
2. **`departments`**: Top-level administrative groupings.
3. **`teams`**: Operational squads with explicit 1:1 Team Leader relationship (`leaderId`).
4. **`users`**: Secure employee identities with unique email, unique employee codes, and bcrypt-hashed passwords.
5. **`tasks`**: Operational incident and maintenance tasks constrained with 0-100% progress and relational audit logs.
6. **`task_comments`**: Chronological discussion threads.
7. **`task_activity`**: Immutable audit history tracking every status, assignment, and progress update.
8. **`attendance_records` & `attendance_breaks`**: Granular work duration and break intervals.
9. **`leave_requests`**: Two-phase approval workflow.
10. **`notifications`**: Per-user targeted inbox messages.
