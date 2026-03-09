import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import TextField from '@mui/material/TextField';
import "./Signup.css";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/Api';

export default function Signup() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validatePhone(phone) {
        // التحقق من رقم الهاتف (أرقام فقط، 10-15 رقم)
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
        
        // Validation
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
            const data = await register({
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
        <> 
           <div className='headertype40'>
                <h3>
                    LOGO
                </h3>
                <h1>Welcome TO ZUMRA! </h1>
                <h4>Please Fill The credential To Signup</h4>
                </div>
            <div className='login-contaner40'>
                
                <div className='box-left40'>
                    <form className='alltext40' onSubmit={handleSignup}>
                
            

                <div className='logcss40'>
        
                            <div className="buttons40">
              <TextField  fullWidth  label="Full Name" variant="outlined" sx={{marginBottom:"15px"}} value={name} onChange={(e)=>setName(e.target.value)}/>
            <TextField  fullWidth  label="Phone Number" variant="outlined" sx={{marginBottom:"15px"}} type='tel' value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)}/>
             <TextField  fullWidth  label="Email" variant="outlined" sx={{marginBottom:"15px"}} type='email' value={email} onChange={(e)=>setEmail(e.target.value)}/>
             <TextField fullWidth type="password" value={password} sx={{marginBottom:"15px"}} onChange={(e)=>setPassword(e.target.value)}  label="password" variant="outlined"  />
               <TextField  fullWidth  label="Confirm Password" variant="outlined" sx={{marginBottom:"15px"}} type='password' value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
               
               <div style={{marginBottom:"15px", display:"flex", alignItems:"center"}}>
                   <input 
                       type='checkbox' 
                       checked={acceptTerms} 
                       onChange={(e)=>setAcceptTerms(e.target.checked)} 
                       id='acceptTerms'
                       style={{marginRight:"8px"}}
                   />
                   <label htmlFor="acceptTerms" style={{fontSize:"14px"}}>
                       أقبل الشروط والأحكام
                   </label>
               </div>
                    
           <button type='submit' disabled={!email.trim() || !password.trim() || !name.trim() || !confirmPassword.trim() || !acceptTerms || isLoading}>
               {isLoading ? "جاري إنشاء الحساب..." : "Sign Up"}
           </button>
            </div>
                           
                            
                            <div className='Signup40'>
                                Don't have an account?
                            <Link to="/" className='Signup40' >
                               Login
                            </Link></div>
                </div>
            </form></div>
            <div className='image-right40'>
           <div className='image-box40'>
                     <InsertPhotoIcon sx={{fontSize:"290px"}} />
              </div>
                </div>
                </div>
        </>
    )
}