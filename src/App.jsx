
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
import CheckoutPage from "./viewpages/CheckoutPage";
import ProfilePage from "./viewpages/ProfilePage";
import WatchCoursePage from "./viewpages/WatchCoursePage";
import CreateCoursePage from "./viewpages/CreateCoursePage";
import CreateFacilityPage from "./viewpages/CreateFacilityPage";
import ActivateFacilityPage from "./viewpages/ActivateFacilityPage";
import FacilityDashboardPage from "./viewpages/FacilityDashboardPage";
import FacilitySettingsPage from "./viewpages/FacilitySettingsPage";
import LiveMeetingTestPage from "./viewpages/LiveMeetingTestPage";
import AllCoursesPage from "./viewpages/AllCoursesPage";
import MyCoursesPage from "./viewpages/MyCoursesPage";
import CourseControlPanel from "./viewpages/CourseControlPanel";
import BatchControlPanel from "./viewpages/BatchControlPanel";

import ChatBot from "./viewpages/ChatBot";
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
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
      <Route
        path="/checkout"
        element={<><Navbar /><CheckoutPage /></>}
      />
      <Route
        path="/profile"
        element={<><Navbar /><ProfilePage /></>}
      />
      <Route
        path="/watch/:courseId"
        element={<><Navbar /><WatchCoursePage /></>}
      />
      <Route
        path="/create-course"
        element={<><Navbar /><CreateCoursePage /></>}
      />
      <Route
        path="/create-facility"
        element={<><Navbar /><CreateFacilityPage /></>}
      />
      <Route
        path="/courses"
        element={<><Navbar /><AllCoursesPage /></>}
      />
      <Route
        path="/my-courses"
        element={<><Navbar /><MyCoursesPage /></>}
      />
      <Route
        path="/activate-facility/:facilityId"
        element={<><Navbar /><ActivateFacilityPage /></>}
      />
      <Route
        path="/facility-payment-success"
        element={<><Navbar /><ActivateFacilityPage /></>}
      />
      <Route
        path="/facility-dashboard/:facilityId"
        element={<><Navbar /><FacilityDashboardPage /></>}
      />
      <Route
        path="/facility-settings/:facilityId"
        element={<><Navbar /><FacilitySettingsPage /></>}
      />
      <Route
        path="/live-meeting-test"
        element={<><Navbar /><LiveMeetingTestPage /></>}
      />
      <Route
        path="/facility-payment-cancel"
        element={<><Navbar /><ActivateFacilityPage /></>}
      />
      <Route
        path="/course-dashboard/:facilityId/:courseId"
        element={<><Navbar /><CourseControlPanel /></>}
      />
      <Route
        path="/batch-dashboard/:facilityId/:courseId/:batchId"
        element={<><Navbar /><BatchControlPanel /></>}
      />
    </Routes>
    <ChatBot />
    <Toaster position="top-center" />
    </>
  )
}