import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import TextField from '@mui/material/TextField';
import "./Resetpassword.css";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword as resetPasswordApi } from '../services/Api';
export default function Resetpassword() {
     const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const email = (localStorage.getItem("reset_email") || "").trim();
      
    async function handleReset(e) {
        e.preventDefault();
        if (!email) {
            alert("البريد الإلكتروني غير موجود. ارجع لصفحة Forget Password وأعد إرسال OTP.");
            return;
        }
        if (!confirmPassword.trim() || !password.trim()) {
            alert("الرجاء ملء جميع الحقول")
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
            // تنظيف بيانات الريست
            localStorage.removeItem("reset_email");
            navigate("/");
        } catch (error) {
            alert(error.message || "حدث خطأ أثناء تغيير كلمة المرور");
        } finally {
            setIsLoading(false);
        }
   }
   
    
    return (   
        <> 
           <div className='headertype'>
                <h3>
                    LOGO
                </h3>
                <h1>Welcome Back TO ZUMRA! </h1>
                <h4>Please Fill The credential To Login</h4>
                </div>
            <div className='login-contaner'>
                
                <div className='box-left'>
                    <form className='alltext' onSubmit={handleReset}>
                
            

                <div className='logcss'>
        
                            <div className="buttons">
                                
                     <TextField fullWidth type="password" value={password} onChange={(e)=>setPassword(e.target.value)} sx={{marginBottom:"15px"}} label="password" variant="outlined"  />
                    <TextField fullWidth type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}  label="confirmpassword" variant="outlined"  />
                                    <button type='submit' disabled={isLoading || !confirmPassword.trim() || !password.trim()}>
                                      {isLoading ? "جاري الحفظ..." : "Resetpassword"}
                                    </button>
 
                    </div>
                                        
                            <div className='Signup1'>
                                Don't have an account?
                            <Link to="/Signup" className='Signup' >
                                signup  
                            </Link></div>
                </div>
            </form></div>
            <div className='image-right'>
           <div className='image-box'>
                     <InsertPhotoIcon sx={{fontSize:"290px"}} />
              </div>
                </div>
                </div>
        </>
    )
}