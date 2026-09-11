// Dynamic API Base URL Config (local dev vs production)
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://ai-healthcare-agent-eje2.onrender.com";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

// ==========================================
// DOM ELEMENTS SELECTORS
// ==========================================
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const newChatBtn = document.getElementById("new-chat-btn");
const recentList = document.getElementById("recent-list");
const chatFeed = document.getElementById("chat-feed");
const chatInput = document.getElementById("chat-input");
const fileInput = document.getElementById("file-input");
const fileBadge = document.getElementById("file-badge");
const fileBadgeName = document.getElementById("file-badge-name");
const removeFileBtn = document.getElementById("remove-file-btn");
const voiceInputBtn = document.getElementById("voice-input-btn");
const predictDiseaseBtn = document.getElementById("predict-disease-btn");
const downloadReportBtn = document.getElementById("download-report-btn");
const sendMsgBtn = document.getElementById("send-msg-btn");

// Modal Elements
const appModal = document.getElementById("app-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalCloseBtn = document.getElementById("modal-close-btn");
const helpLink = document.getElementById("help-link");
const activityLink = document.getElementById("activity-link");
const settingsLink = document.getElementById("settings-link");
const userProfileBtn = document.getElementById("user-profile-btn");

// ==========================================
// APPLICATION STATE
// ==========================================
let chats = [];
let loading = false;
let isListening = false;
let sidebarOpen = window.innerWidth >= 768;
let hasReportReady = false;
let latestAnalysisText = "";
let cachedSessionToken = null;

// Auth helper: fetches ephemeral session token or uses configured API key
async function getAuthHeaders(forceRefresh = false) {
  const headers = {};
  const staticKey = window.APP_CONFIG?.API_KEY || (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_KEY) || "";
  if (staticKey) {
    headers["X-API-Key"] = staticKey;
    return headers;
  }

  if (!cachedSessionToken || forceRefresh) {
    try {
      const authRes = await fetch(`${API_BASE_URL}/auth/session`, { method: "POST" });
      if (authRes.ok) {
        const authData = await authRes.json();
        cachedSessionToken = authData.access_token;
      }
    } catch (e) {
      console.warn("Could not acquire session token:", e);
    }
  }

  if (cachedSessionToken) {
    headers["Authorization"] = `Bearer ${cachedSessionToken}`;
  }
  return headers;
}

// Resilient fetch wrapper with automatic 401 token refresh and 429 detection
async function fetchWithAuth(url, options = {}) {
  let authHeaders = await getAuthHeaders();
  let mergedOptions = {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders,
    },
  };

  let response = await fetch(url, mergedOptions);

  // Auto-recover on token expiration: retry once with fresh session token
  if (response.status === 401) {
    console.info("Session token expired or invalid; renewing token...");
    authHeaders = await getAuthHeaders(true);
    mergedOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders,
      },
    };
    response = await fetch(url, mergedOptions);
  }

  // Handle rate limiting gracefully
  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after") || "60";
    throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
  }

  return response;
}

// Load initial state from LocalStorage
try {
  const savedChats = localStorage.getItem("healthcare_chats");
  if (savedChats) {
    chats = JSON.parse(savedChats);
  }
  
  const savedSidebar = localStorage.getItem("sidebar_open");
  if (savedSidebar !== null) {
    sidebarOpen = JSON.parse(savedSidebar);
  }
} catch (e) {
  console.error("Failed to load local storage state:", e);
}

// Initialize sidebar layout state
function updateSidebarUI() {
  if (sidebarOpen) {
    sidebar.classList.remove("collapsed");
    if (window.innerWidth < 768) {
      sidebarBackdrop.classList.remove("hidden");
    } else {
      sidebarBackdrop.classList.add("hidden");
    }
  } else {
    sidebar.classList.add("collapsed");
    sidebarBackdrop.classList.add("hidden");
  }
}

// ==========================================
// CUSTOM SVG ICONS (Inline helper strings)
// ==========================================
const sparkIconSvg = `
  <svg class="ai-spark-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 12 8 8 12C12 16 12 22 12 22C12 22 12 16 16 12C12 8 12 2 12 2Z" fill="url(#spark-grad-ai)" />
    <defs>
      <linearGradient id="spark-grad-ai" x1="8" y1="2" x2="16" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#4285f4" />
        <stop offset="40%" stop-color="#9b72cb" />
        <stop offset="100%" stop-color="#d96570" />
      </linearGradient>
    </defs>
  </svg>
`;

// ==========================================
// RENDER FORMATTED TEXT (Custom MD Parser)
// ==========================================
function formatMarkdown(text) {
  if (!text) return "";
  const paragraphs = text.split("\n");
  let htmlResult = "";

  paragraphs.forEach(para => {
    const trimmed = para.trim();
    if (!trimmed) {
      htmlResult += '<div class="ai-paragraph-space"></div>';
      return;
    }

    // Match numbered heading e.g. "1. Important Abnormal Findings" or standard MD headings
    const isHeading = /^\d+\.\s+/.test(trimmed) || trimmed.startsWith("###") || trimmed.startsWith("##");
    const isBullet = trimmed.startsWith("-") || trimmed.startsWith("*");

    let cleanText = trimmed;
    if (trimmed.startsWith("###")) {
      cleanText = trimmed.replace(/^###\s*/, "");
    } else if (trimmed.startsWith("##")) {
      cleanText = trimmed.replace(/^##\s*/, "");
    } else if (isBullet) {
      cleanText = trimmed.replace(/^[-*]\s*/, "");
    }

    // Bold replacement (**bold text**)
    const parts = cleanText.split(/(\*\*.*?\*\*)/g);
    const formattedContent = parts.map(part => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong class="ai-bold-text">${part.slice(2, -2)}</strong>`;
      }
      return part;
    }).join("");

    if (isHeading) {
      htmlResult += `<h3 class="ai-heading">${formattedContent}</h3>`;
    } else if (isBullet) {
      htmlResult += `
        <div class="ai-bullet-row">
          <span class="ai-bullet-dot">●</span>
          <span class="ai-bullet-text">${formattedContent}</span>
        </div>`;
    } else {
      htmlResult += `<p class="ai-paragraph">${formattedContent}</p>`;
    }
  });

  return htmlResult;
}

// ==========================================
// RENDER INTERFACE METHODS
// ==========================================

function renderRecent() {
  recentList.innerHTML = "";
  if (chats.length > 0) {
    const firstUserMsg = chats.find(c => c.type === 'user')?.text || "Active Conversation";
    const truncated = firstUserMsg.substring(0, 24) + (firstUserMsg.length > 24 ? "..." : "");

    const recentItem = document.createElement("div");
    recentItem.className = "recent-item";
    recentItem.innerHTML = `
      <div class="recent-item-left">
        <svg class="chat-bubble-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="recent-item-text">${truncated}</span>
      </div>
      <button class="delete-chat-btn" title="Clear active conversation">
        <svg class="delete-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    `;
    
    recentItem.querySelector(".delete-chat-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      clearChats();
    });
    
    recentList.appendChild(recentItem);
  } else {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "recent-empty";
    emptyDiv.textContent = "No recent chats";
    recentList.appendChild(emptyDiv);
  }
}

function renderChats() {
  chatFeed.innerHTML = "";
  
  if (chats.length === 0) {
    // Show Greeting landing screen
    const landing = document.createElement("div");
    landing.className = "landing-container";
    landing.innerHTML = `
      <h2 class="greeting-title animate-fade-in-up">Hello, Friend.</h2>
      <h3 class="greeting-subtitle animate-fade-in-up">How can I help you today?</h3>
      
      <div class="cards-grid">
        <div class="card card-pdf animate-fade-in-up" style="animation-delay: 0.1s;">
          <p class="card-text">Analyze blood or pathology report PDF to detect abnormal values.</p>
          <div class="card-footer">
            <span class="card-link">Upload PDF</span>
            <div class="card-icon-wrapper">
              <svg class="card-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card card-symptoms animate-fade-in-up" style="animation-delay: 0.2s;">
          <p class="card-text">Check symptoms like fever, cough, or fatigue for disease analysis.</p>
          <div class="card-footer">
            <span class="card-link">Predict Disease</span>
            <div class="card-icon-wrapper">
              <svg class="card-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card card-lifestyle animate-fade-in-up" style="animation-delay: 0.3s;">
          <p class="card-text">Ask for personalized diet or exercise recommendations.</p>
          <div class="card-footer">
            <span class="card-link">Lifestyle Tips</span>
            <div class="card-icon-wrapper">
              <svg class="card-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card card-checklist animate-fade-in-up" style="animation-delay: 0.4s;">
          <p class="card-text">Prep questions for your next doctor checkup.</p>
          <div class="card-footer">
            <span class="card-link">Get Checklist</span>
            <div class="card-icon-wrapper">
              <svg class="card-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add Click listeners to quick action cards
    landing.querySelector(".card-pdf").addEventListener("click", () => {
      fileInput.click();
    });
    landing.querySelector(".card-symptoms").addEventListener("click", () => {
      chatInput.value = "I am having dry cough, fever, and chest tightness.";
      updateButtonStates();
      chatInput.focus();
    });
    landing.querySelector(".card-lifestyle").addEventListener("click", () => {
      chatInput.value = "What is a recommended heart-healthy diet plan for hypertension?";
      updateButtonStates();
      chatInput.focus();
    });
    landing.querySelector(".card-checklist").addEventListener("click", () => {
      chatInput.value = "What questions should I ask my doctor about high blood pressure during my checkup?";
      updateButtonStates();
      chatInput.focus();
    });

    chatFeed.appendChild(landing);
  } else {
    // Show active message stream
    const threadContainer = document.createElement("div");
    threadContainer.className = "chat-thread-container";
    
    chats.forEach(chat => {
      const messageRow = document.createElement("div");
      if (chat.type === "user") {
        messageRow.className = "chat-message-row user-row animate-fade-in-up";
        messageRow.innerHTML = `
          <div class="user-bubble-wrapper">
            <div class="user-bubble">${chat.text}</div>
            <div class="user-avatar-small">HB</div>
          </div>
        `;
      } else {
        messageRow.className = "chat-message-row ai-row animate-fade-in-up";
        messageRow.innerHTML = `
          <div class="ai-bubble-wrapper">
            <div class="ai-avatar-small">
              ${sparkIconSvg}
            </div>
            <div class="ai-bubble-content">
              <div class="ai-bubble-label">Siri Healthcare Agent</div>
              <div class="ai-formatted-text">${formatMarkdown(chat.text)}</div>
            </div>
          </div>
        `;
      }
      threadContainer.appendChild(messageRow);
    });

    // Add loader row if loading is true
    if (loading) {
      const loaderRow = document.createElement("div");
      loaderRow.className = "chat-message-row ai-row";
      loaderRow.innerHTML = `
        <div class="loading-row">
          <div class="ai-avatar-small">
            <svg class="ai-spark-svg animate-spin-slow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 12 8 8 12C12 16 12 22 12 22C12 22 12 16 16 12C12 8 12 2 12 2Z" fill="url(#spark-grad-loading)" />
              <defs>
                <linearGradient id="spark-grad-loading" x1="8" y1="2" x2="16" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#4285f4" />
                  <stop offset="40%" stop-color="#9b72cb" />
                  <stop offset="100%" stop-color="#d96570" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="loading-content-placeholder">
            <div class="loading-label">Thinking</div>
            <div class="pulse-bar p-75"></div>
            <div class="pulse-bar p-50"></div>
          </div>
        </div>
      `;
      threadContainer.appendChild(loaderRow);
    }

    chatFeed.appendChild(threadContainer);
    // Scroll to the bottom of the feed
    setTimeout(() => {
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }, 50);
  }

  // Toggle download report button if history holds diagnostic content
  hasReportReady = chats.some(c => c.type === 'ai' && (c.text.includes("Findings") || c.text.includes("Recommendations") || c.text.includes("Analysis") || c.text.includes("Report")));
  if (hasReportReady) {
    downloadReportBtn.classList.remove("hidden");
  } else {
    downloadReportBtn.classList.add("hidden");
  }

  renderRecent();
}

function updateButtonStates() {
  const hasText = chatInput.value.trim().length > 0;
  
  if (hasText && !loading) {
    sendMsgBtn.removeAttribute("disabled");
    sendMsgBtn.classList.remove("disabled");
    sendMsgBtn.classList.add("active");
    
    predictDiseaseBtn.removeAttribute("disabled");
    predictDiseaseBtn.classList.remove("disabled");
  } else {
    sendMsgBtn.setAttribute("disabled", "true");
    sendMsgBtn.classList.add("disabled");
    sendMsgBtn.classList.remove("active");
    
    predictDiseaseBtn.setAttribute("disabled", "true");
    predictDiseaseBtn.classList.add("disabled");
  }
}

// ==========================================
// CORE LOGIC & ACTIONS
// ==========================================

async function sendMessage() {
  const textVal = chatInput.value.trim();
  if (!textVal || loading) return;

  const userMessage = { type: "user", text: textVal };
  chats.push(userMessage);
  
  chatInput.value = "";
  updateButtonStates();
  loading = true;
  saveChatsToLocal();
  renderChats();

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage.text }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error (${response.status})`);
    }
    
    const data = await response.json();
    chats.push({
      type: "ai",
      text: data.reply || "No response received."
    });
  } catch (error) {
    console.error(error);
    chats.push({
      type: "ai",
      text: `❌ ${error.message || "Backend connection failed. Please check if your server is running."}`
    });
  } finally {
    loading = false;
    saveChatsToLocal();
    renderChats();
  }
}

async function predictDisease() {
  const textVal = chatInput.value.trim();
  if (!textVal || loading) return;

  const symptomsText = textVal;
  chats.push({
    type: "user",
    text: `🩺 Check symptoms: ${symptomsText}`
  });

  chatInput.value = "";
  updateButtonStates();
  loading = true;
  saveChatsToLocal();
  renderChats();

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/predict-disease`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms: symptomsText }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error (${response.status})`);
    }
    
    const data = await response.json();
    chats.push({
      type: "ai",
      text: data.prediction || "No prediction result returned."
    });
  } catch (error) {
    console.error(error);
    chats.push({
      type: "ai",
      text: `❌ ${error.message || "Prediction failed. Please verify the backend is running."}`
    });
  } finally {
    loading = false;
    saveChatsToLocal();
    renderChats();
  }
}

async function uploadPDF(file) {
  if (!file || loading) return;

  // Client-side pre-flight size check
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    chats.push({
      type: "ai",
      text: "❌ Upload rejected: File exceeds the maximum allowed size of 10 MB. Please choose a smaller report."
    });
    renderChats();
    return;
  }

  // Client-side extension check
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    chats.push({
      type: "ai",
      text: "❌ Upload rejected: Please select a valid document ending in .pdf"
    });
    renderChats();
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  chats.push({
    type: "user",
    text: `📄 Uploaded pathology report: ${file.name}`
  });
  
  loading = true;
  saveChatsToLocal();
  renderChats();

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/analyze-report/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed (${response.status})`);
    }

    const data = await response.json();
    latestAnalysisText = data.medical_analysis || "";
    chats.push({
      type: "ai",
      text: data.medical_analysis || "No analysis received."
    });
    hasReportReady = true;
  } catch (error) {
    console.error(error);
    chats.push({
      type: "ai",
      text: `❌ ${error.message || "PDF Analysis Failed. Please verify your connection or file content."}`
    });
  } finally {
    loading = false;
    saveChatsToLocal();
    renderChats();
  }
}

async function uploadImage(file) {
  if (!file || loading) return;

  // Client-side pre-flight size check
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    chats.push({
      type: "ai",
      text: "❌ Upload rejected: Image exceeds the 10 MB limit. Please select a smaller photo."
    });
    renderChats();
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  chats.push({
    type: "user",
    text: `📷 Uploaded image for skin/wound analysis: ${file.name}`
  });
  
  loading = true;
  saveChatsToLocal();
  renderChats();

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/predict-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed (${response.status})`);
    }

    const data = await response.json();
    latestAnalysisText = data.analysis || "";
    chats.push({
      type: "ai",
      text: data.analysis || "No response received."
    });
    hasReportReady = true;
  } catch (error) {
    console.error(error);
    chats.push({
      type: "ai",
      text: `❌ ${error.message || "Image Analysis Failed. Please check your backend connection."}`
    });
  } finally {
    loading = false;
    saveChatsToLocal();
    renderChats();
  }
}

async function downloadPDF() {
  try {
    let reportContent = latestAnalysisText;
    if (!reportContent) {
      const lastReportChat = [...chats].reverse().find(c => c.type === "ai" && (c.text.includes("Findings") || c.text.includes("Analysis") || c.text.includes("Report")));
      if (lastReportChat) {
        reportContent = lastReportChat.text;
      }
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/generate-pdf/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: reportContent || "No report generated yet." }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "PDF generation failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Siri_Healthcare_Report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    chats.push({
      type: "ai",
      text: `❌ Failed to download PDF: ${error.message || "Please ensure an analysis has been completed."}`
    });
    renderChats();
  }
}

function clearChats() {
  chats = [];
  hasReportReady = false;
  latestAnalysisText = "";
  localStorage.removeItem("healthcare_chats");
  renderChats();
}

function saveChatsToLocal() {
  try {
    localStorage.setItem("healthcare_chats", JSON.stringify(chats));
  } catch (e) {
    console.error("Local storage save failed:", e);
  }
}

// ==========================================
// VOICE TRANSLATION (Speech API)
// ==========================================
function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    chats.push({
      type: "ai",
      text: "ℹ️ Voice recognition is not supported in this browser. Please type your query in the input bar."
    });
    renderChats();
    return;
  }

  if (isListening) return;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  isListening = true;
  voiceInputBtn.classList.add("listening");

  recognition.start();

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    chatInput.value = speechResult;
    updateButtonStates();
    isListening = false;
    voiceInputBtn.classList.remove("listening");
  };

  recognition.onerror = (e) => {
    console.warn("Speech recognition notice:", e.error);
    isListening = false;
    voiceInputBtn.classList.remove("listening");
  };

  recognition.onend = () => {
    isListening = false;
    voiceInputBtn.classList.remove("listening");
  };
}

// ==========================================
// MODAL DIALOG CONTROLS (Help, Activity, Settings)
// ==========================================

function openModal(title, htmlContent) {
  modalTitle.textContent = title;
  modalBody.innerHTML = htmlContent;
  appModal.classList.remove("hidden");
}

function closeModal() {
  appModal.classList.add("hidden");
}

modalCloseBtn.addEventListener("click", closeModal);
appModal.addEventListener("click", (e) => {
  if (e.target === appModal) closeModal();
});

helpLink.addEventListener("click", (e) => {
  e.preventDefault();
  openModal("Help & Clinical Guidance", `
    <div class="modal-section">
      <div class="modal-section-title">🚨 Emergency Notice</div>
      <p>If you are experiencing severe chest pain, shortness of breath, sudden numbness, or a medical emergency, immediately call <strong>911 (US)</strong>, <strong>112 (EU/India)</strong>, or go to the nearest emergency room.</p>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">🩺 How to Use Siri Healthcare Agent</div>
      <ul style="padding-left: 20px; line-height: 1.8;">
        <li><strong>Chat:</strong> Ask questions on nutrition, wellness, or preventative care.</li>
        <li><strong>Symptom Check:</strong> Click the stethoscope button to explore possible symptoms.</li>
        <li><strong>Pathology Report:</strong> Click the paperclip to upload a blood/lab report PDF.</li>
        <li><strong>Skin & Wound:</strong> Attach a photo of a rash or lesion for visual first-aid guidance.</li>
        <li><strong>PDF Download:</strong> Download a formatted pathology report once analysis is complete.</li>
      </ul>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">⚖️ Medical Disclaimer</div>
      <p style="font-size: 12px; color: var(--text-muted);">This application provides educational insights only and is strictly forbidden from prescribing medications or providing definitive medical diagnoses. Always consult a licensed clinician.</p>
    </div>
  `);
});

activityLink.addEventListener("click", (e) => {
  e.preventDefault();
  const userCount = chats.filter(c => c.type === "user").length;
  const aiCount = chats.filter(c => c.type === "ai").length;
  openModal("Session Activity", `
    <div class="modal-section">
      <div class="modal-section-title">📊 Current Session Metrics</div>
      <div class="modal-card">
        <div><strong>Total Messages:</strong> ${chats.length}</div>
        <div><strong>User Questions:</strong> ${userCount}</div>
        <div><strong>Assistant Insights:</strong> ${aiCount}</div>
        <div><strong>Report Active:</strong> ${hasReportReady ? "Yes" : "None"}</div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">🧹 Manage Session Data</div>
      <p>All conversation history is stored locally in your browser and is never shared across users.</p>
      <button id="modal-clear-history-btn" class="modal-btn" style="background: #dc2626;">Clear Conversation History</button>
    </div>
  `);
  document.getElementById("modal-clear-history-btn")?.addEventListener("click", () => {
    clearChats();
    closeModal();
  });
});

function showSettingsModal() {
  openModal("Application Settings & Health", `
    <div class="modal-section">
      <div class="modal-section-title">🌐 Backend Service Status</div>
      <div class="modal-card">
        <div><strong>Target API:</strong> <code>${API_BASE_URL}</code></div>
        <div><strong>Session Authentication:</strong> ${cachedSessionToken ? "Active" : "Not authenticated yet"}</div>
        <div id="settings-health-status" style="margin-top: 8px;">Checking backend health...</div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">⚡ Test AI Pipeline</div>
      <p>Test the Groq LLM inference connectivity directly from your browser.</p>
      <button id="settings-test-ai-btn" class="modal-btn">Run AI Connection Test</button>
      <div id="settings-ai-result" class="modal-card hidden" style="margin-top: 10px;"></div>
    </div>
  `);

  // Query live health
  fetch(`${API_BASE_URL}/health`)
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById("settings-health-status");
      if (el) el.innerHTML = `🟢 <strong>Status:</strong> ${data.status} (v${data.version || "1.0.0"})`;
    })
    .catch(() => {
      const el = document.getElementById("settings-health-status");
      if (el) el.innerHTML = "🔴 <strong>Status:</strong> Unreachable or waking up...";
    });

  // Wire AI Test button
  document.getElementById("settings-test-ai-btn")?.addEventListener("click", async () => {
    const resBox = document.getElementById("settings-ai-result");
    if (resBox) {
      resBox.classList.remove("hidden");
      resBox.textContent = "Querying /ai-test endpoint...";
    }
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/ai-test`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (resBox) resBox.textContent = `✅ AI Response: ${json.response?.substring(0, 100)}...`;
    } catch (err) {
      if (resBox) resBox.textContent = `❌ AI Test Error: ${err.message}`;
    }
  });
}

settingsLink.addEventListener("click", (e) => {
  e.preventDefault();
  showSettingsModal();
});

userProfileBtn.addEventListener("click", showSettingsModal);

// ==========================================
// EVENT LISTENERS BINDINGS
// ==========================================

// Hamburger collapse sidebar (Desktop)
toggleSidebarBtn.addEventListener("click", () => {
  sidebarOpen = !sidebarOpen;
  updateSidebarUI();
  localStorage.setItem("sidebar_open", JSON.stringify(sidebarOpen));
});

// Mobile hamburger button
mobileMenuBtn.addEventListener("click", () => {
  sidebarOpen = !sidebarOpen;
  updateSidebarUI();
});

// Close sidebar on mobile backdrop click
sidebarBackdrop.addEventListener("click", () => {
  sidebarOpen = false;
  updateSidebarUI();
});

// New chat button
newChatBtn.addEventListener("click", () => {
  clearChats();
  if (window.innerWidth < 768) {
    sidebarOpen = false;
    updateSidebarUI();
  }
});

// Text Input typing triggers button validation
chatInput.addEventListener("input", updateButtonStates);

// Enter triggers Send
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !loading) {
    sendMessage();
  }
});

// Stethoscope predict disease
predictDiseaseBtn.addEventListener("click", predictDisease);

// Send message click
sendMsgBtn.addEventListener("click", sendMessage);

// Voice button trigger
voiceInputBtn.addEventListener("click", startVoiceInput);

// Download report button click
downloadReportBtn.addEventListener("click", downloadPDF);

// Attachment file changes auto-upload
fileInput.addEventListener("change", (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name);
    fileBadgeName.textContent = `${isImage ? "📷" : "📄"} ${file.name}`;
    fileBadge.classList.remove("hidden");
    
    const uploadPromise = isImage ? uploadImage(file) : uploadPDF(file);
    
    uploadPromise.then(() => {
      fileInput.value = "";
      fileBadge.classList.add("hidden");
    });
  }
});

// Remove badge file click
removeFileBtn.addEventListener("click", () => {
  fileInput.value = "";
  fileBadge.classList.add("hidden");
});

// Window resize listener
window.addEventListener("resize", () => {
  if (window.innerWidth >= 768 && sidebarBackdrop) {
    sidebarBackdrop.classList.add("hidden");
  }
});

// Initial load rendering
updateSidebarUI();
renderChats();
updateButtonStates();
