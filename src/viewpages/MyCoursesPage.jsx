import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyCoursesPage.css";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import SchoolIcon from "@mui/icons-material/School";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";

// ─── Mock Data ───────────────────────────────────────────
const myCourses = [
    { id: 1, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", instructor: "Jane Cooper", progress: 65, status: "in-progress" },
    { id: 2, title: "Flutter Development Bootcamp", instructor: "Amr Ahmed", progress: 30, status: "in-progress" },
    { id: 3, title: "Frontend Web Development with React", instructor: "Amr Ahmed", progress: 100, status: "completed" },
    { id: 4, title: "UI/UX Design Masterclass", instructor: "Jane Cooper", progress: 100, status: "completed" },
    { id: 5, title: "Backend Development with Node.js", instructor: "Amr Ahmed", progress: 10, status: "in-progress" },
    { id: 6, title: "Digital Marketing Strategy", instructor: "Sara Ali", progress: 45, status: "in-progress" },
];

const tabs = [
    { id: "all", label: "All Courses" },
    { id: "in-progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
];

// ─── Component ───────────────────────────────────────────
export default function MyCoursesPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all");

    const filteredCourses = activeTab === "all"
        ? myCourses
        : myCourses.filter((c) => c.status === activeTab);

    return (
        <div className="my-courses-page">
            {/* Header */}
            <div className="my-courses-header">
                <h1>My Courses</h1>
                <p>Track your learning progress</p>
            </div>

            {/* Tabs */}
            <div className="my-courses-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`my-courses-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
                <div className="my-courses-grid">
                    {filteredCourses.map((course) => (
                        <div
                            className="my-course-card"
                            key={course.id}
                            onClick={() => navigate(`/watch/${course.id}`)}
                        >
                            <div className="my-course-card-image">
                                <LandscapeIcon />
                                <span className="my-course-progress-badge">
                                    {course.progress}%
                                </span>
                            </div>
                            <div className="my-course-card-body">
                                <h3 className="my-course-card-title">{course.title}</h3>
                                <p className="my-course-card-instructor">👤 {course.instructor}</p>
                                <div className="my-course-progress-bar">
                                    <div
                                        className="my-course-progress-fill"
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                                <span className="my-course-progress-text">
                                    {course.progress}% completed
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="my-courses-empty">
                    <SchoolIcon />
                    <h3>No courses yet</h3>
                    <p>Start learning by browsing our course catalog</p>
                    <button className="browse-courses-btn" onClick={() => navigate("/courses")}>
                        Browse Courses
                    </button>
                </div>
            )}

            {/* Footer */}
            <footer className="my-courses-footer">
                <div className="footer-logo">LOGO</div>
                <div className="footer-links">
                    <a className="footer-link" href="#">FAQS</a>
                    <a className="footer-link" href="#">CONTACT US</a>
                    <a className="footer-link" href="#">ZUMRA FOUNDERS</a>
                </div>
                <div className="footer-social">
                    <a href="#" className="social-icon"><FacebookIcon /></a>
                    <a href="#" className="social-icon"><InstagramIcon /></a>
                    <a href="#" className="social-icon"><XIcon /></a>
                </div>
                <p className="footer-copyright">©Copyrights 2026</p>
            </footer>
        </div>
    );
}
