import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

// MUI Icons
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupsIcon from "@mui/icons-material/Groups";
import LandscapeIcon from "@mui/icons-material/Landscape";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import SkipNextIcon from "@mui/icons-material/SkipNext";

// ─── Mock Data ───────────────────────────────────────────
const popularCourses = [
    { id: 1, title: "Flutter Course", instructor: "Amr Ahmed", price: "$199" },
    { id: 2, title: "Backend Course", instructor: "Amr Ahmed", price: "$199" },
    { id: 3, title: "Frontend Course", instructor: "Amr Ahmed", price: "$199" },
    { id: 4, title: "UI/UX Design Course", instructor: "Amr Ahmed", price: "$199" },
];

const facilities = [
    {
        id: "zumra",
        name: "ZUMRA",
        description:
            "Powerful e-learning platform serving all educational needs. Manage courses, batches, groups, and track student progress with our comprehensive LMS.",
    },
    {
        id: "iti",
        name: "ITI",
        description:
            "Industrial training institute providing hands-on courses. Integrated platforms for course delivery, tracking, and certification management.",
    },
    {
        id: "udemy",
        name: "Udemy",
        description:
            "Global marketplace for learning and instruction. Browse thousands of courses and get hands-on practice with real-world projects.",
    },
];

const myLearningCourses = [
    { id: 1, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", isPlaying: true },
    { id: 2, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", isPlaying: false },
    { id: 3, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", isPlaying: false },
    { id: 4, title: "Complete Drawing Course: Ultimate Graphic Art with Pencil", isPlaying: false },
];

// ─── Component ───────────────────────────────────────────
export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            {/* ═══ Welcome Section ═══ */}
            <section className="welcome-section">
                <p className="welcome-greeting">
                    Welcome back, <span>Amr</span>
                </p>
                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-icon streak">
                            <LocalFireDepartmentIcon />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Current Streak</span>
                            <span className="stat-value">🔥 7 Days</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon lessons">
                            <MenuBookIcon />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Lessons completed</span>
                            <span className="stat-value">80 · 150 Min spent</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon groups">
                            <GroupsIcon />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Group classes</span>
                            <span className="stat-value">12 Active</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Most Popular ═══ */}
            <div className="section-header">
                <h2 className="section-title">Most Popular</h2>
                <button className="see-all-btn">See all →</button>
            </div>
            <div className="courses-scroll-container">
                <div className="courses-row">
                    {popularCourses.map((course) => (
                        <div className="course-card" key={course.id} onClick={() => navigate(`/course/${course.id}`)}>
                            <div className="course-card-image">
                                <LandscapeIcon />
                            </div>
                            <div className="course-card-body">
                                <h3 className="course-card-title">{course.title}</h3>
                                <p className="course-card-instructor">👤 {course.instructor}</p>
                                <span className="course-card-price">{course.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ Facilities ═══ */}
            <div className="section-header">
                <h2 className="section-title">Facilities</h2>
            </div>
            <div className="facilities-grid">
                {facilities.map((facility) => (
                    <div className="facility-card" key={facility.id} onClick={() => navigate(`/facility/${facility.id}`)}>
                        <div className="facility-icon">
                            <SchoolIcon />
                        </div>
                        <h3 className="facility-name">{facility.name}</h3>
                        <p className="facility-description">{facility.description}</p>
                    </div>
                ))}
            </div>

            {/* ═══ My Learning ═══ */}
            <div className="section-header">
                <h2 className="section-title">My Learning</h2>
                <button className="see-all-btn">See all →</button>
            </div>
            <div className="learning-scroll-container">
                <div className="learning-row">
                    {myLearningCourses.map((course) => (
                        <div className="learning-card" key={course.id} onClick={() => navigate(`/course/${course.id}`)}>
                            <div className="learning-card-image">
                                <LandscapeIcon style={{ color: "#4b5563", fontSize: 40 }} />
                                <div className="play-overlay">
                                    <PlayArrowIcon />
                                </div>
                                <button className="close-btn">
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="learning-card-body">
                                <p className="learning-card-title">{course.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ Video Player ═══ */}
            <section className="video-player-section">
                <div className="video-thumbnail">
                    <PlayArrowIcon />
                </div>
                <div className="video-info">
                    <h3 className="video-title">Complete Drawing Course: Ultimate Drawing Art with Pencil</h3>
                    <p className="video-subtitle">Practice: Draw Face with Pencil</p>
                    <div className="video-progress-bar">
                        <div className="video-progress-fill" style={{ width: "45%" }}></div>
                    </div>
                </div>
                <div className="video-actions">
                    <button className="video-action-btn">
                        <FavoriteIcon />
                    </button>
                    <button className="video-action-btn">
                        <ShareIcon />
                    </button>
                    <button className="video-action-btn">
                        <SkipNextIcon />
                    </button>
                </div>
            </section>

            {/* ═══ Footer ═══ */}
            <footer className="home-footer">
                <div className="footer-logo">ZUMRA</div>
                <div className="footer-links">
                    <a className="footer-link" href="#">FAQS</a>
                    <a className="footer-link" href="#">CONTACT US</a>
                    <a className="footer-link" href="#">PRIVACY POLICY</a>
                </div>
                <p className="footer-copyright">© 2026 Zumra. All rights reserved.</p>
            </footer>
        </div>
    );
}
