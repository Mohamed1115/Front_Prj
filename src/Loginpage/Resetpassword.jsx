import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword as resetPasswordApi } from '../services/Api';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import "./Logincss.css";

export default function Resetpassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const email = (localStorage.getItem("reset_email") || "").trim();
      
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function handleReset(e) {
        e.preventDefault();
        if (!email) {
            alert("البريد الإلكتروني غير موجود. ارجع لصفحة Forget Password وأعد إرسال OTP.");
            return;
        }
        if (!confirmPassword.trim() || !password.trim()) {
            alert("الرجاء ملء جميع الحقول");
            return;
        }
        if (password.trim().length < 6) {
            alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }
        if (password.trim() !== confirmPassword.trim()) {
            alert("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
            return;
        }

        setIsLoading(true);
        try {
            await resetPasswordApi({
                email,
                password: password.trim(),
                confirmPassword: confirmPassword.trim(),
            });
            alert("تم تغيير كلمة المرور بنجاح");
            localStorage.removeItem("reset_email");
            navigate("/");
        } catch (error) {
            alert(error.message || "حدث خطأ أثناء تغيير كلمة المرور");
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
                    <h1>Reset Password</h1>
                    <p>Enter your new password below</p>
                </div>

                <form onSubmit={handleReset} className="login-form">
                    <div className="input-group">
                        <label>New Password</label>
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
                    
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button 
                                type="button" 
                                className="toggle-password" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="sign-in-btn" 
                        disabled={isLoading || !confirmPassword.trim() || !password.trim()}
                        style={{ marginTop: '1rem' }}
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                    
                    <div className="sign-up-prompt">
                        Remember your password? <Link to="/">Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}