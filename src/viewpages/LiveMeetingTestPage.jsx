import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createLiveMeeting } from "../services/Api";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamIcon from '@mui/icons-material/Videocam';
import "./LiveMeetingTestPage.css";

export default function LiveMeetingTestPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [responseData, setResponseData] = useState(null);

    // Form states
    const [facilityId, setFacilityId] = useState("");
    const [lessonId, setLessonId] = useState("");
    const [meetingData, setMeetingData] = useState({
        RoomName: "TestRoom123",
        DisplayName: "Test User",
        Email: "test@example.com",
        Avatar: "https://via.placeholder.com/150",
        IsModerator: true,
        MeetingDuration: 60,
        EnableRecording: false,
        EnableChat: true,
        EnableScreenShare: true,
        EnableWhiteboard: true,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMeetingData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!facilityId || !lessonId) {
            toast.error("Please provide both Facility ID and Lesson ID.");
            return;
        }

        setIsLoading(true);
        setResponseData(null);
        try {
            const result = await createLiveMeeting(facilityId, lessonId, meetingData);
            setResponseData(result);
            toast.success("Live meeting created successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to create live meeting");
            setResponseData({ error: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="lmt-page">
            <div className="lmt-header">
                <button className="lmt-back-btn" onClick={() => navigate("/profile")}>
                    <ArrowBackIcon fontSize="small" /> Back to Profile
                </button>
                <div className="lmt-title-area">
                    <div className="lmt-icon-wrapper">
                        <VideocamIcon fontSize="large" />
                    </div>
                    <div>
                        <h1>Live Meeting Tester</h1>
                        <p>Test the /Api/Lesson/CreateLive endpoint.</p>
                    </div>
                </div>
            </div>

            <div className="lmt-content">
                <div className="lmt-card">
                    <form className="lmt-form" onSubmit={handleSubmit}>
                        <div className="lmt-grid">
                            <div className="lmt-form-group">
                                <label>Facility ID (FId) *</label>
                                <input 
                                    type="number" 
                                    value={facilityId} 
                                    onChange={(e) => setFacilityId(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="lmt-form-group">
                                <label>Lesson ID (id) *</label>
                                <input 
                                    type="number" 
                                    value={lessonId} 
                                    onChange={(e) => setLessonId(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="lmt-form-group">
                                <label>Room Name</label>
                                <input 
                                    type="text" 
                                    name="RoomName"
                                    value={meetingData.RoomName} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="lmt-form-group">
                                <label>Display Name</label>
                                <input 
                                    type="text" 
                                    name="DisplayName"
                                    value={meetingData.DisplayName} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="lmt-form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    name="Email"
                                    value={meetingData.Email} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="lmt-form-group">
                                <label>Avatar URL</label>
                                <input 
                                    type="url" 
                                    name="Avatar"
                                    value={meetingData.Avatar} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="lmt-form-group">
                                <label>Meeting Duration (mins)</label>
                                <input 
                                    type="number" 
                                    name="MeetingDuration"
                                    value={meetingData.MeetingDuration} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                        </div>

                        <div className="lmt-checkbox-grid">
                            <label className="lmt-checkbox-label">
                                <input 
                                    type="checkbox" 
                                    name="IsModerator"
                                    checked={meetingData.IsModerator}
                                    onChange={handleInputChange}
                                />
                                Is Moderator
                            </label>
                            <label className="lmt-checkbox-label">
                                <input 
                                    type="checkbox" 
                                    name="EnableRecording"
                                    checked={meetingData.EnableRecording}
                                    onChange={handleInputChange}
                                />
                                Enable Recording
                            </label>
                            <label className="lmt-checkbox-label">
                                <input 
                                    type="checkbox" 
                                    name="EnableChat"
                                    checked={meetingData.EnableChat}
                                    onChange={handleInputChange}
                                />
                                Enable Chat
                            </label>
                            <label className="lmt-checkbox-label">
                                <input 
                                    type="checkbox" 
                                    name="EnableScreenShare"
                                    checked={meetingData.EnableScreenShare}
                                    onChange={handleInputChange}
                                />
                                Enable Screen Share
                            </label>
                            <label className="lmt-checkbox-label">
                                <input 
                                    type="checkbox" 
                                    name="EnableWhiteboard"
                                    checked={meetingData.EnableWhiteboard}
                                    onChange={handleInputChange}
                                />
                                Enable Whiteboard
                            </label>
                        </div>

                        <button type="submit" className="lmt-submit-btn" disabled={isLoading}>
                            {isLoading ? "Creating Meeting..." : "Test Endpoint"}
                        </button>
                    </form>
                </div>

                {responseData && (
                    <div className="lmt-card lmt-response-card">
                        <h2>API Response</h2>
                        {/* --- Join button shown prominently if meeting was created --- */}
                        {responseData?.data?.meetingUrl && (
                            <div className="lmt-join-banner">
                                <div className="lmt-meeting-info">
                                    <div className="lmt-meeting-info-row">
                                        <span className="lmt-info-label">Room</span>
                                        <span className="lmt-info-value">{responseData.data.roomName}</span>
                                    </div>
                                    <div className="lmt-meeting-info-row">
                                        <span className="lmt-info-label">Starts</span>
                                        <span className="lmt-info-value">{new Date(responseData.data.startTime).toLocaleString()}</span>
                                    </div>
                                    <div className="lmt-meeting-info-row">
                                        <span className="lmt-info-label">Ends</span>
                                        <span className="lmt-info-value">{new Date(responseData.data.endTime).toLocaleString()}</span>
                                    </div>
                                </div>
                                <a 
                                    href={responseData.data.meetingUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="lmt-join-btn"
                                >
                                    🎥 Join Meeting Now
                                </a>
                            </div>
                        )}
                        {/* --- Raw JSON response --- */}
                        <details style={{ marginTop: '16px' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#6b7280', fontSize: '0.9rem', marginBottom: '10px' }}>
                                View Raw Response
                            </summary>
                            <pre>{JSON.stringify(responseData, null, 2)}</pre>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}
