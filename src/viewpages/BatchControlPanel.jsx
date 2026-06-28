import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import "./FacilityDashboardPage.css";

import ListAltIcon from "@mui/icons-material/ListAlt";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import VideocamIcon from "@mui/icons-material/Videocam";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CloseIcon from "@mui/icons-material/Close";

import { getBatchSections, createSection, deleteSection, createLesson, deleteLesson, getLessonsByBatchId, createVideoLesson, createLiveMeeting, createTask, deleteTask, updateTask, getTaskSubmissions, getBatchMembers, getSubmissionsByUser, submitTaskOnBehalf } from "../services/Api";
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
    const [lessonView, setLessonView] = useState("list"); // list, add, add-task
    const [currentLesson, setCurrentLesson] = useState({ name: "", description: "", type: "Video", duration: 0, sectionId: "" });
    const [currentTask, setCurrentTask] = useState({ title: "", description: "", type: "Form", formUrl: "", maxScore: 100, deadline: "", sectionId: "" });
    const [allLessons, setAllLessons] = useState([]);
    const [isLoadingLessonsData, setIsLoadingLessonsData] = useState(false);

    // --- Submissions & Edit States ---
    const [submissionsModal, setSubmissionsModal] = useState({ open: false, taskId: null, taskTitle: '', submissions: [] });
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);

    // --- Modals State ---
    const [videoModal, setVideoModal] = useState({ open: false, lessonId: null, lessonName: '' });
    const [videoForm, setVideoForm] = useState({ File: null, VideoFormat: '', VideoQuality: '', VideoSize: '', Duration: '' });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const [liveModal, setLiveModal] = useState({ open: false, lessonId: null, lessonName: '' });
    const [liveForm, setLiveForm] = useState({ RoomName: '', DisplayName: '', Email: '', MeetingDuration: 60, EnableRecording: true, EnableChat: true, EnableScreenShare: true, EnableWhiteboard: true, IsModerator: true });

    // --- Members State ---
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    
    // --- Member Submissions State ---
    const [memberSubmissionsModal, setMemberSubmissionsModal] = useState({ open: false, member: null, submissions: [] });
    const [isLoadingMemberSubmissions, setIsLoadingMemberSubmissions] = useState(false);

    // --- Manual Task Submission State ---
    const [manualSubmissionModal, setManualSubmissionModal] = useState({ open: false, selectedMemberId: '', selectedTaskId: '', submissionUrl: '' });
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);

    const handleManualSubmissionSubmit = async (e) => {
        e.preventDefault();
        const { selectedMemberId, selectedTaskId, submissionUrl } = manualSubmissionModal;
        if (!selectedMemberId || !selectedTaskId) {
            toast.error("Please select a member and a task");
            return;
        }
        setIsSubmittingManual(true);
        try {
            await submitTaskOnBehalf(facilityId, parseInt(selectedTaskId), selectedMemberId, submissionUrl);
            toast.success("Task submission registered successfully");
            setManualSubmissionModal({ open: false, selectedMemberId: '', selectedTaskId: '', submissionUrl: '' });
        } catch (error) {
            toast.error(error.message || "Failed to register task submission");
        } finally {
            setIsSubmittingManual(false);
        }
    };

    const handleViewMemberSubmissions = async (member) => {
        setMemberSubmissionsModal({ open: true, member, submissions: [] });
        setIsLoadingMemberSubmissions(true);
        try {
            const res = await getSubmissionsByUser(member.userId);
            setMemberSubmissionsModal(prev => ({ ...prev, submissions: res.data || [] }));
        } catch (error) {
            toast.error(error.message || "Failed to load member submissions");
        } finally {
            setIsLoadingMemberSubmissions(false);
        }
    };

    const loadMembers = async () => {
        try {
            setIsLoadingMembers(true);
            const data = await getBatchMembers(batchId);
            setMembers(data);
        } catch (error) {
            toast.error(error.message || "Failed to load members");
        } finally {
            setIsLoadingMembers(false);
        }
    };

    useEffect(() => {
        if ((activeTab === "sections" && sectionView === "list") || (activeTab === "lessons" && lessonView === "list")) {
            loadSections();
            if (activeTab === "lessons") {
                loadLessons();
            }
        } else if (activeTab === "members") {
            loadMembers();
            loadSections();
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
            loadSections();
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
            loadSections();
        } catch (error) {
            toast.error(error.message || "Failed to delete lesson");
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestData = {
                CourseId: parseInt(courseId),
                CourseBatchId: parseInt(batchId),
                SectionId: parseInt(currentTask.sectionId),
                Title: currentTask.title,
                Description: currentTask.description,
                Type: currentTask.type,
                FormUrl: currentTask.type === "Form" ? currentTask.formUrl : "",
                MaxScore: parseInt(currentTask.maxScore) || 100,
                Deadline: currentTask.deadline
            };
            if (editingTaskId) {
                await updateTask(facilityId, editingTaskId, requestData);
                toast.success("Task updated successfully");
            } else {
                await createTask(facilityId, requestData);
                toast.success("Task created successfully");
            }
            setEditingTaskId(null);
            setCurrentTask({ title: "", description: "", type: "Form", formUrl: "", maxScore: 100, deadline: "", sectionId: "" });
            loadLessons();
            loadSections();
            setLessonView("list");
        } catch (error) {
            toast.error(error.message || `Failed to ${editingTaskId ? 'update' : 'create'} task`);
        }
    };

    const handleEditTaskClick = (task) => {
        setEditingTaskId(task.id || task.Id);
        
        let formattedDeadline = "";
        const rawDeadline = task.deadline || task.Deadline;
        if (rawDeadline) {
            const d = new Date(rawDeadline);
            const tzoffset = d.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, -1);
            formattedDeadline = localISOTime.substring(0, 16);
        }

        setCurrentTask({
            title: task.title || task.Title || "",
            description: task.description || task.Description || "",
            type: task.type || task.Type || "Form",
            formUrl: task.formUrl || task.FormUrl || "",
            maxScore: task.maxScore || task.MaxScore || 100,
            deadline: formattedDeadline,
            sectionId: task.sectionId || task.SectionId || ""
        });
        setLessonView("add-task");
    };

    const handleViewSubmissionsClick = async (task) => {
        const taskId = task.id || task.Id;
        const taskTitle = task.title || task.Title;
        setSubmissionsModal({ open: true, taskId, taskTitle, submissions: [] });
        setIsLoadingSubmissions(true);
        try {
            const response = await getTaskSubmissions(facilityId, taskId);
            const list = Array.isArray(response) ? response : (response?.data || response?.$values || []);
            setSubmissionsModal(prev => ({ ...prev, submissions: list }));
        } catch (error) {
            toast.error(error.message || "Failed to load submissions");
        } finally {
            setIsLoadingSubmissions(false);
        }
    };

    const handleCancelTask = () => {
        setEditingTaskId(null);
        setCurrentTask({ title: "", description: "", type: "Form", formUrl: "", maxScore: 100, deadline: "", sectionId: "" });
        setLessonView("list");
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(facilityId, taskId);
            toast.success("Task deleted successfully");
            loadLessons();
            loadSections();
        } catch (error) {
            toast.error(error.message || "Failed to delete task");
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

            if (!link || (!link.Guid && !link.guid)) {
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
                    loadSections();
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
            loadSections();
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
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'members' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('members'); }}
                        >
                            <PeopleIcon /> Members
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
                                                <h3 className="settings-section-title">Batch Curriculum Content</h3>
                                                <p className="settings-subtitle">Manage lessons and tasks for this batch.</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
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
                                                <button 
                                                    className="btn-primary" 
                                                    onClick={() => {
                                                        setCurrentTask({ title: "", description: "", type: "Form", formUrl: "", maxScore: 100, deadline: "", sectionId: sections.length > 0 ? (sections[0].id || sections[0].Id) : "" });
                                                        setLessonView("add-task");
                                                    }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#059669', borderColor: '#059669' }}
                                                >
                                                    <AddIcon fontSize="small"/> Add Task
                                                </button>
                                            </div>
                                        </div>

                                        {isLoadingSections || isLoadingLessonsData ? (
                                            <p style={{color: 'var(--text-secondary)'}}>Loading...</p>
                                        ) : sections.reduce((sum, sec) => {
                                            const lCount = sec.contents?.filter(c => c.type === "Lesson" && c.lesson).length || sec.Contents?.filter(c => (c.Type === "Lesson" || c.type === "Lesson") && (c.Lesson || c.lesson)).length || 0;
                                            const tCount = sec.contents?.filter(c => c.type === "Task" && c.task).length || sec.Contents?.filter(c => (c.Type === "Task" || c.type === "Task") && (c.Task || c.task)).length || 0;
                                            return sum + lCount + tCount;
                                        }, 0) === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                                                <PlayCircleOutlineIcon style={{ fontSize: 60, color: 'var(--text-muted)' }} />
                                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No lessons or tasks found in this batch. Click "Add Lesson" or "Add Task" to get started.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                {sections.map((section, sIdx) => {
                                                    const sectionLessons = section.contents 
                                                        ? section.contents.filter(c => c.type === "Lesson" && c.lesson).map(c => c.lesson)
                                                        : (section.Contents 
                                                            ? section.Contents.filter(c => (c.Type === "Lesson" || c.type === "Lesson") && (c.Lesson || c.lesson)).map(c => c.Lesson || c.lesson)
                                                            : []);

                                                    const sectionTasks = section.contents 
                                                        ? section.contents.filter(c => c.type === "Task" && c.task).map(c => c.task)
                                                        : (section.Contents 
                                                            ? section.Contents.filter(c => (c.Type === "Task" || c.type === "Task") && (c.Task || c.task)).map(c => c.Task || c.task)
                                                            : []);

                                                    if (sectionLessons.length === 0 && sectionTasks.length === 0) return null;

                                                    return (
                                                        <div key={section.id || section.Id || sIdx} style={{ background: 'var(--bg-secondary, rgba(0,0,0,0.02))', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                                            {/* Section header in content list */}
                                                            <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                                                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700' }}>
                                                                    Section {section.order || section.Order || (sIdx + 1)}: {section.name || section.Name}
                                                                </h4>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                {sectionLessons.map((lesson, idx) => {
                                                                    const lessonType = (lesson.type || lesson.Type || 'Video');
                                                                    const lessonId = lesson.id || lesson.Id;
                                                                    const isLive = lessonType === 'Live';
                                                                    return (
                                                                        <div key={`lesson-${lessonId || idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg, #ffffff)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', gap: '1rem' }}>
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

                                                                {sectionTasks.map((task, idx) => {
                                                                    const taskId = task.id || task.Id;
                                                                    const taskType = task.type || task.Type || 'Assignment';
                                                                    return (
                                                                        <div key={`task-${taskId || idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg, #ffffff)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', gap: '1rem' }}>
                                                                            {/* Icon + Info */}
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                                                                <div style={{ background: '#059669', color: '#fff', width: 42, height: 42, borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                                                                    <AssignmentIcon style={{ fontSize: 20 }} />
                                                                                </div>
                                                                                <div style={{ minWidth: 0 }}>
                                                                                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title || task.Title || 'Unnamed Task'}</p>
                                                                                    <span style={{ display: 'inline-block', marginTop: '3px', fontSize: '0.75rem', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: 'rgba(5,150,105,0.12)', color: '#059669' }}>
                                                                                        📝 {taskType}
                                                                                    </span>
                                                                                    {(task.maxScore || task.MaxScore) ? <span style={{ marginLeft: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>• Max: {task.maxScore || task.MaxScore} pts</span> : null}
                                                                                    {(task.deadline || task.Deadline) ? <span style={{ marginLeft: '6px', fontSize: '0.78rem', color: '#dc2626', fontWeight: '600' }}>• Due: {new Date(task.deadline || task.Deadline).toLocaleString()}</span> : null}
                                                                                </div>
                                                                            </div>
                                                                            {/* Action Buttons */}
                                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                                                                {taskType.toLowerCase() === 'link' && (
                                                                                    <button
                                                                                        className="btn-secondary"
                                                                                        onClick={() => handleViewSubmissionsClick(task)}
                                                                                        title="View submissions"
                                                                                        style={{ color: '#059669', borderColor: 'rgba(5,150,105,0.3)', padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}
                                                                                    >
                                                                                        <AssignmentTurnedInIcon style={{ fontSize: 18 }} /> Submissions
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    className="btn-secondary"
                                                                                    onClick={() => handleEditTaskClick(task)}
                                                                                    title="Edit task"
                                                                                    style={{ color: '#4f46e5', borderColor: 'rgba(79,70,229,0.3)', padding: '0.45rem', display: 'flex', alignItems: 'center' }}
                                                                                >
                                                                                    <EditIcon style={{ fontSize: 18 }} />
                                                                                </button>
                                                                                <button
                                                                                    className="btn-secondary"
                                                                                    onClick={() => handleDeleteTask(taskId)}
                                                                                    title="Delete task"
                                                                                    style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0.45rem', display: 'flex', alignItems: 'center' }}
                                                                                >
                                                                                    <DeleteIcon style={{ fontSize: 18 }} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : lessonView === "add" ? (
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
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <button 
                                                    className="btn-secondary" 
                                                    onClick={handleCancelTask}
                                                    style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                                >
                                                    ← Back to Lessons
                                                </button>
                                                <h3 className="settings-section-title">{editingTaskId ? "Edit Task" : "Create New Task"}</h3>
                                            </div>
                                        </div>
                                        <form className="settings-form" onSubmit={handleTaskSubmit}>
                                            <div className="form-group">
                                                <label>Section <span style={{color: '#ef4444'}}>*</span></label>
                                                <select 
                                                    value={currentTask.sectionId} 
                                                    onChange={(e) => setCurrentTask({...currentTask, sectionId: e.target.value})}
                                                    required
                                                >
                                                    <option value="" disabled>Select Section</option>
                                                    {sections.map(sec => (
                                                        <option key={sec.id || sec.Id} value={sec.id || sec.Id}>{sec.name || sec.Name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Task Title <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={currentTask.title} 
                                                    onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Type <span style={{color: '#ef4444'}}>*</span></label>
                                                <select 
                                                    value={currentTask.type} 
                                                    onChange={(e) => setCurrentTask({...currentTask, type: e.target.value})}
                                                    required
                                                >
                                                    <option value="Form">Google Form</option>
                                                    <option value="Link">Link Submission (Drive, GitHub, etc.)</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Max Score <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={currentTask.maxScore} 
                                                    onChange={(e) => setCurrentTask({...currentTask, maxScore: e.target.value})}
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Deadline <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="datetime-local" 
                                                    value={currentTask.deadline} 
                                                    onChange={(e) => setCurrentTask({...currentTask, deadline: e.target.value})}
                                                    required 
                                                />
                                            </div>
                                            {currentTask.type === "Form" && (
                                                <div className="form-group">
                                                    <label>Form URL <span style={{color: '#ef4444'}}>*</span></label>
                                                    <input 
                                                        type="url" 
                                                        placeholder="e.g. https://docs.google.com/forms/..."
                                                        value={currentTask.formUrl} 
                                                        onChange={(e) => setCurrentTask({...currentTask, formUrl: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            )}
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea 
                                                    rows="3"
                                                    value={currentTask.description} 
                                                    onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                                                />
                                            </div>
                                            <div className="form-actions-row" style={{marginTop: '2rem'}}>
                                                <button type="button" className="btn-secondary" onClick={handleCancelTask}>Cancel</button>
                                                <button type="submit" className="btn-primary" style={{ background: '#059669', borderColor: '#059669' }}>{editingTaskId ? "Save Changes" : "Create Task"}</button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="tab-pane-profile" style={{ padding: 0 }}>
                                <div className="fd-content" style={{ padding: 0, maxWidth: 'none' }}>
                                    <div className="fd-card fd-access-list-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                            <h2 style={{ margin: 0 }}><PeopleIcon /> Course Members</h2>
                                            <button 
                                                className="btn-primary"
                                                onClick={() => setManualSubmissionModal({ open: true, selectedMemberId: '', selectedTaskId: '', submissionUrl: '' })}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#4f46e5', borderColor: '#4f46e5', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
                                            >
                                                <AddIcon fontSize="small"/> Record Task Submission
                                            </button>
                                        </div>
                                        {isLoadingMembers ? (
                                            <p className="fd-loading-text">Loading members...</p>
                                        ) : members.length === 0 ? (
                                            <div className="fd-empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
                                                <PeopleIcon style={{ fontSize: 60, color: '#9ca3af', marginBottom: '1rem', opacity: 0.5 }} />
                                                <p style={{ color: 'var(--text-secondary)' }}>No members are enrolled in this batch yet.</p>
                                            </div>
                                        ) : (
                                            <div className="fd-table-container">
                                                <table className="fd-table">
                                                    <thead>
                                                        <tr>
                                                            <th>User</th>
                                                            <th>Email</th>
                                                            <th>Enrolled Date</th>
                                                            <th style={{ textAlign: 'right' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {members.map((member, idx) => {
                                                            const name = member.name || member.Name || member.userName || "Unknown";
                                                            const userName = member.userName || "Unknown";
                                                            const email = member.email || "";
                                                            const enrolledDateStr = member.enrolledAt;
                                                            const enrolledDate = enrolledDateStr ? new Date(enrolledDateStr).toLocaleDateString() : "-";
                                                            
                                                            return (
                                                                <tr 
                                                                    key={member.enrollmentId || idx}
                                                                    onClick={() => handleViewMemberSubmissions(member)}
                                                                    style={{ cursor: 'pointer' }}
                                                                    className="fd-table-row-clickable"
                                                                >
                                                                    <td>
                                                                        <div className="fd-user-cell">
                                                                            <div className="fd-avatar">
                                                                                {String(name).charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                                    {name}
                                                                                </div>
                                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                                                    @{userName}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span style={{ color: 'var(--text-secondary)' }}>{email}</span>
                                                                    </td>
                                                                    <td>
                                                                        <span style={{ color: 'var(--text-secondary)' }}>{enrolledDate}</span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'right' }}>
                                                                        <span 
                                                                            style={{
                                                                                fontSize: '0.8rem',
                                                                                color: '#4f46e5',
                                                                                fontWeight: '600',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px',
                                                                                padding: '4px 8px',
                                                                                borderRadius: '6px',
                                                                                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                                                                                transition: 'all 0.2s'
                                                                            }}
                                                                            className="view-submissions-btn"
                                                                        >
                                                                            Submissions →
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
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

        {/* Submissions Modal */}
        {submissionsModal.open && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '1.5rem'
            }}>
                <div style={{
                    background: 'var(--card-bg, #ffffff)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '750px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    overflow: 'hidden',
                }}>
                    {/* Modal Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, rgba(5, 150, 105, 0.05), transparent)'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Task Submissions
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {submissionsModal.taskTitle}
                            </p>
                        </div>
                        <button
                            onClick={() => setSubmissionsModal({ open: false, taskId: null, taskTitle: '', submissions: [] })}
                            style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--bg-hover, #f1f5f9)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <CloseIcon style={{ fontSize: 20 }} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div style={{
                        padding: '1.5rem',
                        overflowY: 'auto',
                        flex: 1,
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {isLoadingSubmissions ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 0' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(5,150,105,0.1)', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading submissions...</p>
                            </div>
                        ) : submissionsModal.submissions.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 0', textAlign: 'center' }}>
                                <AssignmentTurnedInIcon style={{ fontSize: 50, color: 'var(--text-muted)', opacity: 0.5, marginBottom: '12px' }} />
                                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontWeight: '600' }}>No Submissions Yet</h4>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>
                                    Students enrolled in this batch haven't submitted this link task yet.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {submissionsModal.submissions.map((sub) => {
                                    const student = sub.student || {};
                                    const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
                                    
                                    return (
                                        <div
                                            key={sub.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-color, #e2e8f0)',
                                                backgroundColor: 'var(--bg-card, #f8fafc)',
                                                gap: '1rem',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            {/* Student Profile Info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                                                {student.imageUrl ? (
                                                    <img
                                                        src={student.imageUrl}
                                                        alt={student.name}
                                                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#059669',
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {initials}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                        {student.name || 'Unknown Student'}
                                                    </h4>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                                                        {student.email || 'No email available'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Submission details */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Submitted: {new Date(sub.submissionAt).toLocaleString()}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: '600',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        backgroundColor: sub.status === 'Late' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                                                        color: sub.status === 'Late' ? '#ef4444' : '#059669'
                                                    }}>
                                                        {sub.status || 'Submitted'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Open Submission Button */}
                                            <div>
                                                <a
                                                    href={sub.submissionUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#059669',
                                                        color: '#ffffff',
                                                        textDecoration: 'none',
                                                        fontSize: '0.82rem',
                                                        fontWeight: '600',
                                                        transition: 'background-color 0.2s',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                                >
                                                    Open Link →
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Member Submissions Modal */}
        {memberSubmissionsModal.open && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '1.5rem'
            }}>
                <div style={{
                    background: 'var(--card-bg, #ffffff)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '750px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    overflow: 'hidden',
                }}>
                    {/* Modal Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, rgba(79, 70, 229, 0.05), transparent)'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Member Task Submissions
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {memberSubmissionsModal.member?.name || memberSubmissionsModal.member?.userName} ({memberSubmissionsModal.member?.email})
                            </p>
                        </div>
                        <button
                            onClick={() => setMemberSubmissionsModal({ open: false, member: null, submissions: [] })}
                            style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--bg-hover, #f1f5f9)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <CloseIcon style={{ fontSize: 20 }} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div style={{
                        padding: '1.5rem',
                        overflowY: 'auto',
                        flex: 1,
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {isLoadingMemberSubmissions ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 0' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(79,70,229,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading submissions...</p>
                            </div>
                        ) : memberSubmissionsModal.submissions.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 0', textAlign: 'center' }}>
                                <AssignmentTurnedInIcon style={{ fontSize: 50, color: 'var(--text-muted)', opacity: 0.5, marginBottom: '12px' }} />
                                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontWeight: '600' }}>No Submissions</h4>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>
                                    This member hasn't submitted any tasks yet.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {memberSubmissionsModal.submissions.map((sub) => {
                                    return (
                                        <div
                                            key={sub.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-color, #e2e8f0)',
                                                backgroundColor: 'var(--bg-card, #f8fafc)',
                                                gap: '1rem',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            {/* Task Title */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                                                <AssignmentIcon style={{ color: '#4f46e5' }} />
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                        {sub.taskTitle}
                                                    </h4>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                                                        Submitted: {new Date(sub.submissionAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: '600',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    backgroundColor: sub.status === 'Late' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(79, 70, 229, 0.12)',
                                                    color: sub.status === 'Late' ? '#ef4444' : '#4f46e5'
                                                }}>
                                                    {sub.status || 'Submitted'}
                                                </span>
                                            </div>

                                            {/* Open Link Button */}
                                            <div>
                                                <a
                                                    href={sub.submissionUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#4f46e5',
                                                        color: '#ffffff',
                                                        textDecoration: 'none',
                                                        fontSize: '0.82rem',
                                                        fontWeight: '600',
                                                        transition: 'background-color 0.2s',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                                                >
                                                    Open Link →
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Manual Task Submission Modal */}
        {manualSubmissionModal.open && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '1.5rem'
            }}>
                <div style={{
                    background: 'var(--card-bg, #ffffff)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '500px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    overflow: 'hidden',
                }}>
                    {/* Modal Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, rgba(79, 70, 229, 0.05), transparent)'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Record Task Submission
                        </h3>
                        <button
                            onClick={() => setManualSubmissionModal({ open: false, selectedMemberId: '', selectedTaskId: '', submissionUrl: '' })}
                            style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--bg-hover, #f1f5f9)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <CloseIcon style={{ fontSize: 20 }} />
                        </button>
                    </div>

                    {/* Modal Form */}
                    <form onSubmit={handleManualSubmissionSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Member Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Member</label>
                            <select
                                value={manualSubmissionModal.selectedMemberId}
                                onChange={(e) => setManualSubmissionModal(prev => ({ ...prev, selectedMemberId: e.target.value }))}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    backgroundColor: 'var(--bg-card, #f8fafc)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                required
                            >
                                <option value="">Select Member...</option>
                                {members.map(m => (
                                    <option key={m.userId} value={m.userId}>
                                        {m.name || m.userName} (@{m.userName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Task Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Task</label>
                            <select
                                value={manualSubmissionModal.selectedTaskId}
                                onChange={(e) => setManualSubmissionModal(prev => ({ ...prev, selectedTaskId: e.target.value }))}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    backgroundColor: 'var(--bg-card, #f8fafc)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                required
                            >
                                <option value="">Select Task...</option>
                                {sections.flatMap(sec => 
                                    sec.contents 
                                        ? sec.contents.filter(c => c.type === "Task" && c.task).map(c => c.task)
                                        : (sec.Contents 
                                            ? sec.Contents.filter(c => (c.Type === "Task" || c.type === "Task") && (c.Task || c.task)).map(c => c.Task || c.task)
                                            : []
                                        )
                                ).map(t => (
                                    <option key={t.id || t.Id} value={t.id || t.Id}>
                                        {t.title || t.Title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Submission Link */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Submission Link</label>
                            <input
                                type="url"
                                placeholder="https://github.com/username/project"
                                value={manualSubmissionModal.submissionUrl}
                                onChange={(e) => setManualSubmissionModal(prev => ({ ...prev, submissionUrl: e.target.value }))}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    backgroundColor: 'var(--bg-card, #f8fafc)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setManualSubmissionModal({ open: false, selectedMemberId: '', selectedTaskId: '', submissionUrl: '' })}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    background: 'none',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingManual}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#4f46e5',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {isSubmittingManual ? "Saving..." : "Save Submission"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
}
