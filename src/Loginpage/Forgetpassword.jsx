import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/Api';
import "./Logincss.css";

export default function Forgetpassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async function handleForgotPassword(e) {
        e.preventDefault();
        
        const trimmedEmail = email.trim();
        
        if (!trimmedEmail) {
            alert("الرجاء إدخال البريد الإلكتروني");
            return;
        }
        
        if (!validateEmail(trimmedEmail)) {
            alert("الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }
        
        setIsLoading(true);
        
        try {
            await forgotPassword(trimmedEmail);
            alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
            localStorage.setItem("reset_email", trimmedEmail);
            navigate("/OTP", { state: { email: trimmedEmail } });
        } catch (error) {
            console.error("Forgot password error:", error);
            alert(error.message || "حدث خطأ أثناء إرسال الطلب");
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
                    <h1>Forgot Password</h1>
                    <p>Enter the email associated with your account</p>
                </div>

                <form onSubmit={handleForgotPassword} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="sign-in-btn" 
                        disabled={!email.trim() || isLoading}
                        style={{ marginTop: '1rem' }}
                    >
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                    </button>
                    
                    <div className="sign-up-prompt">
                        Remember your password? <Link to="/">Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}