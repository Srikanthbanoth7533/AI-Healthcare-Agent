import {
  useEffect,
  useRef,
  useState
} from "react";

// API Base URL config (dynamic for local dev vs production)
const API_BASE_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "https://ai-healthcare-agent-eje2.onrender.com";

// ==========================================
// CUSTOM SVG ICONS (Premium aesthetics)
// ==========================================

const SparkIcon = ({ className }) => (
  <svg className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 12 8 8 12C12 16 12 22 12 22C12 22 12 16 16 12C12 8 12 2 12 2Z" fill="url(#spark-grad)" />
    <defs>
      <linearGradient id="spark-grad" x1="8" y1="2" x2="16" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285f4" />
        <stop offset="40%" stopColor="#9b72cb" />
        <stop offset="100%" stopColor="#d96570" />
      </linearGradient>
    </defs>
  </svg>
);

const HamburgerIcon = ({ onClick }) => (
  <button onClick={onClick} className="p-2 hover:bg-[#282a2c] rounded-full transition-colors duration-200">
    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MicIcon = ({ isListening }) => (
  <svg className={`w-5 h-5 ${isListening ? "text-purple-400 animate-pulse" : "text-gray-400 hover:text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const AttachmentIcon = () => (
  <svg className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg className="w-5 h-5 text-gray-400 hover:text-[#d96570] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5 text-gray-400 hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const SendIcon = ({ active }) => (
  <svg className={`w-5 h-5 ${active ? "text-white" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ==========================================
// RENDER FORMATTED TEXT (Custom MD Parser)
// ==========================================

const renderFormattedText = (text) => {
  if (!text) return null;
  const paragraphs = text.split("\n");
  return paragraphs.map((para, index) => {
    let trimmed = para.trim();
    if (!trimmed) return <div key={index} className="h-2"></div>;

    // Headings matching digits e.g. "1. Important Abnormal Findings" or standard MD headings
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

    // Bold replacement
    const parts = cleanText.split(/(\*\*.*?\*\*)/g);
    const formattedContent = parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pIdx} className="font-semibold text-blue-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isHeading) {
      return (
        <h3 key={index} className="text-lg font-bold text-white mt-5 mb-2 first:mt-0 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
          {formattedContent}
        </h3>
      );
    }

    if (isBullet) {
      return (
        <div key={index} className="flex items-start gap-2 ml-4 my-1.5">
          <span className="text-[#9b72cb] mt-2 select-none text-[8px] flex-shrink-0">●</span>
          <p className="flex-1 text-[#e3e3e3] leading-relaxed">{formattedContent}</p>
        </div>
      );
    }

    return (
      <p key={index} className="text-[#e3e3e3] leading-relaxed my-2">
        {formattedContent}
      </p>
    );
  });
};

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [hasReportReady, setHasReportReady] = useState(false);

  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("healthcare_chats");
    return savedChats ? JSON.parse(savedChats) : [];
  });

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("healthcare_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chats, loading]);

  // Main Chat Send
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      type: "user",
      text: message,
    };

    setChats((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
        }),
      });

      const data = await response.json();
      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text: data.reply || "No response received.",
        },
      ]);
    } catch {
      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text: "❌ Backend connection failed. Please check if your server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice recognition
  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    setIsListening(true);

    recognition.start();

    recognition.onresult = (event) => {
      setMessage(event.results[0][0].transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // PDF Upload
  const uploadPDF = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) {
      alert("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setChats((prev) => [
      ...prev,
      {
        type: "user",
        text: `📄 Uploaded pathology report: ${file.name}`,
      },
    ]);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-report/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text: data.medical_analysis || "No analysis received.",
        },
      ]);
      setHasReportReady(true);
    } catch {
      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text: "❌ PDF Analysis Failed. Please verify your connection or file content.",
        },
      ]);
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  };

  // Clear Conversation
  const clearChats = () => {
    setChats([]);
    localStorage.removeItem("healthcare_chats");
    setHasReportReady(false);
  };

  // Download Generated PDF Report
  const downloadPDF = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-pdf/`, {
        method: "POST",
      });

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "AI_Healthcare_Report.pdf";
      link.click();
    } catch {
      alert("Failed to download PDF report. Ensure an analysis has been completed.");
    }
  };

  // Symptom Predict Disease
  const predictDisease = async () => {
    if (!message.trim()) {
      alert("Please enter symptoms in the text box first.");
      return;
    }

    const symptomsText = message;
    setChats((prev) => [
      ...prev,
      {
        type: "user",
        text: `🩺 Check symptoms: ${symptomsText}`,
      },
    ]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/predict-disease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptomsText,
        }),
      });

      const data = await response.json();
      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text: data.prediction || "No prediction result returned.",
        },
      ]);
    } catch (error) {
      console.error(error);
      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text: "❌ Prediction failed. Please verify the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Card clicks
  const handleCardClick = (promptText, type) => {
    setMessage(promptText);
  };

  // File Input Handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-upload once selected
      uploadPDF(file);
    }
  };

  return (
    <div className="h-screen flex bg-[#131314] text-[#e3e3e3] overflow-hidden">
      
      {/* ==========================================
          LEFT COLLAPSIBLE SIDEBAR
         ========================================== */}
      <div 
        className={`${
          sidebarOpen ? "w-72" : "w-18"
        } shrink-0 bg-[#1e1f20] border-r border-[#282a2c] flex flex-col justify-between py-6 px-4 transition-all duration-300 z-10`}
      >
        <div className="flex flex-col gap-8">
          
          {/* Hamburger Menu & Brand Title */}
          <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} h-10`}>
            {sidebarOpen && (
              <div className="flex items-center gap-2 font-semibold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <SparkIcon className="w-5 h-5" />
                <span>AI Doctor</span>
              </div>
            )}
            <HamburgerIcon onClick={() => setSidebarOpen(!sidebarOpen)} />
          </div>

          {/* New Chat Button */}
          <button
            onClick={clearChats}
            className={`flex items-center gap-3 bg-[#131314] hover:bg-[#282a2c] border border-[#3c4043] rounded-full transition-all duration-200 text-[#e3e3e3] ${
              sidebarOpen ? "px-5 py-3 w-full" : "p-3 w-10 h-10 justify-center"
            }`}
            title="New Conversation"
          >
            <PlusIcon />
            {sidebarOpen && <span className="text-sm font-medium">New Chat</span>}
          </button>

          {/* Recent Section */}
          {sidebarOpen && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 tracking-wider px-2">RECENT</span>
              <div className="flex flex-col gap-1 max-h-[40vh] overflow-y-auto pr-1">
                {chats.length > 0 ? (
                  <div className="flex items-center justify-between group bg-[#282a2c] text-white px-3 py-2.5 rounded-lg text-sm cursor-pointer">
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      <ChatIcon />
                      <span className="truncate">
                        {chats.find(c => c.type === 'user')?.text.substring(0, 24) || "Active Conversation"}...
                      </span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearChats(); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3c4043] rounded transition-opacity duration-150"
                      title="Clear active conversation"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic px-2">No recent chats</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-2">
          <a href="#" className={`flex items-center gap-4 hover:bg-[#282a2c] p-2.5 rounded-lg text-sm transition-colors duration-150 ${!sidebarOpen && "justify-center"}`} title="Help">
            <QuestionIcon />
            {sidebarOpen && <span>Help</span>}
          </a>
          <a href="#" className={`flex items-center gap-4 hover:bg-[#282a2c] p-2.5 rounded-lg text-sm transition-colors duration-150 ${!sidebarOpen && "justify-center"}`} title="Activity">
            <ActivityIcon />
            {sidebarOpen && <span>Activity</span>}
          </a>
          <a href="#" className={`flex items-center gap-4 hover:bg-[#282a2c] p-2.5 rounded-lg text-sm transition-colors duration-150 ${!sidebarOpen && "justify-center"}`} title="Settings">
            <SettingsIcon />
            {sidebarOpen && <span>Settings</span>}
          </a>
        </div>
      </div>

      {/* ==========================================
          MAIN CONTENT CONTAINER
         ========================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282a2c] bg-[#131314]/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🩺 AI Healthcare Assistant
            </h1>
          </div>
          {/* Mock User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs shadow-lg cursor-pointer">
            HB
          </div>
        </div>

        {/* ==========================================
            CHAT FEED AREA
           ========================================== */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 pb-32">
          
          {chats.length === 0 ? (
            /* Gemini-style Greeting Landing Page */
            <div className="max-w-4xl mx-auto mt-8 flex flex-col gap-2">
              <h2 className="text-5xl font-medium tracking-tight bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent leading-normal py-1">
                Hello, Friend.
              </h2>
              <h3 className="text-4xl font-medium text-gray-500 py-1">
                How can I help you today?
              </h3>

              {/* Grid of Interactive Quick-Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full">
                
                <div 
                  onClick={() => handleCardClick("I want to upload my pathology report. Let's start the analysis.", "report")}
                  className="bg-[#1e1f20] hover:bg-[#282a2c] p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group border border-[#282a2c] hover:border-blue-500/50 shadow-md flex flex-col justify-between h-48"
                >
                  <p className="text-sm font-medium text-[#e3e3e3] leading-relaxed">
                    Analyze blood or pathology report PDF to detect abnormal values.
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-blue-400 font-semibold group-hover:underline">Upload PDF</span>
                    <div className="p-2.5 bg-[#131314] rounded-xl text-blue-400"><AttachmentIcon /></div>
                  </div>
                </div>

                <div 
                  onClick={() => handleCardClick("I am having dry cough, fever, and chest tightness.", "symptoms")}
                  className="bg-[#1e1f20] hover:bg-[#282a2c] p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group border border-[#282a2c] hover:border-[#d96570]/50 shadow-md flex flex-col justify-between h-48"
                >
                  <p className="text-sm font-medium text-[#e3e3e3] leading-relaxed">
                    Check symptoms like fever, cough, or fatigue for disease analysis.
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-[#d96570] font-semibold group-hover:underline">Predict Disease</span>
                    <div className="p-2.5 bg-[#131314] rounded-xl text-[#d96570]"><StethoscopeIcon /></div>
                  </div>
                </div>

                <div 
                  onClick={() => handleCardClick("What is a recommended heart-healthy diet plan for hypertension?", "diet")}
                  className="bg-[#1e1f20] hover:bg-[#282a2c] p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group border border-[#282a2c] hover:border-purple-500/50 shadow-md flex flex-col justify-between h-48"
                >
                  <p className="text-sm font-medium text-[#e3e3e3] leading-relaxed">
                    Ask for personalized diet or exercise recommendations.
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-purple-400 font-semibold group-hover:underline">Lifestyle Tips</span>
                    <div className="p-2.5 bg-[#131314] rounded-xl text-purple-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => handleCardClick("What questions should I ask my doctor about high blood pressure during my checkup?", "doctor")}
                  className="bg-[#1e1f20] hover:bg-[#282a2c] p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group border border-[#282a2c] hover:border-green-500/50 shadow-md flex flex-col justify-between h-48"
                >
                  <p className="text-sm font-medium text-[#e3e3e3] leading-relaxed">
                    Prep questions for your next doctor checkup.
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-green-400 font-semibold group-hover:underline">Get Checklist</span>
                    <div className="p-2.5 bg-[#131314] rounded-xl text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Active Thread Layout */
            <div className="max-w-3xl mx-auto space-y-10">
              {chats.map((chat, index) => (
                <div key={index} className="flex flex-col gap-3">
                  
                  {chat.type === "user" ? (
                    /* User Speech Bubble */
                    <div className="flex justify-end items-end gap-3 animate-fade-in-up">
                      <div className="bg-[#282a2c] text-[#e3e3e3] px-5 py-3 rounded-2xl rounded-tr-none shadow-md max-w-[85%] leading-relaxed text-sm">
                        {chat.text}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow">
                        HB
                      </div>
                    </div>
                  ) : (
                    /* AI Assistant Clean Gemini Style Layout */
                    <div className="flex gap-4 items-start w-full animate-fade-in-up">
                      <div className="w-8 h-8 rounded-full bg-[#1e1f20] border border-[#3c4043] flex items-center justify-center shadow shrink-0">
                        <SparkIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-sm overflow-hidden select-text text-left pr-4">
                        <div className="text-xs text-gray-500 font-semibold mb-1 tracking-wider uppercase">AI Doctor</div>
                        {renderFormattedText(chat.text)}
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {loading && (
                /* Gemini-style Pulse Loader */
                <div className="flex gap-4 items-start w-full">
                  <div className="w-8 h-8 rounded-full bg-[#1e1f20] border border-[#3c4043] flex items-center justify-center shadow shrink-0">
                    <SparkIcon className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Thinking</div>
                    <div className="h-4 bg-[#1e1f20] rounded-md animate-pulse w-3/4"></div>
                    <div className="h-4 bg-[#1e1f20] rounded-md animate-pulse w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* ==========================================
            FLOATING CAPSULE INPUT SYSTEM
           ========================================== */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent pt-8 pb-6 px-4 md:px-8">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            
            {/* Display Selected File badge prior to upload */}
            {selectedFile && (
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs self-start animate-fade-in shadow">
                <span>📄 {selectedFile.name}</span>
                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="hover:text-red-400 font-bold transition-colors ml-1"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Input Capsule */}
            <div className="bg-[#1e1f20] rounded-full border border-transparent hover:border-[#3c4043] focus-within:border-[#3c4043] shadow-2xl transition-all duration-300 flex items-center px-5 py-1.5 w-full">
              
              {/* Attachment File Input */}
              <label className="p-2 hover:bg-[#282a2c] rounded-full cursor-pointer transition-colors duration-150 flex-shrink-0" title="Attach Pathology PDF">
                <AttachmentIcon />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  className="hidden" 
                />
              </label>

              {/* Text Input */}
              <input
                type="text"
                value={message}
                placeholder="Ask a healthcare question, details on symptoms, or attach a report..."
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    sendMessage();
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none text-[#e3e3e3] placeholder-gray-500 text-sm px-4 py-3 min-w-0"
              />

              {/* Action Toolbar */}
              <div className="flex items-center gap-1 flex-shrink-0">
                
                {/* Voice Input */}
                <button
                  onClick={startVoiceInput}
                  disabled={loading}
                  className={`p-2 rounded-full hover:bg-[#282a2c] transition-colors duration-150 ${isListening && "bg-[#282a2c]"}`}
                  title="Voice Input"
                >
                  <MicIcon isListening={isListening} />
                </button>

                {/* Stethoscope (Predict Disease) */}
                <button
                  onClick={predictDisease}
                  disabled={loading || !message.trim()}
                  className={`p-2 rounded-full hover:bg-[#282a2c] transition-colors duration-150 ${(!message.trim()) && "opacity-40 cursor-not-allowed"}`}
                  title="Check Symptoms (Predict Disease)"
                >
                  <StethoscopeIcon />
                </button>

                {/* PDF Download (Active when report history exists) */}
                {(hasReportReady || chats.some(c => c.type === 'ai' && c.text.includes("Findings"))) && (
                  <button
                    onClick={downloadPDF}
                    className="p-2 rounded-full hover:bg-[#282a2c] transition-colors duration-150"
                    title="Download Pathology Analysis Report"
                  >
                    <DownloadIcon />
                  </button>
                )}

                {/* Send/Submit */}
                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className={`p-2.5 rounded-full transition-all duration-200 ${
                    message.trim() ? "bg-[#3c4043] hover:bg-[#4a4c4e]" : "bg-transparent opacity-40 cursor-not-allowed"
                  }`}
                  title="Send Message"
                >
                  <SendIcon active={!!message.trim()} />
                </button>

              </div>

            </div>

            {/* Disclaimer Caption */}
            <p className="text-[11px] text-gray-500 text-center select-none leading-relaxed px-4">
              AI Healthcare Assistant is an AI tool. Checkups & recommendations should always be validated with a qualified medical professional.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
}

export default App;