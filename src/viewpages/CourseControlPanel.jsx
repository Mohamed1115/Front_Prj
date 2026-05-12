import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProfilePage.css"; // Reuse existing styles

import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";

import { getCourseBatches, createBatch } from "../services/Api";
import toast from 'react-hot-toast';

export default function CourseControlPanel() {
    const { facilityId, courseId } = useParams();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState("overview");

    // --- Batches State ---
    const [batches, setBatches] = useState([]);
    const [isLoadingBatches, setIsLoadingBatches] = useState(false);
    const [batchView, setBatchView] = useState("list"); // list, add
    const [currentBatch, setCurrentBatch] = useState({ title: "", startDate: "", endDate: "", capacity: 0, status: "Active" });

    React.useEffect(() => {
        if (activeTab === "batches" && batchView === "list") {
            loadBatches();
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
                    </div>
                </main>
            </div>
        </div>
    );
}
