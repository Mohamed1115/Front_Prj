import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FacilityProfile.css";

// MUI Icons
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GridViewIcon from "@mui/icons-material/GridView";
import LandscapeIcon from "@mui/icons-material/Landscape";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import IosShareIcon from "@mui/icons-material/IosShare";
import SchoolIcon from "@mui/icons-material/School";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";

// ─── Mock Data ───────────────────────────────────────────
const facilityData = {
    zumra: {
        name: "ZUMRA",
        description:
            "Our facility is a creative learning hub dedicated to empowering talent across multiple disciplines. We offer a wide range of professional courses — from drawing and design to photography and digital media — all led by experienced instructors and supported by state-of-the-art equipment.",
    },
    iti: {
        name: "ITI",
        description:
            "Industrial Training Institute providing hands-on courses. Integrated platforms for course delivery, tracking, and certification management across all disciplines.",
    },
    udemy: {
        name: "Udemy",
        description:
            "Global marketplace for learning and instruction. Browse thousands of courses and get hands-on practice with real-world projects and expert instructors.",
    },
};

const categories = [
    {
        id: 1,
        name: "Programming",
        description: "Learn coding, software development, and computer science.",
        count: 180,
    },
    {
        id: 2,
        name: "Design",
        description: "Master graphic design, UI/UX, and creative arts.",
        count: 120,
    },
    {
        id: 3,
        name: "Education",
        description: "Teaching methods, pedagogy, and academic excellence.",
        count: 90,
    },
    {
        id: 4,
        name: "Other",
        description: "Business, marketing, and professional development.",
        count: 75,
    },
];

const mockCourses = [
    {
        id: 1,
        title: "Complete Drawing Course: Ultimate Drawing Art with Pencil",
        description:
            "Learn the fundamentals of drawing from scratch and develop your artistic skills step by step. This course covers everything from basic shapes, proportions, and perspective to light, shadow, and color theory — helping you transform simple sketches into professional artworks. Perfect for beginners and aspiring artists who want to build a strong creative foundation.",
        price: "$250",
        instructor: "Jane Cooper",
        rating: 4.0,
    },
    {
        id: 2,
        title: "Complete Drawing Course: Ultimate Drawing Art with Pencil",
        description:
            "Learn the fundamentals of drawing from scratch and develop your artistic skills step by step. This course covers everything from basic shapes, proportions, and perspective to light, shadow, and color theory — helping you transform simple sketches into professional artworks.",
        price: "$250",
        instructor: "Jane Cooper",
        rating: 4.0,
    },
    {
        id: 3,
        title: "Complete Drawing Course: Ultimate Drawing Art with Pencil",
        description:
            "Learn the fundamentals of drawing from scratch and develop your artistic skills step by step. This course covers everything from basic shapes, proportions, and perspective to light, shadow.",
        price: "$250",
        instructor: "Jane Cooper",
        rating: 4.0,
    },
    {
        id: 4,
        title: "Complete Drawing Course: Ultimate Drawing Art with Pencil",
        description:
            "Learn the fundamentals of drawing from scratch and develop your artistic skills step by step. This course covers everything from basic shapes, proportions, and perspective to light.",
        price: "$250",
        instructor: "Jane Cooper",
        rating: 4.0,
    },
    {
        id: 5,
        title: "Complete Drawing Course: Ultimate Drawing Art with Pencil",
        description:
            "This is a full course of drawing from scratch introducing and building your artistic skills step by step. This course covers everything from basic shapes.",
        price: "$250",
        instructor: "Jane Cooper",
        rating: 4.0,
    },
];

// ─── Component ───────────────────────────────────────────
export default function FacilityProfile() {
    const { facilityId } = useParams();
    const facility = facilityData[facilityId] || facilityData.zumra;
    const [activeTab, setActiveTab] = useState("courses");
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setActiveTab("courses");
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
    };

    return (
        <div className="facility-page">
            {/* ═══ Facility Header ═══ */}
            <section className="facility-header">
                <div className="facility-header-left">
                    <div className="facility-header-icon">
                        <LandscapeIcon style={{ fontSize: 40, color: "#fff" }} />
                    </div>
                    <div className="facility-header-info">
                        <div className="facility-header-name-row">
                            <h1 className="facility-header-name">{facility.name} ⚙</h1>
                            <div className="facility-header-actions">
                                <button className="fh-action-btn">
                                    <FavoriteBorderIcon fontSize="small" />
                                </button>
                                <button className="fh-action-btn">
                                    <GridViewIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                        <p className="facility-header-desc">
                            {facility.description}{" "}
                            <span className="see-more-link">see more..</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ Content ═══ */}
            {!selectedCategory ? (
                /* Show Categories only (no tabs) */
                <CategoriesView
                    categories={categories}
                    onCategoryClick={handleCategoryClick}
                />
            ) : (
                /* After clicking a category → show Tabs + Courses/Live */
                <>
                    <div className="facility-tabs">
                        <button
                            className={`facility-tab ${activeTab === "courses" ? "active" : ""}`}
                            onClick={() => setActiveTab("courses")}
                        >
                            Courses
                        </button>
                        <button
                            className={`facility-tab ${activeTab === "live" ? "active" : ""}`}
                            onClick={() => setActiveTab("live")}
                        >
                            Live
                        </button>
                    </div>

                    {activeTab === "courses" && (
                        <CoursesListView
                            categoryName={selectedCategory.name}
                            courses={mockCourses}
                            onBack={handleBackToCategories}
                        />
                    )}

                    {activeTab === "live" && (
                        <CoursesListView
                            categoryName="Live Sessions"
                            courses={mockCourses}
                            onBack={handleBackToCategories}
                            isLive
                        />
                    )}
                </>
            )}

            {/* ═══ Footer ═══ */}
            <footer className="facility-footer">
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

// ─── Categories Sub-View ─────────────────────────────────
function CategoriesView({ categories, onCategoryClick }) {
    return (
        <section className="categories-section">
            <div className="categories-label">
                <h3>Categories</h3>
                <p className="categories-subtitle">Browse by subject area</p>
            </div>
            <div className="categories-grid">
                {categories.map((cat) => (
                    <div
                        className="category-card"
                        key={cat.id}
                        onClick={() => onCategoryClick(cat)}
                    >
                        <div className="category-card-image">
                            <LandscapeIcon style={{ fontSize: 36, color: "#9ca3af" }} />
                        </div>
                        <div className="category-card-body">
                            <h3 className="category-card-name">{cat.name}</h3>
                            <p className="category-card-desc">{cat.description}</p>
                            <div className="category-card-footer">
                                <span className="category-count">{cat.count} courses</span>
                                <span className="category-explore">Explore →</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function CoursesListView({ categoryName, courses, onBack, isLive }) {
    const navigate = useNavigate();
    return (
        <section className="courses-list-section">
            <div className="courses-list-header">
                <h3>
                    {categoryName}
                    {onBack && (
                        <>
                            {" "}
                            <span className="back-link" onClick={onBack}>
                                ← Back
                            </span>
                        </>
                    )}
                </h3>
            </div>
            <div className="courses-list">
                {courses.map((course) => (
                    <div className="course-list-card" key={course.id} onClick={() => navigate(`/course/${course.id}`)} style={{ cursor: "pointer" }}>
                        <div className="course-list-image">
                            <LandscapeIcon style={{ fontSize: 40, color: "#9ca3af" }} />
                        </div>
                        <div className="course-list-content">
                            <h3 className="course-list-title">{course.title}</h3>
                            <p className="course-list-desc">{course.description}</p>
                            <div className="course-list-badges">
                                <div className="clb-item">
                                    <div className="clb-icon">
                                        <StarBorderIcon style={{ fontSize: 16 }} />
                                    </div>
                                    <span>{course.rating}</span>
                                </div>
                                <div className="clb-item">
                                    <div className="clb-icon">
                                        <IosShareIcon style={{ fontSize: 16 }} />
                                    </div>
                                </div>
                                <div className="clb-item">
                                    <div className="clb-icon">
                                        <PersonOutlineIcon style={{ fontSize: 16 }} />
                                    </div>
                                    <span>{course.instructor}</span>
                                </div>
                            </div>
                        </div>
                        <div className="course-list-actions">
                            <div className="cla-top-row">
                                <span className="cla-add-to-cart">Add to Card</span>
                                <span className="cla-price">{course.price}</span>
                            </div>
                            <button className="cla-buy-btn">Buy now</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
