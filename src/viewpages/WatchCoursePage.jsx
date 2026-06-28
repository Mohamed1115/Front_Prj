import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./WatchCoursePage.css";
import { getWatchCourseData, getImageUrl, submitTask, getTaskSubmission } from "../services/Api";

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
import SchoolIcon from "@mui/icons-material/School";

export default function WatchCoursePage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeContent, setActiveContent] = useState(null); // { type: "Lesson" | "Task", data: object }
    const [openSections, setOpenSections] = useState([0]); // Open first section by default
    const [activeTab, setActiveTab] = useState("overview");

    const [submissionUrl, setSubmissionUrl] = useState("");
    const [submissionData, setSubmissionData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingSubmission, setFetchingSubmission] = useState(false);

    useEffect(() => {
        async function fetchWatchData() {
            try {
                setLoading(true);
                setError(null);
                const res = await getWatchCourseData(courseId);
                if (res && res.success) {
                    setCourse(res.data);
                    
                    // Set active content to the first lesson/task in the first section
                    const firstSection = res.data.sections?.[0];
                    const firstContent = firstSection?.contents?.[0];
                    if (firstContent) {
                        if (firstContent.type === "Lesson" && firstContent.lesson) {
                            setActiveContent({ type: "Lesson", data: firstContent.lesson });
                        } else if (firstContent.type === "Task" && firstContent.task) {
                            setActiveContent({ type: "Task", data: firstContent.task });
                        }
                    }
                    
                    // Open sections by default
                    if (res.data.sections && res.data.sections.length > 0) {
                        setOpenSections(res.data.sections.map((_, i) => i));
                    }
                } else {
                    setError("Failed to load course details");
                }
            } catch (err) {
                console.error(err);
                setError(err.message || "An error occurred while loading this course");
            } finally {
                setLoading(false);
            }
        }
        fetchWatchData();
    }, [courseId]);

    useEffect(() => {
        if (activeContent && activeContent.type === "Task") {
            async function fetchSubmission() {
                try {
                    setFetchingSubmission(true);
                    setSubmissionUrl("");
                    setSubmissionData(null);
                    const res = await getTaskSubmission(activeContent.data.id);
                    if (res && res.success && res.data) {
                        setSubmissionData(res.data);
                        setSubmissionUrl(res.data.submissionUrl || "");
                    }
                } catch (err) {
                    console.error("Error fetching task submission:", err);
                } finally {
                    setFetchingSubmission(false);
                }
            }
            fetchSubmission();
        }
    }, [activeContent]);

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        if (!submissionUrl.trim()) return;
        try {
            setSubmitting(true);
            const res = await submitTask(activeContent.data.id, submissionUrl);
            if (res && res.success) {
                // Refresh submission data
                const resSub = await getTaskSubmission(activeContent.data.id);
                if (resSub && resSub.success && resSub.data) {
                    setSubmissionData(resSub.data);
                }
                alert("Task submitted successfully!");
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to submit task");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSection = (idx) => {
        setOpenSections(prev => 
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const totalLessons = course?.sections?.reduce((sum, s) => {
        const lessonsCount = s.contents?.filter(c => c.type === "Lesson").length || 0;
        return sum + lessonsCount;
    }, 0) || 0;

    const completedCount = 0; // Defaulting to 0 since completion tracking is not fully implemented on backend
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "qa", label: "Q&A" },
        { id: "notes", label: "Notes" },
        { id: "announcements", label: "Announcements" },
    ];

    const instructorInfo = {
        name: course?.instructorName || "Instructor",
        title: "eCommerce & Entrepreneurship made simple.",
        bio: "Dedicated to making high-quality education affordable and accessible. Experience in teaching both technical and creative skills.",
        rating: 4.8,
        reviews: 225,
        students: 41784,
        courses: 12
    };

    const staticReviews = [
        { id: 1, name: "Anna Smith", rating: 5, content: "The instructor really knows the subject and makes learning so easy. Best course ever!" },
        { id: 2, name: "John Doe", rating: 4, content: "Very detailed, step by step process. Highly recommended." },
    ];

    if (loading) {
        return (
            <div style={{ padding: "120px 0", textAlign: "center", color: "#6b7280", minHeight: "80vh" }}>
                <div style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    border: "4px solid rgba(0,0,0,0.1)",
                    borderTopColor: "var(--btn-primary-bg, #1a1a1a)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }} />
                <p style={{ marginTop: "16px", fontSize: "0.95rem" }}>Loading course content...</p>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "80px 5%", textAlign: "center", minHeight: "80vh" }}>
                <h2 style={{ color: "#dc2626", marginBottom: "16px" }}>⚠️ Error loading course</h2>
                <p style={{ color: "#4b5563", marginBottom: "24px" }}>{error}</p>
                <button 
                    style={{
                        padding: "12px 28px",
                        background: "var(--btn-primary-bg, #1a1a1a)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }} 
                    onClick={() => navigate("/my-learning")}
                >
                    Back to My Learning
                </button>
            </div>
        );
    }

    return (
        <div className="watch-course-page">
            <div className="watch-course-layout">
                
                {/* ═══ Main Left Column (Video & Content) ═══ */}
                <div className="watch-main-col">
                    <div className="watch-breadcrumb">
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/my-learning')}>My Learning</span> 
                        {" > "} {course?.title}
                        {activeContent && ` > ${activeContent.data.name || activeContent.data.title}`}
                    </div>

                    {/* Video Player Box / Task Area */}
                    <div className="watch-video-container" style={activeContent && activeContent.type === "Task" ? { height: 'auto', aspectRatio: 'auto', overflow: 'visible', background: 'transparent', boxShadow: 'none' } : {}}>
                        {activeContent ? (
                            activeContent.type === "Lesson" ? (
                                activeContent.data.type === "Live" ? (
                                    <div className="watch-live-container">
                                        <div className="watch-live-badge">🔴 Live Session</div>
                                        <h2 className="watch-live-title">{activeContent.data.name}</h2>
                                        <p className="watch-live-time">
                                            Starts: {activeContent.data.live?.startTime ? new Date(activeContent.data.live.startTime).toLocaleString() : "TBD"}
                                        </p>
                                        {activeContent.data.live?.meetingUrl ? (
                                            <button 
                                                className="watch-live-btn"
                                                onClick={() => window.open(activeContent.data.live.meetingUrl, "_blank")}
                                            >
                                                Join Live Class
                                            </button>
                                        ) : (
                                            <p style={{ color: "#cbd5e1" }}>Meeting link not generated yet.</p>
                                        )}
                                    </div>
                                ) : (
                                    activeContent.data.rec?.videoUrl ? (
                                        <iframe
                                            src={activeContent.data.rec.videoUrl}
                                            loading="lazy"
                                            className="watch-video-iframe"
                                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                            allowFullScreen={true}
                                            title={activeContent.data.name}
                                        />
                                    ) : (
                                        <div style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>
                                            <LandscapeIcon style={{ fontSize: 100, color: "#9ca3af", marginBottom: "16px" }} />
                                            <p>No video file has been uploaded for this lesson yet.</p>
                                        </div>
                                    )
                                )
                            ) : (
                                /* Task */
                                <div className="watch-task-container" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '3rem 2rem',
                                    background: 'var(--card-bg, #ffffff)',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    maxWidth: '650px',
                                    margin: '0 auto',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: activeContent.data.type === "Form" ? '#ecfdf5' : '#eff6ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <SchoolIcon style={{ fontSize: 45, color: activeContent.data.type === "Form" ? "#059669" : "#3b82f6" }} />
                                    </div>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '30px',
                                        background: activeContent.data.type === "Form" ? '#d1fae5' : '#dbeafe',
                                        color: activeContent.data.type === "Form" ? '#065f46' : '#1e40af',
                                        marginBottom: '1rem',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {activeContent.data.type === "Form" ? "Google Form" : "Link Submission"}
                                    </span>
                                    <h2 className="watch-task-title" style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                        {activeContent.data.title}
                                    </h2>
                                    {activeContent.data.description && (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.5rem 0 1rem 0', maxWidth: '480px', lineHeight: '1.5' }}>
                                            {activeContent.data.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', margin: '1rem 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <span>🏆 <strong>Max Score:</strong> {activeContent.data.maxScore || "100"}</span>
                                        {activeContent.data.deadline && (
                                            <span>📅 <strong>Deadline:</strong> {new Date(activeContent.data.deadline).toLocaleDateString()}</span>
                                        )}
                                    </div>

                                    {activeContent.data.type === "Form" ? (
                                        <div style={{ width: '100%' }}>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                                This assignment is hosted on Google Forms. Click the button below to open and fill the form.
                                            </p>
                                            <button 
                                                onClick={() => window.open(activeContent.data.formUrl, "_blank")}
                                                className="btn-primary"
                                                style={{
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.75rem 2rem',
                                                    borderRadius: '10px',
                                                    fontWeight: '600',
                                                    fontSize: '1rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                            >
                                                Go to Google Form
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ width: '100%', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                            {fetchingSubmission ? (
                                                <p style={{ color: 'var(--text-secondary)' }}>Loading submission details...</p>
                                            ) : (
                                                <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch', width: '100%', maxWidth: '450px', margin: '0 auto' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                                                            Submission Link
                                                        </label>
                                                        <input 
                                                            type="url"
                                                            required
                                                            placeholder="Paste your solution link (e.g. Google Drive, GitHub)"
                                                            value={submissionUrl}
                                                            onChange={(e) => setSubmissionUrl(e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.75rem 1rem',
                                                                borderRadius: '10px',
                                                                border: '1px solid var(--border-color)',
                                                                fontSize: '0.95rem',
                                                                background: 'var(--bg-primary)',
                                                                color: 'var(--text-primary)',
                                                                boxSizing: 'border-box'
                                                            }}
                                                        />
                                                    </div>
                                                    <button 
                                                        type="submit"
                                                        disabled={submitting}
                                                        className="btn-primary"
                                                        style={{
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.75rem 1.5rem',
                                                            borderRadius: '10px',
                                                            fontWeight: '600',
                                                            fontSize: '0.95rem',
                                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                                            opacity: submitting ? 0.7 : 1,
                                                            transition: 'all 0.2s',
                                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                                                        }}
                                                    >
                                                        {submitting ? "Submitting..." : (submissionData ? "Resubmit Solution Link" : "Submit Solution")}
                                                    </button>

                                                    {submissionData && (
                                                        <div style={{
                                                            marginTop: '1.25rem',
                                                            padding: '1rem',
                                                            borderRadius: '12px',
                                                            background: '#f8fafc',
                                                            border: '1px solid #e2e8f0',
                                                            textAlign: 'left'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Your Submission:</span>
                                                                <span style={{
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '600',
                                                                    padding: '0.15rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    background: submissionData.status === "Late" ? '#ffedd5' : '#dcfce7',
                                                                    color: submissionData.status === "Late" ? '#c2410c' : '#15803d'
                                                                }}>
                                                                    {submissionData.status || "Submitted"}
                                                                </span>
                                                            </div>
                                                            <a href={submissionData.submissionUrl} target="_blank" rel="noopener noreferrer" style={{
                                                                fontSize: '0.85rem',
                                                                color: '#3b82f6',
                                                                textDecoration: 'underline',
                                                                wordBreak: 'break-all',
                                                                display: 'block',
                                                                marginBottom: '0.5rem'
                                                            }}>
                                                                {submissionData.submissionUrl}
                                                            </a>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                Submitted at: {new Date(submissionData.submissionAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div style={{ textAlign: "center", color: "#6b7280" }}>
                                <LandscapeIcon style={{ fontSize: 100, color: "#9ca3af" }} />
                                <p>Select a lesson from the playlist to start learning</p>
                            </div>
                        )}
                    </div>

                    <h1 className="watch-video-title">{course?.title}</h1>
                    <div className="watch-video-meta">
                        <span className="watch-video-instructor">👤 {course?.instructorName || "Instructor"}</span>
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
                                    <p className="watch-about-text">{course?.description || "No description provided."}</p>
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
                            <div className="watch-progress-text">{completedCount} / {totalLessons} lessons completed</div>
                            <div className="watch-progress-bar">
                                <div className="watch-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>

                        <div className="watch-playlist-accordion">
                            {course?.sections?.map((section, sIdx) => (
                                <div className="wp-section-item" key={section.id}>
                                    
                                    <button 
                                        className="wp-section-header"
                                        onClick={() => toggleSection(sIdx)}
                                    >
                                        <div>
                                            <div className="wp-section-title">Section {sIdx + 1}: {section.name}</div>
                                            <div className="wp-section-meta">
                                                {section.contents?.length || 0} items
                                            </div>
                                        </div>
                                        {openSections.includes(sIdx) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </button>

                                    {openSections.includes(sIdx) && (
                                        <div className="wp-lessons-list">
                                            {section.contents?.map((content) => {
                                                if (content.type === "Lesson" && content.lesson) {
                                                    const lesson = content.lesson;
                                                    const isActive = activeContent?.type === "Lesson" && activeContent.data.id === lesson.id;
                                                    return (
                                                        <div 
                                                            className={`wp-lesson-item ${isActive ? "active" : ""}`}
                                                            key={`lesson-${lesson.id}`}
                                                            onClick={() => setActiveContent({ type: "Lesson", data: lesson })}
                                                        >
                                                            <div className="wp-lesson-icon">
                                                                <PlayCircleOutlineIcon fontSize="small" style={{ color: "#9ca3af" }} />
                                                            </div>
                                                            <div className="wp-lesson-details">
                                                                <div className="wp-lesson-title">{lesson.name}</div>
                                                                <div className="wp-lesson-duration">
                                                                    {lesson.type === "Live" ? "🔴 Live Class" : "📹 Recorded Video"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                } else if (content.type === "Task" && content.task) {
                                                    const task = content.task;
                                                    const isActive = activeContent?.type === "Task" && activeContent.data.id === task.id;
                                                    return (
                                                        <div 
                                                            className={`wp-lesson-item ${isActive ? "active" : ""}`}
                                                            key={`task-${task.id}`}
                                                            onClick={() => setActiveContent({ type: "Task", data: task })}
                                                        >
                                                            <div className="wp-lesson-icon">
                                                                <SchoolIcon fontSize="small" style={{ color: "#9ca3af" }} />
                                                            </div>
                                                            <div className="wp-lesson-details">
                                                                <div className="wp-lesson-title">📝 Task: {task.title}</div>
                                                                <div className="wp-lesson-duration">
                                                                    Max Score: {task.maxScore || "N/A"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
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
