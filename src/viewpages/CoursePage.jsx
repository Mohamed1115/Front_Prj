import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./CoursePage.css";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
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
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SchoolIcon from "@mui/icons-material/School";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// ─── Mock Data ───────────────────────────────────────────
const courseData = {
    title: "Complete Drawing Course:\nUltimate Drawing Art with Pencil",
    subtitle: "Unlock the future of Commerce — Where Creativity Meets Opportunity.",
    instructor: "Jane Cooper",
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
        "How to build a portfolio that attracts clients or",
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
            title: "How to draw digitally, develop your style, and create illustrations that stand out online",
            lessons: [
                { name: "How to draw from basic shapes to full illustrations", duration: "03:27" },
                { name: "Understanding light, shadow, and perspective", duration: "04:39" },
                { name: "How to choose colors and create balanced compositions", duration: "06:55" },
                { name: "Turning simple sketches into digital art", duration: "03:43" },
                { name: "How to find your unique drawing style", duration: "06:41" },
                { name: "Techniques for drawing people, faces, and emotions", duration: "07:51" },
                { name: "How to use digital tools (Procreate, Photoshop, etc.) effectively", duration: "10:42" },
            ],
        },
        {
            title: "How to unlock your artistic potential, grow your style, and share your art with the world",
            lessons: [
                { name: "Building your artistic identity", duration: "05:20" },
                { name: "Sharing your work on social media", duration: "04:15" },
            ],
        },
    ],
    facility: {
        name: "ZUMRA",
        description: "Our facility is a creative learning hub dedicated to empowering talent across multiple disciplines. We offer a wide range of professional courses — from drawing and design to photography and digital media — all led by experienced instructors and supported by state-of-the-art equipment. Whether you're a beginner exploring your passion or a professional looking to refine your skills, our programs are designed to help you grow, create, and succeed in today's creative world.",
        reviews: 9225,
        rating: 4.9,
        students: 418784,
        courses: 30,
    },
    instructorInfo: {
        name: "Jane Cooper",
        title: "eCommerce & Entrepreneurship made simple.",
        bio: "Jane Cooper is the Founder of Invert Media. Invert Media is an Online Education Company. It's mission is to make high quality education affordable and accessible to the entire world.\n\nHe runs a successful eCommerce Business, creates content and courses to educate aspiring Entrepreneurs, and loves his wife and his dog. Feel free to message him, he's always willing to help...",
        reviews: 225,
        rating: 4.2,
        students: 41784,
        courses: 12,
    },
    faqs: [
        { question: "What is ZUMRA", answer: "ZUMRA is a creative learning hub dedicated to empowering talent across multiple disciplines." },
        { question: "What is included in a ZUMRA", answer: "Access to all course materials, assignments, and community support." },
        { question: "Where can I watch?", answer: "You can watch on any device — mobile, tablet, laptop, or TV." },
        { question: "Where courses are right for me?", answer: "We offer courses for beginners to advanced levels across many creative fields." },
        { question: "Will I be changed taxed?", answer: "Taxes may apply based on your location and local regulations." },
    ],
    reviews: [
        { name: "Jane Cooper", rating: 5.0, text: "The instructor really knows the subject and makes learning so easy." },
        { name: "Jane Cooper", rating: 5.0, text: "The instructor really knows the subject and makes learning so easy." },
        { name: "Jane Cooper", rating: 5.0, text: "The instructor really knows the subject and makes learning so easy." },
        { name: "Jane Cooper", rating: 5.0, text: "The instructor really knows the subject and makes learning so easy." },
        { name: "Jane Cooper", rating: 5.0, text: "" },
    ],
};

// ─── Component ───────────────────────────────────────────
export default function CoursePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [openSections, setOpenSections] = useState([0]);
    const [openFaqs, setOpenFaqs] = useState([]);
    const [showMoreLearn, setShowMoreLearn] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [reviewText, setReviewText] = useState("");

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
        { id: "overview", label: "Overview" },
        { id: "content", label: "Course content" },
        { id: "facility", label: "Facility" },
        { id: "instructor", label: "Instructor" },
        { id: "faq", label: "FAQ" },
    ];

    const scrollToSection = (tabId) => {
        setActiveTab(tabId);
        const el = document.getElementById(`section-${tabId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const includeIcons = {
        video: <OndemandVideoIcon />,
        download: <DownloadIcon />,
        mobile: <PhoneIphoneIcon />,
        lifetime: <AllInclusiveIcon />,
        certificate: <WorkspacePremiumIcon />,
    };

    return (
        <div className="course-page">
            {/* ═══ Hero Banner ═══ */}
            <section className="course-hero">
                <div className="course-hero-overlay">
                    <p className="hero-created-by">
                        Created by <span className="hero-instructor-badge">{courseData.instructor}</span>
                    </p>
                    <h1 className="hero-title">{courseData.title}</h1>
                    <p className="hero-subtitle">{courseData.subtitle}</p>
                    <div className="hero-actions">
                        <div className="hero-add-to-cart">
                            <span>Add to Card</span>
                            <span className="hero-price">{courseData.price}</span>
                            <span className="hero-old-price">{courseData.oldPrice}</span>
                        </div>
                        <button className="hero-heart-btn">
                            <FavoriteBorderIcon />
                        </button>
                    </div>
                    <button className="hero-buy-btn">Buy now</button>
                </div>
            </section>

            {/* ═══ Tab Navigation ═══ */}
            <nav className="course-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`course-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => scrollToSection(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ═══ Overview + Sidebar ═══ */}
            <div className="course-body" id="section-overview">
                <div className="course-main">
                    {/* What you'll learn */}
                    <section className="learn-section">
                        <h2 className="section-heading">What you'll learn</h2>
                        <div className="learn-grid">
                            {courseData.whatYouLearn
                                .slice(0, showMoreLearn ? undefined : 6)
                                .map((item, i) => (
                                    <div className="learn-item" key={i}>
                                        <CheckCircleOutlineIcon className="learn-check" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                        </div>
                        {courseData.whatYouLearn.length > 6 && (
                            <button
                                className="show-more-btn"
                                onClick={() => setShowMoreLearn(!showMoreLearn)}
                            >
                                {showMoreLearn ? "Show less" : "Show more"}{" "}
                                {showMoreLearn ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </button>
                        )}
                    </section>

                    {/* Course Content */}
                    <section className="content-section" id="section-content">
                        <div className="content-header">
                            <div>
                                <h2 className="section-heading">Course content</h2>
                                <p className="content-meta">
                                    {courseData.sections.length} sections • 25 lectures • 2h 17m total length
                                </p>
                            </div>
                            <button className="expand-all-btn">Expand all sections</button>
                        </div>
                        <div className="accordion-list">
                            {courseData.sections.map((section, idx) => (
                                <div className="accordion-item" key={idx}>
                                    <button
                                        className={`accordion-header ${openSections.includes(idx) ? "open" : ""}`}
                                        onClick={() => toggleSection(idx)}
                                    >
                                        <span className="accordion-title">{section.title}</span>
                                        {openSections.includes(idx) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </button>
                                    {openSections.includes(idx) && (
                                        <div className="accordion-body">
                                            {section.lessons.map((lesson, li) => (
                                                <div className="lesson-row" key={li}>
                                                    <div className="lesson-left">
                                                        <PlayCircleOutlineIcon className="lesson-icon" />
                                                        <span>{lesson.name}</span>
                                                    </div>
                                                    <span className="lesson-duration">{lesson.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Facility */}
                    <section className="facility-section" id="section-facility">
                        <div className="facility-info-card">
                            <div className="fic-left">
                                <h3 className="fic-label">Facility</h3>
                                <p className="fic-desc">{courseData.facility.description}</p>
                                <div className="fic-stats">
                                    <div className="fic-stat">
                                        <RateReviewIcon fontSize="small" />
                                        <span>{courseData.facility.reviews.toLocaleString()} Reviews</span>
                                    </div>
                                    <div className="fic-stat">
                                        <StarIcon fontSize="small" />
                                        <span>{courseData.facility.rating} Facility Rating</span>
                                    </div>
                                    <div className="fic-stat">
                                        <PeopleIcon fontSize="small" />
                                        <span>{courseData.facility.students.toLocaleString()} Students</span>
                                    </div>
                                    <div className="fic-stat">
                                        <MenuBookIcon fontSize="small" />
                                        <span>{courseData.facility.courses} Courses</span>
                                    </div>
                                </div>
                            </div>
                            <div className="fic-right">
                                <div className="fic-logo-box">
                                    <LandscapeIcon style={{ fontSize: 50, color: "#fff" }} />
                                </div>
                                <h4 className="fic-name">{courseData.facility.name}</h4>
                                <p className="fic-tagline">A creative learning platform empowering you to learn, create, and grow.</p>
                            </div>
                        </div>
                    </section>

                    {/* Instructor */}
                    <section className="instructor-section" id="section-instructor">
                        <div className="instructor-card">
                            <div className="inst-left">
                                <div className="inst-avatar">
                                    <LandscapeIcon style={{ fontSize: 50, color: "#9ca3af" }} />
                                </div>
                                <h3 className="inst-name">{courseData.instructorInfo.name}</h3>
                                <p className="inst-title">{courseData.instructorInfo.title}</p>
                            </div>
                            <div className="inst-right">
                                <h3 className="inst-heading">Instructor</h3>
                                <p className="inst-bio">{courseData.instructorInfo.bio}</p>
                                <div className="inst-stats">
                                    <div className="fic-stat">
                                        <RateReviewIcon fontSize="small" />
                                        <span>{courseData.instructorInfo.reviews} Reviews</span>
                                    </div>
                                    <div className="fic-stat">
                                        <StarIcon fontSize="small" />
                                        <span>{courseData.instructorInfo.rating} Instructor Rating</span>
                                    </div>
                                    <div className="fic-stat">
                                        <PeopleIcon fontSize="small" />
                                        <span>{courseData.instructorInfo.students.toLocaleString()} Students</span>
                                    </div>
                                    <div className="fic-stat">
                                        <MenuBookIcon fontSize="small" />
                                        <span>{courseData.instructorInfo.courses} Courses</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="faq-section" id="section-faq">
                        <div className="faq-header">
                            <h2 className="section-heading">FAQ</h2>
                            <button className="see-more-link">see more</button>
                        </div>
                        <div className="faq-list">
                            {courseData.faqs.map((faq, idx) => (
                                <div className="faq-item" key={idx}>
                                    <button
                                        className="faq-question"
                                        onClick={() => toggleFaq(idx)}
                                    >
                                        <span>{faq.question}</span>
                                        {openFaqs.includes(idx) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </button>
                                    {openFaqs.includes(idx) && (
                                        <div className="faq-answer">{faq.answer}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Reviews */}
                    <section className="reviews-section">
                        <h2 className="section-heading">Reviews</h2>
                        <div className="review-underline"></div>
                        <p className="review-prompt">Tell us your review..</p>
                        <div className="review-input-row">
                            <div className="star-rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} onClick={() => setUserRating(star)} style={{ cursor: "pointer" }}>
                                        {star <= userRating ? (
                                            <StarIcon style={{ color: "#f59e0b" }} />
                                        ) : (
                                            <StarBorderIcon style={{ color: "#9ca3af" }} />
                                        )}
                                    </span>
                                ))}
                            </div>
                            <button className="send-review-btn">Send</button>
                        </div>
                        <div className="reviews-list">
                            {courseData.reviews.map((review, idx) => (
                                <div className="review-card" key={idx}>
                                    <AccountCircleIcon className="review-avatar" />
                                    <div className="review-content">
                                        <h4 className="review-name">{review.name}</h4>
                                        <p className="review-rating">
                                            {review.rating}
                                            <StarIcon style={{ color: "#f59e0b", fontSize: 16, marginLeft: 2 }} />
                                        </p>
                                        {review.text && <p className="review-text">"{review.text}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* ═══ Sidebar ═══ */}
                <aside className="course-sidebar" id="section-includes">
                    <div className="sidebar-card">
                        <h3 className="sidebar-title">This course includes:</h3>
                        <div className="sidebar-features">
                            {courseData.courseIncludes.map((item, i) => (
                                <div className="sidebar-feature" key={i}>
                                    <div className="sf-icon">{includeIcons[item.icon]}</div>
                                    <span className="sf-text">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
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
                <p className="footer-copyright">©Copyrights 2026</p>
            </footer>
        </div>
    );
}
