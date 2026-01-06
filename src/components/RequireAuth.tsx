import { Navigate } from "react-router-dom";
import { getToken } from "@/lib/auth";

type RequireAuthProps = {
  children: JSX.Element;
};

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
