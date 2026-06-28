import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/Api';
import toast from 'react-hot-toast';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import "./Logincss.css";

export default function Forgetpassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const savedTheme = localStorage.getItem('zumra-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);
    const [isLoading, setIsLoading] = useState(false);
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async function handleForgotPassword(e) {
        e.preventDefault();
        
        const trimmedEmail = email.trim();
        
        if (!trimmedEmail) {
            toast.error("الرجاء إدخال البريد الإلكتروني");
            return;
        }
        
        if (!validateEmail(trimmedEmail)) {
            toast.error("الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }
        
        setIsLoading(true);
        
        try {
            await forgotPassword(trimmedEmail);
            toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
            localStorage.setItem("reset_email", trimmedEmail);
            navigate("/OTP", { state: { email: trimmedEmail } });
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error(error.message || "حدث خطأ أثناء إرسال الطلب");
        } finally {
            setIsLoading(false);
        }
    }

    return (   
        <div className="login-wrapper">
            <div className="login-card-container">
                <div className="login-card-header">
                    <Link to="/" className="logo-container">
                        <span className="logo-icon-dot"></span>
                        <span className="logo-text">ZUMRA</span>
                    </Link>
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive an OTP verification code</p>
                </div>

                <form onSubmit={handleForgotPassword} className="login-form">
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

                    <button 
                        type="submit" 
                        className="premium-action-btn" 
                        disabled={!email.trim() || isLoading}
                        style={{ marginTop: '1rem' }}
                    >
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                    </button>
                    
                    <div className="auth-footer-container">
                        <div className="auth-footer-prompt">
                            Remember your password? <Link to="/">Login</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}