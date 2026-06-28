import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./ProfilePage.css";
import "./FacilityDashboardPage.css";

// MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import GroupsIcon from "@mui/icons-material/Groups";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import VideocamIcon from "@mui/icons-material/Videocam";
import PaymentIcon from "@mui/icons-material/Payment";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import toast from "react-hot-toast";

import { getGroups, createGroup, updateGroup, deleteGroup, getAllCourses, createCourse, updateCourse, deleteCourse, getImageUrl, getFacilityAccess, giveFacilityAccess } from "../services/Api";

export default function FacilitySettingsPage() {
    const { facilityId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Facility data passed from previous page if any
    const facilityData = location.state?.facility || {};
    
    const [activeTab, setActiveTab] = useState("general");

    // --- Groups State ---
    const [groups, setGroups] = useState([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [groupView, setGroupView] = useState("list"); // list, add, edit, manage
    const [currentGroup, setCurrentGroup] = useState({ id: null, name: "", description: "" });

    // --- Group Courses State ---
    const [groupCourses, setGroupCourses] = useState([]);
    const [isLoadingGroupCourses, setIsLoadingGroupCourses] = useState(false);
    const [courseView, setCourseView] = useState("list"); // list, add, edit
    const [currentCourse, setCurrentCourse] = useState({ id: null, name: "", description: "", cost: 0, type: "", image: null });

    // --- Facility Courses State ---
    const [facilityCourses, setFacilityCourses] = useState([]);
    const [isLoadingFacilityCourses, setIsLoadingFacilityCourses] = useState(false);
    const [facilityCourseView, setFacilityCourseView] = useState("list"); // list, add, edit
    const [currentFacilityCourse, setCurrentFacilityCourse] = useState({ id: null, name: "", description: "", cost: 0, type: "", groupId: "", image: null });

    // --- Members Access State ---
    const [memberEmail, setMemberEmail] = useState("");
    const [memberRole, setMemberRole] = useState(1); // 1 for Leader, 2 for Instructor
    const [accessList, setAccessList] = useState([]);
    const [isLoadingAccess, setIsLoadingAccess] = useState(false);
    const [isFetchingAccess, setIsFetchingAccess] = useState(true);

    const fetchAccessList = async () => {
        setIsFetchingAccess(true);
        try {
            const data = await getFacilityAccess(facilityId);
            setAccessList(data || []);
        } catch (error) {
            toast.error(error.message || "Failed to load access list");
        } finally {
            setIsFetchingAccess(false);
        }
    };

    const handleGiveAccess = async (e) => {
        e.preventDefault();
        if (!memberEmail.trim()) {
            toast.error("Please enter a valid email");
            return;
        }
        setIsLoadingAccess(true);
        try {
            await giveFacilityAccess(memberEmail, parseInt(facilityId), parseInt(memberRole));
            toast.success("Access granted successfully");
            setMemberEmail("");
            fetchAccessList();
        } catch (error) {
            toast.error(error.message || "Failed to grant access");
        } finally {
            setIsLoadingAccess(false);
        }
    };

    useEffect(() => {
        if (activeTab === "members" && facilityId) {
            fetchAccessList();
        }
    }, [activeTab, facilityId]);

    useEffect(() => {
        if (activeTab === "groups" && groupView === "list") {
            loadGroups();
        }
    }, [activeTab, groupView, facilityId]);

    const loadGroups = async () => {
        try {
            setIsLoadingGroups(true);
            const data = await getGroups(facilityId);
            setGroups(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error.message || "Failed to load groups");
        } finally {
            setIsLoadingGroups(false);
        }
    };

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        try {
            if (groupView === "add") {
                await createGroup(facilityId, { name: currentGroup.name, description: currentGroup.description });
                toast.success("Group created successfully");
            } else if (groupView === "edit") {
                await updateGroup(facilityId, { id: currentGroup.id, name: currentGroup.name, description: currentGroup.description });
                toast.success("Group updated successfully");
            }
            setGroupView("list");
        } catch (error) {
            toast.error(error.message || "Failed to save group");
        }
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;
        try {
            await deleteGroup(facilityId, id);
            toast.success("Group deleted successfully");
            loadGroups();
        } catch (error) {
            toast.error(error.message || "Failed to delete group");
        }
    };

    useEffect(() => {
        if (activeTab === "groups" && groupView === "manage" && courseView === "list") {
            loadGroupCourses();
        }
    }, [activeTab, groupView, courseView, facilityId, currentGroup.id]);

    useEffect(() => {
        if (activeTab === "courses" && facilityCourseView === "list") {
            loadFacilityCourses();
            if (groups.length === 0) loadGroups(); // Make sure groups are loaded for the dropdown
        }
    }, [activeTab, facilityCourseView, facilityId]);

    const loadFacilityCourses = async () => {
        try {
            setIsLoadingFacilityCourses(true);
            const allCourses = await getAllCourses();
            const filtered = (Array.isArray(allCourses) ? allCourses : (allCourses?.data || allCourses?.$values || [])).filter(c => c.facilityId == facilityId || c.FacilityId == facilityId);
            setFacilityCourses(filtered);
        } catch (error) {
            toast.error(error.message || "Failed to load facility courses");
        } finally {
            setIsLoadingFacilityCourses(false);
        }
    };

    const handleFacilityCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("Name", currentFacilityCourse.name);
            formData.append("Description", currentFacilityCourse.description);
            formData.append("Cost", currentFacilityCourse.cost);
            formData.append("Type", currentFacilityCourse.type || "Online");
            formData.append("GroupId", currentFacilityCourse.groupId || 0);
            formData.append("FacilityId", facilityId);
            if (currentFacilityCourse.image) {
                formData.append("Image", currentFacilityCourse.image);
            }

            if (facilityCourseView === "add") {
                await createCourse(facilityId, formData);
                toast.success("Course created successfully");
            } else if (facilityCourseView === "edit") {
                await updateCourse(facilityId, currentFacilityCourse.id, formData);
                toast.success("Course updated successfully");
            }
            setFacilityCourseView("list");
        } catch (error) {
            toast.error(error.message || "Failed to save course");
        }
    };

    const handleDeleteFacilityCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await deleteCourse(facilityId, id);
            toast.success("Course deleted successfully");
            loadFacilityCourses();
        } catch (error) {
            toast.error(error.message || "Failed to delete course");
        }
    };

    const loadGroupCourses = async () => {
        if (!currentGroup.id) return;
        try {
            setIsLoadingGroupCourses(true);
            const allCourses = await getAllCourses();
            const filtered = (Array.isArray(allCourses) ? allCourses : (allCourses?.data || allCourses?.$values || [])).filter(c => c.groupId === currentGroup.id || c.GroupId === currentGroup.id);
            setGroupCourses(filtered);
        } catch (error) {
            toast.error(error.message || "Failed to load courses");
        } finally {
            setIsLoadingGroupCourses(false);
        }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("Name", currentCourse.name);
            formData.append("Description", currentCourse.description);
            formData.append("Cost", currentCourse.cost);
            formData.append("Type", currentCourse.type || "Online");
            formData.append("GroupId", currentGroup.id);
            formData.append("FacilityId", facilityId);
            if (currentCourse.image) {
                formData.append("Image", currentCourse.image);
            }

            if (courseView === "add") {
                await createCourse(facilityId, formData);
                toast.success("Course assigned successfully");
            } else if (courseView === "edit") {
                await updateCourse(facilityId, currentCourse.id, formData);
                toast.success("Course updated successfully");
            }
            setCourseView("list");
        } catch (error) {
            toast.error(error.message || "Failed to save course");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to remove this course?")) return;
        try {
            await deleteCourse(facilityId, id);
            toast.success("Course removed successfully");
            loadGroupCourses();
        } catch (error) {
            toast.error(error.message || "Failed to remove course");
        }
    };

    return (
        <div className="profile-layout-wrapper">
            {/* Breadcrumb */}
            <div className="profile-breadcrumb">
                <span onClick={() => navigate('/home')}>Home</span>
                <span className="bc-sep">›</span>
                <span onClick={() => navigate('/profile')}>Control Panel</span>
                <span className="bc-sep">›</span>
                <span className="bc-active">
                    Facility Settings ({facilityData.name || facilityData.Name || facilityId})
                </span>
            </div>

            <div className="profile-dashboard-container">
                {/* ═══ LEFT SIDEBAR ═══ */}
                <aside className="profile-sidebar">
                    <nav className="sidebar-nav">
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            <SettingsIcon /> General Settings
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'members' ? 'active' : ''}`}
                            onClick={() => setActiveTab('members')}
                        >
                            <GroupIcon /> Members
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'groups' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('groups'); setGroupView('list'); }}
                        >
                            <GroupsIcon /> Groups
                        </button>
                        <button 
                            className={`sidebar-nav-item ${activeTab === 'courses' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('courses'); setFacilityCourseView("list"); }}
                        >
                            <MenuBookIcon /> Courses
                        </button>
                    </nav>
                </aside>

                {/* ═══ RIGHT MAIN CONTENT ═══ */}
                <main className="profile-main-content">
                    <div className="profile-content-area">
                        


                        {/* 2. GENERAL SETTINGS TAB */}
                        {activeTab === 'general' && (
                            <div className="tab-pane-profile">
                                <h3 className="settings-section-title">General Settings</h3>
                                <p className="settings-subtitle">Update basic facility information.</p>
                                
                                <div className="profile-form" style={{ marginTop: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Facility Name</label>
                                        <input type="text" defaultValue={facilityData.name || facilityData.Name || ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea rows="4" defaultValue={facilityData.description || facilityData.Description || ""} />
                                    </div>
                                    <div className="form-actions-row">
                                        <button className="btn-secondary">Cancel</button>
                                        <button className="btn-primary" onClick={() => toast.success("Settings saved successfully!")}>Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. MEMBERS TAB */}
                        {activeTab === 'members' && (
                            <div className="tab-pane-profile" style={{ padding: 0 }}>
                                <div className="fd-content" style={{ padding: 0, maxWidth: 'none' }}>
                                    <div className="fd-card fd-add-access-card">
                                        <h2><AddCircleOutlineIcon /> Grant New Access</h2>
                                        <form className="fd-form" onSubmit={handleGiveAccess}>
                                            <div className="fd-form-group">
                                                <label>User Email</label>
                                                <input 
                                                    type="email" 
                                                    placeholder="Enter member's email" 
                                                    value={memberEmail} 
                                                    onChange={(e) => setMemberEmail(e.target.value)} 
                                                    required 
                                                />
                                            </div>
                                            <div className="fd-form-group">
                                                <label>Role</label>
                                                <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                                                    <option value={1}>Leader</option>
                                                    <option value={2}>Instructor</option>
                                                </select>
                                            </div>
                                            <div className="fd-form-submit">
                                                <button type="submit" className="fd-primary-btn" disabled={isLoadingAccess}>
                                                    {isLoadingAccess ? "Processing..." : "Grant Access"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="fd-card fd-access-list-card" style={{ marginTop: '2rem' }}>
                                        <h2><GroupIcon /> Facility Members</h2>
                                        {isFetchingAccess ? (
                                            <p className="fd-loading-text">Loading members...</p>
                                        ) : accessList.length === 0 ? (
                                            <div className="fd-empty-state">
                                                <GroupIcon style={{ fontSize: 60, color: '#9ca3af' }} />
                                                <p>No members have been added to this facility yet.</p>
                                            </div>
                                        ) : (
                                            <div className="fd-table-container">
                                                <table className="fd-table">
                                                    <thead>
                                                        <tr>
                                                            <th>User</th>
                                                            <th>Role</th>
                                                            <th>Joined Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {accessList.map((member, idx) => {
                                                            const userName = member.userName || member.user || `User #${idx}`;
                                                            const email = member.email || "";
                                                            
                                                            let memberRoleName = "Unknown";
                                                            if (member.role === 0) memberRoleName = "Super Admin";
                                                            else if (member.role === 1) memberRoleName = "Leader";
                                                            else if (member.role === 2) memberRoleName = "Instructor";

                                                            const joinedDateStr = member.createdAt || member.joinedAt;
                                                            const joinedDate = joinedDateStr ? new Date(joinedDateStr).toLocaleDateString() : "-";
                                                            
                                                            const badgeClass = memberRoleName.replace(/\s+/g, '').toLowerCase();
                                                            
                                                            return (
                                                                <tr key={member.id || idx}>
                                                                    <td>
                                                                        <div className="fd-user-cell">
                                                                            <div className="fd-avatar">
                                                                                {String(userName).charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <div className="fd-email" style={{ fontWeight: 600 }}>{userName}</div>
                                                                                {email && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{email}</div>}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`fd-badge ${badgeClass}`}>
                                                                            {memberRoleName}
                                                                        </span>
                                                                    </td>
                                                                    <td>{joinedDate}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3.5 GROUPS TAB */}
                        {activeTab === 'groups' && (
                            <div className="tab-pane-profile">
                                {groupView === "list" ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 className="settings-section-title">Facility Groups</h3>
                                                <p className="settings-subtitle">Manage member groups within this facility.</p>
                                            </div>
                                            <button 
                                                className="btn-primary" 
                                                onClick={() => {
                                                    setCurrentGroup({ id: null, name: "", description: "" });
                                                    setGroupView("add");
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <AddIcon fontSize="small"/> Add Group
                                            </button>
                                        </div>

                                        {isLoadingGroups ? (
                                            <p style={{color: 'var(--text-secondary)'}}>Loading groups...</p>
                                        ) : groups.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                                                <GroupsIcon style={{ fontSize: 60, color: 'var(--text-muted)' }} />
                                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No groups found. Create one to organize members.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {groups.map((grp, idx) => (
                                                    <div key={grp.id || grp.Id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <div style={{ width: 50, height: 50, borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <GroupsIcon style={{ color: 'var(--text-muted)' }} />
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600' }}>
                                                                    {grp.name || grp.Name || "Unnamed Group"}
                                                                </h4>
                                                                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                                    {grp.description || grp.Description || "No description."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button 
                                                                className="btn-primary" 
                                                                onClick={() => {
                                                                    setCurrentGroup({ id: grp.id || grp.Id, name: grp.name || grp.Name, description: grp.description || grp.Description });
                                                                    setGroupView("manage");
                                                                }} 
                                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                <SettingsIcon fontSize="small"/> Manage
                                                            </button>
                                                            <button 
                                                                className="btn-secondary" 
                                                                onClick={() => {
                                                                    setCurrentGroup({ id: grp.id || grp.Id, name: grp.name || grp.Name, description: grp.description || grp.Description });
                                                                    setGroupView("edit");
                                                                }} 
                                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                <EditIcon fontSize="small"/> Edit
                                                            </button>
                                                            <button 
                                                                className="btn-secondary" 
                                                                onClick={() => handleDeleteGroup(grp.id || grp.Id)} 
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
                                ) : groupView === "add" || groupView === "edit" ? (
                                    <>
                                        <h3 className="settings-section-title">
                                            {groupView === "add" ? "Add New Group" : "Edit Group"}
                                        </h3>
                                        <form className="settings-form" onSubmit={handleGroupSubmit} style={{ marginTop: '1.5rem' }}>
                                            <div className="form-group">
                                                <label>Group Name <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter group name..."
                                                    value={currentGroup.name} 
                                                    onChange={(e) => setCurrentGroup({...currentGroup, name: e.target.value})}
                                                    required 
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea 
                                                    rows="4" 
                                                    placeholder="Enter group description..." 
                                                    value={currentGroup.description}
                                                    onChange={(e) => setCurrentGroup({...currentGroup, description: e.target.value})}
                                                />
                                            </div>
                                            <div className="form-actions-row" style={{marginTop: '2rem'}}>
                                                <button type="button" className="btn-secondary" onClick={() => setGroupView("list")}>Cancel</button>
                                                <button type="submit" className="btn-primary">Save Group</button>
                                            </div>
                                        </form>
                                    </>
                                ) : groupView === "manage" ? (
                                    <>
                                        {courseView === "list" ? (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                    <div>
                                                        <button 
                                                            className="btn-secondary" 
                                                            onClick={() => setGroupView("list")}
                                                            style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                                        >
                                                            ← Back to Groups
                                                        </button>
                                                        <h3 className="settings-section-title">Manage Group: {currentGroup.name}</h3>
                                                        <p className="settings-subtitle">Manage the courses assigned to this group.</p>
                                                    </div>
                                                    <button 
                                                        className="btn-primary" 
                                                        onClick={() => {
                                                            setCurrentCourse({ id: null, name: "", description: "", cost: 0, type: "", image: null });
                                                            setCourseView("add");
                                                        }}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                                    >
                                                        <AddIcon fontSize="small"/> Assign Course
                                                    </button>
                                                </div>

                                                {isLoadingGroupCourses ? (
                                                    <p style={{color: 'var(--text-secondary)'}}>Loading courses...</p>
                                                ) : groupCourses.length === 0 ? (
                                                    <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                                        <MenuBookIcon style={{ fontSize: 50, color: 'var(--text-muted)' }} />
                                                        <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.1rem' }}>No Courses Assigned</h4>
                                                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
                                                            This group does not have any courses assigned to it yet. Click "Assign Course" to add courses for the members of this group.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        {groupCourses.map((crs, idx) => (
                                                            <div key={crs.id || crs.Id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                                    <div style={{ width: 60, height: 60, borderRadius: '8px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                                                                        {crs.imageUrl || crs.ImageUrl ? (
                                                                            <img src={getImageUrl(crs.imageUrl || crs.ImageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                        ) : (
                                                                            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                <MenuBookIcon style={{ color: 'var(--text-muted)' }} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600' }}>
                                                                            {crs.name || crs.Name || "Unnamed Course"}
                                                                        </h4>
                                                                        <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                                            {crs.description || crs.Description || "No description."}
                                                                        </p>
                                                                        <p style={{ margin: '0.2rem 0 0', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                                            ${crs.cost || crs.Cost || 0}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                                    <button 
                                                                        className="btn-secondary" 
                                                                        onClick={() => {
                                                                            setCurrentCourse({ id: crs.id || crs.Id, name: crs.name || crs.Name, description: crs.description || crs.Description, cost: crs.cost || crs.Cost, type: crs.type || crs.Type, image: null });
                                                                            setCourseView("edit");
                                                                        }} 
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                                                    >
                                                                        <EditIcon fontSize="small"/> Edit
                                                                    </button>
                                                                    <button 
                                                                        className="btn-secondary" 
                                                                        onClick={() => handleDeleteCourse(crs.id || crs.Id)} 
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
                                                <h3 className="settings-section-title">
                                                    {courseView === "add" ? "Assign New Course" : "Edit Assigned Course"}
                                                </h3>
                                                <form className="settings-form" onSubmit={handleCourseSubmit} style={{ marginTop: '1.5rem' }}>
                                                    <div className="form-group">
                                                        <label>Course Name <span style={{color: '#ef4444'}}>*</span></label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Enter course name..."
                                                            value={currentCourse.name} 
                                                            onChange={(e) => setCurrentCourse({...currentCourse, name: e.target.value})}
                                                            required 
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Description</label>
                                                        <textarea 
                                                            rows="4" 
                                                            placeholder="Enter course description..." 
                                                            value={currentCourse.description}
                                                            onChange={(e) => setCurrentCourse({...currentCourse, description: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <div className="form-group" style={{ flex: 1 }}>
                                                            <label>Cost ($)</label>
                                                            <input 
                                                                type="number" 
                                                                min="0"
                                                                value={currentCourse.cost} 
                                                                onChange={(e) => setCurrentCourse({...currentCourse, cost: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="form-group" style={{ flex: 1 }}>
                                                            <label>Type</label>
                                                            <select 
                                                                value={currentCourse.type} 
                                                                onChange={(e) => setCurrentCourse({...currentCourse, type: e.target.value})}
                                                            >
                                                                <option value="">Select Type...</option>
                                                                <option value="Online">Online</option>
                                                                <option value="Offline">Offline</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Course Image</label>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={(e) => setCurrentCourse({...currentCourse, image: e.target.files[0]})}
                                                        />
                                                    </div>
                                                    <div className="form-actions-row" style={{marginTop: '2rem'}}>
                                                        <button type="button" className="btn-secondary" onClick={() => setCourseView("list")}>Cancel</button>
                                                        <button type="submit" className="btn-primary">Save Course</button>
                                                    </div>
                                                </form>
                                            </>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* 4. COURSES TAB */}
                        {activeTab === 'courses' && (
                            <div className="tab-pane-profile">
                                {facilityCourseView === "list" ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div>
                                                <h3 className="settings-section-title">Facility Courses</h3>
                                                <p className="settings-subtitle">Manage all courses associated with this facility.</p>
                                            </div>
                                        </div>

                                        {isLoadingFacilityCourses ? (
                                            <p style={{color: 'var(--text-secondary)'}}>Loading courses...</p>
                                        ) : facilityCourses.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                                                <MenuBookIcon style={{ fontSize: 60, color: 'var(--text-muted)' }} />
                                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No courses found in this facility. Create one to get started.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {facilityCourses.map((crs, idx) => (
                                                    <div key={crs.id || crs.Id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <div style={{ width: 60, height: 60, borderRadius: '8px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                                                                {crs.imageUrl || crs.ImageUrl ? (
                                                                    <img src={getImageUrl(crs.imageUrl || crs.ImageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                        <MenuBookIcon style={{ color: 'var(--text-muted)' }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600' }}>
                                                                    {crs.name || crs.Name || "Unnamed Course"}
                                                                </h4>
                                                                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                                    {crs.description || crs.Description || "No description."}
                                                                </p>
                                                                <div style={{ display: 'flex', gap: '15px', marginTop: '0.5rem' }}>
                                                                    <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                                        ${crs.cost || crs.Cost || 0}
                                                                    </span>
                                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                                        {groups.find(g => (g.id || g.Id) == (crs.groupId || crs.GroupId))?.name || groups.find(g => (g.id || g.Id) == (crs.groupId || crs.GroupId))?.Name || "No Group Assigned"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button 
                                                                className="btn-primary" 
                                                                onClick={() => {
                                                                    navigate(`/course-dashboard/${facilityId}/${crs.id || crs.Id}`);
                                                                }} 
                                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                <SettingsIcon fontSize="small"/> Manage
                                                            </button>
                                                            <button 
                                                                className="btn-secondary" 
                                                                onClick={() => {
                                                                    setCurrentFacilityCourse({ id: crs.id || crs.Id, name: crs.name || crs.Name, description: crs.description || crs.Description, cost: crs.cost || crs.Cost, type: crs.type || crs.Type, groupId: crs.groupId || crs.GroupId, image: null });
                                                                    setFacilityCourseView("edit");
                                                                }} 
                                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                <EditIcon fontSize="small"/> Edit
                                                            </button>
                                                            <button 
                                                                className="btn-secondary" 
                                                                onClick={() => handleDeleteFacilityCourse(crs.id || crs.Id)} 
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
                                                    onClick={() => setFacilityCourseView("list")}
                                                    style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                                >
                                                    ← Back to Courses
                                                </button>
                                                <h3 className="settings-section-title">
                                                    {facilityCourseView === "add" ? "Create New Course" : "Edit Course"}
                                                </h3>
                                            </div>
                                        </div>
                                        <form className="settings-form" onSubmit={handleFacilityCourseSubmit}>
                                            <div className="form-group">
                                                <label>Course Name <span style={{color: '#ef4444'}}>*</span></label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter course name..."
                                                    value={currentFacilityCourse.name} 
                                                    onChange={(e) => setCurrentFacilityCourse({...currentFacilityCourse, name: e.target.value})}
                                                    required 
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea 
                                                    rows="4" 
                                                    placeholder="Enter course description..." 
                                                    value={currentFacilityCourse.description}
                                                    onChange={(e) => setCurrentFacilityCourse({...currentFacilityCourse, description: e.target.value})}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Cost ($)</label>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={currentFacilityCourse.cost} 
                                                        onChange={(e) => setCurrentFacilityCourse({...currentFacilityCourse, cost: e.target.value})}
                                                    />
                                                </div>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Type</label>
                                                    <select 
                                                        value={currentFacilityCourse.type} 
                                                        onChange={(e) => setCurrentFacilityCourse({...currentFacilityCourse, type: e.target.value})}
                                                    >
                                                        <option value="">Select Type...</option>
                                                        <option value="Online">Online</option>
                                                        <option value="Offline">Offline</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Assign to Group <span style={{color: '#ef4444'}}>*</span></label>
                                                <select 
                                                    value={currentFacilityCourse.groupId} 
                                                    onChange={(e) => setCurrentFacilityCourse({...currentFacilityCourse, groupId: e.target.value})}
                                                    required
                                                >
                                                    <option value="" disabled>Select a Group...</option>
                                                    {groups.map((grp, idx) => (
                                                        <option key={grp.id || grp.Id || idx} value={grp.id || grp.Id}>{grp.name || grp.Name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Course Image</label>
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => setCurrentFacilityCourse({...currentFacilityCourse, image: e.target.files[0]})}
                                                />
                                            </div>
                                            <div className="form-actions-row" style={{marginTop: '2rem'}}>
                                                <button type="button" className="btn-secondary" onClick={() => setFacilityCourseView("list")}>Cancel</button>
                                                <button type="submit" className="btn-primary">Save Course</button>
                                            </div>
                                        </form>
                                    </>
                                )}
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
