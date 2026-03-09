import React, { useState } from "react";
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
import "./Pages1.css";

export default function Navbar() {
    const navigate = useNavigate();

    // Categories menu
    const [anchorEl, setAnchorEl] = useState(null);
    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

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
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        px: 2.5,
                        '&:hover': {
                            borderColor: 'rgba(255,255,255,0.6)',
                            background: 'rgba(255,255,255,0.05)',
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
                        bgcolor: '#e8e8e8',
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
                    <FavoriteBorderIcon
                        onClick={() => navigate('/Favoritepage')}
                        style={{ cursor: "pointer" }}
                    />
                    <ShoppingCartOutlinedIcon style={{ cursor: "pointer" }} />
                    <span className="nav-my-learning" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
                        My Learning
                    </span>
                    <AccountCircleRoundedIcon
                        style={{ cursor: "pointer", fontSize: '32px' }}
                    />
                </div>
            </div>
        </header>
    );
}