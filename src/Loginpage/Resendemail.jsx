import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resendConfirmEmail } from '../services/Api';
import "./Logincss.css";

export default function Resendemail() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    async function handleResend(e) {
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
            await resendConfirmEmail(trimmedEmail);
            alert("تم إرسال بريد تأكيد جديد إلى بريدك الإلكتروني");
            navigate("/");
        } catch (error) {
            alert(error.message || "حدث خطأ أثناء إرسال البريد");
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
                    <h1>Resend Confirmation</h1>
                    <p>Enter your email to receive a new confirmation link</p>
                </div>

                <form onSubmit={handleResend} className="login-form">
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
                        {isLoading ? "Sending..." : "Send Email"}
                    </button>
                    
                    <div className="sign-up-prompt">
                        Back to <Link to="/">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}