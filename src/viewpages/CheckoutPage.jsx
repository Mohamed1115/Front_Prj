import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

// MUI Icons
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LandscapeIcon from "@mui/icons-material/Landscape";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import StarIcon from "@mui/icons-material/Star";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Payment, 3: Confirmation

    // Mock Cart Data
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            title: "Complete Drawing Course: Ultimate Drawing Art with Pencil",
            instructor: "Jane Cooper",
            rating: 4.8,
            price: 119.99,
            oldPrice: 189.99
        },
        {
            id: 2,
            title: "Complete Drawing Course: Ultimate Drawing Art with Pencil", // Duplicate to match wireframe displaying 2 items
            instructor: "Jane Cooper",
            rating: 4.8,
            price: 119.99,
            oldPrice: 189.99
        }
    ]);

    const handleRemove = (id, indexToRemove) => {
        // filter by index to allow removing duplicates individually
        setCartItems(cartItems.filter((_, idx) => idx !== indexToRemove));
    };

    // Derived values
    const subtotal = cartItems.reduce((acc, item) => acc + item.oldPrice, 0);
    const discounts = cartItems.reduce((acc, item) => acc + (item.oldPrice - item.price), 0);
    const total = subtotal - discounts;

    // Stepper config
    const steps = [
        { number: 1, label: "Cart", icon: <ShoppingCartIcon /> },
        { number: 2, label: "Payment", icon: <CreditCardIcon /> },
        { number: 3, label: "Confirmation", icon: <CheckCircleIcon /> },
    ];

    // Navigation Handlers
    const goToPayment = () => {
        setCurrentStep(2);
        window.scrollTo(0, 0);
    };

    const placeOrder = () => {
        setCurrentStep(3);
        window.scrollTo(0, 0);
    };

    const backToCart = () => {
        setCurrentStep(1);
    };

    const goToCourse = () => {
        navigate("/my-courses");
    };

    return (
        <div className="checkout-page">
            {/* Breadcrumb */}
            <div className="checkout-breadcrumb">
                <span style={{ cursor: 'pointer' }} onClick={() => navigate("/home")}>Home</span>
                {" > "}
                <span>Checkout</span>
            </div>

            <h1 className="checkout-page-title">Checkout</h1>
            <p className="checkout-page-subtitle">Complete your purchase to get into our courses</p>

            {/* Stepper */}
            <div className="checkout-stepper-container">
                <div className="checkout-stepper">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.number}>
                            <div className="stepper-step">
                                <div className={`stepper-circle ${currentStep >= step.number ? "active" : "inactive"}`}>
                                    {step.icon}
                                </div>
                                <span className={`stepper-label ${currentStep >= step.number ? "active" : "inactive"}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`stepper-line ${currentStep > step.number ? "active" : ""}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ═══ STEP 1: CART ═══ */}
            {currentStep === 1 && (
                <div className="checkout-layout">
                    {/* Left: Cart Items */}
                    <div className="checkout-left">
                        <h2 className="section-title">Shopping Cart</h2>
                        <div className="cart-items-list">
                            {cartItems.map((item, idx) => (
                                <div className="cart-item-card" key={idx}>
                                    <div className="cart-item-image">
                                        <LandscapeIcon />
                                    </div>
                                    <div className="cart-item-details">
                                        <h3>{item.title}</h3>
                                        <div className="cart-item-meta">
                                            <span className="cart-item-instructor">👨‍🏫 {item.instructor}</span>
                                            <span className="cart-item-rating">
                                                <StarIcon fontSize="small" style={{ color: "#f59e0b" }} /> {item.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="cart-item-pricing-actions">
                                        <div className="cart-item-prices">
                                            <span className="cart-price">${item.price.toFixed(2)}</span>
                                            <span className="cart-old-price">${item.oldPrice.toFixed(2)}</span>
                                        </div>
                                        <button className="cart-remove-btn" onClick={() => handleRemove(item.id, idx)}>
                                            <DeleteOutlineIcon fontSize="small" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {cartItems.length === 0 && <p>Your cart is empty.</p>}
                        </div>
                    </div>

                    {/* Right: Cart Summary */}
                    <div className="checkout-right">
                        <div className="summary-card">
                            <h3 className="summary-title">Summary</h3>
                            
                            <div className="promo-code-container">
                                <label>Promo Code</label>
                                <div className="promo-input-row">
                                    <input type="text" placeholder="Enter here" />
                                    <button>Apply</button>
                                </div>
                            </div>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Discount</span>
                                <span style={{ color: "#16a34a" }}>-${discounts.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax</span>
                                <span>$0.00</span>
                            </div>

                            <div className="summary-total">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <button 
                                className="primary-action-btn" 
                                onClick={goToPayment}
                                disabled={cartItems.length === 0}
                            >
                                Proceed to Checkout
                            </button>

                            <ul className="checkout-terms-list">
                                <li>✓ By pledging your cart, you agree to our terms</li>
                                <li>✓ 30-day money back guarantee</li>
                                <li>✓ Secure encrypted payments</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ STEP 2: PAYMENT ═══ */}
            {currentStep === 2 && (
                <div className="checkout-layout">
                    {/* Left: Payment Form */}
                    <div className="checkout-left">
                        <button className="back-link-btn" onClick={backToCart}>{"< Back to cart"}</button>
                        
                        <h2 className="section-title">Contact Information</h2>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="e.g. anna@gmail.com" />
                            <div className="checkbox-row">
                                <input type="checkbox" id="updates-check" />
                                <label htmlFor="updates-check">Receive updates about your courses and new features.</label>
                            </div>
                        </div>

                        <h2 className="section-title" style={{ marginTop: 40 }}>Payment Information</h2>
                        <div className="payment-method-selector">
                            <div className="pm-option active">
                                <CreditCardIcon /> Pay with Card
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Card Number</label>
                            <input type="text" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Expiration Date</label>
                                <input type="text" placeholder="MM/YY" />
                            </div>
                            <div className="form-group">
                                <label>CVV</label>
                                <input type="text" placeholder="123" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Cardholder Name</label>
                            <input type="text" placeholder="Name on card" />
                        </div>

                        <h2 className="section-title" style={{ marginTop: 40 }}>Billing Address</h2>
                        <div className="form-group">
                            <label>Country or Region</label>
                            <select>
                                <option>United States</option>
                                <option>Egypt</option>
                                <option>United Kingdom</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input type="text" placeholder="Street Address" />
                        </div>
                        <div className="form-row-2">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" placeholder="City" />
                            </div>
                            <div className="form-group">
                                <label>State / Province</label>
                                <input type="text" placeholder="State/Province" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Zip code</label>
                            <input type="text" placeholder="Zip code" />
                        </div>
                    </div>

                    {/* Right: Payment Summary */}
                    <div className="checkout-right">
                        <div className="summary-card">
                            <h3 className="summary-title">Order Summary</h3>
                            
                            <div className="mini-cart-list">
                                {cartItems.map((item, idx) => (
                                    <div className="mini-cart-item" key={idx}>
                                        <div className="mci-image"><LandscapeIcon /></div>
                                        <div className="mci-details">
                                            <h4>{item.title}</h4>
                                            <div className="mci-prices">
                                                <span>${item.price.toFixed(2)}</span>
                                                <span className="mci-old-price">${item.oldPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="promo-code-container" style={{ marginTop: 24 }}>
                                <label>Promo Code</label>
                                <div className="promo-input-row">
                                    <input type="text" placeholder="Enter here" />
                                    <button>Apply</button>
                                </div>
                            </div>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Discount</span>
                                <span style={{ color: "#16a34a" }}>-${discounts.toFixed(2)}</span>
                            </div>
                            
                            <div className="summary-total">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <div className="checkout-terms-checkbox">
                                <input type="checkbox" id="terms-check" />
                                <label htmlFor="terms-check">By completing your purchase you agree to these <a href="#">Terms and conditions</a>.</label>
                            </div>

                            <button className="primary-action-btn" onClick={placeOrder}>
                                Place Order
                            </button>

                            <ul className="checkout-terms-list">
                                <li>✓ Secure encrypted checkout</li>
                                <li>✓ Access right after purchase</li>
                                <li>✓ 30-day money back guarantee</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ STEP 3: CONFIRMATION ═══ */}
            {currentStep === 3 && (
                <div className="confirmation-layout">
                    <div className="confirmation-card">
                        <div className="confirmation-icon">
                            <CheckCircleIcon />
                        </div>
                        <h2 className="confirmation-title">Payment Successful!</h2>
                        <p className="confirmation-subtitle">Thanks, your payment has been successfully processed.</p>

                        <div className="receipt-box">
                            <div className="receipt-row">
                                <span>Order Date</span>
                                <strong>Feb 10, 2026</strong>
                            </div>

                            <div className="receipt-items">
                                {cartItems.map((item, idx) => (
                                    <div className="receipt-item" key={idx}>
                                        <div className="ri-image"><LandscapeIcon /></div>
                                        <div className="ri-details">
                                            <h4>{item.title}</h4>
                                            <span>⭐ {item.rating} • {item.instructor}</span>
                                        </div>
                                        <div className="ri-price">${item.price.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="receipt-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Discount</span>
                                <span style={{ color: "#16a34a" }}>-${discounts.toFixed(2)}</span>
                            </div>
                            <div className="receipt-total">
                                <span>Total Paid</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="confirmation-note">
                            <CheckCircleIcon style={{ fontSize: 18 }} />
                            <p>You can access your course materials right away or review your receipt in your account dashboard.</p>
                        </div>

                        <button className="primary-action-btn" onClick={goToCourse}>Go to Course</button>
                        <p className="contact-support-link">Need help? <a href="#">Contact Support</a></p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="checkout-footer">
                <div className="footer-logo">LOGO</div>
                <div className="footer-links">
                    <a className="footer-link" href="#">FAQS</a>
                    <a className="footer-link" href="#">CONTACT US</a>
                    <a className="footer-link" href="#">ZUMRA FOUNDERS</a>
                </div>
                <div className="footer-social">
                    <a href="#" className="social-icon"><FacebookIcon /></a>
                    <a href="#" className="social-icon"><InstagramIcon /></a>
                    <a href="#" className="social-icon"><XIcon /></a>
                </div>
                <p className="footer-copyright">©Copyrights 2026</p>
            </footer>
        </div>
    );
}
