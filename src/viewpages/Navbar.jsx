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
import { getAllCategories, getUserProfile, getImageUrl } from "../services/Api";
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
            let email = "";
            let name = "User";
            if (payload) {
                email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.sub || "User";
                name = payload.name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || email.split("@")[0] || "User";
            }
            setUser({ name, email, imageUrl: null });

            // Fetch real user details including Avatar image
            async function fetchNavbarUser() {
                try {
                    const data = await getUserProfile();
                    if (data) {
                        setUser({
                            name: data.name || data.Name || name,
                            email: data.email || data.Email || email,
                            imageUrl: data.imageUrl || data.ImageUrl || null
                        });
                    }
                } catch (error) {
                    console.error("Failed to load user profile in navbar:", error);
                }
            }
            fetchNavbarUser();
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

    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header style={{ padding: "12px 30px" }}>
            <div className="nav-container">
                {/* Left Section: Logo & Categories */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div
                        onClick={() => navigate('/home')}
                        style={{
                            cursor: 'pointer',
                            fontSize: '24px',
                            fontWeight: 900,
                            letterSpacing: '0.5px',
                            color: 'var(--nav-text, white)',
                            fontFamily: 'system-ui, sans-serif'
                        }}
                    >
                        ZUMRA
                    </div>

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
                            height: '38px',
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
                                    navigate('/courses', { state: { categoryId: cat.id || cat.Id, categoryName: cat.name || cat.Name } });
                                }}>
                                    {cat.name || cat.Name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>Loading...</MenuItem>
                        )}
                    </Menu>
                </div>

                {/* Center Section: Search Bar */}
                <Paper
                    component="form"
                    onSubmit={handleSearchSubmit}
                    sx={{
                        p: "2px 14px",
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        maxWidth: 1000,
                        mx: 4,
                        height: 44,
                        borderRadius: '22px',
                        bgcolor: 'var(--nav-search-bg)',
                        border: '1px solid var(--nav-border)',
                        boxShadow: 'none',
                        transition: 'all 0.25s ease',
                        '&:focus-within': {
                            borderColor: 'var(--primary, #7c3aed)',
                            boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.2)',
                            bgcolor: 'rgba(255, 255, 255, 0.98)',
                        }
                    }}
                >
                    <IconButton type="submit" sx={{ p: '4px', color: 'var(--nav-search-text)' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                    <InputBase
                        sx={{
                            ml: 1,
                            flex: 1,
                            color: 'var(--nav-search-text)',
                            fontSize: '0.92rem',
                            '& input::placeholder': {
                                color: 'var(--nav-search-text)',
                                opacity: 0.65
                            }
                        }}
                        placeholder="Search courses and facilities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Paper>

                {/* Right Section: Icons */}
                <div className="icon" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                    <FavoriteBorderIcon
                        onClick={() => navigate('/Favoritepage')}
                        style={{ cursor: "pointer", color: 'var(--nav-icon-color)' }}
                    />

                    {/* Cart wrapper: clicking the icon goes directly to checkout */}
                    <div className="nav-cart-wrapper">
                        <ShoppingCartOutlinedIcon
                            onClick={() => navigate('/checkout')}
                            style={{ cursor: "pointer" }}
                        />
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
                            <Avatar
                                src={user.imageUrl ? getImageUrl(user.imageUrl) : undefined}
                                imgProps={{
                                    style: {
                                        objectFit: 'cover',
                                        imageRendering: '-webkit-optimize-contrast'
                                    }
                                }}
                                sx={{ bgcolor: 'var(--primary, #7c3aed)', width: 44, height: 44, fontSize: '1.25rem', border: '2px solid transparent', '&:hover': { borderColor: 'var(--primary, #7c3aed)' } }}
                            >
                                {!user.imageUrl && (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                            </Avatar>
                        ) : (
                            <AccountCircleRoundedIcon style={{ color: "var(--nav-icon-color)", fontSize: '44px' }} />
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