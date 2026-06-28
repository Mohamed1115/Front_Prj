import GoogleIcon from '@mui/icons-material/Google';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import "./Logincss.css";
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/Api';
import toast from 'react-hot-toast';

export default function Login() {
    const [checkbox, setCheckbox] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedTheme = localStorage.getItem('zumra-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const params = new URLSearchParams(location.search);
        const token = params.get("token") || params.get("accessToken") || params.get("jwt");
        
        if (token) {
            localStorage.setItem("token", token);
            toast.success("Logged in successfully");
            navigate("/home");
        }
    }, [location, navigate]);

    async function handleCheckbox(e) {
        setCheckbox(e.target.checked);
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function handleLogin(e) {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            toast.error("Please fill all fields");
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            toast.error("Please enter a valid email");
            return;
        }

        if (trimmedPassword.length < 3) {
            toast.error("Password must be at least 3 characters");
            return;
        }

        setIsLoading(true);

        try {
            const data = await login({
                userName: trimmedEmail,
                password: trimmedPassword,
                rememberMe: checkbox
            });

            const token =
                data?.token ??
                data?.accessToken ??
                data?.jwt ??
                data?.data?.token ??
                data?.data?.accessToken;

            localStorage.setItem("token", token);
            toast.success("Logged in successfully");
            navigate("/home");
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.message || "An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = (e) => {
        e.preventDefault();
        const baseUrl = import.meta.env.DEV ? "http://localhost:5000" : (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "");
        const returnUrl = encodeURIComponent(`${window.location.origin}/`);
        window.location.href = `${baseUrl}/Auth/Account/ExternalLogin?provider=Google&returnUrl=${returnUrl}`;
    };

    return (
        <div className="login-wrapper">
            <div className="login-card-container">
                <div className="login-card-header">
                    <Link to="/" className="logo-container">
                        <span className="logo-icon-dot"></span>
                        <span className="logo-text">ZUMRA</span>
                    </Link>
                    <h1>Welcome Back!</h1>
                    <p>Please enter your credentials to login</p>
                </div>

                <button type="button" onClick={handleGoogleLogin} className="google-signin-btn">
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>

                <div className="divider-with-text">
                    <div className="line"></div>
                    <span>or sign in with email</span>
                    <div className="line"></div>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <MailOutlineIcon className="input-icon" />
                            <input 
                                type="email" 
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <LockOutlinedIcon className="input-icon" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button" 
                                className="toggle-password" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="form-options-row">
                        <label className="remember-checkbox">
                            <input type="checkbox" checked={checkbox} onChange={handleCheckbox} />
                            Keep me logged in
                        </label>
                        <Link to="/Forgetpassword" className="forgot-password-link">Forgot Password?</Link>
                    </div>

                    <button 
                        type="submit" 
                        className="premium-action-btn" 
                        disabled={!email.trim() || !password.trim() || isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                    
                    <div className="auth-footer-container">
                        <div className="auth-footer-prompt">
                            Don't have an account? <Link to="/Signup">Sign up</Link>
                        </div>
                        <div className="auth-footer-prompt">
                            Didn't receive confirmation? <Link to="/Resendemail">Resend email</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}