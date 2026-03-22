import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import XIcon from '@mui/icons-material/X';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import "./Logincss.css";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/Api';

export default function Login() {
    const [checkbox, setCheckbox] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

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
            alert("Please fill all fields");
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            alert("Please enter a valid email");
            return;
        }

        if (trimmedPassword.length < 3) {
            alert("Password must be at least 3 characters");
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
            alert("Logged in successfully");
            navigate("/home");
        } catch (error) {
            console.error("Login error:", error);
            alert(error.message || "An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon"></span>
                        <span className="logo-text">ZUMRA</span>
                    </div>
                    <h1>Welcome back</h1>
                    <p>Please enter your details to sign in</p>
                </div>

                <div className="social-logins">
                    <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="social-btn">
                        <GoogleIcon />
                    </a>
                    <a href="https://apple.com" target="_blank" rel="noopener noreferrer" className="social-btn">
                        <AppleIcon />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn">
                        <XIcon />
                    </a>
                </div>

                <div className="divider">
                    <span>OR</span>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Your Email Address</label>
                        <input 
                            type="email" 
                            placeholder="Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••"
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

                    <div className="form-options">
                        <label className="remember-checkbox">
                            <input type="checkbox" checked={checkbox} onChange={handleCheckbox} />
                            <span className="checkmark"></span>
                            Remember me
                        </label>
                        <Link to="/Forgetpassword" className="forgot-password">Forgot password?</Link>
                    </div>

                    <button 
                        type="submit" 
                        className="sign-in-btn" 
                        disabled={!email.trim() || !password.trim() || isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </button>
                    
                    <div className="sign-up-prompt">
                        Don't have an account? <Link to="/Signup">Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}