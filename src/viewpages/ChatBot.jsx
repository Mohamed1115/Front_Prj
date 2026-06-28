import React, { useState, useEffect, useRef } from 'react';
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
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: "مرحباً بك في بوت زمرة. كيف يمكنني مساعدتك اليوم؟\nWelcome to ZUMRA bot. How can I help you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // UI Flow states based on wireframes:
    // 0: Normal chat
    // 1: Attachment menu open
    // 2: Drag & Drop area open
    // 3: File selected/uploading
    // 4: Audio recording sent (mock)
    const [chatState, setChatState] = useState(0);

    const messagesEndRef = useRef(null);

    // Auto scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [isOpen]);

    // Helper to decode JWT token
    const getTokenPayload = (token) => {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return "1";
            const payload = getTokenPayload(token);
            if (!payload) return "1";
            return payload.sub ||
                   payload.nameid ||
                   payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
                   payload.userId ||
                   "1";
        } catch { return "1"; }
    };

    const getSessionId = () => {
        let sid = sessionStorage.getItem("chatSessionId");
        if (!sid) {
            sid = Math.floor(100000 + Math.random() * 900000).toString();
            sessionStorage.setItem("chatSessionId", sid);
        }
        return sid;
    };

    const startNewChat = () => {
        const newSid = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem("chatSessionId", newSid);
        setMessages([
            {
                id: Date.now(),
                sender: 'bot',
                text: "مرحباً بك في بوت زمرة. تم بدء محادثة جديدة! كيف يمكنني مساعدتك اليوم؟\nWelcome to ZUMRA bot. New chat started! How can I help you today?",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
        setChatState(0);
    };

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

    const handleSendMessage = async () => {
        const text = inputValue.trim();
        if (!text) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const userId = getUserIdFromToken();
        const sessionId = getSessionId();

        try {
            const response = await fetch("https://n8n.zumra.site/webhook/3c147e6b-f549-4307-b54c-8ae8c17b14ce", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    sessionId: sessionId,
                    type: "Text",
                    message: text
                })
            });

            if (!response.ok) {
                throw new Error(`Server status: ${response.status}`);
            }

            const responseText = await response.text();
            let botReply = '';

            try {
                const data = JSON.parse(responseText);
                if (Array.isArray(data) && data.length > 0) {
                    const item = data[0];
                    botReply = item.output || item.message || item.response || item.text || item.reply || item.content || (typeof item === 'string' ? item : JSON.stringify(item));
                } else {
                    botReply = data.output || data.message || data.response || data.text || data.reply || data.content || (typeof data === 'string' ? data : JSON.stringify(data));
                }
            } catch {
                botReply = responseText;
            }

            if (!botReply || typeof botReply !== 'string' || botReply.trim() === '') {
                botReply = responseText || "No response received.";
            }

            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: botReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("ChatBot error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: "عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendAction = () => {
        if (chatState === 3) {
            const fileMsg = {
                id: Date.now(),
                sender: 'user',
                text: 'Sent attachment: photo.png',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isFile: true
            };
            setMessages(prev => [...prev, fileMsg]);
            setChatState(0);
        } else {
            const audioMsg = {
                id: Date.now(),
                sender: 'user',
                isAudio: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, audioMsg]);
            setChatState(0);
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                                className="cb-close-btn" 
                                onClick={startNewChat} 
                                title="محادثة جديدة / New Chat"
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <DeleteOutlineIcon fontSize="small" style={{ color: '#ef4444' }} />
                            </button>
                            <button className="cb-close-btn" onClick={toggleChat}>
                                <CloseIcon fontSize="small"/>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="chatbot-messages">
                        <div className="cb-date-divider">Today</div>
                        
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                {msg.isAudio ? (
                                    <div className="cb-msg-bubble user cb-audio-bubble">
                                        <button className="cb-audio-play"><PlayArrowIcon fontSize="small"/></button>
                                        <div className="cb-audio-wave">||||ı|ıı|||ı|ı|| O:05</div>
                                        <VolumeUpIcon fontSize="small" className="cb-audio-vol"/>
                                    </div>
                                ) : (
                                    <div className={`cb-msg-bubble ${msg.sender} ${msg.isError ? 'cb-error' : ''}`} style={{ whiteSpace: 'pre-line' }}>
                                        {msg.text}
                                    </div>
                                )}
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: '#9ca3af',
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    margin: '2px 8px 8px 8px'
                                }}>
                                    {msg.time}
                                </span>
                            </div>
                        ))}

                        {isLoading && (
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <div className="cb-msg-bubble bot" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '10px 14px', width: 'fit-content' }}>
                                    <span className="dot-bounce"></span>
                                    <span className="dot-bounce"></span>
                                    <span className="dot-bounce"></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
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
                        <input 
                            type="text" 
                            placeholder="Write a message..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            disabled={isLoading}
                        />
                        <div className="cb-footer-actions">
                            <button><MicNoneIcon fontSize="small"/></button>
                            <button onClick={handleAttachClick} className={chatState === 1 ? 'active' : ''}>
                                <AttachFileIcon fontSize="small"/>
                            </button>
                            <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                                <SendIcon fontSize="small"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
