// ======================================================
// API - MOCK MODE (للتطوير فقط - تنقل بين الصفحات بحرية)
// علشان ترجع للـ API الحقيقي، غيّر MOCK_MODE لـ false
// ======================================================
const MOCK_MODE = false;

const RAW_BASE_URL = import.meta.env.DEV
    ? ""  // في الـ dev، الـ Vite proxy بيوجه الطلبات تلقائياً لـ localhost:5000
    : (import.meta.env.VITE_API_BASE_URL ?? "");
const BASE_URL = RAW_BASE_URL.replace(/\/$/, "");

export function getImageUrl(path) {
    if (!path) return null;
    // Replace all backslashes with forward slashes (common issue with Windows/C# paths)
    let normalizedPath = path.replace(/\\/g, '/');
    if (normalizedPath.startsWith("http")) return normalizedPath;
    
    const cleanPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    return import.meta.env.DEV ? `http://localhost:5000${cleanPath}` : `${RAW_BASE_URL}${cleanPath}`;
}

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

    const trimmedEmail = String(email ?? "").trim();
    if (!trimmedEmail) throw new Error("Please enter your email address");

    // الـ Backend بيتوقع email كـ query parameter مش كـ body
    const url = `${BASE_URL}/Auth/Account/ResendconfirmEmail?email=${encodeURIComponent(trimmedEmail)}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const body = await readBody(response);
            throw new Error(formatErrorMessage(response.status, body));
        }
        return await readBody(response);
    } catch (err) {
        if (err.message === "Failed to fetch" || err.message?.includes("NetworkError"))
            throw new Error("Cannot connect to server.");
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

// ======================================================
// COURSE & FACILITY API CALLS
// ======================================================

export async function getAllCourses() {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const response = await fetch(`${BASE_URL}/Api/Course`, {
        headers: { "Content-Type": "application/json" }
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getCourseById(id) {
    if (MOCK_MODE) {
        await mockDelay();
        return null;
    }
    const response = await fetch(`${BASE_URL}/Api/Course/${id}`, {
        headers: { "Content-Type": "application/json" }
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function createCourse(facilityId, formData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Course/${facilityId}`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function updateCourse(facilityId, courseId, formData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Course/${facilityId}/${courseId}`, {
        method: "PUT",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function deleteCourse(facilityId, courseId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Course/${facilityId}/${courseId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

// BATCH API CALLS
export async function getCourseBatches(courseId) {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const response = await fetch(`${BASE_URL}/Api/Batch/Course/${courseId}`, {
        headers: { "Content-Type": "application/json" }
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function createBatch(facilityId, batchData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Batch/${facilityId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(batchData),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

// SECTION API CALLS
export async function getBatchSections(batchId) {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const response = await fetch(`${BASE_URL}/Api/Section/Batch/${batchId}`);
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function createSection(facilityId, batchId, sectionData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, Data: [] };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Section/${facilityId}/${batchId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(sectionData),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function deleteSection(facilityId, batchId, sectionId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, Data: [] };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Section/${facilityId}/${batchId}/${sectionId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

// LESSON API CALLS
export async function getLessonsByBatchId(batchId) {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Lesson/GetByBatchId?id=${batchId}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    // Support nested standard responses
    const list = data?.data ?? data;
    if (Array.isArray(list)) return list;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
}

export async function createLesson(facilityId, lessonData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    
    // Convert to x-www-form-urlencoded
    const formBody = [];
    for (const property in lessonData) {
        if(lessonData[property] !== undefined && lessonData[property] !== null) {
            formBody.push(encodeURIComponent(property) + "=" + encodeURIComponent(lessonData[property]));
        }
    }
    const body = formBody.join("&");

    const response = await fetch(`${BASE_URL}/Api/Lesson/Add/${facilityId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function deleteLesson(facilityId, lessonId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Lesson/Delete/${facilityId}/${lessonId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function createTask(facilityId, taskData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    
    const formBody = [];
    for (const property in taskData) {
        if(taskData[property] !== undefined && taskData[property] !== null) {
            formBody.push(encodeURIComponent(property) + "=" + encodeURIComponent(taskData[property]));
        }
    }
    const body = formBody.join("&");

    const response = await fetch(`${BASE_URL}/Api/Task/Add/${facilityId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function deleteTask(facilityId, taskId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Task/Delete/${facilityId}/${taskId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function submitTask(taskId, submissionUrl) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, message: "Mock success" };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Task/Submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ TaskId: taskId, SubmissionUrl: submissionUrl }),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function submitTaskOnBehalf(facilityId, taskId, userId, submissionUrl) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, message: "Mock success" };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Task/SubmitOnBehalf/${facilityId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ TaskId: taskId, UserId: userId, SubmissionUrl: submissionUrl }),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getTaskSubmission(taskId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, data: null };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Task/GetSubmission/${taskId}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function updateTask(facilityId, taskId, taskData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    
    const formBody = [];
    for (const property in taskData) {
        if(taskData[property] !== undefined && taskData[property] !== null) {
            formBody.push(encodeURIComponent(property) + "=" + encodeURIComponent(taskData[property]));
        }
    }
    const body = formBody.join("&");

    const response = await fetch(`${BASE_URL}/Api/Task/Update/${facilityId}/${taskId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getTaskSubmissions(facilityId, taskId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, data: [] };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Task/GetTaskSubmissions/${facilityId}/${taskId}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getSubmissionsByUser(userId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, data: [] };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Task/GetSubmissionsByUser/${userId}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}



export async function getAllFacilities() {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const response = await fetch(`${BASE_URL}/Api/Facility/GetAll`, {
        headers: { "Content-Type": "application/json" }
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getFacilitiesByUserId(userId) {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Facility/GetByUserID`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));

    // Response shape: { success: true, data: [ { facilityId, role, joinedAt, facility: {...} } ] }
    const list = data?.data ?? data;
    if (Array.isArray(list)) {
        return list.map(item => ({ ...(item.facility ?? item), role: item.role }));
    }
    if (Array.isArray(data.$values)) return data.$values;
    return [];
}

export async function getFacilityAccess(facilityId) {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Facility/whoAccess?id=${facilityId}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    const list = data?.data ?? data;
    if (Array.isArray(list)) return list;
    if (Array.isArray(data.$values)) return data.$values;
    return [];
}

export async function giveFacilityAccess(userEmail, facilityId, level) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Facility/GiveAccess`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user: userEmail, facilityId, level }),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

// ─── LIVE MEETING API ──────────────────────────────────────────────
export async function createLiveMeeting(facilityId, lessonId, meetingData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, url: "https://meet.jit.si/DummyRoom123" };
    }
    const token = localStorage.getItem("token");
    
    const formBody = [];
    for (const property in meetingData) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(meetingData[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    const body = formBody.join("&");

    const response = await fetch(`${BASE_URL}/Api/Lesson/CreateLive/${facilityId}/${lessonId}/Live`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
    });
    
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

// ─── CREATE VIDEO LESSON API ───────────────────────────────────────
export async function createVideoLesson(facilityId, lessonId, videoData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    
    const formBody = [];
    for (const property in videoData) {
        if (videoData[property] !== undefined && videoData[property] !== null && videoData[property] !== '') {
            formBody.push(encodeURIComponent(property) + "=" + encodeURIComponent(videoData[property]));
        }
    }
    const body = formBody.join("&");

    const response = await fetch(`${BASE_URL}/Api/Lesson/CreateVideo/${facilityId}/${lessonId}/Video`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
    });
    
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getFacilityById(id) {
    if (MOCK_MODE) {
        await mockDelay();
        return null;
    }
    const response = await fetch(`${BASE_URL}/Api/Facility/GetById/${id}`, {
        headers: { "Content-Type": "application/json" }
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function createFacility(formData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "Facility created" };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Facility/Create`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData // Using FormData for image uploads
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function updateFacility(id, formData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "Facility updated" };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Facility/Update/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}` // Assuming Auth needed
        },
        body: formData
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function deleteFacility(id) {
    if (MOCK_MODE) {
        await mockDelay();
        return { message: "Facility deleted" };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Facility/Delete/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getAllCategories() {
    if (MOCK_MODE) {
        await mockDelay();
        return [
            { id: 1, name: "Technology", description: "Tech courses" },
            { id: 2, name: "Arts", description: "Art courses" }
        ];
    }
    const response = await fetch(`${BASE_URL}/Api/Category`, {
        headers: { "Content-Type": "application/json" }
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    
    // Defensive extraction
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.$values)) return data.$values;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
}

export async function payForFacility(facilityId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { url: 'https://stripe.com/mock-checkout' };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Facility/Pay?fcId=${facilityId}`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function enrollCourse(batchId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Order/Enroll/Enroll/${batchId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (response.status === 409) {
        // Duplicate enrollment: user already owns or has the course in cart
        const msg = data?.message || "You already own or have this course in your cart.";
        throw new Error(msg);
    }
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function checkCourseEnrollmentStatus(batchId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, status: "none" };
    }
    const token = localStorage.getItem("token");
    if (!token) return { success: true, status: "none" };
    const response = await fetch(`${BASE_URL}/Api/Order/CheckEnrollmentStatus/${batchId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await readBody(response);
    if (!response.ok) return { success: true, status: "none" }; // fallback silently
    return data; // { success, status: "owned" | "in_cart" | "none" }
}

export async function getOrderItems() {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Order/GetAll`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    // Check if the backend returns the array directly or inside a property
    return data;
}

export async function getMyEnrollments() {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Course/my-enrollments`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getBatchMembers(batchId) {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Order/GetBatchMembers/${batchId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    const list = data?.data ?? data?.Data ?? data;
    if (Array.isArray(list)) return list;
    if (Array.isArray(data.$values)) return data.$values;
    return [];
}

export async function getWatchCourseData(courseId) {
    if (MOCK_MODE) {
        await mockDelay();
        return null;
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Course/watch/${courseId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function removeFromOrder(enrollId) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Order/Delete/Enroll/${enrollId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function payForOrder() {
    if (MOCK_MODE) {
        await mockDelay();
        return 'https://checkout.stripe.com/pay/cs_test_mock';
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Order/Pay`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function confirmOrderSuccess() {
    if (MOCK_MODE) {
        await mockDelay();
        return { Message: "Payment success" };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Order/Success`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function checkFacilityStatus(id) {
    if (MOCK_MODE) {
        await mockDelay();
        return { status: 'Pending' };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/Facility/Check/${id}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

// ─── GROUP API ──────────────────────────────────────────────────
export async function getGroups(facilityId) {
    if (MOCK_MODE) {
        await mockDelay();
        return [];
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/Group/${facilityId}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    const list = data?.data ?? data;
    if (Array.isArray(list)) return list;
    if (Array.isArray(data.$values)) return data.$values;
    return [];
}

export async function createGroup(facilityId, groupData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/Group/${facilityId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(groupData),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function updateGroup(facilityId, groupData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/Group/${facilityId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(groupData),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function getGroupById(facilityId, id) {
    if (MOCK_MODE) {
        await mockDelay();
        return null;
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/Group/${facilityId}/${id}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function deleteGroup(facilityId, id) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/Group/${facilityId}/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

// ─── USER PROFILE API ──────────────────────────────────────────────
export async function getUserProfile() {
    if (MOCK_MODE) {
        await mockDelay();
        return {
            email: "Amrmohammedd99@gmail.com",
            name: "Amr Ahmed",
            userName: "AmrAhmed",
            phone: "01099684122",
            imageUrl: null
        };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/User`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data?.Data ?? data?.data ?? data;
}

export async function updateUserProfile(profileData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/User`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profileData),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function changeUserEmail(newEmail) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/User/Email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ newEmail }),
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function uploadUserAvatar(formData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, imageUrl: null };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/User/Image`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function updateUserAvatar(formData) {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true, imageUrl: null };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/User/Image`, {
        method: "PUT",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function deleteUserAvatar() {
    if (MOCK_MODE) {
        await mockDelay();
        return { success: true };
    }
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/Api/User/Image`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}

export async function search(q) {
    if (MOCK_MODE) {
        await mockDelay();
        return {
            courses: [
                { id: 1, name: "Premium Drawing Course", description: "Learn painting and drawing", cost: 49, type: "recorded", facilityName: "Art Facility", groupName: "A1" }
            ],
            facilities: [
                { id: 1, name: "Art Academy", description: "Best art facility", type: "Academy", status: "Active", categoryName: "Arts" }
            ],
            groups: [
                { id: 1, name: "Advanced Drawing Group", description: "Group for advanced painters", facilityName: "Art Academy" }
            ]
        };
    }
    const response = await fetch(`${BASE_URL}/api/Search?q=${encodeURIComponent(q)}`, {
        headers: { "Content-Type": "application/json" }
    });
    const data = await readBody(response);
    if (!response.ok) throw new Error(formatErrorMessage(response.status, data));
    return data;
}