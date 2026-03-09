import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import GoogleIcon from '@mui/icons-material/Google';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import TextField from '@mui/material/TextField';
import "./Logincss.css";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../services/Api';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const [checkbox, setCheckbox] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function handleCheckbox(e) {
        setCheckbox(e.target.checked)
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function handleLogin(e) {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();


        if (!trimmedEmail || !trimmedPassword) {
            alert("الرجاء ملء جميع الحقول");
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            alert("الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }

        if (trimmedPassword.length < 3) {
            alert("كلمة المرور يجب أن تكون 3 أحرف على الأقل");
            return;
        }

        setIsLoading(true);

        try {
            const data = await login({
                userName: trimmedEmail,
                password: trimmedPassword,
                rememberMe: checkbox
            });

            const token =
                data?.token ??
                data?.accessToken ??
                data?.jwt ??
                data?.data?.token ??
                data?.data?.accessToken;


            localStorage.setItem("token", token);
            alert("تم تسجيل الدخول بنجاح");
            navigate("/home");
        } catch (error) {
            console.error("Login error:", error);
            alert(error.message || "حدث خطأ أثناء تسجيل الدخول");
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
                    <form className='alltext' onSubmit={handleLogin}>



                        <div className='logcss'>

                            <div className="buttons">

                                <TextField fullWidth label="Email" variant="outlined" sx={{ marginBottom: "15px" }} type='email' value={email} onChange={(e) => setEmail(e.target.value)} /><br />
                                <TextField fullWidth type="password" value={password} onChange={(e) => setPassword(e.target.value)} label="password" variant="outlined" />
                                <div className='remember'>   <input type='checkbox' checked={checkbox} onChange={handleCheckbox} id='remember' />
                                    <label htmlFor="remember">
                                        <span className='checkbox'></span>

                                        {checkbox ? 'keep my login' : "don't keep me login"}
                                    </label>

                                    <div className='mylink'>  <Link to="/Forgetpassword" className='Links'>
                                        Forgetpassword ?
                                    </Link>
                                        <Link to="/Resendemail" className='Links'>
                                            Resend email confirmation
                                        </Link>
                                    </div>

                                </div>


                                <button type='submit' disabled={!email.trim() || !password.trim() || isLoading}>
                                    {isLoading ? "جاري تسجيل الدخول..." : "Login"}
                                </button>
                                <hr />

                            </div>
                            <footer className='foot'>
                                <a
                                    href='https://www.facebook.com/?locale=ar_AR'
                                    target='_blank'
                                    rel='noopener noreferrer'

                                    style={{ color: "black" }}
                                    className='facebook'
                                >
                                    <FacebookRoundedIcon sx={{ fontSize: "40px" }} />
                                </a>
                                <a
                                    href='https://accounts.google.com/v3/signin/identifier?continue=https://accounts.google.com/signin/chrome/sync/finish?est%3DAPMJ_aGUNTfsgyteCDbAi9EvGxiimqAtMPErFss3PJCmSnVGlL7Q4Qkq4n2ZIYaaOuq9YIm1Ryl1nIW1Zz4BTw%26continue%3Dhttps://www.google.com/&ssp=1&flowName=GlifDesktopChromeSync&dsh=S-1777760559:1765917958365213>'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    style={{ color: "black" }}
                                    className='google'>

                                    <GoogleIcon sx={{ fontSize: "40px" }} />
                                </a>

                            </footer>

                            <div className='Signup1'>
                                Don't have an account?
                                <Link to="Signup" className='Signup' >
                                    signup
                                </Link></div>
                        </div>
                    </form></div>
                <div className='image-right'>
                    <div className='image-box'>
                        <InsertPhotoIcon sx={{ fontSize: "290px" }} />
                    </div>
                </div>
            </div>
        </>
    )
}