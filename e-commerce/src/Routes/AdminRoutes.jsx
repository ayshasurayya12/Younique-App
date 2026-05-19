import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute({ children }) {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return <Navigate to="/login" replace />;

    const user = JSON.parse(storedUser);

    if (user.role !== "admin") {
        return <Navigate to="/not-authorized" replace />;
    }

    return children;
}