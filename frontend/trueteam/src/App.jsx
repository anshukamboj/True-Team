import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/AppLayout'
import ProtectedRoute from "./components/ProtectRoute";

// public pages
import Main from './components/Main';
import Login from './components/Login'
import ForgotPassword from './components/ForgotPassword'
import CreateAccount from './components/CreateAccount'

// employee pages
import Dashboard from './components/Dashboard'
import Tasks from './components/Tasks'
import Attendance from './components/Attendance'
import LeaveManagement from './components/LeaveManagement'
import PayrollDocuments from './components/PayrollDocuments'
import EmployeeProfile from './components/EmployeeProfile'

// HR pages
import HRDashboard from './components/Overview'
import Employees from './components/Employees'
import EmployeeDetail from './components/EmployeeDetail'
import Recruitment from './components/Recruitment'
import AttendanceManagement from './components/AttendanceManagement'
import LeavePage from './components/LeaveRequests'
import PayrollPage from './components/Payroll'
import SettingsPage from './components/Settings'
import Jobs from './components/Jobs';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Main/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-account" element={<CreateAccount />} />

          {/* Employee area */}
          <Route element={<ProtectedRoute role="employee" />}>
            <Route path="/employee" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="payroll" element={<PayrollDocuments />} />
              <Route path="profile" element={<EmployeeProfile />} />
            </Route>
          </Route>

          {/* HR area */}
          <Route element={<ProtectedRoute role="hr" />}>
            <Route path="/hr" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HRDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="recruitment" element={<Recruitment />} />
              <Route path="jobs" element={<Jobs/>} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="leave" element={<LeavePage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="profile" element={<EmployeeProfile/>} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* anything else */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App