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
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import MessageIcon from "@mui/icons-material/Message";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";

// ─── Component ───────────────────────────────────────────
export default function ProfilePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");

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
        fullName: "Amr Ahmed",
        email: "Amrmohammedd99@gmail.com",
        facilityName: "ZUMRA",
        phoneNumber: "01099684122",
        bio: "Passionate developer and instructor."
    });

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
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
                    {activeTab === 'my-courses' && 'My Learning'}
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
                            className={`sidebar-nav-item ${activeTab === 'my-courses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('my-courses')}
                        >
                            <MenuBookIcon /> My Learning
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
                                    <div className="profile-avatar-circle">
                                        <AccountCircleIcon style={{fontSize: 80, color: "#9ca3af"}} />
                                        <div className="avatar-edit-badge"><EditIcon fontSize="small"/></div>
                                    </div>
                                    <div className="profile-avatar-text">
                                        <h3>Your Avatar</h3>
                                        <p>PNG or JPG no larger than 800px wide and tall.</p>
                                    </div>
                                </div>

                                <div className="profile-form">
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} />
                                        </div>
                                    </div>

                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Facility Name (Optional)</label>
                                            <input type="text" name="facilityName" value={profileData.facilityName} onChange={handleProfileChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileChange} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Bio</label>
                                        <textarea rows="4" name="bio" value={profileData.bio} onChange={handleProfileChange} />
                                    </div>

                                    <div className="form-actions-row">
                                        <button className="btn-secondary">Cancel</button>
                                        <button className="btn-primary">Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. FACILITY TAB */}
                        {activeTab === 'facility' && (
                            <div className="tab-pane-facility">
                                <h3 className="settings-section-title">Facility Information</h3>
                                <p className="settings-subtitle">Manage your facility details and courses.</p>
                                <div className="settings-form">
                                    <div className="form-group">
                                        <label>Facility Name</label>
                                        <input type="text" value="ZUMRA" readOnly />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea rows="4" placeholder="Enter facility description..." />
                                    </div>
                                    <div className="form-actions-row">
                                        <button className="btn-secondary">Cancel</button>
                                        <button className="btn-primary">Save</button>
                                    </div>
                                </div>
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
                <p className="footer-copyright">©Copyrights 2026</p>
            </footer>
        </div>
    );
}
