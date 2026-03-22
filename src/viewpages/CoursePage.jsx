import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import RateReviewIcon from "@mui/icons-material/RateReview";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

// ─── Mock Data ───────────────────────────────────────────
const courseData = {
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
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [openSections, setOpenSections] = useState([0]);
    const [openFaqs, setOpenFaqs] = useState([]);
    const [userRating, setUserRating] = useState(0);

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
        { id: "reviews", label: "Reviews" },
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

    return (
        <div className="course-page">
            
            {/* ═══ Hero Banner (Gray Background) ═══ */}
            <div className="course-hero">
                <div className="hero-content-wrapper">
                    <div className="hero-left">
                        <div className="course-breadcrumb">
                            Courses {">"} Drawing {">"} Complete Drawing Course
                        </div>
                        <div className="hero-meta-top">
                            <span>Created by <span className="hero-instructor-badge">{courseData.instructor}</span></span>
                            <span className="hero-language">🌍 Language {courseData.language}</span>
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
                        <div className="fcc-video-preview" onClick={() => navigate(`/watch/1`)}>
                            <LandscapeIcon />
                            <div className="fcc-video-overlay">
                                <PlayCircleOutlineIcon />
                            </div>
                        </div>
                        <div className="fcc-body">
                            <div className="fcc-price-row">
                                <span className="fcc-price">{courseData.price}</span>
                                <span className="fcc-old-price">{courseData.oldPrice}</span>
                            </div>
                            <div className="fcc-actions">
                                <div className="fcc-row-btns">
                                    <button className="fcc-add-btn" onClick={() => navigate('/checkout')}>Add to Cart</button>
                                    <button className="fcc-heart-btn"><FavoriteBorderIcon /></button>
                                </div>
                                <button className="fcc-buy-btn" onClick={() => navigate('/checkout')}>Buy now</button>
                            </div>
                            
                            <div className="fcc-includes">
                                <h4>This course includes:</h4>
                                <div className="fcc-include-list">
                                    {courseData.courseIncludes.map((item, i) => (
                                        <div className="fcc-include-item" key={i}>
                                            {includeIcons[item.icon]}
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Main Body (Left Column) ═══ */}
            <div className="course-main-layout">
                <div className="course-left-column">
                    
                    {/* What you'll learn */}
                    <section id="section-overview" className="learn-section">
                        <h2 className="section-heading">What you'll learn</h2>
                        <div className="learn-grid">
                            {courseData.whatYouLearn.map((item, i) => (
                                <div className="learn-item" key={i}>
                                    <CheckCircleOutlineIcon className="learn-check" fontSize="small" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Course Content Accordion */}
                    <section id="section-content">
                        <div className="content-header">
                            <div>
                                <h2 className="section-heading" style={{ marginBottom: 4 }}>Course content</h2>
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
                                        className="accordion-header"
                                        onClick={() => toggleSection(idx)}
                                    >
                                        <span>{section.title}</span>
                                        {openSections.includes(idx) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </button>
                                    {openSections.includes(idx) && (
                                        <div className="accordion-body">
                                            {section.lessons.map((lesson, li) => (
                                                <div className="lesson-row" key={li}>
                                                    <div className="lesson-left">
                                                        <VideoLibraryIcon className="lesson-icon" fontSize="small" />
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
                                <div className="info-stats">
                                    <div className="info-stat"><RateReviewIcon fontSize="small" /> {courseData.facility.reviews.toLocaleString()} Reviews</div>
                                    <div className="info-stat"><StarIcon fontSize="small" style={{color: '#f59e0b'}} /> {courseData.facility.rating} Rating</div>
                                    <div className="info-stat"><PeopleIcon fontSize="small" /> {courseData.facility.students.toLocaleString()} Students</div>
                                    <div className="info-stat"><MenuBookIcon fontSize="small" /> {courseData.facility.courses} Courses</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Instructor */}
                    <section id="section-instructor">
                        <h2 className="section-heading">Instructor</h2>
                        <div className="info-card">
                            <div className="info-avatar-box" style={{ borderRadius: '50%' }}>
                                <LandscapeIcon />
                            </div>
                            <div className="info-content">
                                <h3 className="info-name">{courseData.instructorInfo.name}</h3>
                                <p className="info-title">{courseData.instructorInfo.title}</p>
                                <p className="info-desc">{courseData.instructorInfo.bio}</p>
                                <div className="info-stats">
                                    <div className="info-stat"><RateReviewIcon fontSize="small" /> {courseData.instructorInfo.reviews.toLocaleString()} Reviews</div>
                                    <div className="info-stat"><StarIcon fontSize="small" style={{color: '#f59e0b'}} /> {courseData.instructorInfo.rating} Rating</div>
                                    <div className="info-stat"><PeopleIcon fontSize="small" /> {courseData.instructorInfo.students.toLocaleString()} Students</div>
                                    <div className="info-stat"><MenuBookIcon fontSize="small" /> {courseData.instructorInfo.courses} Courses</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section id="section-faq">
                        <h2 className="section-heading">FAQ</h2>
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
                    <section id="section-reviews">
                        <h2 className="section-heading">Reviews</h2>
                        
                        <div className="review-input-box">
                            <div className="review-input-header">Tell us your review..</div>
                            <div className="review-textarea-row">
                                <textarea placeholder="Write your feedback..." />
                                <button className="send-review-btn">Send</button>
                            </div>
                            <div className="star-rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} onClick={() => setUserRating(star)} style={{ cursor: "pointer" }}>
                                        {star <= userRating ? (
                                            <StarIcon style={{ color: "#f59e0b" }} />
                                        ) : (
                                            <StarBorderIcon style={{ color: "#d1d5db" }} />
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="reviews-list">
                            {courseData.reviews.map((review, idx) => (
                                <div className="review-card" key={idx}>
                                    <AccountCircleIcon className="review-avatar" />
                                    <div className="review-content">
                                        <h4 className="review-name">{review.name}</h4>
                                        <div className="review-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon 
                                                    key={i} 
                                                    fontSize="small"
                                                    style={{ color: i < review.rating ? "#f59e0b" : "#e5e7eb", fontSize: '16px' }} 
                                                />
                                            ))}
                                        </div>
                                        <p className="review-text">"{review.text}"</p>
                                    </div>
                                </div>
                            ))}
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
                <p className="footer-copyright">©Copyrights 2026</p>
            </footer>
        </div>
    );
}
