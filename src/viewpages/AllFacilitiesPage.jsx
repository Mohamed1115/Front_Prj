import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AllFacilitiesPage.css";
import { getAllFacilities, getAllCategories, getImageUrl } from "../services/Api";

// MUI Icons
import LandscapeIcon from "@mui/icons-material/Landscape";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import BusinessIcon from "@mui/icons-material/Business";

export default function AllFacilitiesPage() {
    const navigate = useNavigate();
    const [facilities, setFacilities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategoryId, setActiveCategoryId] = useState("All");
    const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                
                const [facilitiesData, categoriesData] = await Promise.all([
                    getAllFacilities(),
                    getAllCategories()
                ]);

                const fArray = Array.isArray(facilitiesData) ? facilitiesData : (facilitiesData?.data || []);
                const cArray = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

                setFacilities(fArray);
                setCategories(cArray);
            } catch (err) {
                console.error("Error fetching facilities data:", err);
                setError("Failed to load facilities. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filter facilities based on active category
    const filteredFacilities = activeCategoryId === "All"
        ? facilities
        : facilities.filter(f => {
            const catId = f.categoryId || f.CategoryId;
            return catId == activeCategoryId;
        });

    return (
        <div className="all-facilities-page">
            <div className="facilities-layout-container">
                
                {/* Header & Title */}
                <div className="facilities-header-wrapper">
                    <h1 className="facilities-page-title">Educational Facilities</h1>
                    <p className="facilities-page-subtitle">Explore training centers, schools, and educational institutes near you</p>
                </div>

                {/* Filters Row */}
                <div className="facilities-filters-row">
                    <div className="category-chips">
                        <button
                            className={`category-chip ${activeCategoryId === "All" ? "active" : ""}`}
                            onClick={() => setActiveCategoryId("All")}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id || cat.Id}
                                className={`category-chip ${activeCategoryId == (cat.id || cat.Id) ? "active" : ""}`}
                                onClick={() => setActiveCategoryId(cat.id || cat.Id)}
                            >
                                {cat.name || cat.Name}
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

                {/* Facilities List/Grid Area */}
                {loading ? (
                    <div className="facilities-status-message">
                        <p>Loading facilities...</p>
                    </div>
                ) : error ? (
                    <div className="facilities-status-message error">
                        <p>{error}</p>
                    </div>
                ) : filteredFacilities.length === 0 ? (
                    <div className="facilities-status-message">
                        <p>No facilities found matching the criteria.</p>
                    </div>
                ) : (
                    <div className={`facilities-content-area ${viewMode}-view`}>
                        {filteredFacilities.map(fac => {
                            const facImage = fac.image || fac.Image || fac.imageUrl || fac.ImageUrl || fac.imagePath || fac.ImagePath || fac.logo || fac.Logo || fac.picture || fac.Picture;
                            const facName = fac.name || fac.Name || fac.title || "Facility Name";
                            const facType = fac.type || fac.Type || fac.subtitle || "Educational Facility";
                            const facDesc = fac.desc || fac.description || fac.Description || "Providing premium learning opportunities and courses.";
                            const categoryName = fac.category?.name || fac.category?.Name || fac.Category?.Name || null;

                            return (
                                <div 
                                    className="facility-item" 
                                    key={fac.id || fac.Id}
                                    onClick={() => navigate(`/facility/${fac.id || fac.Id}`)}
                                >
                                    <div className="facility-item-image">
                                        {facImage ? (
                                            <img src={getImageUrl(facImage)} alt={facName} />
                                        ) : (
                                            <BusinessIcon className="placeholder-icon" />
                                        )}
                                    </div>
                                    <div className="facility-item-details">
                                        <div className="facility-item-type-tag">{facType}</div>
                                        <h3 className="facility-item-title">{facName}</h3>
                                        <p className="facility-item-desc">{facDesc}</p>
                                        
                                        <div className="facility-item-meta">
                                            {categoryName && (
                                                <span className="facility-category-label">
                                                    Category: {categoryName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <footer className="all-facilities-footer">
                <p>&copy; {new Date().getFullYear()} Zumra. All rights reserved.</p>
            </footer>
        </div>
    );
}
