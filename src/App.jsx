import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegisterApplicant from "./pages/applicants/RegisterApplicant";
import ApplicantList from "./pages/applicants/ApplicantList";
import ApplicantDetail from "./pages/applicants/ApplicantDetail";
import EditApplicant from "./pages/applicants/EditApplicant";
import IDCardPage from "./pages/idcard/IDCardPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ManageOfficers from "./pages/officers/ManageOfficers";
import MyRecord from "./pages/member/MyRecord";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "10px", background: "#0f172a", color: "#fff", fontSize: "14px" },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["admin", "officer"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/applicants" element={
            <ProtectedRoute allowedRoles={["admin", "officer"]}>
              <ApplicantList />
            </ProtectedRoute>
          } />
          <Route path="/applicants/register" element={
            <ProtectedRoute allowedRoles={["admin", "officer"]}>
              <RegisterApplicant />
            </ProtectedRoute>
          } />
          <Route path="/applicants/:rcNumber" element={
            <ProtectedRoute allowedRoles={["admin", "officer"]}>
              <ApplicantDetail />
            </ProtectedRoute>
          } />
          <Route path="/applicants/:rcNumber/edit" element={
            <ProtectedRoute allowedRoles={["admin", "officer"]}>
              <EditApplicant />
            </ProtectedRoute>
          } />
          <Route path="/applicants/:rcNumber/idcard" element={
            <ProtectedRoute allowedRoles={["admin", "officer"]}>
              <IDCardPage />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={["admin", "officer"]}>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/officers" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageOfficers />
            </ProtectedRoute>
          } />
          <Route path="/my-record" element={
            <ProtectedRoute allowedRoles={["member"]}>
              <MyRecord />
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center h-screen text-red-600 text-xl font-semibold">
              Access Denied. You do not have permission to view this page.
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
