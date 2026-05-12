import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getFacilityAccess, giveFacilityAccess, getImageUrl } from "../services/Api";
import "./FacilityDashboardPage.css";

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function FacilityDashboardPage() {
    const { facilityId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const facilityInfo = location.state?.facility || {};

    const [email, setEmail] = useState("");
    const [role, setRole] = useState(1); // 1 for Leader, 2 for Instructor
    const [accessList, setAccessList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchAccessList = async () => {
        setIsFetching(true);
        try {
            const data = await getFacilityAccess(facilityId);
            setAccessList(data || []);
        } catch (error) {
            toast.error(error.message || "Failed to load access list");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (facilityId) {
            fetchAccessList();
        }
    }, [facilityId]);

    const handleGiveAccess = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter a valid email");
            return;
        }
        setIsLoading(true);
        try {
            await giveFacilityAccess(email, parseInt(facilityId), parseInt(role));
            toast.success("Access granted successfully");
            setEmail("");
            fetchAccessList();
        } catch (error) {
            toast.error(error.message || "Failed to grant access");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fd-page">
            <div className="fd-header">
                <button className="fd-back-btn" onClick={() => navigate("/profile")}>
                    <ArrowBackIcon fontSize="small" /> Back to Profile
                </button>
                <div className="fd-facility-info">
                    {facilityInfo.image || facilityInfo.imageUrl ? (
                        <img 
                            src={getImageUrl(facilityInfo.image || facilityInfo.imageUrl)} 
                            alt={facilityInfo.name} 
                            className="fd-facility-logo"
                        />
                    ) : (
                        <div className="fd-facility-placeholder">
                            <GroupIcon />
                        </div>
                    )}
                    <div>
                        <h1>{facilityInfo.name || "Facility"} Dashboard</h1>
                        <p>Manage access and permissions for your facility members.</p>
                    </div>
                </div>
            </div>

            <div className="fd-content">
                <div className="fd-card fd-add-access-card">
                    <h2><AddCircleOutlineIcon /> Grant New Access</h2>
                    <form className="fd-form" onSubmit={handleGiveAccess}>
                        <div className="fd-form-group">
                            <label>User Email</label>
                            <input 
                                type="email" 
                                placeholder="Enter member's email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="fd-form-group">
                            <label>Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value={1}>Leader</option>
                                <option value={2}>Instructor</option>
                            </select>
                        </div>
                        <div className="fd-form-submit">
                            <button type="submit" className="fd-primary-btn" disabled={isLoading}>
                                {isLoading ? "Processing..." : "Grant Access"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="fd-card fd-access-list-card">
                    <h2><GroupIcon /> Facility Members</h2>
                    {isFetching ? (
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
                                        // Handle specific API response structure: { userName, email, role (0/1/2), createdAt }
                                        const userName = member.userName || member.user || `User #${idx}`;
                                        const email = member.email || "";
                                        
                                        let memberRoleName = "Unknown";
                                        if (member.role === 0) memberRoleName = "Super Admin";
                                        else if (member.role === 1) memberRoleName = "Leader";
                                        else if (member.role === 2) memberRoleName = "Instructor";

                                        const joinedDateStr = member.createdAt || member.joinedAt;
                                        const joinedDate = joinedDateStr ? new Date(joinedDateStr).toLocaleDateString() : "-";
                                        
                                        // create a safe class name for the badge
                                        const badgeClass = memberRoleName.replace(/\s+/g, '').toLowerCase();
                                        
                                        return (
                                            <tr key={member.id || idx}>
                                                <td>
                                                    <div className="fd-user-cell">
                                                        <div className="fd-avatar">
                                                            {String(userName).charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="fd-user-details" style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span className="fd-username" style={{ fontWeight: '600', color: 'var(--btn-primary-bg, #1a1a1a)' }}>{userName}</span>
                                                            {email && <span className="fd-email-small" style={{ fontSize: '0.8rem', color: '#6b7280' }}>{email}</span>}
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
    );
}
