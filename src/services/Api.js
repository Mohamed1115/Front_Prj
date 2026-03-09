// ======================================================
// API - MOCK MODE (للتطوير فقط - تنقل بين الصفحات بحرية)
// علشان ترجع للـ API الحقيقي، غيّر MOCK_MODE لـ false
// ======================================================
const MOCK_MODE = true;

const RAW_BASE_URL = import.meta.env.DEV
    ? "http://localhost:5000"
    : (import.meta.env.VITE_API_BASE_URL ?? "");
const BASE_URL = RAW_BASE_URL.replace(/\/$/, "");

function mockDelay(ms = 500) {
    return new Promise((res) => setTimeout(res, ms));
}

async function readBody(response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        try { return await response.json(); } catch { return null; }
    }
    try { return await response.text(); } catch { return null; }
}

function formatErrorMessage(status, body) {
    const serverErrorLabel = status === 500 ? "خطأ من السيرفر (500) — " : "";
    if (!body) return `${serverErrorLabel}Request failed (${status}).`;
    if (typeof body === "object") {
        const title = body.title || body.message;
        const detail = body.detail;
        const errors = body.errors;
        let msg = title || "";
        if (detail) msg = msg ? `${msg}\n${detail}` : String(detail);
        if (errors && typeof errors === "object") {
            const flat = Object.entries(errors)
                .flatMap(([key, msgs]) => (Array.isArray(msgs) ? msgs.map((m) => `${key}: ${m}`) : [`${key}: ${String(msgs)}`]))
                .join("\n");
            msg = msg ? `${msg}\n${flat}` : flat;
        }
        return serverErrorLabel + (msg || `Request failed (${status})`);
    }
    if (typeof body === "string" && body.trim()) return serverErrorLabel + body;
    return serverErrorLabel + `Request failed (${status})`;
}


export async function login(userData) {
    if (MOCK_MODE) {
        await mockDelay();
        localStorage.setItem("token", "mock-token-12345");
        return { token: "mock-token-12345", user: { name: "Test User", email: userData.userName } };
    }

    if (!userData || !userData.userName || !userData.password)
        throw new Error("البيانات المطلوبة غير مكتملة");

    const url = `${BASE_URL}/Auth/Account/Login`;
    const requestBody = {
        userName: String(userData.userName).trim(),
        password: String(userData.password).trim(),
        rememberMe: Boolean(userData.rememberMe)
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const body = await readBody(response);
            throw new Error(formatErrorMessage(response.status, body));
        }
        const data = await readBody(response);
        if (!data) throw new Error("السيرفر لم يرجع أي بيانات");
        return data;
    } catch (err) {
        if (err.message === "Failed to fetch" || err.message?.includes("NetworkError"))
            throw new Error("تعذر الاتصال بالسيرفر.");
        throw err;
    }
}

export async function forgotPassword(email) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "OTP sent successfully" };
    }

    if (!email || !email.trim()) throw new Error("الرجاء إدخال بريد إلكتروني");

    const url = `${BASE_URL}/Auth/Account/ForgotPassword`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: String(email).trim() }),
        });
        if (!response.ok) {
            const body = await readBody(response);
            throw new Error(formatErrorMessage(response.status, body));
        }
        return await readBody(response);
    } catch (err) {
        if (err.message === "Failed to fetch" || err.message?.includes("NetworkError"))
            throw new Error("تعذر الاتصال بالسيرفر.");
        throw err;
    }
}

export async function register(userData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "Registered successfully" };
    }

    if (!userData || !userData.name || !userData.email || !userData.password || !userData.confirmPassword)
        throw new Error("البيانات المطلوبة غير مكتملة");
    if (userData.password !== userData.confirmPassword)
        throw new Error("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
    if (!userData.acceptTerms)
        throw new Error("يجب الموافقة على الشروط والأحكام");

    const url = `${BASE_URL}/Auth/Account/Register`;
    const requestBody = {
        name: String(userData.name).trim(),
        email: String(userData.email).trim(),
        phoneNumber: String(userData.phoneNumber || "").trim(),
        password: String(userData.password).trim(),
        confirmPassword: String(userData.confirmPassword).trim(),
        acceptTerms: Boolean(userData.acceptTerms)
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const body = await readBody(response);
            throw new Error(formatErrorMessage(response.status, body));
        }
        return await readBody(response);
    } catch (err) {
        if (err.message === "Failed to fetch" || err.message?.includes("NetworkError"))
            throw new Error("تعذر الاتصال بالسيرفر.");
        throw err;
    }
}

export async function confirmAccount(params = {}) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "Account confirmed" };
    }

    // ✅ الإصلاح: بناء الـ URL مباشرة من BASE_URL بدون window.location.origin
    // المشكلة الأصلية: new URL(fullUrl, window.location.origin) كانت بتتجاهل الـ BASE_URL
    // وبتوجه الطلب للـ frontend بدل الـ backend
    const urlObj = new URL(`${BASE_URL}/Auth/Account/Confirm`);
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        const v = String(value).trim();
        if (!v) return;
        urlObj.searchParams.set(key, v);
    });

    try {
        const response = await fetch(urlObj.toString(), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const body = await readBody(response);
            throw new Error(formatErrorMessage(response.status, body));
        }
        return await readBody(response);
    } catch (err) {
        if (err.message === "Failed to fetch" || err.message?.includes("NetworkError"))
            throw new Error("تعذر الاتصال بالسيرفر.");
        throw err;
    }
}

export async function verifyOTP(payload = {}) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "OTP verified" };
    }

    const url = `${BASE_URL}/Auth/Account/VerifyOTP`;
    const email = String(payload.email ?? "").trim();
    const otp = String(payload.otp ?? "").trim();
    if (!email) throw new Error("الرجاء إدخال البريد الإلكتروني");
    if (!otp) throw new Error("الرجاء إدخال كود OTP");

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });
        if (!response.ok) {
            const body = await readBody(response);
            throw new Error(formatErrorMessage(response.status, body));
        }
        return await readBody(response);
    } catch (err) {
        if (err.message === "Failed to fetch" || err.message?.includes("NetworkError"))
            throw new Error("تعذر الاتصال بالسيرفر.");
        throw err;
    }
}

export async function resetPassword(payload = {}) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "Password reset successfully" };
    }

    const url = `${BASE_URL}/Auth/Account/ResetPassword`;
    const email = String(payload.email ?? "").trim();
    const password = String(payload.password ?? "").trim();
    const confirmPassword = String(payload.confirmPassword ?? "").trim();

    if (!email) throw new Error("الرجاء إدخال البريد الإلكتروني");
    if (!password || !confirmPassword) throw new Error("الرجاء إدخال كلمة المرور وتأكيدها");
    if (password.length < 6) throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    if (password !== confirmPassword) throw new Error("كلمة المرور وتأكيد كلمة المرور غير متطابقين");

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, confirmPassword }),
        });
        if (!response.ok) {
            const body = await readBody(response);
            throw new Error(formatErrorMessage(response.status, body));
        }
        return await readBody(response);
    } catch (err) {
        if (err.message === "Failed to fetch" || err.message?.includes("NetworkError"))
            throw new Error("تعذر الاتصال بالسيرفر.");
        throw err;
    }
}

export async function resendConfirmEmail(email) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "Email resent" };
    }

    const url = `${BASE_URL}/Auth/Account/ResendconfirmEmail`;
    const trimmedEmail = String(email ?? "").trim();
    if (!trimmedEmail) throw new Error("الرجاء إدخال البريد الإلكتروني");

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: trimmedEmail }),
        });
        if (!response.ok) {
            const body = await readBody(response);
            throw new Error(formatErrorMessage(response.status, body));
        }
        return await readBody(response);
    } catch (err) {
        if (err.message === "Failed to fetch" || err.message?.includes("NetworkError"))
            throw new Error("تعذر الاتصال بالسيرفر.");
        throw err;
    }
}

export async function getWithAuth(endpoint) {
    if (MOCK_MODE) {
        await mockDelay();
        return { data: [] };
    }

    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}