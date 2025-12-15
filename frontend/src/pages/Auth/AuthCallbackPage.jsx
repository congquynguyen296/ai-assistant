import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { toast } from "sonner";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (code && !processedRef.current) {
      processedRef.current = true;
      const handleGoogleLogin = async () => {
        try {
          const response = await authService.googleLogin(code);
          const { user, token } = response?.data || response;
          login(user, token);
          toast.success("Đăng nhập Google thành công");
          navigate("/dashboard");
        } catch (error) {
          console.error(error);
          toast.error("Đăng nhập Google thất bại");
          navigate("/login");
        }
      };

      handleGoogleLogin();
    } else if (!code) {
        navigate("/login");
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <LoadingSpinner />
    </div>
  );
};

export default AuthCallbackPage;
