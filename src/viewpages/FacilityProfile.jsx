import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getFacilityById, getGroups, getAllCourses, getImageUrl } from "../services/Api";
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


// ─── Component ───────────────────────────────────────────
export default function FacilityProfile() {
    const { facilityId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [facility, setFacility] = useState(null);
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("courses");
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const facData = await getFacilityById(facilityId);
                const facilityObj = facData?.data || facData || null;
                setFacility(facilityObj);

                const grpsData = await getGroups(facilityId);
                const grps = Array.isArray(grpsData) ? grpsData : (grpsData?.data || []);

                const allCoursesData = await getAllCourses();
                const allC = Array.isArray(allCoursesData) ? allCoursesData : (allCoursesData?.data || []);
                const facCourses = allC.filter(c => String(c.facilityId) === String(facilityId));
                
                setCourses(facCourses);

                // Map groups to categories and add count
                const cats = grps.map(g => {
                    const count = facCourses.filter(c => String(c.groupId) === String(g.id || g.Id)).length;
                    return {
                        id: g.id || g.Id,
                        name: g.name || g.Name,
                        description: g.description || g.Description || "Category description",
                        count: count
                    };
                });
                setCategories(cats);

                // Auto-select group from navigation state if present
                const passedGroupId = location.state?.selectedGroupId;
                if (passedGroupId) {
                    const matchedCat = cats.find(c => String(c.id) === String(passedGroupId));
                    if (matchedCat) {
                        setSelectedCategory(matchedCat);
                        setActiveTab("courses");
                    }
                }

            } catch (err) {
                console.error("Failed to load facility data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [facilityId, location.state]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setActiveTab("courses");
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
    };

    if (loading) {
        return <div className="facility-page"><p style={{padding: '2rem'}}>Loading facility data...</p></div>;
    }

    if (!facility) {
        return <div className="facility-page"><p style={{padding: '2rem'}}>Facility not found.</p></div>;
    }

    const facImage = facility.image || facility.Image || facility.imageUrl || facility.ImageUrl || facility.imagePath || facility.ImagePath || facility.logo || facility.Logo || facility.picture || facility.Picture;

    return (
        <div className="facility-page">
            {/* ═══ Facility Header ═══ */}
            <section className="facility-header">
                <div className="facility-header-left">
                    <div className="facility-header-icon" style={{ padding: facImage ? 0 : '', overflow: 'hidden' }}>
                        {facImage ? (
                            <img src={getImageUrl(facImage)} alt={facility.name || facility.Name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <LandscapeIcon style={{ fontSize: 40, color: "#fff" }} />
                        )}
                    </div>
                    <div className="facility-header-info">
                        <div className="facility-header-name-row">
                            <h1 className="facility-header-name">{facility.name || facility.Name} ⚙</h1>
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
                            courses={courses.filter(c => String(c.groupId) === String(selectedCategory.id))}
                            onBack={handleBackToCategories}
                        />
                    )}

                    {activeTab === "live" && (
                        <CoursesListView
                            categoryName="Live Sessions"
                            courses={courses.filter(c => String(c.groupId) === String(selectedCategory.id) && c.type === 'Live')}
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
            </footer>
        </div>
    );
}

// ─── Categories Sub-View ─────────────────────────────────
function CategoriesView({ categories, onCategoryClick }) {
    return (
        <section className="categories-section">
            <div className="categories-label">
                <h3>Groups</h3>
                <p className="categories-subtitle">Browse by subject area</p>
            </div>
            <div className="categories-grid">
                {categories.map((cat) => (
                    <div
                        className="category-card"
                        key={cat.id}
                        onClick={() => onCategoryClick(cat)}
                    >
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
                    <div className="course-list-card" key={course.id || course.Id} onClick={() => navigate(`/course/${course.id || course.Id}`)} style={{ cursor: "pointer" }}>
                        <div className="course-list-image" style={{ padding: (course.imageUrl || course.image || course.ImageUrl || course.Image) ? 0 : '', overflow: 'hidden' }}>
                            {(course.imageUrl || course.image || course.ImageUrl || course.Image) ? (
                                <img src={getImageUrl(course.imageUrl || course.image || course.ImageUrl || course.Image)} alt={course.name || course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <LandscapeIcon style={{ fontSize: 40, color: "#9ca3af" }} />
                            )}
                        </div>
                        <div className="course-list-content">
                            <h3 className="course-list-title">{course.name || course.title || course.Name}</h3>
                            <p className="course-list-desc">{course.description || course.Description}</p>
                            <div className="course-list-badges">
                                <div className="clb-item">
                                    <div className="clb-icon">
                                        <StarBorderIcon style={{ fontSize: 16 }} />
                                    </div>
                                    <span>{course.rating || "4.0"}</span>
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
                                    <span>{course.instructor || "Instructor"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="course-list-actions">
                            <div className="cla-top-row">
                                <span className="cla-add-to-cart">Add to Cart</span>
                                <span className="cla-price">{(course.cost || course.price || course.Cost || course.Price) ? `$${course.cost || course.price || course.Cost || course.Price}` : "Free"}</span>
                            </div>
                            <button className="cla-buy-btn">Buy now</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
