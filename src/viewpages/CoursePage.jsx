import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, getFacilityById, getBatchSections, getImageUrl, enrollCourse, checkCourseEnrollmentStatus } from "../services/Api";
import "./CoursePage.css";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import DownloadIcon from "@mui/icons-material/Download";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AssignmentIcon from "@mui/icons-material/Assignment";

// ─── Mock Data Fallback ───────────────────────────────────────────
const mockCourseData = {
    title: "Complete Drawing Course:\nUltimate Drawing Art with Pencil",
    subtitle: "Unlock the future of Commerce — Where Creativity Meets Opportunity. Master shading, proportions, and character building from scratch to advanced level.",
    instructor: "Jane Cooper",
    language: "Arabic",
    price: "$250",
    oldPrice: "$350",
    whatYouLearn: [
        "How to draw from basic shapes to full illustrations",
        "How to find your unique drawing style",
        "Understanding light, shadow, and perspective",
        "Techniques for drawing people, faces, and emotions",
        "How to choose colors and create balanced compositions",
        "How to use digital tools (Procreate, Photoshop, etc.) effectively",
        "Turning simple sketches into digital art",
        "How to build a portfolio that attracts clients",
    ],
    courseIncludes: [
        { icon: "video", text: "1.5 hours on-demand video" },
        { icon: "download", text: "2 downloadable resources" },
        { icon: "mobile", text: "Access on mobile and TV" },
        { icon: "lifetime", text: "Full lifetime access" },
        { icon: "certificate", text: "Certificate of completion" },
    ],
    sections: [
        {
            title: "Getting Started with Drawing Tools",
            lessons: [
                { name: "How to draw from basic shapes", duration: "03:27" },
                { name: "Understanding light and shadow", duration: "04:39" },
                { name: "How to choose colors", duration: "06:55" },
                { name: "Turning simple sketches into art", duration: "03:43" },
                { name: "Finding your unique style", duration: "06:41" },
            ],
        },
        {
            title: "Advanced Portrait Drawing",
            lessons: [
                { name: "Drawing realistic eyes and lips", duration: "05:20" },
                { name: "Proportions of the human face", duration: "04:15" },
                { name: "Shading skin textures", duration: "08:10" },
            ],
        },
    ],
    facility: {
        name: "ZUMRA",
        description: "Our facility is a creative learning hub dedicated to empowering talent across multiple disciplines. We offer a wide range of professional courses.",
        reviews: 9225,
        rating: 4.9,
        students: 418784,
        courses: 30,
    },
    instructorInfo: {
        name: "Jane Cooper",
        title: "eCommerce & Entrepreneurship made simple.",
        bio: "Jane runs a successful eCommerce Business, creates content and courses to educate aspiring artists, and loves sharing knowledge with the community.",
        reviews: 225,
        rating: 4.2,
        students: 41784,
        courses: 12,
    },
    faqs: [
        { question: "What is ZUMRA?", answer: "ZUMRA is a creative learning hub dedicated to empowering talent across multiple disciplines." },
        { question: "What is included in the course?", answer: "Access to all course materials, assignments, and community support." },
        { question: "Where can I watch?", answer: "You can watch on any device — mobile, tablet, laptop, or TV." },
        { question: "Is this course right for me?", answer: "We offer courses for beginners to advanced levels across many creative fields." },
    ],
    reviews: [
        { name: "Anna Smith", rating: 5, text: "The instructor really knows the subject and makes learning so easy." },
        { name: "John Doe", rating: 4, text: "Great course, learned a lot about shading." },
        { name: "Emily Clark", rating: 5, text: "Highly recommended for beginners." },
    ],
};

// ─── Component ───────────────────────────────────────────
export default function CoursePage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("content");
    const [openSections, setOpenSections] = useState([0]);
    const [openFaqs, setOpenFaqs] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    const [apiCourse, setApiCourse] = useState(null);
    const [apiFacility, setApiFacility] = useState(null);
    const [apiSections, setApiSections] = useState(null);
    const [loading, setLoading] = useState(true);
    // "none" | "in_cart" | "owned"
    const [enrollmentStatus, setEnrollmentStatus] = useState("none");
    const [enrollStatusLoading, setEnrollStatusLoading] = useState(false);

    useEffect(() => {
        async function fetchCourse() {
            try {
                setLoading(true);
                const data = await getCourseById(courseId);
                const cData = Array.isArray(data) ? data[0] : (data?.data || data);
                setApiCourse(cData);

                if (cData?.facilityId) {
                    const facData = await getFacilityById(cData.facilityId);
                    setApiFacility(facData?.data || facData);
                }

                if (cData?.courseBatches?.length > 0) {
                    const bId = cData.courseBatches[0].id || cData.courseBatches[0].Id;
                    const secData = await getBatchSections(bId);
                    setApiSections(secData?.data || secData);

                    // Check enrollment status for this batch
                    try {
                        setEnrollStatusLoading(true);
                        const statusRes = await checkCourseEnrollmentStatus(bId);
                        setEnrollmentStatus(statusRes?.status || "none");
                    } catch {
                        setEnrollmentStatus("none");
                    } finally {
                        setEnrollStatusLoading(false);
                    }
                }

            } catch (error) {
                console.error("Failed to load course:", error);
            } finally {
                setLoading(false);
            }
        }
        if (courseId) {
            fetchCourse();
        } else {
            setLoading(false);
        }
    }, [courseId]);

    // Merge API data with mock variables to prevent UI from breaking
    const courseData = apiCourse ? {
        ...mockCourseData,
        title: apiCourse.title || apiCourse.name || apiCourse.Name || mockCourseData.title,
        subtitle: apiCourse.description || apiCourse.subtitle || apiCourse.Description || mockCourseData.subtitle,
        price: (apiCourse.cost || apiCourse.price || apiCourse.Cost) ? `$${apiCourse.cost || apiCourse.price || apiCourse.Cost}` : mockCourseData.price,
        oldPrice: apiCourse.oldPrice ? `$${apiCourse.oldPrice}` : mockCourseData.oldPrice,
        instructor: apiCourse.instructorName || apiCourse.instructor || mockCourseData.instructor,
        imageUrl: apiCourse.imageUrl || apiCourse.image || apiCourse.ImageUrl || apiCourse.Image,
        facility: apiFacility ? {
            ...mockCourseData.facility,
            name: apiFacility.name || apiFacility.Name || mockCourseData.facility.name,
            description: apiFacility.description || apiFacility.Description || mockCourseData.facility.description,
        } : mockCourseData.facility,
        sections: apiSections && Array.isArray(apiSections) && apiSections.length > 0 ? apiSections.map(s => ({
            title: s.name || s.Name || "Section",
            items: (s.contents || s.Contents || []).map(item => {
                const isLesson = item.type === 'Lesson' || item.Type === 'Lesson';
                if (isLesson) {
                    return {
                        id: item.lesson?.id || item.lesson?.Id,
                        type: 'Lesson',
                        name: item.lesson?.name || item.lesson?.Name || `Lesson ${item.order || item.Order}`,
                        duration: item.lesson?.rec?.duration ? `${Math.round(item.lesson.rec.duration / 60)}m` : "05:00"
                    };
                } else {
                    return {
                        id: item.task?.id || item.task?.Id,
                        type: 'Task',
                        name: item.task?.title || item.task?.Title || `Task ${item.order || item.Order}`,
                        taskType: item.task?.type || item.task?.Type,
                        deadline: item.task?.deadline || item.task?.Deadline
                    };
                }
            })
        })) : mockCourseData.sections.map(s => ({
            title: s.title,
            items: s.lessons.map(l => ({ ...l, type: 'Lesson' }))
        })),
    } : mockCourseData;

    const totalLessons = courseData.sections ? courseData.sections.reduce((acc, s) => acc + (s.items || []).filter(i => i.type === 'Lesson').length, 0) : 0;
    const totalTasks = courseData.sections ? courseData.sections.reduce((acc, s) => acc + (s.items || []).filter(i => i.type === 'Task').length, 0) : 0;

    const toggleSection = (idx) => {
        setOpenSections((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    const toggleFaq = (idx) => {
        setOpenFaqs((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    const tabs = [
        { id: "content", label: "Course content" },
        { id: "facility", label: "Facility" },
    ];

    const scrollToSection = (tabId) => {
        setActiveTab(tabId);
        const el = document.getElementById(`section-${tabId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const includeIcons = {
        video: <OndemandVideoIcon fontSize="small" />,
        download: <DownloadIcon fontSize="small" />,
        mobile: <PhoneIphoneIcon fontSize="small" />,
        lifetime: <AllInclusiveIcon fontSize="small" />,
        certificate: <WorkspacePremiumIcon fontSize="small" />,
    };

    const addToCart = async () => {
        try {
            // Guard: if already owned or in cart, don't proceed
            if (enrollmentStatus === "owned") {
                navigate(`/watch/${courseId}`);
                return;
            }
            if (enrollmentStatus === "in_cart") {
                navigate('/checkout');
                return;
            }

            // Debug: log what we have
            console.log("=== ADD TO CART DEBUG ===");
            console.log("apiCourse:", JSON.stringify(apiCourse, null, 2));
            console.log("courseId param:", courseId);
            
            // Backend requires batchId, not courseId
            const batchId = apiCourse?.courseBatches?.[0]?.id 
                         || apiCourse?.courseBatches?.[0]?.Id
                         || apiCourse?.CourseBatches?.[0]?.id
                         || apiCourse?.CourseBatches?.[0]?.Id
                         || apiCourse?.batchId
                         || apiCourse?.BatchId;
            
            if (!batchId) {
                alert("لا يوجد Batch لهذا الكورس. في حالة وجود مشكلة تواصل مع الإدارة.");
                return;
            }

            await enrollCourse(batchId);
            setEnrollmentStatus("in_cart");
            navigate('/checkout');
        } catch (error) {
            console.error("Failed to enroll/add to cart:", error);
            // Handle the case where user already has course (409 from backend)
            const msg = error.message?.toLowerCase() || "";
            if (msg.includes("already owns") || msg.includes("already has")) {
                setEnrollmentStatus(msg.includes("owns") ? "owned" : "in_cart");
                alert(error.message);
            } else {
                alert("حدث خطأ أثناء الإضافة للسلة: " + error.message);
            }
        }
    };

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favoriteCourses') || '[]');
        const isFav = favs.some(c => c.id === (courseData.id || courseId));
        setIsFavorite(isFav);
    }, [courseData.id, courseId]);

    const toggleFavorite = () => {
        const favs = JSON.parse(localStorage.getItem('favoriteCourses') || '[]');
        const currentId = courseData.id || courseId;
        
        if (isFavorite) {
            const newFavs = favs.filter(c => c.id !== currentId);
            localStorage.setItem('favoriteCourses', JSON.stringify(newFavs));
            setIsFavorite(false);
        } else {
            const courseToAdd = {
                id: currentId,
                title: courseData.title,
                description: courseData.subtitle,
                price: courseData.price,
                imageUrl: courseData.imageUrl || null
            };
            favs.push(courseToAdd);
            localStorage.setItem('favoriteCourses', JSON.stringify(favs));
            setIsFavorite(true);
        }
    };

    return (
        <div className="course-page">
            {loading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <h2>Loading course details...</h2>
                </div>
            ) : (
                <>
            {/* ═══ Hero Banner (Gray Background) ═══ */}
            <div className="course-hero">
                <div className="hero-content-wrapper">
                    <div className="hero-left">
                        <div className="course-breadcrumb">
                            Courses {">"} {courseData.title}
                        </div>

                        <h1 className="hero-title">{courseData.title}</h1>
                        <p className="hero-subtitle">{courseData.subtitle}</p>
                        
                        <div className="course-tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`course-tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => scrollToSection(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ═══ Floating Checkout Card ═══ */}
                    <div className="floating-checkout-card">
                        <div className="fcc-video-preview" onClick={() => navigate(`/watch/1`)} style={{ padding: courseData.imageUrl ? 0 : '', overflow: 'hidden' }}>
                            {courseData.imageUrl ? (
                                <img src={getImageUrl(courseData.imageUrl)} alt={courseData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <LandscapeIcon />
                            )}
                            <div className="fcc-video-overlay">
                                <PlayCircleOutlineIcon />
                            </div>
                        </div>
                        <div className="fcc-body">
                            <div className="fcc-price-row">
                                <span className="fcc-price">{courseData.price}</span>
                            </div>

                            {/* Enrollment status banner */}
                            {enrollmentStatus === "owned" && (
                                <div style={{
                                    background: "#f0fdf4",
                                    border: "1px solid #86efac",
                                    borderRadius: "10px",
                                    padding: "10px 14px",
                                    marginBottom: "12px",
                                    color: "#166534",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}>
                                    ✅ أنت مشترك بالفعل في هذا الكورس
                                </div>
                            )}
                            {enrollmentStatus === "in_cart" && (
                                <div style={{
                                    background: "#fffbeb",
                                    border: "1px solid #fcd34d",
                                    borderRadius: "10px",
                                    padding: "10px 14px",
                                    marginBottom: "12px",
                                    color: "#92400e",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}>
                                    🛒 هذا الكورس موجود في سلة المشتريات
                                </div>
                            )}

                            <div className="fcc-actions">
                                {enrollmentStatus === "owned" ? (
                                    <button
                                        className="fcc-buy-btn"
                                        onClick={() => navigate(`/watch/${courseId}`)}
                                        style={{ width: "100%" }}
                                    >
                                        🎓 Go to Course
                                    </button>
                                ) : enrollmentStatus === "in_cart" ? (
                                    <button
                                        className="fcc-buy-btn"
                                        onClick={() => navigate('/checkout')}
                                        style={{ width: "100%" }}
                                    >
                                        🛒 View Cart
                                    </button>
                                ) : (
                                    <div className="fcc-row-btns" style={{ flexDirection: "column", gap: "8px" }}>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                className="fcc-add-btn"
                                                onClick={addToCart}
                                                disabled={enrollStatusLoading}
                                            >
                                                {enrollStatusLoading ? "..." : "Add to Cart"}
                                            </button>
                                            <button className="fcc-heart-btn" onClick={toggleFavorite}>
                                                {isFavorite ? <FavoriteIcon style={{ color: "#ef4444" }} /> : <FavoriteBorderIcon />}
                                            </button>
                                        </div>
                                        <button
                                            className="fcc-buy-btn"
                                            onClick={addToCart}
                                            disabled={enrollStatusLoading}
                                        >
                                            Buy now
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Main Body (Left Column) ═══ */}
            <div className="course-main-layout">
                <div className="course-left-column">
                    


                    {/* Course Content Accordion */}
                    <section id="section-content">
                        <div className="content-header">
                            <div>
                                <h2 className="section-heading" style={{ marginBottom: 4 }}>Course content</h2>
                                <p className="content-meta">
                                    {courseData.sections.length} sections • {totalLessons} lectures {totalTasks > 0 ? `• ${totalTasks} tasks` : ''}
                                </p>
                            </div>
                        </div>
                        <div className="accordion-list">
                            {courseData.sections.map((section, idx) => (
                                <div className="accordion-item" key={idx}>
                                    <button
                                        className="accordion-header"
                                        onClick={() => toggleSection(idx)}
                                    >
                                        <span>{section.title}</span>
                                        {openSections.includes(idx) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </button>
                                    {openSections.includes(idx) && (
                                        <div className="accordion-body">
                                            {(section.items || []).map((item, li) => (
                                                <div className="lesson-row" key={li}>
                                                    <div className="lesson-left">
                                                        {item.type === 'Task' ? (
                                                            <AssignmentIcon className="lesson-icon" fontSize="small" />
                                                        ) : (
                                                            <VideoLibraryIcon className="lesson-icon" fontSize="small" />
                                                        )}
                                                        <span>{item.name}</span>
                                                        {item.type === 'Task' && (
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                border: '1px solid var(--btn-primary-bg, #1a1a1a)',
                                                                color: 'var(--btn-primary-bg, #1a1a1a)',
                                                                marginLeft: '8px',
                                                                fontWeight: '600',
                                                                display: 'inline-block'
                                                            }}>
                                                                Task {item.taskType ? `(${item.taskType})` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Facility */}
                    <section id="section-facility">
                        <h2 className="section-heading">Facility</h2>
                        <div className="info-card">
                            <div className="info-avatar-box">
                                <LandscapeIcon />
                            </div>
                            <div className="info-content">
                                <h3 className="info-name">{courseData.facility.name}</h3>
                                <p className="info-title">Creative learning platform empowering you to learn</p>
                                <p className="info-desc">{courseData.facility.description}</p>

                            </div>
                        </div>
                    </section>



                </div>
                
                {/* Right Spacer for the floating card */}
                <div className="course-right-spacer"></div>
            </div>

            {/* ═══ Footer ═══ */}
            <footer className="course-footer">
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
            </>
            )}
        </div>
    );
}
