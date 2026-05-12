import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Menu,
    MenuItem,
    Paper,
    InputBase,
    IconButton,
    Avatar,
    Divider,
    ListItemIcon,
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
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import { getAllCategories } from "../services/Api";
import "./Pages1.css";

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

    // Categories state
    const [categories, setCategories] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await getAllCategories();
                setCategories(data || []);
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        }
        fetchCategories();
    }, []);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // Profile menu state
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
    const handleProfileClose = () => setProfileAnchorEl(null);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const payload = getTokenPayload(token);
            if (payload) {
                // Try to extract useful info from token claims
                const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.sub || "User";
                const name = payload.name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || email.split("@")[0] || "User";
                setUser({ name, email });
            } else {
                setUser({ name: "User" });
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

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
                        ZUMRA
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
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    sx={{ mt: 1 }}
                >
                    {categories.length > 0 ? (
                        categories.map((cat, idx) => (
                            <MenuItem key={cat.id || cat.Id || idx} onClick={() => {
                                handleClose();
                                navigate('/courses'); // Or wherever categories lead
                            }}>
                                {cat.name || cat.Name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>Loading...</MenuItem>
                    )}
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
                            <div className="cart-overlay-dropdown" style={{ zIndex: 1000 }}>
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
                                                        <div className="coc-icon-circle"><StarBorderIcon style={{ fontSize: 18 }} /></div>
                                                        <div className="coc-tag-text">
                                                            <span>Ratings 4.0</span>
                                                            <small>(13 ratings) 108 students</small>
                                                        </div>
                                                    </div>
                                                    <div className="coc-tag-item">
                                                        <div className="coc-icon-circle"><IosShareIcon style={{ fontSize: 16 }} /></div>
                                                        <span className="coc-tag-label">Share</span>
                                                    </div>
                                                    <div className="coc-tag-item">
                                                        <div className="coc-icon-circle"><ApartmentIcon style={{ fontSize: 16 }} /></div>
                                                        <span className="coc-tag-label">Zumra</span>
                                                    </div>
                                                    <div className="coc-tag-item">
                                                        <div className="coc-icon-circle"><PersonOutlineIcon style={{ fontSize: 18 }} /></div>
                                                        <span className="coc-tag-label">Jane Cooper</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="coc-delete-btn">
                                                <DeleteOutlineIcon fontSize="small" />
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

                    {/* Profile Avatar / Menu */}
                    <IconButton
                        onClick={handleProfileOpen}
                        sx={{ p: 0, ml: 1 }}
                    >
                        {user ? (
                            <Avatar sx={{ bgcolor: 'var(--primary, #7c3aed)', width: 32, height: 32, fontSize: '1rem', border: '2px solid transparent', '&:hover': { borderColor: 'var(--primary, #7c3aed)' } }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                        ) : (
                            <AccountCircleRoundedIcon style={{ color: "var(--nav-icon-color)", fontSize: '32px' }} />
                        )}
                    </IconButton>
                    <Menu
                        anchorEl={profileAnchorEl}
                        open={Boolean(profileAnchorEl)}
                        onClose={handleProfileClose}
                        sx={{ mt: 1 }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem disabled sx={{ opacity: '1 !important', py: 1.5 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ color: 'inherit', fontSize: '0.95rem' }}>{user?.name || "Welcome!"}</strong>
                                {user?.email && <span style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '0.8rem', marginTop: '4px' }}>{user.email}</span>}
                            </div>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { handleProfileClose(); navigate('/profile'); }}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            My Profile
                        </MenuItem>
                        <MenuItem onClick={() => { handleProfileClose(); navigate('/profile'); /* could pass a hash/state to select settings tab later */ }}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { handleProfileClose(); handleLogout(); }} sx={{ color: '#ef4444' }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>

                </div>
            </div>
        </header>
    );
}