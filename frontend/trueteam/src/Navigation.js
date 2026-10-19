import {
  Home,
  CheckSquare,
  Clock,
  Calendar,
  DollarSign,
  User,
  Users,
  Briefcase,
  Settings,
} from 'lucide-react'

// Sidebar links for employees
export const employeeLinks = [
  { name: 'Dashboard',  icon: Home,        to: '/employee/dashboard' },
  { name: 'Tasks',      icon: CheckSquare, to: '/employee/tasks' },
  { name: 'Attendance', icon: Clock,       to: '/employee/attendance' },
  { name: 'Leave',      icon: Calendar,    to: '/employee/leave' },
  { name: 'Payroll',    icon: DollarSign,  to: '/employee/payroll' },
  { name: 'Profile',    icon: User,        to: '/employee/profile' },
]

// Sidebar links for HR
export const hrLinks = [
  { name: 'Dashboard',   icon: Home,       to: '/hr/dashboard' },
  { name: 'Employees',   icon: Users,      to: '/hr/employees' },
  { name: 'Recruitment', icon: Briefcase,  to: '/hr/recruitment' },
  { name: 'Jobs',        icon: Briefcase,  to: '/hr/jobs' },
  { name: 'Attendance',  icon: Clock,      to: '/hr/attendance' },
  { name: 'Leave',       icon: Calendar,   to: '/hr/leave' },
  { name: 'Payroll',     icon: DollarSign, to: '/hr/payroll' },
    { name: 'Profile',     icon: User,       to: '/hr/profile' },
  { name: 'Settings',    icon: Settings,   to: '/hr/settings' },
]