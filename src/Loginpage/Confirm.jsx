import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { confirmAccount } from "../services/Api";
import toast from 'react-hot-toast';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import "./Logincss.css";

export default function Confirm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const savedTheme = localStorage.getItem('zumra-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function validateEmail(v) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(v);
    }

    async function handleConfirm(e) {
        e.preventDefault();
        const trimmedEmail = email.trim();
        const trimmedCode = code.trim();

        if (!trimmedEmail || !trimmedCode) {
            toast.error("الرجاء إدخال البريد الإلكتروني وكود التأكيد");
            return;
        }
        if (!validateEmail(trimmedEmail)) {
            toast.error("الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }

        setIsLoading(true);
        try {
            await confirmAccount({ email: trimmedEmail, code: trimmedCode });
            toast.success("تم تأكيد الحساب بنجاح");
            navigate("/");
        } catch (error) {
            toast.error(error.message || "حدث خطأ أثناء التأكيد");
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
                    <h1>Confirm Account</h1>
                    <p>Enter your email and confirmation code to activate your account</p>
                </div>

                <form onSubmit={handleConfirm} className="login-form">
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
                        <label>Confirmation Code</label>
                        <div className="input-with-icon">
                            <LockOutlinedIcon className="input-icon" />
                            <input 
                                type="text" 
                                placeholder="Enter Code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="premium-action-btn" 
                        disabled={isLoading || !email.trim() || !code.trim()}
                        style={{ marginTop: '1rem' }}
                    >
                        {isLoading ? "Confirming..." : "Confirm"}
                    </button>
                    
                    <div className="auth-footer-container">
                        <div className="auth-footer-prompt">
                            Back to <Link to="/">Login</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
