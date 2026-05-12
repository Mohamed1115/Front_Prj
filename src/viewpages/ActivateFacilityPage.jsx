import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import toast from "react-hot-toast";
import { payForFacility, getImageUrl } from "../services/Api";
import "./ActivateFacilityPage.css";

const FACILITY_ACTIVATION_PRICE = 250; // EGP

export default function ActivateFacilityPage() {
    const navigate = useNavigate();
    const { facilityId } = useParams();
    const location = useLocation();

    const isSuccess = location.pathname.includes("/facility-payment-success");
    const isCancel  = location.pathname.includes("/facility-payment-cancel");

    const facilityInfo = location.state?.facility || null;
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get("session_id");

    const steps = [
        { number: 1, label: "Facility",    icon: <HomeWorkIcon /> },
        { number: 2, label: "Payment",     icon: <CreditCardIcon /> },
        { number: 3, label: "Confirmation",icon: <TaskAltIcon /> },
    ];
    const currentStep = isSuccess ? 3 : isCancel ? 2 : 1;

    const handlePay = async () => {
        setIsLoading(true);
        try {
            const fid = facilityId || facilityInfo?.id || facilityInfo?.Id;
            if (!fid) throw new Error("Facility ID is missing.");
            const result = await payForFacility(fid);
            const url = result?.url || result?.checkoutUrl || result?.stripeUrl || result;
            if (url && typeof url === "string") {
                window.location.href = url;
            } else {
                toast.error("Could not get payment URL from server.");
            }
        } catch (error) {
            toast.error(error.message || "Payment initiation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const facName = facilityInfo?.name || facilityInfo?.Name || "Your Facility";
    const facDesc = facilityInfo?.description || facilityInfo?.Description || "";

    // ────── SUCCESS PAGE (Step 3) ──────
    if (isSuccess) {
        return (
            <div className="afp-page">
                <div className="afp-breadcrumb">
                    <span style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>Home</span>
                    {" > "}
                    <span style={{ cursor: "pointer" }} onClick={() => navigate("/profile")}>Control Panel</span>
                    {" > "}
                    <span>Activation Confirmed</span>
                </div>
                <h1 className="afp-page-title">Facility Activation</h1>
                <p className="afp-page-subtitle">Your payment was successful</p>

                <div className="afp-stepper-container">
                    <div className="afp-stepper">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.number}>
                                <div className="afp-stepper-step">
                                    <div className={`afp-stepper-circle ${currentStep >= step.number ? "active" : "inactive"}`}>
                                        {step.icon}
                                    </div>
                                    <span className={`afp-stepper-label ${currentStep >= step.number ? "active" : "inactive"}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`afp-stepper-line ${currentStep > step.number ? "active" : ""}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="afp-confirmation-layout">
                    <div className="afp-confirmation-card">
                        <div className="afp-confirmation-icon">
                            <CheckCircleIcon />
                        </div>
                        <h2 className="afp-confirmation-title">Payment Successful!</h2>
                        <p className="afp-confirmation-subtitle">
                            Your facility has been activated. You can now start publishing courses and managing your content.
                        </p>

                        <div className="afp-receipt-box">
                            <div className="afp-receipt-row">
                                <span>Facility</span>
                                <strong>{facName}</strong>
                            </div>
                            <div className="afp-receipt-row">
                                <span>Status</span>
                                <strong style={{ color: "#16a34a" }}>✅ Active</strong>
                            </div>
                            {sessionId && (
                                <div className="afp-receipt-row">
                                    <span>Session ID</span>
                                    <code style={{ fontSize: "0.78rem", color: "#6b7280" }}>{sessionId}</code>
                                </div>
                            )}
                            <div className="afp-receipt-total">
                                <span>Total Paid</span>
                                <span>EGP {FACILITY_ACTIVATION_PRICE}</span>
                            </div>
                        </div>

                        <div className="afp-confirmation-note">
                            <CheckCircleIcon style={{ fontSize: 18, flexShrink: 0 }} />
                            <p>You can now manage your facility, add courses, and start enrolling students from your dashboard.</p>
                        </div>

                        <button className="afp-primary-btn" onClick={() => navigate("/profile")}>
                            Go to My Facilities
                        </button>
                        <p className="afp-contact-support">
                            Need help? <a href="#">Contact Support</a>
                        </p>
                    </div>
                </div>

                <AfpFooter />
            </div>
        );
    }

    // ────── CANCEL PAGE ──────
    if (isCancel) {
        return (
            <div className="afp-page">
                <div className="afp-breadcrumb">
                    <span style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>Home</span>
                    {" > "}
                    <span style={{ cursor: "pointer" }} onClick={() => navigate("/profile")}>Control Panel</span>
                    {" > "}
                    <span>Activation Cancelled</span>
                </div>
                <h1 className="afp-page-title">Facility Activation</h1>
                <p className="afp-page-subtitle">Payment was cancelled</p>

                <div className="afp-stepper-container">
                    <div className="afp-stepper">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.number}>
                                <div className="afp-stepper-step">
                                    <div className={`afp-stepper-circle ${currentStep >= step.number ? "active" : "inactive"}`}>
                                        {step.icon}
                                    </div>
                                    <span className={`afp-stepper-label ${currentStep >= step.number ? "active" : "inactive"}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`afp-stepper-line ${currentStep > step.number ? "active" : ""}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="afp-confirmation-layout">
                    <div className="afp-confirmation-card">
                        <div className="afp-confirmation-icon afp-cancel-icon">
                            <CancelIcon />
                        </div>
                        <h2 className="afp-confirmation-title">Payment Cancelled</h2>
                        <p className="afp-confirmation-subtitle">
                            Your payment was cancelled. Your facility is still pending activation. You can try again at any time from your profile.
                        </p>
                        <button className="afp-primary-btn" onClick={() => navigate("/profile")}>
                            Back to My Facilities
                        </button>
                    </div>
                </div>

                <AfpFooter />
            </div>
        );
    }

    // ────── MAIN ACTIVATE PAGE (Step 1) ──────
    return (
        <div className="afp-page">
            {/* Breadcrumb */}
            <div className="afp-breadcrumb">
                <span style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>Home</span>
                {" > "}
                <span style={{ cursor: "pointer" }} onClick={() => navigate("/profile")}>Control Panel</span>
                {" > "}
                <span>Activate Facility</span>
            </div>

            <h1 className="afp-page-title">Activate Facility</h1>
            <p className="afp-page-subtitle">Complete payment to activate your facility and start publishing courses</p>

            {/* Stepper */}
            <div className="afp-stepper-container">
                <div className="afp-stepper">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.number}>
                            <div className="afp-stepper-step">
                                <div className={`afp-stepper-circle ${currentStep >= step.number ? "active" : "inactive"}`}>
                                    {step.icon}
                                </div>
                                <span className={`afp-stepper-label ${currentStep >= step.number ? "active" : "inactive"}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`afp-stepper-line ${currentStep > step.number ? "active" : ""}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Two-column layout */}
            <div className="afp-layout">
                {/* LEFT: Facility details */}
                <div className="afp-left">
                    <h2 className="afp-section-title">Facility Details</h2>

                    <div className="afp-facility-card">
                        <div className="afp-facility-img-box">
                            {(() => {
                                const img = facilityInfo?.image || facilityInfo?.Image || facilityInfo?.imageUrl || facilityInfo?.ImageUrl || facilityInfo?.imagePath || facilityInfo?.ImagePath;
                                return img
                                    ? <img src={getImageUrl(img)} alt={facName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                    : <HomeWorkIcon style={{ fontSize: 36, color: "#7c3aed" }} />;
                            })()}
                        </div>
                        <div className="afp-facility-info">
                            <h3>{facName}</h3>
                            {facDesc && <p>{facDesc}</p>}
                            <span className="afp-badge-pending">Pending Activation</span>
                        </div>
                    </div>

                    <h2 className="afp-section-title" style={{ marginTop: 40 }}>What's Included</h2>
                    <div className="afp-benefits-card">
                        <ul className="afp-benefits-list">
                            <li><CheckCircleIcon style={{ fontSize: 18, color: "#16a34a" }} /> Publish unlimited courses</li>
                            <li><CheckCircleIcon style={{ fontSize: 18, color: "#16a34a" }} /> Manage batches & student enrollments</li>
                            <li><CheckCircleIcon style={{ fontSize: 18, color: "#16a34a" }} /> Access to facility analytics dashboard</li>
                            <li><CheckCircleIcon style={{ fontSize: 18, color: "#16a34a" }} /> Create live sessions</li>
                            <li><CheckCircleIcon style={{ fontSize: 18, color: "#16a34a" }} /> Priority support from Zumra team</li>
                        </ul>
                    </div>
                </div>

                {/* RIGHT: Summary */}
                <div className="afp-right">
                    <div className="afp-summary-card">
                        <h3 className="afp-summary-title">Order Summary</h3>

                        <div className="afp-summary-item">
                            <div className="afp-summary-item-icon">
                                <HomeWorkIcon style={{ color: "#9ca3af" }} />
                            </div>
                            <div className="afp-summary-item-info">
                                <h4>Facility Activation</h4>
                                <p>One-time activation fee</p>
                            </div>
                            <span className="afp-summary-item-price">EGP {FACILITY_ACTIVATION_PRICE}</span>
                        </div>

                        <div className="afp-summary-row">
                            <span>Subtotal</span>
                            <span>EGP {FACILITY_ACTIVATION_PRICE}</span>
                        </div>
                        <div className="afp-summary-row">
                            <span>Tax</span>
                            <span>EGP 0</span>
                        </div>
                        <div className="afp-summary-total">
                            <span>Total</span>
                            <span>EGP {FACILITY_ACTIVATION_PRICE}</span>
                        </div>

                        <button
                            className="afp-primary-btn"
                            onClick={handlePay}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="afp-loading-dots">Processing<span>.</span><span>.</span><span>.</span></span>
                            ) : (
                                <><OpenInNewIcon fontSize="small" style={{ marginRight: 6 }} /> Proceed to Payment</>
                            )}
                        </button>

                        <ul className="afp-terms-list">
                            <li>🔒 Secure encrypted payment via Stripe</li>
                            <li>✓ Instant activation after payment</li>
                            <li>✓ Cancel anytime from your profile</li>
                        </ul>
                    </div>
                </div>
            </div>

            <AfpFooter />
        </div>
    );
}

function AfpFooter() {
    return (
        <footer className="afp-footer">
            <div className="afp-footer-logo">LOGO</div>
            <div className="afp-footer-links">
                <a className="afp-footer-link" href="#">FAQS</a>
                <a className="afp-footer-link" href="#">CONTACT US</a>
                <a className="afp-footer-link" href="#">ZUMRA FOUNDERS</a>
            </div>
            <div className="afp-footer-social">
                <a href="#" className="afp-social-icon"><FacebookIcon /></a>
                <a href="#" className="afp-social-icon"><InstagramIcon /></a>
                <a href="#" className="afp-social-icon"><XIcon /></a>
            </div>
            <p className="afp-footer-copyright">©Copyrights 2026</p>
        </footer>
    );
}
