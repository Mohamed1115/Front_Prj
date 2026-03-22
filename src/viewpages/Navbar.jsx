import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Menu,
    MenuItem,
    Paper,
    InputBase,
    IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IosShareIcon from "@mui/icons-material/IosShare";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import LandscapeIcon from "@mui/icons-material/Landscape";
import "./Pages1.css";

export default function Navbar() {
    const navigate = useNavigate();

    // Theme
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('zumra-theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('zumra-theme', theme);
    }, [theme]);

    const themeOptions = [
        { id: 'dark', color: '#1a1818' },
        { id: 'yellow', color: '#ffd500' },
        { id: 'blue', color: '#2563eb' },
    ];

    // Categories menu
    const [anchorEl, setAnchorEl] = useState(null);
    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // Cart Dropdown
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setIsCartOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const cartItems = [
        { id: 1, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", desc: "Learn the fundamentals of drawing from scratch and develop your artistic skills step by step. This course covers everything from basic shapes, proportions, and perspective to light, shadow, and color theory — helping you transform simple sketches into professional artworks. Perfect for beginners and aspiring artists who want to build a strong creative foundation." },
        { id: 2, title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", desc: "Learn the fundamentals of drawing from scratch and develop your artistic skills step by step. This course covers everything from basic shapes, proportions, and perspective to light, shadow, and color theory — helping you transform simple sketches into professional artworks. Perfect for beginners and aspiring artists who want to build a strong creative foundation." },
    ];

    return (
        <header>
            <div className="nav-container">
                {/* Logo */}
                <ul className="nav">
                    <li className="li1" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
                        LOGO
                    </li>
                </ul>

                {/* Categories Button */}
                <Button
                    variant="outlined"
                    onClick={handleOpen}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{
                        color: 'var(--nav-text)',
                        borderColor: 'var(--nav-cat-border)',
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        px: 2.5,
                        '&:hover': {
                            borderColor: 'var(--nav-cat-border)',
                            background: 'var(--nav-cat-hover)',
                        }
                    }}
                >
                    Categories
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem onClick={handleClose}>Python Course</MenuItem>
                    <MenuItem onClick={handleClose}>Frontend Course</MenuItem>
                    <MenuItem onClick={handleClose}>Backend Course</MenuItem>
                    <MenuItem onClick={handleClose}>Flutter Course</MenuItem>
                </Menu>

                {/* Search Bar */}
                <Paper
                    component="form"
                    sx={{
                        p: "2px 4px",
                        display: "flex",
                        alignItems: "center",
                        width: 400,
                        borderRadius: 5,
                        bgcolor: 'var(--nav-search-bg)',
                        boxShadow: 'none',
                    }}
                >
                    <IconButton type="button" sx={{ p: '6px' }}>
                        <SearchIcon />
                    </IconButton>
                    <InputBase sx={{ ml: 0, flex: 1 }} placeholder="Search.." />
                </Paper>

                {/* Right Icons */}
                <div className="icon">
                    {/* Theme Toggle */}
                    <div className="theme-toggle-group">
                        {themeOptions.map(t => (
                            <button
                                key={t.id}
                                className={`theme-dot ${theme === t.id ? 'active' : ''}`}
                                style={{ background: t.color }}
                                onClick={() => setTheme(t.id)}
                                title={t.id + ' theme'}
                            />
                        ))}
                    </div>

                    <FavoriteBorderIcon
                        onClick={() => navigate('/Favoritepage')}
                        style={{ cursor: "pointer", color: 'var(--nav-icon-color)' }}
                    />
                    
                    {/* Cart wrapper with overlay */}
                    <div className="nav-cart-wrapper" ref={cartRef}>
                        <ShoppingCartOutlinedIcon
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            style={{ cursor: "pointer" }}
                        />
                        
                        {isCartOpen && (
                            <div className="cart-overlay-dropdown">
                                <div className="cart-overlay-items">
                                    {cartItems.map((item, idx) => (
                                        <div className="cart-overlay-card" key={idx}>
                                            <div className="coc-image">
                                                <LandscapeIcon />
                                            </div>
                                            <div className="coc-content">
                                                <h4>{item.title}</h4>
                                                <p>{item.desc}</p>
                                                
                                                <div className="coc-tags">
                                                    <div className="coc-tag-item">
                                                        <div className="coc-icon-circle"><StarBorderIcon style={{fontSize: 18}}/></div>
                                                        <div className="coc-tag-text">
                                                            <span>Ratings 4.0</span>
                                                            <small>(13 ratings) 108 students</small>
                                                        </div>
                                                    </div>
                                                    <div className="coc-tag-item">
                                                        <div className="coc-icon-circle"><IosShareIcon style={{fontSize: 16}}/></div>
                                                        <span className="coc-tag-label">Share</span>
                                                    </div>
                                                    <div className="coc-tag-item">
                                                        <div className="coc-icon-circle"><ApartmentIcon style={{fontSize: 16}}/></div>
                                                        <span className="coc-tag-label">Zumra</span>
                                                    </div>
                                                    <div className="coc-tag-item">
                                                        <div className="coc-icon-circle"><PersonOutlineIcon style={{fontSize: 18}}/></div>
                                                        <span className="coc-tag-label">Jane Cooper</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="coc-delete-btn">
                                                <DeleteOutlineIcon fontSize="small"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-overlay-actions">
                                    <button 
                                        className="btn-checkout" 
                                        onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                                    >
                                        Checkout
                                    </button>
                                    <button 
                                        className="btn-keep-shopping"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Keep Shopping
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <span className="nav-my-learning" onClick={() => navigate('/my-courses')} style={{ cursor: 'pointer' }}>
                        My Learning
                    </span>
                    <AccountCircleRoundedIcon
                        onClick={() => navigate('/profile')}
                        style={{ cursor: "pointer", fontSize: '32px' }}
                    />
                </div>
            </div>
        </header>
    );
}