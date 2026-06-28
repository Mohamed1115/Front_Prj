import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCourses, getAllFacilities, getImageUrl, getMyEnrollments } from "../services/Api";
import "./HomePage.css";

// MUI Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LandscapeIcon from "@mui/icons-material/Landscape";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import CloudIcon from "@mui/icons-material/Cloud";
import VideocamIcon from "@mui/icons-material/Videocam";

// ─── API Data Placeholders ───────────────────────────────────────────
// We will load popularCourses and facilities via API and store them in state.
// ───────────────────────────────────────────────────────────────────

const learningCourses = [
    { id: 1, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", author: "Jane Cooper", lessons: 12 },
    { id: 2, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", author: "Jane Cooper", lessons: 12 },
    { id: 3, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", author: "Jane Cooper", lessons: 12 },
    { id: 4, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", author: "Jane Cooper", lessons: 12 },
];

const upcomingEvents = [
    { date: "Feb, Jan 24", course: "Drawing Course", time: "" },
    { date: "Jan, Jul 25", course: "Drawing Course", time: "" },
    { date: "Mon, Jul 26", course: "Drawing Course", time: "" },
    { date: "Tue, Jul 26", course: "Drawing Course", time: "" },
    { date: "Tue, Jan 28", course: "Python Course", time: "" },
];

export default function HomePage() {
    const navigate = useNavigate();
    const [popularCourses, setPopularCourses] = useState([]);
    const [facilitiesState, setFacilitiesState] = useState([]);
    const [showAllFacilities, setShowAllFacilities] = useState(false);
    const [userName, setUserName] = useState("User");
    const [bannerIndex, setBannerIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [myLearning, setMyLearning] = useState([]);

    const bannersData = [
        { id: 1, type: 'blue', tag: 'New Course', title: 'Master Full-Stack', desc: 'Build real-world apps with React & C#', btn: 'Explore Now', icon: SchoolIcon },
        { id: 2, type: 'orange', tag: 'Trending', title: 'UX/UI Design', desc: 'Create stunning interfaces from scratch', btn: 'Start Learning', icon: LocalFireDepartmentIcon },
        { id: 3, type: 'green', tag: 'Popular', title: 'Cloud Architecture', desc: 'Deploy scalable apps with AWS & Docker', btn: 'Discover', icon: CloudIcon },
        { id: 4, type: 'purple', tag: 'Live Classes', title: 'Live Coding Sessions', desc: 'Join expert developers in real-time', btn: 'Join Now', icon: VideocamIcon },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setBannerIndex((prev) => (prev + 2) % bannersData.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        async function loadData() {
            try {
                // Decode token to get username
                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split(".")[1]));
                        const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";
                        let name = payload.name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload.unique_name || payload.given_name || email.split("@")[0] || "User";
                        if (name && name.includes("@")) {
                            name = name.split("@")[0];
                        }
                        setUserName(name);
                    } catch (e) {
                        console.error("Error decoding token for username", e);
                    }
                }

                setLoading(true);
                const coursesData = await getAllCourses();
                const facilitiesData = await getAllFacilities();
                
                // Assuming data could be inside a 'data' property or it's an array itself
                const cArray = Array.isArray(coursesData) ? coursesData : (coursesData?.data || []);
                const fArray = Array.isArray(facilitiesData) ? facilitiesData : (facilitiesData?.data || []);

                setPopularCourses(cArray.slice(0, 4));
                setFacilitiesState(fArray.slice(0, 3));

                if (token) {
                    try {
                        const myRes = await getMyEnrollments();
                        if (myRes && myRes.success) {
                            setMyLearning(myRes.data || []);
                        }
                    } catch (myErr) {
                        console.error("Error loading enrollments on HomePage:", myErr);
                    }
                }
            } catch (error) {
                console.error("Failed to load API data on HomePage:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="home-dashboard">
            
            {/* ═══ 1. Welcome Section ═══ */}
            <section className="home-section welcome-section">
                <h2 className="home-welcome-title">Welcome back, {userName}!</h2>
                <div className="home-banners">
                    {[bannersData[bannerIndex], bannersData[(bannerIndex + 1) % bannersData.length]].map((banner) => {
                        const Icon = banner.icon;
                        return (
                            <div className={`promo-banner banner-${banner.type}`} key={banner.id} onClick={() => navigate('/courses')}>
                                <div className="promo-content">
                                    <span className="promo-tag">{banner.tag}</span>
                                    <h3>{banner.title}</h3>
                                    <p>{banner.desc}</p>
                                    <button className="promo-btn">{banner.btn}</button>
                                </div>
                                <div className="promo-icon">
                                    <Icon style={{ fontSize: 100 }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ═══ 2. Most Popular ═══ */}
            <section className="home-section popular-section">
                <div className="section-header-row">
                    <h2>Most Popular</h2>
                    <button className="see-more-btn" onClick={() => navigate('/courses')}>see more</button>
                </div>
                <div className="popular-cards-row">
                    {loading ? (
                        <p style={{ padding: "20px" }}>Loading courses...</p>
                    ) : popularCourses.length === 0 ? (
                        <p style={{ padding: "20px" }}>No courses found.</p>
                    ) : popularCourses.map(course => (
                        <div className="popular-card" key={course.id} onClick={() => navigate(`/course/${course.id}`)}>
                            <div className="pop-card-image" style={{ padding: (course.imageUrl || course.image) ? 0 : '', overflow: 'hidden' }}>
                                {(course.imageUrl || course.image) && (
                                    <img src={getImageUrl(course.imageUrl || course.image)} alt={course.name || course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                                )}
                                <div className="pop-play-circle">
                                    <PlayArrowIcon />
                                </div>
                            </div>
                            <div className="pop-card-footer">
                                <h4>{course.name || course.title}</h4>
                                <div className="pop-card-meta">
                                    <span>{course.instructor || "Instructor"}</span>
                                    <span>{course.price ? `$${course.price}` : "Free"}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ 3. Facilities (Dark Section) ═══ */}
            <section className="home-full-width facilities-section">
                <div className="facilities-container">
                    <div className="section-header-row">
                        <h2>Facilities</h2>
                        <button className="see-more-btn light" onClick={() => navigate('/facilities')}>see more</button>
                    </div>
                    <div className="facilities-cards-row">
                        {loading ? (
                            <p style={{ padding: "20px" }}>Loading facilities...</p>
                        ) : facilitiesState.length === 0 ? (
                            <p style={{ padding: "20px" }}>No facilities found.</p>
                        ) : facilitiesState.map(fac => {
                            const facImage = fac.image || fac.Image || fac.imageUrl || fac.ImageUrl || fac.imagePath || fac.ImagePath || fac.logo || fac.Logo || fac.picture || fac.Picture;
                            return (
                                <div className="facility-card" key={fac.id || fac.Id} onClick={() => navigate(`/facility/${fac.id || fac.Id}`)}>
                                    <div className="fac-icon-box" style={{ padding: facImage ? 0 : '', overflow: 'hidden' }}>
                                        {facImage ? (
                                            <img src={getImageUrl(facImage)} alt={fac.name || fac.Name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <LandscapeIcon />
                                        )}
                                    </div>
                                    <h3>{fac.name || fac.Name || fac.title}</h3>
                                    <p className="fac-subtitle">{fac.type || fac.Type || fac.subtitle || "Training Institute"}</p>
                                    <p className="fac-desc">{fac.desc || fac.description || fac.Description || "A creative learning hub."}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ 4. My Learning ═══ */}
            {localStorage.getItem("token") && myLearning.length > 0 && (
                <section className="home-section my-learning-section">
                    <div className="section-header-row">
                        <h2>My Learning</h2>
                        <button className="see-more-btn" onClick={() => navigate('/my-courses')}>see more</button>
                    </div>
                    <div className="learning-cards-row">
                        {myLearning.slice(0, 4).map((course, idx) => {
                            const imageUrl = getImageUrl(course.courseImage);
                            return (
                                <div className="learning-card" key={course.enrollmentId} onClick={() => navigate(`/watch/${course.courseId}`)}>
                                    <div className="lc-image" style={{ background: imageUrl ? 'none' : `linear-gradient(135deg, #3b82f6, #8b5cf6)` }}>
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={course.courseName} className="my-course-img" />
                                        ) : (
                                            <div className="lc-play-overlay">
                                                <PlayCircleIcon />
                                            </div>
                                        )}
                                        {idx === 0 && (
                                            <div className="lc-badge-overlay">
                                                <span className="lc-badge-tag">Continue Learning</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="lc-body">
                                        <h4>{course.courseName}</h4>
                                        <div className="lc-meta-row">
                                            <span>{course.instructorName || "Instructor"}</span>
                                            <span>{course.totalLessons || 0} Lessons</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}






            {/* ═══ 7. Footer ═══ */}
            <footer className="home-footer">
                <div className="footer-logo">LOGO</div>
                <div className="footer-links">
                    <a href="#">FAQS</a>
                    <a href="#">CONTACT US</a>
                    <a href="#">ZUMRA FOUNDERS</a>
                </div>
                <div className="footer-social">
                    <a href="#"><FacebookIcon /></a>
                    <a href="#"><InstagramIcon /></a>
                    <a href="#"><XIcon /></a>
                </div>
            </footer>

        </div>
    );
}
