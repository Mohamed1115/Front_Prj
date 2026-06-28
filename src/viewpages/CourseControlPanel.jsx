import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProfilePage.css"; // Reuse existing styles
import "./FacilityDashboardPage.css";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";

import { getCourseBatches, createBatch, getBatchMembers, getSubmissionsByUser, getBatchSections, submitTaskOnBehalf } from "../services/Api";
import toast from 'react-hot-toast';
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

export default function CourseControlPanel() {
    const { facilityId, courseId } = useParams();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState("overview");

    // --- Batches State ---
    const [batches, setBatches] = useState([]);
    const [isLoadingBatches, setIsLoadingBatches] = useState(false);
    const [batchView, setBatchView] = useState("list"); // list, add
    const [currentBatch, setCurrentBatch] = useState({ title: "", startDate: "", endDate: "", capacity: 0, status: "Active" });

    // --- Members State ---
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    // --- Member Submissions State ---
    const [memberSubmissionsModal, setMemberSubmissionsModal] = useState({ open: false, member: null, submissions: [] });
    const [isLoadingMemberSubmissions, setIsLoadingMemberSubmissions] = useState(false);

    // --- Manual Task Submission State ---
    const [manualSubmissionModal, setManualSubmissionModal] = useState({ open: false, selectedMemberId: '', selectedTaskId: '', submissionUrl: '' });
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);
    const [memberTasks, setMemberTasks] = useState([]);
    const [isLoadingMemberTasks, setIsLoadingMemberTasks] = useState(false);

    const handleMemberChange = async (memberId) => {
        setManualSubmissionModal(prev => ({ ...prev, selectedMemberId: memberId, selectedTaskId: '' }));
        if (!memberId) {
            setMemberTasks([]);
            return;
        }
        
        const selectedMemberObj = members.find(m => m.userId === memberId);
        if (selectedMemberObj && selectedMemberObj.batchId) {
            setIsLoadingMemberTasks(true);
            try {
                const data = await getBatchSections(selectedMemberObj.batchId);
                const sectionsList = Array.isArray(data) ? data : (data?.data || data?.$values || []);
                const tasks = sectionsList.flatMap(sec => 
                    sec.contents 
                        ? sec.contents.filter(c => c.type === "Task" && c.task).map(c => c.task)
                        : (sec.Contents 
                            ? sec.Contents.filter(c => (c.Type === "Task" || c.type === "Task") && (c.Task || c.task)).map(c => c.Task || c.task)
                            : []
                        )
                );
                setMemberTasks(tasks);
            } catch (error) {
                toast.error("Failed to load tasks for this member's batch");
                setMemberTasks([]);
            } finally {
                setIsLoadingMemberTasks(false);
            }
        } else {
            setMemberTasks([]);
        }
    };

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
            setMemberTasks([]);
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
            const batchList = await getCourseBatches(courseId);
            const activeBatches = Array.isArray(batchList) ? batchList : (batchList?.data || batchList?.$values || []);
            
            const allMembersPromises = activeBatches.map(async (batch) => {
                try {
                    const batchMembers = await getBatchMembers(batch.id || batch.Id);
                    return batchMembers.map(m => ({ ...m, batchId: batch.id || batch.Id, batchTitle: batch.title || batch.Title || "Unnamed Batch" }));
                } catch {
                    return [];
                }
            });
            
            const results = await Promise.all(allMembersPromises);
            const flatMembers = results.flat();
            
            const uniqueMembersMap = new Map();
            flatMembers.forEach(member => {
                const identifier = member.userId || member.email;
                if (!uniqueMembersMap.has(identifier)) {
                    uniqueMembersMap.set(identifier, member);
                }
            });
            
            setMembers(Array.from(uniqueMembersMap.values()));
        } catch (error) {
            toast.error(error.message || "Failed to load course members");
        } finally {
            setIsLoadingMembers(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === "batches" && batchView === "list") {
            loadBatches();
        } else if (activeTab === "members") {
            loadMembers();
        }
    }, [activeTab, batchView, courseId]);

    const loadBatches = async () => {
        try {
            setIsLoadingBatches(true);
            const data = await getCourseBatches(courseId);
            setBatches(Array.isArray(data) ? data : (data?.data || data?.$values || []));
        } catch (error) {
            toast.error(error.message || "Failed to load batches");
        } finally {
            setIsLoadingBatches(false);
        }
    };

    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestData = {
                ...currentBatch,
                courseId: parseInt(courseId),
                capacity: currentBatch.capacity ? parseInt(currentBatch.capacity) : null
            };
            await createBatch(facilityId, requestData);
            toast.success("Batch created successfully");
            setBatchView("list");
        } catch (error) {
            toast.error(error.message || "Failed to create batch");
        }
    };

    return (
        <div className="profile-layout-wrapper">
            <div className="profile-breadcrumb">
                <span onClick={() => navigate('/home')}>Home</span>
                <span className="bc-sep">›</span>
                <span onClick={() => navigate(`/facility-settings/${facilityId}`)}>Facility Settings</span>
                <span className="bc-sep">›</span>
                <span className="bc-active">Course Management</span>
            </div>

            <div className="profile-dashboard-container">
                <aside className="profile-sidebar">
                    <nav className="sidebar-nav">
                        <button 
                            className="sidebar-nav-item"
                            onClick={() => navigate(`/facility-settings/${facilityId}`)}
                            style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}
                        >
                            <ArrowBackIcon /> Back to Facility
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <DashboardIcon /> Overview
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'batches' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('batches'); setBatchView('list'); }}
                        >
                            <PeopleIcon /> Course Batches
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'members' ? 'active' : ''}`}
                            onClick={() => setActiveTab('members')}
                        >
                            <PeopleIcon /> Members
                        </button>
                    </nav>
                </aside>

                <main className="profile-main-content">
                    <div className="profile-content-area">
                        {activeTab === 'overview' && (
                            <div className="tab-pane-profile">
                                <h3 className="settings-section-title">Course Overview</h3>
                                <p className="settings-subtitle">At a glance metrics for this course.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                        <h2 style={{ fontSize: '2rem', margin: '0', color: 'var(--text-primary)' }}>0</h2>
                                        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>Enrolled Students</p>
                                    </div>
                                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                        <h2 style={{ fontSize: '2rem', margin: '0', color: 'var(--text-primary)' }}>0</h2>
                                        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>Total Lessons</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'batches' && (
                            <div className="tab-pane-profile">
                                {batchView === "list" ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <h3 className="settings-section-title">Course Batches</h3>
                                                <p className="settings-subtitle">Manage scheduling and student cohorts.</p>
                                            </div>
                                            <button 
                                                className="btn-primary" 
                                                onClick={() => {
                                                    setCurrentBatch({ title: "", startDate: "", endDate: "", capacity: 0, status: "Active" });
                                                    setBatchView("add");
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <AddIcon fontSize="small"/> Create Batch
                                            </button>
                                        </div>

                                        {isLoadingBatches ? (
                                            <p style={{color: 'var(--text-secondary)'}}>Loading batches...</p>
                                        ) : batches.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                                                <PeopleIcon style={{ fontSize: 60, color: 'var(--text-muted)' }} />
                                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No batches found. Create one to start accepting students.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {batches.map((batch, idx) => (
                                                    <div key={batch.id || batch.Id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                        <div>
                                                            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600' }}>
                                                                {batch.title || batch.Title || "Unnamed Batch"}
                                                            </h4>
                                                            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                                {new Date(batch.startDate || batch.StartDate).toLocaleDateString()} - {new Date(batch.endDate || batch.EndDate).toLocaleDateString()}
                                                            </p>
                                                            <div style={{ display: 'flex', gap: '15px', marginTop: '0.5rem' }}>
                                                                <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                                    Status: {batch.status || batch.Status || "Active"}
                                                                </span>
                                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                                    Capacity: {batch.capacity || batch.Capacity || "Unlimited"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button 
                                                                className="btn-secondary" 
                                                                onClick={() => {
                                                                    navigate(`/batch-dashboard/${facilityId}/${courseId}/${batch.id || batch.Id}`);
                                                                }} 
                                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                <SettingsIcon fontSize="small"/> Manage
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
                                                    onClick={() => setBatchView("list")}
                                                    style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                                >
                                                    ← Back to Batches
                                                </button>
                                                <h3 className="settings-section-title">Create New Batch</h3>
                                            </div>
                                        </div>
                                        <form className="settings-form" onSubmit={handleBatchSubmit}>
                                            <div className="form-group">
                                                <label>Batch Title <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Summer 2026 Cohort"
                                                    value={currentBatch.title} 
                                                    onChange={(e) => setCurrentBatch({...currentBatch, title: e.target.value})}
                                                    required 
                                                    autoFocus
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Start Date <span style={{color: '#ef4444'}}>*</span></label>
                                                    <input 
                                                        type="date" 
                                                        value={currentBatch.startDate} 
                                                        onChange={(e) => setCurrentBatch({...currentBatch, startDate: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>End Date <span style={{color: '#ef4444'}}>*</span></label>
                                                    <input 
                                                        type="date" 
                                                        value={currentBatch.endDate} 
                                                        onChange={(e) => setCurrentBatch({...currentBatch, endDate: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Capacity</label>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        placeholder="Leave 0 for unlimited"
                                                        value={currentBatch.capacity} 
                                                        onChange={(e) => setCurrentBatch({...currentBatch, capacity: e.target.value})}
                                                    />
                                                </div>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Status <span style={{color: '#ef4444'}}>*</span></label>
                                                    <select 
                                                        value={currentBatch.status} 
                                                        onChange={(e) => setCurrentBatch({...currentBatch, status: e.target.value})}
                                                        required
                                                    >
                                                        <option value="Active">Active</option>
                                                        <option value="Inactive">Inactive</option>
                                                        <option value="Upcoming">Upcoming</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-actions-row" style={{marginTop: '2rem'}}>
                                                <button type="button" className="btn-secondary" onClick={() => setBatchView("list")}>Cancel</button>
                                                <button type="submit" className="btn-primary">Create Batch</button>
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
                                                <p style={{ color: 'var(--text-secondary)' }}>No members are enrolled in this course yet.</p>
                                            </div>
                                        ) : (
                                            <div className="fd-table-container">
                                                <table className="fd-table">
                                                    <thead>
                                                        <tr>
                                                            <th>User</th>
                                                            <th>Email</th>
                                                            <th>Batch</th>
                                                            <th>Enrolled Date</th>
                                                            <th style={{ textAlign: 'right' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {members.map((member, idx) => {
                                                            const name = member.name || member.Name || member.userName || "Unknown";
                                                            const userName = member.userName || "Unknown";
                                                            const email = member.email || "";
                                                            const batchTitle = member.batchTitle || "-";
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
                                                                        <span className="fd-badge leader" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: 600 }}>
                                                                            {batchTitle}
                                                                        </span>
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
                                onClick={() => {
                                    setManualSubmissionModal({ open: false, selectedMemberId: '', selectedTaskId: '', submissionUrl: '' });
                                    setMemberTasks([]);
                                }}
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
                                    onChange={(e) => handleMemberChange(e.target.value)}
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
                                            {m.name || m.userName} (@{m.userName}) — {m.batchTitle}
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
                                    disabled={isLoadingMemberTasks || !manualSubmissionModal.selectedMemberId}
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
                                    {isLoadingMemberTasks ? (
                                        <option value="">Loading tasks...</option>
                                    ) : !manualSubmissionModal.selectedMemberId ? (
                                        <option value="">Please select a member first</option>
                                    ) : memberTasks.length === 0 ? (
                                        <option value="">No tasks found in member's batch</option>
                                    ) : (
                                        <>
                                            <option value="">Select Task...</option>
                                            {memberTasks.map(t => (
                                                <option key={t.id || t.Id} value={t.id || t.Id}>
                                                    {t.title || t.Title}
                                                </option>
                                            ))}
                                        </>
                                    )}
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
                                    onClick={() => {
                                        setManualSubmissionModal({ open: false, selectedMemberId: '', selectedTaskId: '', submissionUrl: '' });
                                        setMemberTasks([]);
                                    }}
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
                                    disabled={isSubmittingManual || isLoadingMemberTasks}
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
        </div>
    );
}
