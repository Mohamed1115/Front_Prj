import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateFacilityPage.css";

// MUI Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";

export default function CreateFacilityPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        category: "",
        description: "",
        website: "",
        address: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log("Facility created:", formData);
        navigate("/checkout");
    };

    return (
        <div className="create-facility-page">
            {/* Breadcrumb */}
            <div className="create-facility-breadcrumb">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/home"); }}>Home</a>
                {" > "}
                <span>Create Facility</span>
            </div>

            <h1 className="create-facility-title">Create Facility</h1>

            <div className="create-facility-container">
                <div className="create-facility-form">
                    {/* Logo Upload */}
                    <div className="create-facility-section">
                        <h3>Facility Logo</h3>
                        <div className="cf-logo-upload">
                            <CloudUploadIcon />
                            <p>Upload Logo</p>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="create-facility-section">
                        <h3>Facility Information</h3>
                        <div className="cf-form-group">
                            <label>Facility Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter facility name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="cf-form-row">
                            <div className="cf-form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="facility@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="cf-form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="cf-form-row">
                            <div className="cf-form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    <option value="education">Education</option>
                                    <option value="technology">Technology</option>
                                    <option value="design">Design</option>
                                    <option value="business">Business</option>
                                </select>
                            </div>
                            <div className="cf-form-group">
                                <label>Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="cf-form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                placeholder="Facility address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="create-facility-section">
                        <h3>Description</h3>
                        <div className="cf-form-group">
                            <label>About the Facility</label>
                            <textarea
                                name="description"
                                placeholder="Describe your facility..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="create-facility-actions">
                        <button className="cf-cancel-btn" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button className="cf-submit-btn" onClick={handleSubmit}>
                            Create Facility
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="create-facility-footer">
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
