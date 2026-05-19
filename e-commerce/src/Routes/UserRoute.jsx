import { Navigate } from "react-router-dom";

export default function UserRoute({ children }) {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return <Navigate to="/login" replace />;

    const user = JSON.parse(storedUser);

    if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    return children;
}