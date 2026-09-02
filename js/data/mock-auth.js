/**
 * Mock Authentication Dataset
 * 5 Demo Users: 1 Manager, 1 Technical Agent, 2 Field Agents, 1 Operations Agent
 * Indian working hours: 10:00 AM – 5:00 PM
 */

export const MOCK_USERS = [
  {
    id: "USR-001",
    employeeCode: "MGR-01",
    name: "Sarah (Lead)",
    email: "sarah@company.com",
    role: "Manager",
    isManager: true,
    department: "Operations Management",
    shift: "10:00 AM – 5:00 PM",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" // Password123!
  },
  {
    id: "USR-002",
    employeeCode: "AGT-01",
    name: "Alex",
    email: "alex@company.com",
    role: "Technical Agent",
    isManager: false,
    department: "Technical Support",
    shift: "10:00 AM – 5:00 PM",
    phone: "+91 98765 43211",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" // Password123!
  },
  {
    id: "USR-003",
    employeeCode: "AGT-02",
    name: "David",
    email: "david@company.com",
    role: "Field Agent",
    isManager: false,
    department: "Field Operations",
    shift: "10:00 AM – 5:00 PM",
    phone: "+91 98765 43212",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" // Password123!
  },
  {
    id: "USR-004",
    employeeCode: "AGT-03",
    name: "Elena",
    email: "elena@company.com",
    role: "Field Agent",
    isManager: false,
    department: "Field Operations",
    shift: "10:00 AM – 5:00 PM",
    phone: "+91 98765 43213",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" // Password123!
  },
  {
    id: "USR-005",
    employeeCode: "AGT-04",
    name: "Marcus",
    email: "marcus@company.com",
    role: "Operations Agent",
    isManager: false,
    department: "Operations Support",
    shift: "10:00 AM – 5:00 PM",
    phone: "+91 98765 43214",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" // Password123!
  }
];

export const CURRENT_DEFAULT_USER = MOCK_USERS[0];
