import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl, payForOrder, getOrderItems, removeFromOrder, confirmOrderSuccess } from "../services/Api";
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
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Payment, 3: Confirmation
    const [isProcessing, setIsProcessing] = useState(false);

    const [cartItems, setCartItems] = useState([]);

    // Handle Stripe redirect back
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        if (status === 'success') {
            // User returned from Stripe after successful payment
            confirmOrderSuccess()
                .then(() => {
                    console.log('Order confirmed successfully');
                })
                .catch((err) => {
                    console.error('Failed to confirm order:', err);
                });
            setCurrentStep(3);
            window.scrollTo(0, 0);
            // Clean the URL
            navigate('/checkout', { replace: true });
        } else if (status === 'cancel') {
            alert('تم إلغاء عملية الدفع.');
            navigate('/checkout', { replace: true });
        }
    }, [location.search]);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const data = await getOrderItems();
                console.log("=== CHECKOUT: getOrderItems response ===", JSON.stringify(data, null, 2));
                
                // Handle all possible C# serialization casing
                let fetchedCart = [];
                const cartData = data?.Data || data?.data;
                
                if (cartData?.Cart) fetchedCart = cartData.Cart;
                else if (cartData?.cart) fetchedCart = cartData.cart;
                else if (Array.isArray(cartData)) fetchedCart = cartData;
                else if (Array.isArray(data)) fetchedCart = data;
                
                console.log("=== CHECKOUT: parsed cart items ===", fetchedCart);
                setCartItems(fetchedCart);
            } catch (error) {
                console.error("Failed to load cart:", error);
                const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
                setCartItems(savedCart);
            }
        };
        fetchCart();
    }, []);

    const handleRemove = async (item, indexToRemove) => {
        try {
            await removeFromOrder(item.EnrollmentId || item.enrollmentId || item.id);
            const updatedCart = cartItems.filter((_, idx) => idx !== indexToRemove);
            setCartItems(updatedCart);
        } catch (error) {
            console.error("Failed to remove item:", error);
            alert("حدث خطأ أثناء إزالة الكورس.");
        }
    };

    // Derived values
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
    const subtotal = safeCartItems.reduce((acc, item) => {
        const price = item?.CourseCost || item?.courseCost || item?.price || 0;
        return acc + Number(price);
    }, 0);
    const total = subtotal;

    // Stepper config
    const steps = [
        { number: 1, label: "Cart", icon: <ShoppingCartIcon /> },
        { number: 2, label: "Payment", icon: <CreditCardIcon /> },
        { number: 3, label: "Confirmation", icon: <CheckCircleIcon /> },
    ];

    // Navigation Handlers
    const goToPayment = async () => {
        setIsProcessing(true);
        try {
            const res = await payForOrder();
            let redirectUrl = null;
            
            if (typeof res === 'string' && res.startsWith('http')) {
                redirectUrl = res;
            } else if (res?.CheckoutUrl) {
                redirectUrl = res.CheckoutUrl;
            } else if (res?.checkoutUrl) {
                redirectUrl = res.checkoutUrl;
            } else if (res?.url) {
                redirectUrl = res.url;
            } else if (res?.data?.url) {
                redirectUrl = res.data.url;
            }

            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                alert("لم يتم العثور على رابط Stripe. Response: " + JSON.stringify(res));
                console.error("Invalid Response:", res);
            }
        } catch (error) {
            console.error("Payment redirect failed:", error);
            alert("فشل الاتصال بالـ API: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const placeOrder = () => {
        setCurrentStep(3);
        window.scrollTo(0, 0);
        localStorage.removeItem('cart');
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
                            {safeCartItems.map((item, idx) => {
                                const title = item.CourseName || item.courseName || item.title || 'Course';
                                const subtitle = item.BatchTitle || item.batchTitle || item.instructor || '';
                                const price = item.CourseCost || item.courseCost || item.price || 0;
                                const imageUrl = item.CourseImage || item.courseImage || item.imageUrl || null;
                                return (
                                    <div className="cart-item-card" key={idx}>
                                        <div className="cart-item-image" style={{ padding: imageUrl ? 0 : '', overflow: 'hidden' }}>
                                            {imageUrl ? (
                                                <img src={getImageUrl(imageUrl)} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <LandscapeIcon />
                                            )}
                                        </div>
                                        <div className="cart-item-details">
                                            <h3>{title}</h3>
                                            <div className="cart-item-meta">
                                                <span className="cart-item-instructor">👨‍🏫 {subtitle}</span>
                                            </div>
                                        </div>
                                        <div className="cart-item-pricing-actions">
                                            <div className="cart-item-prices">
                                                <span className="cart-price">${Number(price).toFixed(2)}</span>
                                            </div>
                                            <button className="cart-remove-btn" onClick={() => handleRemove(item, idx)}>
                                                <DeleteOutlineIcon fontSize="small" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                                disabled={cartItems.length === 0 || isProcessing}
                            >
                                {isProcessing ? "Processing..." : "Proceed to Checkout"}
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
                                        <div className="mci-image" style={{ padding: item.imageUrl ? 0 : '', overflow: 'hidden' }}>
                                            {item.imageUrl ? (
                                                <img src={getImageUrl(item.imageUrl)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <LandscapeIcon />
                                            )}
                                        </div>
                                        <div className="mci-details">
                                            <h4>{item.title}</h4>
                                            <div className="mci-prices">
                                                <span>${item.price.toFixed(2)}</span>
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
                                        <div className="ri-image" style={{ padding: item.imageUrl ? 0 : '', overflow: 'hidden' }}>
                                            {item.imageUrl ? (
                                                <img src={getImageUrl(item.imageUrl)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <LandscapeIcon />
                                            )}
                                        </div>
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
            </footer>
        </div>
    );
}
