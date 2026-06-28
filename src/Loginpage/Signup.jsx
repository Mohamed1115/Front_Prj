import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/Api';
import toast from 'react-hot-toast';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import "./Logincss.css";

export default function Signup() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('zumra-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validatePhone(phone) {
        const phoneRegex = /^[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    async function handleSignup(e) {
        e.preventDefault();
        
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phoneNumber.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();
        
        if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
            toast.error("الرجاء ملء جميع الحقول المطلوبة");
            return;
        }
        
        if (!validateEmail(trimmedEmail)) {
            toast.error("الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }
        
        if (trimmedPhone && !validatePhone(trimmedPhone)) {
            toast.error("الرجاء إدخال رقم هاتف صحيح (10-15 رقم)");
            return;
        }
        
        if (trimmedPassword.length < 6) {
            toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }
        
        if (trimmedPassword !== trimmedConfirmPassword) {
            toast.error("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
            return;
        }
        
        if (!acceptTerms) {
            toast.error("يجب الموافقة على الشروط والأحكام");
            return;
        }
        
        setIsLoading(true);
        
        try {
            await register({
                name: trimmedName,
                email: trimmedEmail,
                phoneNumber: trimmedPhone,
                password: trimmedPassword,
                confirmPassword: trimmedConfirmPassword,
                acceptTerms: acceptTerms
            });
            
            toast.success("تم إنشاء الحساب بنجاح!");
            navigate("/");
        } catch (error) {
            console.error("Signup error:", error);
            toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
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
                    <h1>Create Account</h1>
                    <p>Get started with your free account today</p>
                </div>

                <form onSubmit={handleSignup} className="login-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <div className="input-with-icon">
                            <PersonOutlineIcon className="input-icon" />
                            <input 
                                type="text" 
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

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
                        <label>Phone Number</label>
                        <div className="input-with-icon">
                            <LocalPhoneIcon className="input-icon" />
                            <input 
                                type="tel" 
                                placeholder="+1234567890"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <LockOutlinedIcon className="input-icon" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••••••"
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
                        <div className="input-with-icon">
                            <LockOutlinedIcon className="input-icon" />
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="••••••••••••"
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

                    <div className="form-options-row">
                        <label className="remember-checkbox">
                            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                            I accept the terms & conditions
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="premium-action-btn" 
                        disabled={!email.trim() || !password.trim() || !name.trim() || !confirmPassword.trim() || !acceptTerms || isLoading}
                    >
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </button>
                    
                    <div className="auth-footer-container">
                        <div className="auth-footer-prompt">
                            Already have an account? <Link to="/">Login</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}