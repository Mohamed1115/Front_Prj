import "./Pages1.css";
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import LandscapeIcon from '@mui/icons-material/Landscape';
import IosShareIcon from '@mui/icons-material/IosShare';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import { useState, useEffect } from "react";

export default function Pages1() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

   
    const currentCourse = {
        id: "course_1", 
        title: "Complete Drawing Course: Ultimate Drawing Art with Pencil",
        price: "$250",
        description: "This course covers everything from basic shapes, proportions, and perspective to light, shadow,and color theory — helping you transform simple sketches into professional artworks. Perfect forbeginners and aspiring artists who want to build a strong creative foundation",
    };

    
    const [isFavorite, setIsFavorite] = useState(false);
    const [isAddedToCart, setIsAddedToCart] = useState(false);

    // 1. فحص الحالة عند فتح الصفحة (Home)
    useEffect(() => {
        const saved = localStorage.getItem("favoriteCourses");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setIsFavorite(parsed.some(item => item.id === currentCourse.id));
                }
            } catch (e) {
                console.error("JSON Error", e);
            }
        }
    }, []);

    // 2. فانكشن التبديل (Toggle)
    const handletoggleFavorite = () => {
        const saved = localStorage.getItem("favoriteCourses");
        let favoritesList = [];
        
        try {
            favoritesList = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(favoritesList)) favoritesList = [];
        } catch (e) {
            favoritesList = [];
        }

        const isExist = favoritesList.some(item => item.id === currentCourse.id);
        let updatedList;

        if (isExist) {
            updatedList = favoritesList.filter(item => item.id !== currentCourse.id);
            setIsFavorite(false);
        } else {
            updatedList = [...favoritesList, currentCourse];
            setIsFavorite(true);
        }

        localStorage.setItem("favoriteCourses", JSON.stringify(updatedList));
    };

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <main className="main-content">
                <div className="breadcrumb-section">
                    <Breadcrumbs className="breadcrumb">
                        <Link underline="hover" color="text.primary" style={{ cursor: 'pointer' }} >Home</Link>
                        <Typography color="inherit" onClick={() => navigate('/Favoritepage')} style={{ cursor: 'pointer' }}>Favorite</Typography>
                    </Breadcrumbs>
                </div>

                <div className="course-card-wrapper">
                    <div className="course-card-container">
                        <div className="image-placeholder-box"><LandscapeIcon className="placeholder-icon" /></div>
                        <div className="card-main-content">
                            <h2 className="course-title-text">{currentCourse.title}</h2>
                            <p className="course-description-text">{currentCourse.description}</p>
                                                    <div className="interaction-info-bar">
  {/* 1. قسم التقييم */}
  <div className="info-badge">
    <div className="icon-container-black"><StarBorderIcon fontSize="small" /></div>
    <div className="badge-text-group">
      <span className="badge-title">Ratings 4.0</span>
      <span className="badge-subtitle">(13 ratings) 108 students</span>
    </div>
  </div>

  {/* 2. قسم المشاركة */}
  <div className="info-badge clickable">
    <div className="icon-container-black"><IosShareIcon fontSize="small" /></div>
    <span className="badge-single-title">Share</span>
  </div>

  {/* 3. قسم المدرب */}
  <div className="info-badge">
    <div className="icon-container-black"><PersonOutlineIcon fontSize="small" /></div>
    <span className="badge-single-title">Jane Cooper</span>
  </div>
</div>
                        </div>

                        <div className="card-actions-sidebar">
                            <div className="price-interaction-row">
                                <div className={`add-to-card-button ${isAddedToCart ? 'active' : ''}`} onClick={() => setIsAddedToCart(!isAddedToCart)}>
                                    <span className="button-label">Add to Card</span>
                                    <span className="current-price">$250</span>
                                </div>
                                {/* زرار القلب */}
                                <button className={`heart-favorite-button ${isFavorite ? 'filled' : ''}`} onClick={handletoggleFavorite}>
                                    {isFavorite ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteBorderIcon />}
                                </button>
                            </div>
                            <button className="buy-now-primary-button">Buy now</button>
                        </div>

                    </div>
                </div>
            </main>
        </>
    );
}