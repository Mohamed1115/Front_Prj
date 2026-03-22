import React, { useState } from 'react';
import './ChatBot.css';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicNoneIcon from '@mui/icons-material/MicNone';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CropIcon from '@mui/icons-material/Crop';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LandscapeIcon from '@mui/icons-material/Landscape';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    
    // UI Flow states based on wireframes:
    // 0: Normal chat
    // 1: Attachment menu open
    // 2: Drag & Drop area open
    // 3: File selected/uploading
    // 4: Audio recording sent (mock)
    const [chatState, setChatState] = useState(0);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleAttachClick = () => {
        setChatState(chatState === 1 ? 0 : 1);
    };

    const handleSendFileClick = () => {
        setChatState(2);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setChatState(3); // Mock file selected
    };

    const handleSendAction = () => {
        if (chatState === 3) {
            setChatState(0); // File sent, return to normal
        } else {
            // Mock sending an audio file just to show the final state from wireframe
            setChatState(4);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {/* Floating Action Button */}
            {!isOpen && (
                <button className="chatbot-fab" onClick={toggleChat}>
                    <SmartToyIcon />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="cb-header-info">
                            <div className="cb-avatar"><SmartToyIcon /></div>
                            <div>
                                <h3>ZUMRA bot</h3>
                                <p>Support Agent</p>
                            </div>
                        </div>
                        <button className="cb-close-btn" onClick={toggleChat}>
                            <CloseIcon fontSize="small"/>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="chatbot-messages">
                        <div className="cb-date-divider">Yesterday 02:43 PM</div>
                        
                        <div className="cb-msg-bubble user">
                            Hello Nice
                        </div>
                        
                        <div className="cb-msg-bubble bot">
                            Welcome to LiveChat. I was made with... Pick a topic from the list or type down a question!
                        </div>

                        <div className="cb-date-divider">Today 02:12 PM</div>

                        {chatState === 4 && (
                            <div className="cb-msg-bubble user cb-audio-bubble">
                                <button className="cb-audio-play"><PlayArrowIcon fontSize="small"/></button>
                                <div className="cb-audio-wave">||||ı|ıı|||ı|ı|| O:05</div>
                                <VolumeUpIcon fontSize="small" className="cb-audio-vol"/>
                            </div>
                        )}
                    </div>

                    {/* OVERLAYS FOR ATTACHMENTS */}
                    
                    {/* Menu Overlay (State 1) */}
                    {chatState === 1 && (
                        <div className="cb-attach-menu">
                            <button onClick={handleSendFileClick}>
                                <InsertDriveFileOutlinedIcon fontSize="small"/> Send file
                            </button>
                            <button>
                                <CropIcon fontSize="small"/> Attach a screenshot
                            </button>
                        </div>
                    )}

                    {/* Drag & Drop Area (State 2) */}
                    {chatState === 2 && (
                        <div className="cb-drag-drop-overlay">
                            <div 
                                className="cb-drag-box" 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <CloudUploadOutlinedIcon style={{fontSize: 40, color: '#9ca3af', marginBottom: 8}}/>
                                <p>Drag & drop files or <span>Browse</span></p>
                                <small>Supported formats: JPEG, PNG, PDF, mp4, mp3 (Max 10MB)</small>
                            </div>
                        </div>
                    )}

                    {/* File Uploaded State (State 3) */}
                    {chatState === 3 && (
                        <div className="cb-file-uploaded-overlay">
                            <div className="cb-uploaded-box">
                                <div className="cb-ub-header">
                                    <CheckCircleOutlineIcon fontSize="small" style={{color: '#16a34a'}}/>
                                    <span>1 of 1 uploaded</span>
                                    <CloseIcon fontSize="small" style={{cursor: 'pointer'}} onClick={() => setChatState(0)}/>
                                </div>
                                <div className="cb-ub-file">
                                    <div className="cb-ub-image-placeholder">
                                        <LandscapeIcon />
                                    </div>
                                    <div className="cb-ub-details">
                                        <span>photo.png</span>
                                        <DeleteOutlineIcon fontSize="small" style={{cursor: 'pointer'}}/>
                                    </div>
                                </div>
                                <button className="cb-send-files-btn" onClick={handleSendAction}>
                                    Send files
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer Input */}
                    <div className="chatbot-footer">
                        <input type="text" placeholder="Write a message" />
                        <div className="cb-footer-actions">
                            <button><MicNoneIcon fontSize="small"/></button>
                            <button onClick={handleAttachClick} className={chatState === 1 ? 'active' : ''}>
                                <AttachFileIcon fontSize="small"/>
                            </button>
                            <button onClick={handleSendAction}><SendIcon fontSize="small"/></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
