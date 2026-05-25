import { Navigate } from "react-router-dom";

export default function AdminRedirect({ children }) {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return children;
    
    const user = JSON.parse(storedUser);
    if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
    }
    
    return children;
}