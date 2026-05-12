import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { confirmAccount } from "../services/Api";
import toast from 'react-hot-toast';
import "./Logincss.css";

export default function Confirm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
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
            <div className="login-card">
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon"></span>
                        <span className="logo-text">ZUMRA</span>
                    </div>
                    <h1>Confirm Account</h1>
                    <p>Enter your email and confirmation code</p>
                </div>

                <form onSubmit={handleConfirm} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Confirmation Code</label>
                        <input 
                            type="text" 
                            placeholder="Enter Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="sign-in-btn" 
                        disabled={isLoading || !email.trim() || !code.trim()}
                        style={{ marginTop: '1rem' }}
                    >
                        {isLoading ? "Confirming..." : "Confirm"}
                    </button>
                    
                    <div className="sign-up-prompt">
                        Back to <Link to="/">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
