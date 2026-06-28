import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resendConfirmEmail } from '../services/Api';
import toast from 'react-hot-toast';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import "./Logincss.css";

export default function Resendemail() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const savedTheme = localStorage.getItem('zumra-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    function validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    async function handleResend(e) {
        e.preventDefault();
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            toast.error("Please enter your email address");
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            await resendConfirmEmail(trimmedEmail);
            setSent(true);
            toast.success("Confirmation email sent! Check your inbox.");
        } catch (error) {
            toast.error(error.message || "Failed to send email. Please try again.");
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
                    <h1>Resend Confirmation</h1>
                    <p>Enter your email to receive a new activation link</p>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📬</div>
                        <h3 style={{ marginBottom: '8px', color: 'var(--auth-text-primary)' }}>Email Sent!</h3>
                        <p style={{ color: 'var(--auth-text-secondary)', marginBottom: '20px', fontSize: '14px', lineHeight: '1.4' }}>
                            We've sent a confirmation link to <strong>{email}</strong>.<br/>
                            Please check your inbox (and spam folder).
                        </p>
                        <button
                            className="premium-action-btn"
                            onClick={() => navigate('/')}
                        >
                            Back to Login
                        </button>
                        <div className="auth-footer-container">
                            <div className="auth-footer-prompt">
                                Didn't receive it?{" "}
                                <button
                                    style={{ background: 'none', border: 'none', color: 'var(--auth-accent)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}
                                    onClick={() => setSent(false)}
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleResend} className="login-form">
                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <MailOutlineIcon className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="premium-action-btn"
                            disabled={!email.trim() || isLoading}
                            style={{ marginTop: '1rem' }}
                        >
                            {isLoading ? "Sending..." : "Send Confirmation Email"}
                        </button>

                        <div className="auth-footer-container">
                            <div className="auth-footer-prompt">
                                Back to <Link to="/">Login</Link>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}