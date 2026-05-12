import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resendConfirmEmail } from '../services/Api';
import toast from 'react-hot-toast';
import "./Logincss.css";

export default function Resendemail() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
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
            <div className="login-card">
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon"></span>
                        <span className="logo-text">ZUMRA</span>
                    </div>
                    <h1>Resend Confirmation</h1>
                    <p>Enter your email to receive a new confirmation link</p>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📬</div>
                        <h3 style={{ marginBottom: '8px', color: 'var(--text-primary, #1a1a2e)' }}>Email Sent!</h3>
                        <p style={{ color: 'var(--text-secondary, #666)', marginBottom: '20px', fontSize: '14px' }}>
                            We've sent a confirmation link to <strong>{email}</strong>.<br/>
                            Please check your inbox (and spam folder).
                        </p>
                        <button
                            className="sign-in-btn"
                            onClick={() => navigate('/')}
                        >
                            Back to Login
                        </button>
                        <div className="sign-up-prompt" style={{ marginTop: '12px' }}>
                            Didn't receive it?{" "}
                            <button
                                style={{ background: 'none', border: 'none', color: 'var(--primary, #7c3aed)', cursor: 'pointer', fontWeight: '500', padding: 0, fontSize: 'inherit' }}
                                onClick={() => setSent(false)}
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleResend} className="login-form">
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="sign-in-btn"
                            disabled={!email.trim() || isLoading}
                            style={{ marginTop: '1rem' }}
                        >
                            {isLoading ? "Sending..." : "Send Confirmation Email"}
                        </button>

                        <div className="sign-up-prompt">
                            Back to <Link to="/">Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}