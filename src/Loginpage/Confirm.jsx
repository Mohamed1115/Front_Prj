import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { confirmAccount } from "../services/Api";

export default function Confirm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validateEmail(v) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(v);
  }

  async function handleConfirm(e) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedEmail || !trimmedCode) {
      alert("الرجاء إدخال البريد الإلكتروني وكود التأكيد");
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      alert("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsLoading(true);
    try {
      // ابعت نفس فكرة curl: GET /Auth/Account/Confirm?email=...&code=...
      await confirmAccount({ email: trimmedEmail, code: trimmedCode });
      alert("تم تأكيد الحساب بنجاح");
      navigate("/");
    } catch (error) {
      alert(error.message || "حدث خطأ أثناء التأكيد");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="contaner2">
        <div className="headertype10">
          <h3>LOGO</h3>
          <h1>Welcome TO ZUMRA!</h1>
          <h4>Confirm your account</h4>
        </div>

        <div className="login-contaner0">
          <div className="box-left10">
            <form className="alltext10" onSubmit={handleConfirm}>
              <div className="logcss10">
                <div className="buttons10">
                  <div className="header10">
                    <p>Enter email and confirmation code</p>
                  </div>

                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    sx={{ marginBottom: "15px" }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <TextField
                    fullWidth
                    label="Code"
                    variant="outlined"
                    sx={{ marginBottom: "15px" }}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />

                  <button type="submit" disabled={isLoading || !email.trim() || !code.trim()}>
                    {isLoading ? "جاري التأكيد..." : "Confirm"}
                  </button>
                </div>
              </div>

              <div className="Signup10">
                Back to{" "}
                <Link to="/" className="Signup10">
                  Login
                </Link>
              </div>
            </form>
          </div>

          <div className="image-right10">
            <div className="image-box10">
              <InsertPhotoIcon sx={{ fontSize: "280px", margin: "40%" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

