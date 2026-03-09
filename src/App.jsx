
import { Routes, Route } from "react-router-dom";
import Login from "./Loginpage/Login"
import Forgetpassword from "./Loginpage/Forgetpassword";
import Signup from "./Loginpage/Signup";
import OTP from "./Loginpage/OTP";
import Resetpassword from "./Loginpage/Resetpassword";
import Resendemail from "./Loginpage/Resendemail"
import Confirm from "./Loginpage/Confirm";
import Pages1 from "./viewpages/Pages1";
import Favoritepage from "./viewpages/Favoritepage";
import Navbar from "./viewpages/Navbar";
import HomePage from "./viewpages/HomePage";
import FacilityProfile from "./viewpages/FacilityProfile";
import CoursePage from "./viewpages/CoursePage";

export default function App() {
  return (
    <Routes>
      <Route path="/OTP" element={<OTP />} />
      <Route path="/" element={<Login />} />
      <Route path="/Forgetpassword" element={<Forgetpassword />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/Resetpassword" element={<Resetpassword />} />
      <Route path="/Resendemail" element={<Resendemail />} />
      <Route path="/Confirm" element={<Confirm />} />
      <Route
        path="/home"
        element={<><Navbar /><HomePage /></>}
      />
      <Route
        path="/facility/:facilityId"
        element={<><Navbar /><FacilityProfile /></>}
      />
      <Route
        path="/course/:courseId"
        element={<><Navbar /><CoursePage /></>}
      />
      <Route
        path="/pages1"
        element={<><Navbar /><Pages1 /></>}
      />
      <Route path="/Favoritepage" element={<><Navbar /><Favoritepage /></>} />
    </Routes>
  )
}