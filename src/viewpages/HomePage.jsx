import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCourses, getAllFacilities, getImageUrl } from "../services/Api";
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const coursesData = await getAllCourses();
                const facilitiesData = await getAllFacilities();
                
                // Assuming data could be inside a 'data' property or it's an array itself
                const cArray = Array.isArray(coursesData) ? coursesData : (coursesData?.data || []);
                const fArray = Array.isArray(facilitiesData) ? facilitiesData : (facilitiesData?.data || []);

                setPopularCourses(cArray.slice(0, 4));
                setFacilitiesState(fArray.slice(0, 3));
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
                <h2 className="home-welcome-title">Welcome back, Amr!</h2>
                <div className="welcome-stat-badges">
                    <div className="stat-badge">
                        <div className="stat-badge-icon">
                            <LocalFireDepartmentIcon />
                        </div>
                        <div className="stat-badge-info">
                            <span className="stat-badge-label">Current Streak</span>
                            <span className="stat-badge-value">🔥🔥</span>
                        </div>
                    </div>
                    <div className="stat-badge">
                        <div className="stat-badge-icon">
                            <SchoolIcon />
                        </div>
                        <div className="stat-badge-info">
                            <span className="stat-badge-value"><strong>80</strong> Lessons completed</span>
                            <span className="stat-badge-value"><strong>150</strong> Minutes spent</span>
                        </div>
                    </div>
                    <div className="stat-badge">
                        <div className="stat-badge-icon">
                            <GroupsIcon />
                        </div>
                        <div className="stat-badge-info">
                            <span className="stat-badge-label">Group classes</span>
                            <span className="stat-badge-value">🏆</span>
                        </div>
                    </div>
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
                            <div className="pop-card-image">
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
                        <button className="see-more-btn light">see more</button>
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
            <section className="home-section my-learning-section">
                <div className="section-header-row">
                    <h2>My Learning</h2>
                    <button className="see-more-btn" onClick={() => navigate('/my-courses')}>see more</button>
                </div>
                <div className="learning-cards-row">
                    {learningCourses.map((course, idx) => (
                        <div className="learning-card" key={idx} onClick={() => navigate(`/watch/${course.id}`)}>
                            <div className="lc-image">
                                <LandscapeIcon />
                                <div className="lc-play-overlay">
                                    <PlayCircleIcon />
                                </div>
                                {idx === 0 && (
                                    <div className="lc-badge-overlay">
                                        <span className="lc-badge-tag">Start Learn</span>
                                        <span className="lc-badge-sub">(the Future of<br/>eCommerce)</span>
                                    </div>
                                )}
                            </div>
                            <div className="lc-body">
                                <h4>{course.title}</h4>
                                <div className="lc-meta-row">
                                    <span>{course.author}</span>
                                    <span>{course.lessons} Lessons</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>






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
                <p className="footer-copyright">©Copyrights 2026</p>
            </footer>

        </div>
    );
}
