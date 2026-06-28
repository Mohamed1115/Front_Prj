import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AllCoursesPage.css";
import { getAllCourses, getImageUrl } from "../services/Api";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import StarIcon from "@mui/icons-material/Star";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const categories = ["All", "Recorded", "Live"];

export default function AllCoursesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState("All");
    const [viewMode, setViewMode] = useState("list"); // 'grid' | 'list'

    // Get selected category from navigation state
    const selectedCategoryId = location.state?.categoryId;
    const selectedCategoryName = location.state?.categoryName;

    useEffect(() => {
        async function fetchCourses() {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllCourses();
                // Handle API response which might be wrapped or a direct array
                const coursesArray = Array.isArray(data) ? data : (data?.data || []);
                setCourses(coursesArray);
            } catch (err) {
                console.error("Error fetching all courses:", err);
                setError("Failed to load courses. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    // 1. First filter by facility category from Navbar state
    const categoryFilteredCourses = courses.filter(c => {
        if (!selectedCategoryId) return true;
        const fCatId = c.facility?.categoryId || c.facility?.CategoryId;
        return fCatId == selectedCategoryId;
    });

    // 2. Then filter by the "All", "Recorded", "Live" type chips
    const filteredCourses = activeCategory === "All"
        ? categoryFilteredCourses
        : categoryFilteredCourses.filter(c => {
            const typeStr = c.type || c.Type || "";
            if (activeCategory === "Recorded") {
                return typeStr.toLowerCase() === "recorded" || typeStr.toLowerCase() === "rec";
            }
            if (activeCategory === "Live") {
                return typeStr.toLowerCase() === "live";
            }
            return true;
        });

    return (
        <div className="all-courses-page">
            <div className="courses-layout-container">
                
                {/* Header & Title */}
                <div className="courses-header-wrapper">
                    <h1 className="courses-page-title">
                        {selectedCategoryName ? selectedCategoryName : "All Courses"}
                    </h1>
                    <p className="courses-page-subtitle">
                        {selectedCategoryName ? `Courses in ${selectedCategoryName}` : "Courses to get you started"}
                    </p>
                    {selectedCategoryName && (
                        <button 
                            onClick={() => navigate('/courses', { replace: true, state: null })}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "12px",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                border: "1px solid var(--border-color, #e5e7eb)",
                                background: "var(--card-bg, #ffffff)",
                                color: "var(--text-color, #1f2937)",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary, #7c3aed)"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-color, #e5e7eb)"}
                        >
                            <span>Filter: {selectedCategoryName}</span>
                            <strong style={{ marginLeft: "4px", fontSize: "1.1rem", lineHeight: "1" }}>&times;</strong>
                        </button>
                    )}
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

                {/* Error State */}
                {error && (
                    <div className="error-message-wrapper" style={{ padding: "40px 0", textAlign: "center", color: "#ef4444" }}>
                        <p>{error}</p>
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
                        <p style={{ marginTop: "16px", fontSize: "0.95rem" }}>Loading courses...</p>
                        <style>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : (
                    /* Content Grid/List */
                    <div className={`courses-content-area ${viewMode}-view`}>
                        {filteredCourses.length === 0 ? (
                            <div style={{ gridColumn: "1 / -1", padding: "40px 0", textAlign: "center", color: "#64748b" }}>
                                No courses found in this category.
                            </div>
                        ) : (
                            filteredCourses.map((course) => {
                                const courseImg = course.imageUrl || course.image || course.ImageUrl || course.Image;
                                const titleStr = course.title || course.name || course.Name;
                                const descStr = course.description || course.subtitle || course.Description || "Learn from the experts in this premium comprehensive course.";
                                const instructorStr = course.instructorName || course.instructor || "Instructor";
                                const priceNum = course.cost || course.price || course.Cost || 0;
                                const oldPriceNum = course.oldPrice || course.OldPrice;
                                const ratingNum = course.rating || course.Rating || 4.8;
                                const studentsCount = course.students || course.Students || 120;
                                const durationStr = course.duration || course.Duration || "Self-paced";

                                return (
                                    <div
                                        className="course-item"
                                        key={course.id}
                                        onClick={() => navigate(`/course/${course.id}`)}
                                    >
                                        <div className="course-item-image" style={{ padding: courseImg ? 0 : '', overflow: 'hidden', position: 'relative' }}>
                                            {courseImg ? (
                                                <img 
                                                    src={getImageUrl(courseImg)} 
                                                    alt={titleStr} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                            ) : (
                                                <LandscapeIcon />
                                            )}
                                        </div>
                                        <div className="course-item-details">
                                            <h3 className="course-item-title">{titleStr}</h3>
                                            {viewMode === 'list' && (
                                                <p className="course-item-desc">{descStr}</p>
                                            )}
                                            
                                            <div className="course-item-meta-top">
                                                <span className="course-instructor">
                                                    <PersonOutlineIcon fontSize="small"/> {instructorStr}
                                                </span>
                                                <div className="course-rating">
                                                    <StarIcon fontSize="small" style={{ color: "#f59e0b" }} /> 
                                                    <strong>{ratingNum}</strong>
                                                    <span className="rating-count">({studentsCount})</span>
                                                </div>
                                                {viewMode === 'list' && (
                                                    <span className="course-duration">
                                                        <AccessTimeIcon fontSize="small"/> {durationStr}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {viewMode === 'list' && (
                                                <div className="course-item-pricing-row">
                                                    <div className="cip-prices">
                                                        <span className="cip-current">${priceNum.toFixed(2)}</span>
                                                        {oldPriceNum && (
                                                            <span className="cip-old">${oldPriceNum.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                    <button className="cip-add-cart" onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}`); }}>View Details</button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {viewMode === 'grid' && (
                                            <div className="course-item-footer-grid">
                                                <div className="cip-prices">
                                                    <span className="cip-current">${priceNum.toFixed(2)}</span>
                                                    {oldPriceNum && (
                                                        <span className="cip-old" style={{ marginLeft: '8px', fontSize: '0.85rem' }}>${oldPriceNum.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

            </div>
            
            {/* Footer */}
            <footer className="all-courses-footer">
                <p>© 2026 ZUMRA. All rights reserved.</p>
            </footer>
        </div>
    );
}
