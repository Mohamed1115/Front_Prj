import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProfilePage.css";

import ListAltIcon from "@mui/icons-material/ListAlt";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import VideocamIcon from "@mui/icons-material/Videocam";

import { getBatchSections, createSection, deleteSection, createLesson, deleteLesson, getLessonsByBatchId, createVideoLesson, createLiveMeeting } from "../services/Api";
import toast from 'react-hot-toast';
import * as tus from "tus-js-client";

export default function BatchControlPanel() {
    const { facilityId, courseId, batchId } = useParams();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState("sections");

    // --- Sections State ---
    const [sections, setSections] = useState([]);
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    const [sectionView, setSectionView] = useState("list"); // list, add
    const [currentSection, setCurrentSection] = useState({ name: "", order: 1 });

    // --- Lessons State ---
    const [lessonView, setLessonView] = useState("list"); // list, add
    const [currentLesson, setCurrentLesson] = useState({ name: "", description: "", type: "Video", duration: 0, sectionId: "" });
    const [allLessons, setAllLessons] = useState([]);
    const [isLoadingLessonsData, setIsLoadingLessonsData] = useState(false);

    // --- Modals State ---
    const [videoModal, setVideoModal] = useState({ open: false, lessonId: null, lessonName: '' });
    const [videoForm, setVideoForm] = useState({ File: null, VideoFormat: '', VideoQuality: '', VideoSize: '', Duration: '' });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const [liveModal, setLiveModal] = useState({ open: false, lessonId: null, lessonName: '' });
    const [liveForm, setLiveForm] = useState({ RoomName: '', DisplayName: '', Email: '', MeetingDuration: 60, EnableRecording: true, EnableChat: true, EnableScreenShare: true, EnableWhiteboard: true, IsModerator: true });

    useEffect(() => {
        if ((activeTab === "sections" && sectionView === "list") || (activeTab === "lessons" && lessonView === "list")) {
            loadSections();
            if (activeTab === "lessons") {
                loadLessons();
            }
        }
    }, [activeTab, sectionView, lessonView, batchId]);

    const loadSections = async () => {
        try {
            setIsLoadingSections(true);
            const data = await getBatchSections(batchId);
            setSections(Array.isArray(data) ? data : (data?.data || data?.$values || []));
        } catch (error) {
            toast.error(error.message || "Failed to load sections");
        } finally {
            setIsLoadingSections(false);
        }
    };

    const loadLessons = async () => {
        try {
            setIsLoadingLessonsData(true);
            const raw = await getLessonsByBatchId(batchId);
            const list = Array.isArray(raw) ? raw : (raw?.data || raw?.$values || []);
            setAllLessons(list);
        } catch (error) {
            toast.error(error.message || "Failed to load lessons");
        } finally {
            setIsLoadingLessonsData(false);
        }
    };

    const handleSectionSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestData = {
                name: currentSection.name,
                order: parseInt(currentSection.order),
                courseId: parseInt(courseId),
                courseBatchId: parseInt(batchId)
            };
            const response = await createSection(facilityId, batchId, requestData);
            toast.success("Section created successfully");
            if (response.Data || response.data) {
                setSections(Array.isArray(response.Data) ? response.Data : (response.data || []));
            } else {
                loadSections();
            }
            setSectionView("list");
        } catch (error) {
            toast.error(error.message || "Failed to create section");
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm("Are you sure you want to delete this section?")) return;
        try {
            const response = await deleteSection(facilityId, batchId, sectionId);
            toast.success("Section deleted successfully");
            if (response.Data || response.data) {
                setSections(Array.isArray(response.Data) ? response.Data : (response.data || []));
            } else {
                loadSections();
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete section");
        }
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestData = {
                CourseId: parseInt(courseId),
                CourseBatchId: parseInt(batchId),
                SectionId: parseInt(currentLesson.sectionId),
                Name: currentLesson.name,
                Description: currentLesson.description,
                Type: currentLesson.type,
                Duration: parseInt(currentLesson.duration) || 0
            };
            await createLesson(facilityId, requestData);
            toast.success("Lesson created successfully");
            loadLessons();
            setLessonView("list");
        } catch (error) {
            toast.error(error.message || "Failed to create lesson");
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await deleteLesson(facilityId, lessonId);
            toast.success("Lesson deleted successfully");
            loadLessons();
        } catch (error) {
            toast.error(error.message || "Failed to delete lesson");
        }
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        if (!videoForm.File) {
            toast.error("Please select a video file");
            return;
        }
        try {
            setIsUploading(true);
            setUploadProgress(0);

            // 1. Tell backend we are creating a video (creates placeholder in Bunny)
            const requestData = {
                Duration: videoForm.Duration || 0,
                VideoSize: videoForm.File.size,
                VideoFormat: videoForm.VideoFormat || videoForm.File.type.split('/')[1] || 'mp4',
                VideoQuality: videoForm.VideoQuality
            };
            const response = await createVideoLesson(facilityId, videoModal.lessonId, requestData);
            const link = response.link; // { Guid, AuthorizationSignature, AuthorizationExpire, LibraryId }

            if (!link || !link.Guid) {
                throw new Error("Invalid upload link from backend");
            }

            // 2. Upload file via TUS to BunnyCDN
            const upload = new tus.Upload(videoForm.File, {
                endpoint: "https://video.bunnycdn.com/tusupload",
                retryDelays: [0, 3000, 5000, 10000, 20000],
                headers: {
                    AuthorizationSignature: link.authorizationSignature || link.AuthorizationSignature,
                    AuthorizationExpire: String(link.authorizationExpire || link.AuthorizationExpire),
                    VideoId: link.guid || link.Guid,
                    LibraryId: String(link.libraryId || link.LibraryId),
                },
                metadata: {
                    filetype: videoForm.File.type,
                    title: videoForm.File.name,
                },
                onError: function (error) {
                    console.error("Failed because: " + error);
                    toast.error("Upload failed: " + error.message);
                    setIsUploading(false);
                },
                onProgress: function (bytesUploaded, bytesTotal) {
                    const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                    setUploadProgress(Number(percentage));
                },
                onSuccess: function () {
                    toast.success("Video uploaded successfully!");
                    setVideoModal({ open: false, lessonId: null, lessonName: '' });
                    setVideoForm({ File: null, VideoFormat: '', VideoQuality: '', VideoSize: '', Duration: '' });
                    setIsUploading(false);
                    setUploadProgress(0);
                    loadLessons();
                }
            });

            upload.start();

        } catch (error) {
            setIsUploading(false);
            toast.error(error.message || "Failed to link video");
        }
    };

    const handleLiveSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await createLiveMeeting(facilityId, liveModal.lessonId, liveForm);
            toast.success("Live meeting created!");
            setLiveModal({ open: false, lessonId: null, lessonName: '' });
            // If the API returns a meeting URL, open it
            const url = result?.url || result?.Url || result?.meetingUrl || result?.MeetingUrl;
            if (url) window.open(url, '_blank');
            loadLessons();
        } catch (error) {
            toast.error(error.message || "Failed to create live meeting");
        }
    };

    return (
        <>
        <div className="profile-layout-wrapper">
            <div className="profile-breadcrumb">
                <span onClick={() => navigate('/home')}>Home</span>
                <span className="bc-sep">›</span>
                <span onClick={() => navigate(`/facility-settings/${facilityId}`)}>Facility Settings</span>
                <span className="bc-sep">›</span>
                <span onClick={() => navigate(`/course-dashboard/${facilityId}/${courseId}`)}>Course Management</span>
                <span className="bc-sep">›</span>
                <span className="bc-active">Batch Management</span>
            </div>

            <div className="profile-dashboard-container">
                <aside className="profile-sidebar">
                    <nav className="sidebar-nav">
                        <button 
                            className="sidebar-nav-item"
                            onClick={() => navigate(`/course-dashboard/${facilityId}/${courseId}`)}
                            style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}
                        >
                            <ArrowBackIcon /> Back to Course
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'sections' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('sections'); setSectionView('list'); }}
                        >
                            <ListAltIcon /> Curriculum (Sections)
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'lessons' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('lessons'); setLessonView('list'); }}
                        >
                            <PlayCircleOutlineIcon /> Lessons
                        </button>
                    </nav>
                </aside>

                <main className="profile-main-content">
                    <div className="profile-content-area">
                        {activeTab === 'sections' && (
                            <div className="tab-pane-profile">
                                {sectionView === "list" ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <h3 className="settings-section-title">Batch Sections</h3>
                                                <p className="settings-subtitle">Manage curriculum sections for this batch.</p>
                                            </div>
                                            <button 
                                                className="btn-primary" 
                                                onClick={() => {
                                                    setCurrentSection({ name: "", order: sections.length + 1 });
                                                    setSectionView("add");
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <AddIcon fontSize="small"/> Add Section
                                            </button>
                                        </div>

                                        {isLoadingSections ? (
                                            <p style={{color: 'var(--text-secondary)'}}>Loading sections...</p>
                                        ) : sections.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                                                <ListAltIcon style={{ fontSize: 60, color: 'var(--text-muted)' }} />
                                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No sections found in this batch. Add one to start organizing content.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {sections.map((sec, idx) => (
                                                    <div key={sec.id || sec.Id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <div style={{ background: 'var(--primary-color)', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                                                                {sec.order || sec.Order || idx + 1}
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600' }}>
                                                                    {sec.name || sec.Name || "Unnamed Section"}
                                                                </h4>
                                                                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                                    Manage lessons inside this section.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button 
                                                                className="btn-primary" 
                                                                onClick={() => {
                                                                    setActiveTab('lessons');
                                                                    setLessonView('list');
                                                                }} 
                                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                <PlayCircleOutlineIcon fontSize="small"/> Lessons
                                                            </button>
                                                            <button 
                                                                className="btn-secondary" 
                                                                onClick={() => handleDeleteSection(sec.id || sec.Id)} 
                                                                style={{ color: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                <DeleteIcon fontSize="small"/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <button 
                                                    className="btn-secondary" 
                                                    onClick={() => setSectionView("list")}
                                                    style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                                >
                                                    ← Back to Sections
                                                </button>
                                                <h3 className="settings-section-title">Create New Section</h3>
                                            </div>
                                        </div>
                                        <form className="settings-form" onSubmit={handleSectionSubmit}>
                                            <div className="form-group">
                                                <label>Section Name <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Introduction to Programming"
                                                    value={currentSection.name} 
                                                    onChange={(e) => setCurrentSection({...currentSection, name: e.target.value})}
                                                    required 
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Order / Sequence <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={currentSection.order} 
                                                    onChange={(e) => setCurrentSection({...currentSection, order: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="form-actions-row" style={{marginTop: '2rem'}}>
                                                <button type="button" className="btn-secondary" onClick={() => setSectionView("list")}>Cancel</button>
                                                <button type="submit" className="btn-primary">Create Section</button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'lessons' && (
                            <div className="tab-pane-profile">
                                {lessonView === "list" ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <h3 className="settings-section-title">Batch Lessons</h3>
                                                <p className="settings-subtitle">Manage lessons for this batch.</p>
                                            </div>
                                            <button 
                                                className="btn-primary" 
                                                onClick={() => {
                                                    setCurrentLesson({ name: "", description: "", type: "Video", duration: 0, sectionId: sections.length > 0 ? (sections[0].id || sections[0].Id) : "" });
                                                    setLessonView("add");
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <AddIcon fontSize="small"/> Add Lesson
                                            </button>
                                        </div>

                                        {isLoadingSections || isLoadingLessonsData ? (
                                            <p style={{color: 'var(--text-secondary)'}}>Loading...</p>
                                        ) : allLessons.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                                                <PlayCircleOutlineIcon style={{ fontSize: 60, color: 'var(--text-muted)' }} />
                                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No lessons found in this batch. Click "Add Lesson" to get started.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {allLessons.map((lesson, idx) => {
                                                    const lessonType = (lesson.type || lesson.Type || 'Video');
                                                    const lessonId = lesson.id || lesson.Id;
                                                    const isLive = lessonType === 'Live';
                                                    return (
                                                        <div key={lessonId || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', gap: '1rem' }}>
                                                            {/* Icon + Info */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                                                <div style={{ background: isLive ? '#7c3aed' : '#2563eb', color: '#fff', width: 42, height: 42, borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                                                    {isLive ? <VideocamIcon style={{ fontSize: 20 }} /> : <PlayCircleOutlineIcon style={{ fontSize: 20 }} />}
                                                                </div>
                                                                <div style={{ minWidth: 0 }}>
                                                                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.name || lesson.Name || 'Unnamed Lesson'}</p>
                                                                    <span style={{ display: 'inline-block', marginTop: '3px', fontSize: '0.75rem', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: isLive ? 'rgba(124,58,237,0.15)' : 'rgba(37,99,235,0.12)', color: isLive ? '#7c3aed' : '#2563eb' }}>
                                                                        {isLive ? '🔴 Live Meeting' : '🎬 Video'}
                                                                    </span>
                                                                    {(lesson.duration || lesson.Duration) ? <span style={{ marginLeft: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>• {lesson.duration || lesson.Duration} min</span> : null}
                                                                </div>
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                                                {isLive ? (
                                                                    <button
                                                                        className="btn-primary"
                                                                        onClick={() => {
                                                                            setLiveForm({ RoomName: '', DisplayName: '', Email: '', MeetingDuration: 60, EnableRecording: true, EnableChat: true, EnableScreenShare: true, EnableWhiteboard: true, IsModerator: true });
                                                                            setLiveModal({ open: true, lessonId, lessonName: lesson.name || lesson.Name });
                                                                        }}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', padding: '0.45rem 0.9rem', background: '#7c3aed', borderColor: '#7c3aed' }}
                                                                    >
                                                                        <VideocamIcon style={{ fontSize: 16 }} /> Start Live
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="btn-primary"
                                                                        onClick={() => {
                                                                            setVideoForm({ File: null, VideoFormat: '', VideoQuality: '', VideoSize: '', Duration: '' });
                                                                            setUploadProgress(0);
                                                                            setIsUploading(false);
                                                                            setVideoModal({ open: true, lessonId, lessonName: lesson.name || lesson.Name });
                                                                        }}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
                                                                    >
                                                                        <PlayCircleOutlineIcon style={{ fontSize: 16 }} /> Set Video
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="btn-secondary"
                                                                    onClick={() => handleDeleteLesson(lessonId)}
                                                                    title="Delete lesson"
                                                                    style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0.45rem', display: 'flex', alignItems: 'center' }}
                                                                >
                                                                    <DeleteIcon style={{ fontSize: 18 }} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <button 
                                                    className="btn-secondary" 
                                                    onClick={() => setLessonView("list")}
                                                    style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                                >
                                                    ← Back to Lessons
                                                </button>
                                                <h3 className="settings-section-title">Create New Lesson</h3>
                                            </div>
                                        </div>
                                        <form className="settings-form" onSubmit={handleLessonSubmit}>
                                            <div className="form-group">
                                                <label>Section <span style={{color: '#ef4444'}}>*</span></label>
                                                <select 
                                                    value={currentLesson.sectionId} 
                                                    onChange={(e) => setCurrentLesson({...currentLesson, sectionId: e.target.value})}
                                                    required
                                                >
                                                    <option value="" disabled>Select Section</option>
                                                    {sections.map(sec => (
                                                        <option key={sec.id || sec.Id} value={sec.id || sec.Id}>{sec.name || sec.Name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Lesson Name <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={currentLesson.name} 
                                                    onChange={(e) => setCurrentLesson({...currentLesson, name: e.target.value})}
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Type <span style={{color: '#ef4444'}}>*</span></label>
                                                <select 
                                                    value={currentLesson.type} 
                                                    onChange={(e) => setCurrentLesson({...currentLesson, type: e.target.value})}
                                                    required
                                                >
                                                    <option value="Video">Video</option>
                                                    <option value="Live">Live Meeting</option>
                                                    <option value="Document">Document</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Duration (minutes) <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={currentLesson.duration} 
                                                    onChange={(e) => setCurrentLesson({...currentLesson, duration: e.target.value})}
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea 
                                                    rows="3"
                                                    value={currentLesson.description} 
                                                    onChange={(e) => setCurrentLesson({...currentLesson, description: e.target.value})}
                                                />
                                            </div>
                                            <div className="form-actions-row" style={{marginTop: '2rem'}}>
                                                <button type="button" className="btn-secondary" onClick={() => setLessonView("list")}>Cancel</button>
                                                <button type="submit" className="btn-primary">Create Lesson</button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>

        {/* ─── Video Modal ─────────────────────────── */}
        {videoModal.open && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>🎬 Set Video</h3>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{videoModal.lessonName}</p>
                        </div>
                        <button onClick={() => !isUploading && setVideoModal({ open: false, lessonId: null, lessonName: '' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: isUploading ? 'not-allowed' : 'pointer', lineHeight: 1 }} disabled={isUploading}>✕</button>
                    </div>
                    <form onSubmit={handleVideoSubmit}>
                        <div className="form-group">
                            <label>Video File <span style={{ color: '#ef4444' }}>*</span></label>
                            <input 
                                type="file" 
                                accept="video/*" 
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setVideoForm({ 
                                            ...videoForm, 
                                            File: file,
                                            VideoFormat: file.type.split('/')[1] || '',
                                            VideoSize: file.size
                                        });
                                    }
                                }} 
                                required 
                                disabled={isUploading}
                                style={{
                                    padding: '0.5rem',
                                    border: '1px dashed var(--border-color)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-color)',
                                    width: '100%',
                                    cursor: isUploading ? 'not-allowed' : 'pointer'
                                }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Format</label>
                                <select value={videoForm.VideoFormat} onChange={e => setVideoForm({ ...videoForm, VideoFormat: e.target.value })} disabled={isUploading}>
                                    <option value="">Auto (from file)</option>
                                    <option value="mp4">MP4</option>
                                    <option value="webm">WEBM</option>
                                    <option value="mov">MOV</option>
                                    <option value="avi">AVI</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quality</label>
                                <select value={videoForm.VideoQuality} onChange={e => setVideoForm({ ...videoForm, VideoQuality: e.target.value })} disabled={isUploading}>
                                    <option value="">Auto</option>
                                    <option value="360p">360p</option>
                                    <option value="480p">480p</option>
                                    <option value="720p">720p</option>
                                    <option value="1080p">1080p</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Duration (min)</label>
                                <input type="number" min="0" value={videoForm.Duration} onChange={e => setVideoForm({ ...videoForm, Duration: e.target.value })} disabled={isUploading} />
                            </div>
                            <div className="form-group">
                                <label>Size (Bytes)</label>
                                <input type="number" min="0" value={videoForm.VideoSize} readOnly disabled style={{ background: 'var(--bg-color)', cursor: 'not-allowed' }} />
                            </div>
                        </div>

                        {isUploading && (
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--primary-color)', transition: 'width 0.2s' }}></div>
                                </div>
                            </div>
                        )}

                        <div className="form-actions-row" style={{ marginTop: '1.5rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => !isUploading && setVideoModal({ open: false, lessonId: null, lessonName: '' })} disabled={isUploading}>Cancel</button>
                            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} disabled={isUploading}>
                                {isUploading ? 'Uploading...' : <><PlayCircleOutlineIcon style={{ fontSize: 18 }} /> Upload Video</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ─── Live Modal ──────────────────────────── */}
        {liveModal.open && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '540px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>🔴 Create Live Meeting</h3>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{liveModal.lessonName}</p>
                        </div>
                        <button onClick={() => setLiveModal({ open: false, lessonId: null, lessonName: '' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                    </div>
                    <form onSubmit={handleLiveSubmit}>
                        <div className="form-group">
                            <label>Room Name <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" placeholder="e.g. Math-Class-101" value={liveForm.RoomName} onChange={e => setLiveForm({ ...liveForm, RoomName: e.target.value })} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Display Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" placeholder="Your name" value={liveForm.DisplayName} onChange={e => setLiveForm({ ...liveForm, DisplayName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="email" placeholder="host@email.com" value={liveForm.Email} onChange={e => setLiveForm({ ...liveForm, Email: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Meeting Duration (minutes)</label>
                            <input type="number" min="1" value={liveForm.MeetingDuration} onChange={e => setLiveForm({ ...liveForm, MeetingDuration: parseInt(e.target.value) })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {[
                                { key: 'EnableRecording', label: '🔴 Recording' },
                                { key: 'EnableChat', label: '💬 Chat' },
                                { key: 'EnableScreenShare', label: '🖥️ Screen Share' },
                                { key: 'EnableWhiteboard', label: '📋 Whiteboard' },
                            ].map(({ key, label }) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'var(--bg-color)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <input type="checkbox" checked={liveForm[key]} onChange={e => setLiveForm({ ...liveForm, [key]: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }} />
                                    {label}
                                </label>
                            ))}
                        </div>
                        <div className="form-actions-row">
                            <button type="button" className="btn-secondary" onClick={() => setLiveModal({ open: false, lessonId: null, lessonName: '' })}>Cancel</button>
                            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#7c3aed', borderColor: '#7c3aed' }}><VideocamIcon style={{ fontSize: 18 }} /> Go Live</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
}
