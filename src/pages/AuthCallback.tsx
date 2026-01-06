import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "@/lib/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setToken(token);
      navigate("/", { replace: true });
      return;
    }
    navigate("/login", { replace: true });
  }, [navigate, params]);

  return null;
};

export default AuthCallback;
