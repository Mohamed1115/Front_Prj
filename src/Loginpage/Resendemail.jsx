import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import TextField from '@mui/material/TextField';
import "./Resendemail.css";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resendConfirmEmail } from '../services/Api';

export default function Resendemail() {
    const Navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    async function handleResend(e) {
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
            await resendConfirmEmail(trimmedEmail);
            alert("تم إرسال بريد تأكيد جديد إلى بريدك الإلكتروني");
            Navigate("/");
        } catch (error) {
            alert(error.message || "حدث خطأ أثناء إرسال البريد");
        } finally {
            setIsLoading(false);
        }
    }
   

    return (   
        <> 
         <div className='contaner2'>    
           <div className='headertype10'>
                <h3>
                    LOGO
                </h3>
                <h1>Welcome TO ZUMRA! </h1>
                <h4>Please Reset your password</h4>
                </div>
           <div className='login-contaner0'>
                
                <div className='box-left10'>
                    <form className='alltext10' onSubmit={handleResend}>
                <div className='logcss10'>
        
                            <div className="buttons10">
                <div className='header10'><p> Send email confirmation </p></div>    
             <TextField  fullWidth  label="Email" variant="outlined"sx={{marginBottom:"15px"}} type='email' value={email} onChange={(e)=>setEmail(e.target.value)}/>
                  
                     
                    
            
                    <button type='submit' disabled={!email.trim() || isLoading}>
                        {isLoading ? "جاري الإرسال..." : "Send"}
                    </button>
                
            </div>
                            
                        </div>
                         <div className='Signup10'>
                                Don't have an account?
                            <Link to="/Signup" className='Signup10' >
                                signup  
                            </Link></div>
                        </form></div>
                    
            <div className='image-right10'>
           <div className='image-box10'>
                     <InsertPhotoIcon sx={{fontSize:"280px",margin:"40%"}} />
              </div>
                </div>
                </div>
                </div>
        </>
    )
}