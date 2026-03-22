import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./WatchCoursePage.css";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RateReviewIcon from "@mui/icons-material/RateReview";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Mock Data
const courseData = {
    title: "Complete Drawing Course: Ultimate Drawing Art with Pencil",
    instructor: "Jane Cooper",
    totalLessons: 12,
    sections: [
        {
            title: "Getting Started",
            duration: "15m",
            lessons: [
                { id: 1, name: "Introduction to the course", duration: "03:27", completed: true },
                { id: 2, name: "Setting up your workspace", duration: "04:39", completed: true },
                { id: 3, name: "Understanding basic shapes", duration: "06:55", completed: false },
            ],
        },
        {
            title: "Fundamentals of Drawing",
            duration: "25m",
            lessons: [
                { id: 4, name: "Light, shadow, and perspective", duration: "06:41", completed: false },
                { id: 5, name: "Working with proportions", duration: "07:51", completed: false },
                { id: 6, name: "Creating depth in your drawings", duration: "10:42", completed: false },
            ],
        },
        {
            title: "Advanced Techniques",
            duration: "30m",
            lessons: [
                { id: 7, name: "Drawing people and faces", duration: "08:15", completed: false },
                { id: 8, name: "Expressing emotions through art", duration: "04:15", completed: false },
                { id: 9, name: "Digital tools: Procreate & Photoshop", duration: "12:30", completed: false },
                { id: 10, name: "Building your portfolio", duration: "06:45", completed: false },
            ],
        },
    ],
    about: "Learn the fundamentals of drawing from scratch and develop your artistic skills step by step. This course covers everything from basic shapes, proportions, and perspective to light, shadow, and color theory — helping you transform simple sketches into professional artworks.",
    instructorInfo: {
        name: "Jane Cooper",
        title: "eCommerce & Entrepreneurship made simple.",
        bio: "Jane runs a successful eCommerce Business, creates content and courses to educate aspiring creators, and loves reading books. She is dedicated to making high-quality education affordable and accessible.",
        rating: 4.8,
        reviews: 225,
        students: 41784,
        courses: 12
    },
    reviews: [
        { id: 1, name: "Anna Smith", rating: 5, content: "The instructor really knows the subject and makes learning so easy. Best drawing course ever!" },
        { id: 2, name: "John Doe", rating: 4, content: "Very detailed, step by step process. I improved my shading drastically." },
    ]
};

export default function WatchCoursePage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [activeLesson, setActiveLesson] = useState(3);
    const [openSections, setOpenSections] = useState([0, 1]); // Open first 2 sections
    const [activeTab, setActiveTab] = useState("overview");

    const toggleSection = (idx) => {
        setOpenSections(prev => 
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const completedCount = courseData.sections
        .flatMap(s => s.lessons)
        .filter(l => l.completed).length;
    
    const progressPercent = Math.round((completedCount / courseData.totalLessons) * 100);

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "qa", label: "Q&A" },
        { id: "notes", label: "Notes" },
        { id: "announcements", label: "Announcements" },
    ];

    return (
        <div className="watch-course-page">
            <div className="watch-course-layout">
                
                {/* ═══ Main Left Column (Video & Content) ═══ */}
                <div className="watch-main-col">
                    <div className="watch-breadcrumb">
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/courses')}>Courses</span> 
                        {" > "} Drawing {" > "} Lesson 3
                    </div>

                    {/* Video Player Box */}
                    <div className="watch-video-container">
                        <LandscapeIcon style={{ fontSize: 100, color: "#9ca3af" }} />
                        <div className="watch-video-overlay">
                            <PlayCircleOutlineIcon style={{ fontSize: 80, color: "#fff" }} />
                        </div>
                        <div className="watch-video-controls">
                            <span>06:55 / 10:42</span>
                            <span>⚙️ 1080p 🔲</span>
                        </div>
                    </div>

                    <h1 className="watch-video-title">{courseData.title}</h1>
                    <div className="watch-video-meta">
                        <span className="watch-video-instructor">👩‍🏫 {courseData.instructor}</span>
                        <span>⭐ 4.8 Rating</span>
                    </div>

                    {/* Tabs under Video */}
                    <div className="watch-tabs-row">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`watch-tab ${activeTab === tab.id ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content Areas */}
                    <div className="watch-tab-content">
                        {activeTab === "overview" && (
                            <>
                                {/* About Section */}
                                <section>
                                    <h3 className="watch-section-title">About this course</h3>
                                    <p className="watch-about-text">{courseData.about}</p>
                                </section>

                                {/* Instructor Section */}
                                <section>
                                    <h3 className="watch-section-title">Instructor</h3>
                                    <div className="watch-instructor-card">
                                        <div className="watch-inst-avatar">
                                            <LandscapeIcon />
                                        </div>
                                        <div className="watch-inst-info">
                                            <h4>{courseData.instructorInfo.name}</h4>
                                            <p className="title">{courseData.instructorInfo.title}</p>
                                            <p className="bio">{courseData.instructorInfo.bio}</p>
                                            <div className="watch-inst-stats">
                                                <div className="watch-inst-stat"><RateReviewIcon fontSize="small"/> {courseData.instructorInfo.reviews} Reviews</div>
                                                <div className="watch-inst-stat"><StarIcon fontSize="small" style={{color: '#f59e0b'}}/> {courseData.instructorInfo.rating} Rating</div>
                                                <div className="watch-inst-stat"><PeopleIcon fontSize="small"/> {courseData.instructorInfo.students.toLocaleString()} Students</div>
                                                <div className="watch-inst-stat"><MenuBookIcon fontSize="small"/> {courseData.instructorInfo.courses} Courses</div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Reviews Section */}
                                <section>
                                    <h3 className="watch-section-title">Reviews</h3>
                                    <div className="watch-reviews-list">
                                        {courseData.reviews.map(review => (
                                            <div className="watch-review-item" key={review.id}>
                                                <AccountCircleIcon className="watch-review-avatar" />
                                                <div className="watch-review-content">
                                                    <h5>{review.name}</h5>
                                                    <div className="watch-review-rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon 
                                                                key={i} 
                                                                fontSize="small"
                                                                style={{ color: i < review.rating ? "#f59e0b" : "#e5e7eb", fontSize: "16px" }} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <p>"{review.content}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                        
                        {activeTab === "qa" && <p>Q&A placeholder ...</p>}
                        {activeTab === "notes" && <p>Notes placeholder ...</p>}
                        {activeTab === "announcements" && <p>Announcements placeholder ...</p>}
                    </div>

                </div>

                {/* ═══ Right Sidebar (Course Content) ═══ */}
                <aside className="watch-sidebar-col">
                    <div className="watch-sidebar-card">
                        
                        <div className="watch-sidebar-header">
                            <h3>Course Content</h3>
                            <div className="watch-progress-text">{completedCount} / {courseData.totalLessons} lessons completed</div>
                            <div className="watch-progress-bar">
                                <div className="watch-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>

                        <div className="watch-playlist-accordion">
                            {courseData.sections.map((section, sIdx) => (
                                <div className="wp-section-item" key={sIdx}>
                                    
                                    <button 
                                        className="wp-section-header"
                                        onClick={() => toggleSection(sIdx)}
                                    >
                                        <div>
                                            <div className="wp-section-title">Section {sIdx + 1}: {section.title}</div>
                                            <div className="wp-section-meta">{section.lessons.length} lessons • {section.duration}</div>
                                        </div>
                                        {openSections.includes(sIdx) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </button>

                                    {openSections.includes(sIdx) && (
                                        <div className="wp-lessons-list">
                                            {section.lessons.map(lesson => (
                                                <div 
                                                    className={`wp-lesson-item ${activeLesson === lesson.id ? "active" : ""} ${lesson.completed ? "completed" : ""}`}
                                                    key={lesson.id}
                                                    onClick={() => setActiveLesson(lesson.id)}
                                                >
                                                    <div className="wp-lesson-icon">
                                                        {lesson.completed ? (
                                                            <CheckCircleIcon fontSize="small" style={{ color: "#22c55e" }} />
                                                        ) : (
                                                            <PlayCircleOutlineIcon fontSize="small" style={{ color: "#9ca3af" }} />
                                                        )}
                                                    </div>
                                                    <div className="wp-lesson-details">
                                                        <div className="wp-lesson-title">{lesson.id}. {lesson.name}</div>
                                                        <div className="wp-lesson-duration">
                                                            <AccessTimeIcon style={{ fontSize: "12px" }} /> {lesson.duration}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>

                    </div>
                </aside>

            </div>
        </div>
    );
}
