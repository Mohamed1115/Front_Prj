import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/Api';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import "./Logincss.css";

export default function Signup() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
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
            alert("الرجاء ملء جميع الحقول المطلوبة");
            return;
        }
        
        if (!validateEmail(trimmedEmail)) {
            alert("الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }
        
        if (trimmedPhone && !validatePhone(trimmedPhone)) {
            alert("الرجاء إدخال رقم هاتف صحيح (10-15 رقم)");
            return;
        }
        
        if (trimmedPassword.length < 6) {
            alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }
        
        if (trimmedPassword !== trimmedConfirmPassword) {
            alert("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
            return;
        }
        
        if (!acceptTerms) {
            alert("يجب الموافقة على الشروط والأحكام");
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
            
            alert("تم إنشاء الحساب بنجاح!");
            navigate("/");
        } catch (error) {
            console.error("Signup error:", error);
            alert(error.message || "حدث خطأ أثناء إنشاء الحساب");
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
                    <h1>Create an account</h1>
                    <p>Please enter your details to sign up</p>
                </div>

                <form onSubmit={handleSignup} className="login-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Phone Number</label>
                        <input 
                            type="tel" 
                            placeholder="+1234567890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
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

                    <div className="form-options">
                        <label className="remember-checkbox">
                            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                            <span className="checkmark"></span>
                            I accept the terms and conditions
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="sign-in-btn" 
                        disabled={!email.trim() || !password.trim() || !name.trim() || !confirmPassword.trim() || !acceptTerms || isLoading}
                    >
                        {isLoading ? "Signing up..." : "Sign up"}
                    </button>
                    
                    <div className="sign-up-prompt">
                        Already have an account? <Link to="/">Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}