import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateCoursePage.css";

// MUI Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";

export default function CreateCoursePage() {
    const navigate = useNavigate();

    // Basic Info State
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        category: "",
        price: "",
        description: "",
        level: "",
        language: "",
    });

    // Curriculum State (Sections & Lessons)
    const [curriculum, setCurriculum] = useState([
        { id: 1, title: "", lessons: [] }
    ]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Curriculum Builders ---
    const addSection = () => {
        setCurriculum([
            ...curriculum,
            { id: Date.now(), title: "", lessons: [] }
        ]);
    };

    const removeSection = (sectionId) => {
        setCurriculum(curriculum.filter(s => s.id !== sectionId));
    };

    const updateSectionTitle = (sectionId, value) => {
        setCurriculum(curriculum.map(s =>
            s.id === sectionId ? { ...s, title: value } : s
        ));
    };

    const addLesson = (sectionId) => {
        setCurriculum(curriculum.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    lessons: [
                        ...s.lessons,
                        { id: Date.now(), title: "", videoName: "" }
                    ]
                };
            }
            return s;
        }));
    };

    const removeLesson = (sectionId, lessonId) => {
        setCurriculum(curriculum.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    lessons: s.lessons.filter(l => l.id !== lessonId)
                };
            }
            return s;
        }));
    };

    const updateLessonTitle = (sectionId, lessonId, value) => {
        setCurriculum(curriculum.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    lessons: s.lessons.map(l =>
                        l.id === lessonId ? { ...l, title: value } : l
                    )
                };
            }
            return s;
        }));
    };

    const handleVideoUpload = (sectionId, lessonId) => {
        // Mock video upload
        updateLessonTitle(sectionId, lessonId, "Mocking video title..."); // Keep old title mostly
        setCurriculum(curriculum.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    lessons: s.lessons.map(l =>
                        l.id === lessonId ? { ...l, videoName: "lesson_video_v1.mp4" } : l
                    )
                };
            }
            return s;
        }));
    };

    const handleSubmit = () => {
        console.log("Course created:", { ...formData, curriculum });
        navigate("/home");
    };

    return (
        <div className="create-course-page">
            {/* Breadcrumb */}
            <div className="create-course-breadcrumb">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/home"); }}>Home</a>
                {" > "}
                <span>Create Course</span>
            </div>

            <h1 className="create-course-title">Create Course</h1>

            <div className="create-course-container">
                <div className="create-course-form">
                    
                    {/* Basic Info */}
                    <div className="create-course-section">
                        <h3>Basic Information</h3>
                        <div className="cc-form-group">
                            <label>Course Title</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Enter course title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="cc-form-group">
                            <label>Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                placeholder="Enter a brief subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="cc-form-row">
                            <div className="cc-form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    <option value="programming">Programming</option>
                                    <option value="design">Design</option>
                                    <option value="business">Business</option>
                                    <option value="marketing">Marketing</option>
                                </select>
                            </div>
                            <div className="cc-form-group">
                                <label>Price (EG)</label>
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="cc-form-row">
                            <div className="cc-form-group">
                                <label>Level</label>
                                <select name="level" value={formData.level} onChange={handleChange}>
                                    <option value="">Select Level</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="cc-form-group">
                                <label>Language</label>
                                <select name="language" value={formData.language} onChange={handleChange}>
                                    <option value="">Select Language</option>
                                    <option value="arabic">Arabic</option>
                                    <option value="english">English</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Course Curriculum Builder */}
                    <div className="create-course-section">
                        <h3>Course Curriculum</h3>
                        
                        <div className="curriculum-list">
                            {curriculum.map((section, sIdx) => (
                                <div className="cc-curriculum-section-block" key={section.id}>
                                    
                                    {/* Section Header */}
                                    <div className="curriculum-section-header">
                                        <div className="cc-form-group">
                                            <label>Section Title</label>
                                            <input
                                                type="text"
                                                placeholder={`e.g. Section ${sIdx + 1}: Introduction`}
                                                value={section.title}
                                                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                            />
                                        </div>
                                        {curriculum.length > 1 && (
                                            <button 
                                                className="delete-btn" 
                                                title="Remove Section"
                                                onClick={() => removeSection(section.id)}
                                            >
                                                <DeleteOutlineIcon />
                                            </button>
                                        )}
                                    </div>

                                    {/* Lessons List inside Section */}
                                    {section.lessons.length > 0 && (
                                        <div className="cc-curriculum-lessons">
                                            {section.lessons.map((lesson, lIdx) => (
                                                <div className="cc-lesson-block" key={lesson.id}>
                                                    <div className="lesson-header">
                                                        <div className="cc-form-group">
                                                            <label>Lesson Title</label>
                                                            <input
                                                                type="text"
                                                                placeholder={`e.g. Lesson ${lIdx + 1}`}
                                                                value={lesson.title}
                                                                onChange={(e) => updateLessonTitle(section.id, lesson.id, e.target.value)}
                                                            />
                                                        </div>
                                                        <button 
                                                            className="delete-btn" 
                                                            title="Remove Lesson"
                                                            onClick={() => removeLesson(section.id, lesson.id)}
                                                        >
                                                            <DeleteOutlineIcon />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="lesson-upload-row">
                                                        <button 
                                                            className="lesson-upload-btn"
                                                            onClick={() => handleVideoUpload(section.id, lesson.id)}
                                                        >
                                                            <OndemandVideoIcon fontSize="small" />
                                                            {lesson.videoName ? "Change Video" : "Upload Video"}
                                                        </button>
                                                        {lesson.videoName && (
                                                            <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
                                                                {lesson.videoName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Lesson Button */}
                                    <button 
                                        className="add-lesson-btn"
                                        onClick={() => addLesson(section.id)}
                                    >
                                        <AddIcon fontSize="small" /> Add Lesson
                                    </button>

                                </div>
                            ))}
                        </div>

                        {/* Add Section Button */}
                        <button className="add-section-btn" onClick={addSection}>
                            <AddIcon /> Add New Section
                        </button>
                    </div>

                    {/* Description */}
                    <div className="create-course-section">
                        <h3>Course Description</h3>
                        <div className="cc-form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                placeholder="Describe your course in detail..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="create-course-section">
                        <h3>Course Thumbnail</h3>
                        <div className="cc-image-upload">
                            <CloudUploadIcon />
                            <p>Click to upload course image</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="create-course-actions">
                        <button className="cc-cancel-btn" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button className="cc-submit-btn" onClick={handleSubmit}>
                            Create Course
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="create-course-footer">
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
