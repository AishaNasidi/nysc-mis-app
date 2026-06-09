import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }
  if (allowedRoles && !allowedRoles.includes(userProfile?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
