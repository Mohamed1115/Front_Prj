import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import "./OTPcss.css";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyOTP } from "../services/Api";

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
    <>
      <div className="contaner30">
        <div className="headertype30">
          <h3>LOGO</h3>
          <h1>Welcome TO ZUMRA!</h1>
          <h4>Please Reset your password</h4>
        </div>

        <div className="login-contaner30">
          <div className="box-left30">
            <form className="alltext30" onSubmit={handleVerify}>
              <div className="logcss30">
                <div className="buttons30">
                  <div className="header30">
                    <p>Please Enter 6 Digit Code Sent To</p>
                    <h3>{email || "your email"}</h3>
                  </div>
                </div>

            
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) =>
                        handleChange(e.target.value, index)
                      }
                      onKeyDown={(e) =>
                        handleBackspace(e, index)
                      }
                      className="otp-input"
                    />
                  ))}
                </div>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "verifying..." : "verify"}
                </button>
              </div>

              <div className="Signup30">
                Don't have an account?
                <Link to="/Signup" className="Signup30">
                  signup
                </Link>
              </div>
            </form>
          </div>

          <div className="image-right30">
            <div className="image-box30">
              <InsertPhotoIcon
                sx={{ fontSize: "280px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}