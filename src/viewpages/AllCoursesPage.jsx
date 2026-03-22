import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AllCoursesPage.css";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import StarIcon from "@mui/icons-material/Star";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// ─── Mock Data ───────────────────────────────────────────
const allCourses = [
    { id: 1, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", instructor: "Jane Cooper", price: 119.99, oldPrice: 189.99, rating: 4.8, category: "design", duration: "12h 30m", students: 1200 },
    { id: 2, title: "Flutter Development Bootcamp", instructor: "Amr Ahmed", price: 199.99, oldPrice: 249.99, rating: 4.7, category: "programming", duration: "25h 15m", students: 850 },
    { id: 3, title: "Frontend Web Development with React", instructor: "Amr Ahmed", price: 299.99, oldPrice: 350.00, rating: 4.8, category: "programming", duration: "32h 00m", students: 3100 },
    { id: 4, title: "UI/UX Design Masterclass", instructor: "Jane Cooper", price: 179.99, oldPrice: 200.00, rating: 4.6, category: "design", duration: "18h 45m", students: 950 },
    { id: 5, title: "Backend Development with Node.js", instructor: "Amr Ahmed", price: 349.99, oldPrice: 399.99, rating: 4.9, category: "programming", duration: "28h 10m", students: 1540 },
    { id: 6, title: "Digital Marketing Strategy", instructor: "Sara Ali", price: 149.99, oldPrice: 199.99, rating: 4.5, category: "marketing", duration: "10h 20m", students: 600 },
    { id: 7, title: "Business Analytics Fundamentals", instructor: "Sara Ali", price: 199.99, oldPrice: 220.00, rating: 4.4, category: "business", duration: "14h 50m", students: 430 },
];

const categories = ["All", "Programming", "Design", "Marketing", "Business"];

// ─── Component ───────────────────────────────────────────
export default function AllCoursesPage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("All");
    const [viewMode, setViewMode] = useState("list"); // 'grid' | 'list'

    const filteredCourses = activeCategory === "All"
        ? allCourses
        : allCourses.filter(c => c.category === activeCategory.toLowerCase());

    return (
        <div className="all-courses-page">
            <div className="courses-layout-container">
                
                {/* Header & Title */}
                <div className="courses-header-wrapper">
                    <h1 className="courses-page-title">Graphic Design</h1>
                    <p className="courses-page-subtitle">Courses to get you started</p>
                </div>

                {/* Tabs & Toolbar */}
                <div className="courses-toolbar">
                    <div className="courses-tabs-group">
                        <button className="courses-tab active">Courses</button>
                        <button className="courses-tab">Live Session</button>
                    </div>
                </div>

                <div className="courses-filters-row">
                    <div className="category-chips">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`category-chip ${activeCategory === cat ? "active" : ""}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    
                    <div className="view-mode-toggles">
                        <button 
                            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <ViewModuleIcon />
                        </button>
                        <button 
                            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <ViewListIcon />
                        </button>
                    </div>
                </div>

                {/* Content Grid/List */}
                <div className={`courses-content-area ${viewMode}-view`}>
                    {filteredCourses.map((course) => (
                        <div
                            className="course-item"
                            key={course.id}
                            onClick={() => navigate(`/course/${course.id}`)}
                        >
                            <div className="course-item-image">
                                <LandscapeIcon />
                            </div>
                            <div className="course-item-details">
                                <h3 className="course-item-title">{course.title}</h3>
                                {viewMode === 'list' && (
                                    <p className="course-item-desc">
                                        Learn the fundamentals of {course.category} from scratch. This course covers everything from basic principles to advanced techniques.
                                    </p>
                                )}
                                
                                <div className="course-item-meta-top">
                                    <span className="course-instructor"><PersonOutlineIcon fontSize="small"/> {course.instructor}</span>
                                    <div className="course-rating">
                                        <StarIcon fontSize="small" style={{ color: "#f59e0b" }} /> 
                                        <strong>{course.rating}</strong>
                                        <span className="rating-count">({course.students})</span>
                                    </div>
                                    {viewMode === 'list' && (
                                        <span className="course-duration"><AccessTimeIcon fontSize="small"/> {course.duration}</span>
                                    )}
                                </div>
                                
                                {viewMode === 'list' && (
                                    <div className="course-item-pricing-row">
                                        <div className="cip-prices">
                                            <span className="cip-current">${course.price.toFixed(2)}</span>
                                            <span className="cip-old">${course.oldPrice.toFixed(2)}</span>
                                        </div>
                                        <button className="cip-add-cart" onClick={(e) => { e.stopPropagation(); navigate('/checkout'); }}>Add to Cart</button>
                                    </div>
                                )}
                            </div>
                            
                            {viewMode === 'grid' && (
                                <div className="course-item-footer-grid">
                                    <div className="cip-prices">
                                        <span className="cip-current">${course.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
            
            {/* Footer */}
            <footer className="all-courses-footer">
                <p>© 2026 ZUMRA. All rights reserved.</p>
            </footer>
        </div>
    );
}
