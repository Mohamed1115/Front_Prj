import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { search, getImageUrl } from "../services/Api";
import "./SearchResultsPage.css";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import StarIcon from "@mui/icons-material/Star";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ApartmentIcon from "@mui/icons-material/Apartment";

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const navigate = useNavigate();

    const [results, setResults] = useState({ courses: [], facilities: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all"); // 'all' | 'courses' | 'facilities'

    useEffect(() => {
        if (!query) return;

        async function fetchSearchResults() {
            try {
                setLoading(true);
                setError(null);
                const data = await search(query);
                
                setResults({
                    courses: Array.isArray(data?.courses) ? data.courses : (data?.courses?.$values || []),
                    facilities: Array.isArray(data?.facilities) ? data.facilities : (data?.facilities?.$values || []),
                });
            } catch (err) {
                console.error("Search API error:", err);
                setError("Failed to retrieve search results. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        fetchSearchResults();
    }, [query]);

    const totalResults = results.courses.length + results.facilities.length;

    const showCourses = activeTab === "all" || activeTab === "courses";
    const showFacilities = activeTab === "all" || activeTab === "facilities";

    return (
        <div className="all-courses-page search-results-page">
            <div className="courses-layout-container">
                
                {/* Header & Title */}
                <div className="courses-header-wrapper">
                    <h1 className="courses-page-title">Search Results</h1>
                    <p className="courses-page-subtitle">
                        Showing results for <strong style={{ color: "var(--btn-primary-bg, #1a1a1a)" }}>"{query}"</strong>
                    </p>
                </div>

                {/* Tabs / Filters row */}
                <div className="courses-filters-row">
                    <div className="category-chips">
                        <button
                            className={`category-chip ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All Results ({totalResults})
                        </button>
                        <button
                            className={`category-chip ${activeTab === "courses" ? "active" : ""}`}
                            onClick={() => setActiveTab("courses")}
                        >
                            Courses ({results.courses.length})
                        </button>
                        <button
                            className={`category-chip ${activeTab === "facilities" ? "active" : ""}`}
                            onClick={() => setActiveTab("facilities")}
                        >
                            Facilities ({results.facilities.length})
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div style={{ padding: "40px 0", textAlign: "center", color: "#ef4444" }}>
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
                        <p style={{ marginTop: "16px", fontSize: "0.95rem" }}>Searching...</p>
                        <style>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : (
                    <div className="courses-content-area list-view">
                        {totalResults === 0 && !error ? (
                            <div style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
                                No results found matching your search term.
                            </div>
                        ) : (
                            <>
                                {/* --- Courses Results --- */}
                                {showCourses && results.courses.map((course) => {
                                    const courseImg = course.imageUrl || course.image || course.ImageUrl || course.Image;
                                    return (
                                        <div
                                            className="course-item search-result-item course-result"
                                            key={`course-${course.id}`}
                                            onClick={() => navigate(`/course/${course.id}`)}
                                        >
                                            <div className="course-item-image" style={{ padding: courseImg ? 0 : '', overflow: 'hidden', position: 'relative' }}>
                                                {courseImg ? (
                                                    <img 
                                                        src={getImageUrl(courseImg)} 
                                                        alt={course.name} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    />
                                                ) : (
                                                    <LandscapeIcon />
                                                )}
                                            </div>
                                            <div className="course-item-details">
                                                <h3 className="course-item-title">
                                                    {course.name} <span className="result-type-badge course-badge">Course</span>
                                                </h3>
                                                <p className="course-item-desc">{course.description || "No description provided."}</p>
                                                
                                                <div className="course-item-meta-top">
                                                    <span className="course-instructor">
                                                        <PersonOutlineIcon fontSize="small"/> {course.instructorName || "Instructor"}
                                                    </span>
                                                    <div className="course-rating">
                                                        <StarIcon fontSize="small" style={{ color: "#f59e0b" }} /> 
                                                        <strong>4.8</strong>
                                                        <span className="rating-count">(120)</span>
                                                    </div>
                                                    <span className="course-duration">
                                                        <AccessTimeIcon fontSize="small"/> Self-paced
                                                    </span>
                                                    {course.facilityName && (
                                                        <span className="course-facility-meta">
                                                            <ApartmentIcon fontSize="inherit" style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                            {course.facilityName}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="course-item-pricing-row">
                                                    <div className="cip-prices">
                                                        <span className="cip-current">
                                                            {course.cost ? `$${course.cost.toFixed(2)}` : "Free"}
                                                        </span>
                                                    </div>
                                                    <button className="cip-add-cart" onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}`); }}>
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* --- Facilities Results --- */}
                                {showFacilities && results.facilities.map((fac) => {
                                    const facImg = fac.imageUrl || fac.image || fac.ImageUrl || fac.Image || fac.logo || fac.Logo;
                                    return (
                                        <div
                                            className="course-item search-result-item facility-result"
                                            key={`facility-${fac.id}`}
                                            onClick={() => navigate(`/facility/${fac.id}`)}
                                        >
                                            <div className="course-item-image facility-image-wrapper" style={{ padding: facImg ? 0 : '', overflow: 'hidden', position: 'relative' }}>
                                                {facImg ? (
                                                    <img 
                                                        src={getImageUrl(facImg)} 
                                                        alt={fac.name} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    />
                                                ) : (
                                                    <ApartmentIcon style={{ fontSize: 60, color: "#9ca3af" }} />
                                                )}
                                            </div>
                                            <div className="course-item-details">
                                                <h3 className="course-item-title">
                                                    {fac.name} <span className="result-type-badge facility-badge">Facility</span>
                                                </h3>
                                                <p className="course-item-desc">{fac.description || "Explore this educational facility and its courses."}</p>
                                                
                                                <div className="course-item-meta-top">
                                                    {fac.categoryName && (
                                                        <span className="course-instructor">
                                                            <strong>Category:</strong> {fac.categoryName}
                                                        </span>
                                                    )}
                                                    <span className="course-duration">
                                                        <strong>Type:</strong> {fac.type || "Training Center"}
                                                    </span>
                                                    <span className="course-rating">
                                                        <strong>Status:</strong> {fac.status || "Active"}
                                                    </span>
                                                </div>
                                                
                                                <div className="course-item-pricing-row">
                                                    <div className="cip-prices">
                                                        <span className="cip-current" style={{ fontSize: '1rem', color: '#6b7280' }}>
                                                            Facility Profile
                                                        </span>
                                                    </div>
                                                    <button className="cip-add-cart" onClick={(e) => { e.stopPropagation(); navigate(`/facility/${fac.id}`); }}>
                                                        Explore Facility
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
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
