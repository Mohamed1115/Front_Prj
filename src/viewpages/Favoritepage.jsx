import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link, Typography, Button } from "@mui/material"; // ضفنا Button هنا
import { useNavigate } from 'react-router-dom';
import LandscapeIcon from '@mui/icons-material/Landscape';
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FavoriteIcon from "@mui/icons-material/Favorite";

import "./Pages1.css"; 

export default function Favoritepage() {
    const [favs, setFavs] = useState([]);
    const navigate = useNavigate();

    // جلب البيانات 
    const loadFavorites = () => {
        try {
            const saved = localStorage.getItem("favoriteCourses");
            // لو الـ localStorage مش موجود أو فيه نص "undefined" هيرجع مصفوفة فاضية
            if (!saved || saved === "undefined") return [];
            
            const data = JSON.parse(saved);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return [];
        }
    };

    useEffect(() => {
        setFavs(loadFavorites());
    }, []);

    const removeFromFavorites = (id) => {
        const currentFavs = loadFavorites();
        const updated = currentFavs.filter(course => course.id !== id);
        setFavs(updated);
        localStorage.setItem("favoriteCourses", JSON.stringify(updated));
    };

    return (
        <main className="main-content">
            <div className="breadcrumb-section">
                <Breadcrumbs className="breadcrumb">
                    <Link 
                        underline="hover" 
                        color="inherit" 
                        onClick={() => navigate('/pages1')} 
                        style={{ cursor: 'pointer' }}
                    > 
                        Home 
                    </Link>
                    <Typography color="text.primary">Favorite</Typography>
                </Breadcrumbs>
            </div>

            <h2 style={{ margin: '20px 0', color: '#333' }}>your favorite courses ({favs.length})</h2>

            {favs.length > 0 ? (
                favs.map((course) => (
                    <div className="course-card-wrapper" key={course.id}>
                        <div className="course-card-container">
                            <div className="image-placeholder-box">
                                <LandscapeIcon className="placeholder-icon" />
                            </div>

                            <div className="card-main-content">
                                <h2 className="course-title-text">{course.title}</h2>
                                <p className="course-description-text">{course.description}</p>
                                <div className="interaction-info-bar">
                                    <div className="info-badge">
                                        <div className="icon-container-black"><StarBorderIcon fontSize="small" /></div>
                                        <span className="badge-title">Ratings 4.0</span>
                                    </div>
                                    <div className="info-badge">
                                        <div className="icon-container-black"><PersonOutlineIcon fontSize="small" /></div>
                                        <span className="badge-single-title">Jane Cooper</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions-sidebar">
                                <div className="price-interaction-row">
                                    <div className="add-to-card-button">
                                        <span className="current-price">{course.price || "$250"}</span>
                                    </div>
                                    <button 
                                        className="heart-favorite-button filled" 
                                        onClick={() => removeFromFavorites(course.id)}
                                    >
                                        <FavoriteIcon style={{ color: 'red' }} />
                                    </button>
                                </div>
                                <button className="buy-now-primary-button">Buy now</button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                        قائمة المفضلات فارغة حالياً..
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/pages1')}
                        sx={{ backgroundColor: '#1976d2', color: 'white' }}
                    >
                        تصفح الكورسات وأضف للمفضلة
                    </Button>
                </div>
            )}
        </main>
    );
}