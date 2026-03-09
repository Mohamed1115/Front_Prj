import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import TextField from '@mui/material/TextField';
import "./Forgetpasswordcss.css";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/Api';

export default function Forgetpassword() {
    const Navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async function handleForgotPassword(e) {
        e.preventDefault();
        
        const trimmedEmail = email.trim();
        
        if (!trimmedEmail) {
            alert("الرجاء إدخال البريد الإلكتروني");
            return;
        }
        
        if (!validateEmail(trimmedEmail)) {
            alert("الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }
        
        setIsLoading(true);
        
        try {
            const data = await forgotPassword(trimmedEmail);
            alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
            // خزّن الإيميل علشان صفحة OTP تعرف تبعت VerifyOTP
            localStorage.setItem("reset_email", trimmedEmail);
            Navigate("/OTP", { state: { email: trimmedEmail } });
        } catch (error) {
            console.error("Forgot password error:", error);
            alert(error.message || "حدث خطأ أثناء إرسال الطلب");
        } finally {
            setIsLoading(false);
        }
    }
   

    return (   
        <> 
         <div className='allcontaner20'>    
           <div className='headertype20'>
                <h3>
                    LOGO
                </h3>
                <h1>Welcome TO ZUMRA! </h1>
                <h4>Please Reset your password</h4>
                </div>
           <div className='contaner20'>
                
                <div className='box-left20'>
                    <form className='alltext20' onSubmit={handleForgotPassword}>
                
            

                <div className='logcss20'>
        
                            <div className="buttons20">
                <div className='header20'><p>   Enter the email to reset your password. </p></div>    
             <TextField  fullWidth  label="Email" variant="outlined"sx={{marginBottom:"15px"}} type='email' value={email} onChange={(e)=>setEmail(e.target.value)}/>
                  
                     
                    
             
                    <button type='submit' disabled={!email.trim() || isLoading}>
                        {isLoading ? "جاري الإرسال..." : "Send OTP"}
                    </button>
                
            </div>
                            
                        </div>
                         <div className='Signup20'>
                                Don't have an account?
                            <Link to="/Signup" className='Signup20' >
                                signup  
                            </Link></div>
                        </form></div>
                    
            <div className='image-right20'>
           <div className='image-box20'>
                     <InsertPhotoIcon sx={{fontSize:"280px",margin:"30%"}} />
              </div>
                </div>
                </div>
                </div>
        </>
    )
}