import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyOTP } from "../services/Api";
import "./Logincss.css";

export default function OTP() {
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem("reset_email");
    const email = (emailFromState || emailFromStorage || "").trim();

    const handleChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (otp.includes("")) {
            alert("Please enter full OTP");
            return;
        }

        const otpCode = otp.join("");
        if (!email) {
            alert("البريد الإلكتروني غير موجود. ارجع لصفحة Forget Password وأعد إرسال OTP.");
            return;
        }

        setIsLoading(true);
        try {
            await verifyOTP({ email, otp: otpCode });
            alert("تم التحقق من OTP بنجاح");
            navigate("/Resetpassword");
        } catch (error) {
            alert(error.message || "حدث خطأ أثناء التحقق من OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon"></span>
                        <span className="logo-text">ZUMRA</span>
                    </div>
                    <h1>Verify Email</h1>
                    <p>Enter the 6-digit code sent to <br/><strong>{email || "your email"}</strong></p>
                </div>

                <form onSubmit={handleVerify} className="login-form">
                    <div className="otp-container">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleBackspace(e, index)}
                                className="otp-input"
                            />
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        className="sign-in-btn" 
                        disabled={isLoading}
                        style={{ marginTop: '1rem' }}
                    >
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </button>
                    
                    <div className="sign-up-prompt">
                        Didn't receive the code? <Link to="/Forgetpassword">Resend</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}