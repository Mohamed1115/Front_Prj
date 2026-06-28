import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyCoursesPage.css";
import { getMyEnrollments, getImageUrl } from "../services/Api";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import SchoolIcon from "@mui/icons-material/School";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";

const tabs = [
    { id: "all", label: "All Courses" },
];

export default function MyCoursesPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchMyCourses() {
            try {
                setLoading(true);
                setError(null);
                const res = await getMyEnrollments();
                if (res && res.success) {
                    setCourses(res.data || []);
                } else {
                    setError("Failed to load your courses");
                }
            } catch (err) {
                console.error(err);
                setError(err.message || "An error occurred while fetching courses");
            } finally {
                setLoading(false);
            }
        }
        fetchMyCourses();
    }, []);

    const filteredCourses = courses.filter((course) => {
        // Since backend does not track progress percentages yet, we default to 0.
        // If progress is 100, we mark as completed, otherwise in-progress.
        const progress = course.progress || 0;
        const status = progress === 100 ? "completed" : "in-progress";

        if (activeTab === "all") return true;
        return status === activeTab;
    });

    return (
        <div className="my-courses-page">
            {/* Header */}
            <div className="my-courses-header">
                <h1>My Learning</h1>
                <p>Track your learning progress and access your enrolled courses</p>
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

            {/* Error State */}
            {error && (
                <div style={{ padding: "0 5% 20px", color: "#dc2626", fontWeight: "500" }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div style={{ padding: "80px 0", textAlign: "center", color: "#6b7280" }}>
                    <div style={{
                        display: "inline-block",
                        width: "40px",
                        height: "40px",
                        border: "4px solid rgba(0,0,0,0.1)",
                        borderTopColor: "var(--btn-primary-bg, #1a1a1a)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }} />
                    <p style={{ marginTop: "16px", fontSize: "0.95rem" }}>Loading your courses...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : (
                /* Courses Grid */
                filteredCourses.length > 0 ? (
                    <div className="my-courses-grid">
                        {filteredCourses.map((course) => {
                            const imageUrl = getImageUrl(course.courseImage);
                            return (
                                <div
                                    className="my-course-card"
                                    key={course.enrollmentId}
                                    onClick={() => navigate(`/watch/${course.courseId}`)}
                                >
                                    <div className="my-course-card-image">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={course.courseName} className="my-course-img" />
                                        ) : (
                                            <LandscapeIcon />
                                        )}
                                    </div>
                                    <div className="my-course-card-body">
                                        <h3 className="my-course-card-title">{course.courseName}</h3>
                                        <p className="my-course-card-instructor">👤 {course.instructorName || "Instructor"}</p>
                                    </div>
                                </div>
                            );
                        })}
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
                )
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
            </footer>
        </div>
    );
}
