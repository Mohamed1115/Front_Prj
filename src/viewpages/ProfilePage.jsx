import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

// MUI Icons
import PersonIcon from "@mui/icons-material/Person";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import LandscapeIcon from "@mui/icons-material/Landscape";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideocamIcon from "@mui/icons-material/Videocam";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import MessageIcon from "@mui/icons-material/Message";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import { 
    getAllFacilities, 
    getFacilitiesByUserId, 
    createFacility, 
    updateFacility, 
    deleteFacility, 
    getAllCategories, 
    getImageUrl,
    getUserProfile,
    updateUserProfile,
    changeUserEmail,
    uploadUserAvatar,
    updateUserAvatar,
    deleteUserAvatar
} from "../services/Api";

// ─── Component ───────────────────────────────────────────
export default function ProfilePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");

    // Extract userId from JWT token
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Common .NET Identity claim names
            return payload.sub ||
                   payload.nameid ||
                   payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
                   payload.userId ||
                   null;
        } catch { return null; }
    };

    // Theme state (synced with global)
    const [selectedTheme, setSelectedTheme] = useState(() => {
        return localStorage.getItem('zumra-theme') || 'dark';
    });

    const [selectedLang, setSelectedLang] = useState("english");

    // Apply theme globally
    const applyTheme = (themeId) => {
        setSelectedTheme(themeId);
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('zumra-theme', themeId);
    };

    // Sync on mount
    useEffect(() => {
        const saved = localStorage.getItem('zumra-theme') || 'dark';
        setSelectedTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
    }, []);

    // Form Data - Profile
    const [profileData, setProfileData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        imageUrl: null,
        userName: ""
    });
    const [originalEmail, setOriginalEmail] = useState("");

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    // Load Profile from Backend
    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await getUserProfile();
                if (data) {
                    setProfileData({
                        fullName: data.name || data.Name || "",
                        email: data.email || data.Email || "",
                        phoneNumber: data.phone || data.Phone || data.phoneNumber || data.PhoneNumber || "",
                        imageUrl: data.imageUrl || data.ImageUrl || null,
                        userName: data.userName || data.UserName || ""
                    });
                    setOriginalEmail(data.email || data.Email || "");
                }
            } catch (error) {
                console.error("Failed to load user profile:", error);
            }
        }
        if (activeTab === 'profile') {
            fetchProfile();
        }
    }, [activeTab]);

    // Handle Profile Save
    const handleProfileSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            toast.loading("Saving changes...", { id: "profile-save" });
            
            // Call update profile endpoint
            await updateUserProfile({
                name: profileData.fullName,
                phoneNumber: profileData.phoneNumber,
                userName: profileData.userName || profileData.fullName
            });

            // Handle email change if it was modified
            if (profileData.email && profileData.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase()) {
                await changeUserEmail(profileData.email.trim());
                toast.success("Profile updated. A confirmation email has been sent to confirm your new email address.", { id: "profile-save" });
            } else {
                toast.success("Profile updated successfully!", { id: "profile-save" });
            }

            // Re-fetch profile
            const data = await getUserProfile();
            if (data) {
                setProfileData({
                    fullName: data.name || data.Name || "",
                    email: data.email || data.Email || "",
                    phoneNumber: data.phone || data.Phone || data.phoneNumber || data.PhoneNumber || "",
                    imageUrl: data.imageUrl || data.ImageUrl || null,
                    userName: data.userName || data.UserName || ""
                });
                setOriginalEmail(data.email || data.Email || "");
            }
        } catch (error) {
            toast.error(error.message || "Failed to update profile", { id: "profile-save" });
        }
    };

    // Avatar Upload Handlers
    const handleAvatarClick = () => {
        document.getElementById("avatar-input")?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            toast.loading("Uploading avatar...", { id: "avatar-upload" });
            let response;
            if (profileData.imageUrl) {
                response = await updateUserAvatar(formData);
            } else {
                response = await uploadUserAvatar(formData);
            }
            
            setProfileData(prev => ({
                ...prev,
                imageUrl: response.imageUrl || response.ImageUrl || response.data?.imageUrl
            }));
            
            toast.success("Avatar updated successfully!", { id: "avatar-upload" });
            
            // Re-fetch profile to ensure synchronization
            const updated = await getUserProfile();
            if (updated) {
                setProfileData(prev => ({
                    ...prev,
                    imageUrl: updated.imageUrl || updated.ImageUrl || null
                }));
            }
        } catch (error) {
            toast.error(error.message || "Failed to upload avatar", { id: "avatar-upload" });
        }
    };

    const handleAvatarDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your avatar?")) return;
        try {
            toast.loading("Deleting avatar...", { id: "avatar-delete" });
            await deleteUserAvatar();
            setProfileData(prev => ({ ...prev, imageUrl: null }));
            toast.success("Avatar deleted successfully!", { id: "avatar-delete" });
        } catch (error) {
            toast.error(error.message || "Failed to delete avatar", { id: "avatar-delete" });
        }
    };

    // --- Facilities State ---
    const [facilities, setFacilities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
    const [facilityView, setFacilityView] = useState("list"); // list, add, edit
    const [currentFacility, setCurrentFacility] = useState({ id: null, name: "", description: "", type: "", categoryId: "", image: null });

    // Fetch Categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await getAllCategories();
                setCategories(data || []);
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        }
        if (activeTab === 'facility') {
            fetchCategories();
        }
    }, [activeTab]);

    useEffect(() => {
        async function fetchFacilities() {
            try {
                setIsLoadingFacilities(true);
                const userId = getUserIdFromToken();
                const data = userId
                    ? await getFacilitiesByUserId(userId)
                    : await getAllFacilities();
                setFacilities(Array.isArray(data) ? data : []);
            } catch (error) {
                toast.error(error.message || "Failed to load facilities");
                setFacilities([]);
            } finally {
                setIsLoadingFacilities(false);
            }
        }
        if (activeTab === 'facility' && facilityView === 'list') {
            fetchFacilities();
        }
    }, [activeTab, facilityView]);

    const handleFacilitySubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("Name", currentFacility.name);
            formData.append("Description", currentFacility.description);
            
            const selectedCat = categories.find(c => c.id.toString() === currentFacility.categoryId.toString() || c.Id?.toString() === currentFacility.categoryId.toString());
            const typeName = selectedCat ? (selectedCat.name || selectedCat.Name) : "Default";
            
            formData.append("Type", typeName);
            formData.append("CategoryId", currentFacility.categoryId);
            
            if (currentFacility.image) {
                formData.append("Image", currentFacility.image);
            }

            if (facilityView === "add") {
                if (!currentFacility.image) {
                    toast.error("Image is required to create a facility.");
                    return;
                }
                await createFacility(formData);
                toast.success("Facility created successfully");
            } else if (facilityView === "edit") {
                await updateFacility(currentFacility.id, formData);
                toast.success("Facility updated successfully");
            }
            setFacilityView("list");
        } catch (error) {
            toast.error(error.message || "Failed to save facility");
        }
    };

    const handleDeleteFacility = async (id) => {
        if (!window.confirm("Are you sure you want to delete this facility?")) return;
        try {
            await deleteFacility(id);
            toast.success("Facility deleted successfully");
            const userId = getUserIdFromToken();
            const data = userId ? await getFacilitiesByUserId(userId) : await getAllFacilities();
            setFacilities(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error.message || "Failed to delete facility");
        }
    };

    const openEditFacility = (fac) => {
        setCurrentFacility({ 
            id: fac.id || fac.Id, 
            name: fac.name || fac.Name || "", 
            description: fac.description || fac.Description || "",
            categoryId: fac.categoryId || fac.CategoryId || "",
            type: fac.type || fac.Type || "",
            image: null
        });
        setFacilityView("edit");
    };

    return (
        <div className="profile-layout-wrapper">
            
            {/* Breadcrumb */}
            <div className="profile-breadcrumb">
                <span onClick={() => navigate('/home')}>Home</span>
                <span className="bc-sep">›</span>
                <span>Control Panel</span>
                <span className="bc-sep">›</span>
                <span className="bc-active">
                    {activeTab === 'profile' && 'User Profile'}
                    {activeTab === 'facility' && 'Facility'}
                    {activeTab === 'settings' && 'Setting'}
                </span>
            </div>

            <div className="profile-dashboard-container">
                
                {/* ═══ LEFT SIDEBAR ═══ */}
                <aside className="profile-sidebar">
                    <nav className="sidebar-nav">
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <PersonIcon /> User Profile
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'facility' ? 'active' : ''}`}
                            onClick={() => setActiveTab('facility')}
                        >
                            <HomeWorkIcon /> Facility
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <SettingsIcon /> Setting
                        </button>
                    </nav>
                </aside>


                {/* ═══ RIGHT MAIN CONTENT ═══ */}
                <main className="profile-main-content">

                    <div className="profile-content-area">

                        {/* 1. PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="tab-pane-profile">
                                <div className="profile-avatar-row">
                                    <div 
                                        className="profile-avatar-circle" 
                                        onClick={handleAvatarClick} 
                                        style={{ cursor: "pointer", position: "relative", width: 140, height: 140, borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", background: "var(--bg-secondary, #374151)" }}
                                    >
                                        {profileData.imageUrl ? (
                                            <img 
                                                src={getImageUrl(profileData.imageUrl)} 
                                                alt="Avatar" 
                                                style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "-webkit-optimize-contrast" }} 
                                            />
                                        ) : (
                                            <AccountCircleIcon style={{fontSize: 140, color: "#9ca3af"}} />
                                        )}
                                        <div className="avatar-edit-badge" style={{ position: "absolute", bottom: 6, right: 6 }}><EditIcon fontSize="medium"/></div>
                                        <input 
                                            type="file" 
                                            id="avatar-input" 
                                            accept="image/*" 
                                            style={{ display: "none" }} 
                                            onChange={handleAvatarChange} 
                                        />
                                    </div>
                                    <div className="profile-avatar-text">
                                        <h3>Your Avatar</h3>
                                        <p>PNG or JPG no larger than 800px wide and tall.</p>
                                        {profileData.imageUrl && (
                                            <button 
                                                onClick={handleAvatarDelete}
                                                style={{ 
                                                    background: "none", 
                                                    border: "none", 
                                                    color: "#ef4444", 
                                                    cursor: "pointer", 
                                                    fontSize: "0.85rem", 
                                                    padding: "5px 0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "3px"
                                                }}
                                            >
                                                <DeleteIcon fontSize="inherit" /> Delete Avatar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <form className="profile-form" onSubmit={handleProfileSubmit}>
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} required />
                                        </div>
                                    </div>

                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileChange} />
                                        </div>
                                    </div>

                                    <div className="form-actions-row">
                                        <button 
                                            type="button" 
                                            className="btn-secondary" 
                                            onClick={async () => {
                                                try {
                                                    const data = await getUserProfile();
                                                    if (data) {
                                                        setProfileData({
                                                            fullName: data.name || data.Name || "",
                                                            email: data.email || data.Email || "",
                                                            phoneNumber: data.phone || data.Phone || data.phoneNumber || data.PhoneNumber || "",
                                                            imageUrl: data.imageUrl || data.ImageUrl || null,
                                                            userName: data.userName || data.UserName || ""
                                                        });
                                                    }
                                                } catch (err) {
                                                    toast.error("Failed to discard changes");
                                                }
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 2. FACILITY TAB */}
                        {activeTab === 'facility' && (
                            <div className="tab-pane-facility">
                                {facilityView === "list" ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 className="settings-section-title">My Facilities</h3>
                                                <p className="settings-subtitle">Manage your facilities and related courses.</p>
                                            </div>
                                            <button 
                                                className="btn-primary" 
                                                onClick={() => {
                                                    setCurrentFacility({ id: null, name: "", description: "", type: "", categoryId: "", image: null });
                                                    setFacilityView("add");
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <AddIcon fontSize="small"/> Add Facility
                                            </button>
                                        </div>

                                        {isLoadingFacilities ? (
                                            <p style={{color: 'var(--text-secondary)'}}>Loading facilities...</p>
                                        ) : !Array.isArray(facilities) || facilities.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                                                <HomeWorkIcon style={{ fontSize: 60, color: 'var(--text-muted, #9ca3af)' }} />
                                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>You don't have any facilities yet.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {facilities.map((fac, idx) => {
                                                    const facImage = fac.image || fac.Image || fac.imageUrl || fac.ImageUrl || fac.imagePath || fac.ImagePath || fac.logo || fac.Logo || fac.picture || fac.Picture;
                                                    const facStatus = fac.status || fac.Status || "Active";
                                                    const facRole = fac.role || "";
                                                    const isSuperAdmin = facRole === "FacilitySuperAdmin" || facRole === "SuperAdmin";
                                                    const roleLabel = facRole
                                                        ? facRole.replace(/([A-Z])/g, ' $1').trim()
                                                        : "";
                                                    return (
                                                        <div key={fac.id || fac.Id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                                <div style={{ width: 60, height: 60, borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                    {facImage ? (
                                                                        <img src={getImageUrl(facImage)} alt={fac.name || fac.Name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <HomeWorkIcon style={{ color: 'var(--text-muted)' }} />
                                                                    )}
                                                                </div>
                                                                 <div>
                                                                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        {fac.name || fac.Name || "Unnamed Facility"}
                                                                        {facStatus && (
                                                                            <span style={{ 
                                                                                fontSize: '0.75rem', 
                                                                                padding: '2px 8px', 
                                                                                borderRadius: '12px', 
                                                                                background: facStatus === 'Pending' ? '#fef08a' : '#bbf7d0', 
                                                                                color: facStatus === 'Pending' ? '#854d0e' : '#166534' 
                                                                            }}>
                                                                                {facStatus}
                                                                            </span>
                                                                        )}
                                                                        {roleLabel && (
                                                                            <span style={{
                                                                                fontSize: '0.72rem',
                                                                                padding: '2px 8px',
                                                                                borderRadius: '12px',
                                                                                background: isSuperAdmin ? '#ede9fe' : '#e0e7ff',
                                                                                color: isSuperAdmin ? '#6d28d9' : '#3730a3',
                                                                                fontWeight: 600
                                                                            }}>
                                                                                {roleLabel}
                                                                            </span>
                                                                        )}
                                                                    </h4>
                                                                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{fac.description || fac.Description || "No description provided."}</p>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                {isSuperAdmin && (
                                                                    <button className="btn-primary" onClick={() => navigate(`/facility-dashboard/${fac.id || fac.Id}`, { state: { facility: fac } })} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#7c3aed', borderColor: '#7c3aed' }}>
                                                                        Give Access
                                                                    </button>
                                                                )}
                                                                {facStatus === "Pending" && (
                                                                    <button className="btn-primary" onClick={() => navigate(`/activate-facility/${fac.id || fac.Id}`, { state: { facility: fac } })} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                        Activate
                                                                    </button>
                                                                )}
                                                                <button className="btn-secondary" onClick={() => navigate(`/facility-settings/${fac.id || fac.Id}`, { state: { facility: fac } })} style={{ display: 'flex', alignItems: 'center', gap: '5px' }} title="Facility Settings">
                                                                    <SettingsIcon fontSize="small"/>
                                                                </button>
                                                                {isSuperAdmin && (
                                                                    <>
                                                                        <button className="btn-secondary" onClick={() => openEditFacility(fac)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                            <EditIcon fontSize="small"/> Edit
                                                                        </button>
                                                                        <button className="btn-secondary" onClick={() => handleDeleteFacility(fac.id || fac.Id)} style={{ color: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                            <DeleteIcon fontSize="small"/>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h3 className="settings-section-title">
                                            {facilityView === "add" ? "Add New Facility" : "Edit Facility"}
                                        </h3>
                                        <p className="settings-subtitle">Enter facility details below.</p>
                                        <form className="settings-form" onSubmit={handleFacilitySubmit}>
                                            <div className="form-group">
                                                <label>Facility Name <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter facility name..."
                                                    value={currentFacility.name} 
                                                    onChange={(e) => setCurrentFacility({...currentFacility, name: e.target.value})}
                                                    required 
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Category (Type) <span style={{color: '#ef4444'}}>*</span></label>
                                                <select 
                                                    value={currentFacility.categoryId} 
                                                    onChange={(e) => setCurrentFacility({...currentFacility, categoryId: e.target.value})}
                                                    required
                                                    style={{ padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--card-bg)" }}
                                                >
                                                    <option value="" disabled>-- Select a Category --</option>
                                                    {categories.map((cat, idx) => (
                                                        <option key={cat.id || cat.Id || idx} value={cat.id || cat.Id}>
                                                            {cat.name || cat.Name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Image <span style={{color: '#ef4444'}}>{facilityView === "add" ? "*" : ""}</span></label>
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => setCurrentFacility({...currentFacility, image: e.target.files[0]})}
                                                    required={facilityView === "add"}
                                                    style={{ padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--card-bg)" }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea 
                                                    rows="4" 
                                                    placeholder="Enter facility description..." 
                                                    value={currentFacility.description}
                                                    onChange={(e) => setCurrentFacility({...currentFacility, description: e.target.value})}
                                                />
                                            </div>
                                            <div className="form-actions-row" style={{marginTop: '2rem'}}>
                                                <button type="button" className="btn-secondary" onClick={() => setFacilityView("list")}>Cancel</button>
                                                <button type="submit" className="btn-primary">Save Facility</button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}

                        {/* 3. MY COURSES TAB */}
                        {activeTab === 'my-courses' && (
                            <div className="tab-pane-my-courses">
                                {[1, 2, 3, 4].map(num => (
                                    <div className="enrolled-course-card" key={num}>
                                        <div className="ecc-image">
                                            <LandscapeIcon />
                                            <div className="ecc-play-overlay">
                                                <PlayArrowIcon />
                                            </div>
                                        </div>
                                        <div className="ecc-details">
                                            <h3>Complete Drawing Course Ultimate Drawing Art with Pencil</h3>
                                            <p className="ecc-author">Jane Cooper • 15h 30m total</p>
                                            
                                            <div className="ecc-progress-container">
                                                <div className="ecc-progress-bar">
                                                    <div className="ecc-progress-fill" style={{width: num === 1 ? '45%' : num === 2 ? '100%' : '10%'}}></div>
                                                </div>
                                                <span className="ecc-progress-text">{num === 1 ? '45%' : num === 2 ? '100%' : '10%'} Complete</span>
                                            </div>

                                            <div className="ecc-actions">
                                                {num === 2 ? (
                                                    <button className="ecc-btn-outline"><LocalPrintshopIcon fontSize="small"/> Certificate</button>
                                                ) : (
                                                    <button className="ecc-btn-outline"><PlayArrowIcon fontSize="small"/> Continue</button>
                                                )}
                                                <button className="ecc-btn-outline"><MessageIcon fontSize="small"/> Q&A</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 4. SETTINGS TAB — Themes + Language */}
                        {activeTab === 'settings' && (
                            <div className="tab-pane-settings">
                                
                                {/* Themes Section */}
                                <h3 className="settings-section-title">Themes</h3>
                                <hr className="settings-divider" />
                                <div className="settings-radio-group">
                                    <label className="settings-radio-item">
                                        <input 
                                            type="radio" 
                                            name="theme" 
                                            value="dark" 
                                            checked={selectedTheme === 'dark'} 
                                            onChange={() => applyTheme('dark')}
                                        />
                                        <span className="radio-dot"></span>
                                        Default
                                    </label>
                                    <label className="settings-radio-item">
                                        <input 
                                            type="radio" 
                                            name="theme" 
                                            value="blue" 
                                            checked={selectedTheme === 'blue'} 
                                            onChange={() => applyTheme('blue')}
                                        />
                                        <span className="radio-dot"></span>
                                        Blue Theme
                                    </label>
                                    <label className="settings-radio-item">
                                        <input 
                                            type="radio" 
                                            name="theme" 
                                            value="yellow" 
                                            checked={selectedTheme === 'yellow'} 
                                            onChange={() => applyTheme('yellow')}
                                        />
                                        <span className="radio-dot"></span>
                                        Yellow Theme
                                    </label>
                                </div>

                                {/* Language Section */}
                                <h3 className="settings-section-title" style={{marginTop: 40}}>Language</h3>
                                <hr className="settings-divider" />
                                <div className="settings-radio-group">
                                    <label className="settings-radio-item">
                                        <input 
                                            type="radio" 
                                            name="language" 
                                            value="english" 
                                            checked={selectedLang === 'english'} 
                                            onChange={() => setSelectedLang('english')}
                                        />
                                        <span className="radio-dot"></span>
                                        English
                                    </label>
                                    <label className="settings-radio-item">
                                        <input 
                                            type="radio" 
                                            name="language" 
                                            value="arabic" 
                                            checked={selectedLang === 'arabic'} 
                                            onChange={() => setSelectedLang('arabic')}
                                        />
                                        <span className="radio-dot"></span>
                                        Arabic
                                    </label>
                                </div>

                                <div className="form-actions-row" style={{marginTop: 40}}>
                                    <button className="btn-primary">Save</button>
                                </div>
                            </div>
                        )}

                    </div>
                </main>

            </div>

            {/* Footer */}
            <footer className="profile-footer">
                <div className="footer-logo">LOGO</div>
                <div className="footer-links">
                    <a href="#">FAQS</a>
                    <a href="#">CONTACT US</a>
                    <a href="#">ZUMRA FOUNDERS</a>
                </div>
                <div className="footer-social">
                    <a href="#"><FacebookIcon /></a>
                    <a href="#"><InstagramIcon /></a>
                    <a href="#"><XIcon /></a>
                </div>
            </footer>
        </div>
    );
}
