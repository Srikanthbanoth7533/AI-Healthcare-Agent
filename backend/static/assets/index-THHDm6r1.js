(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();const $={},p=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"http://127.0.0.1:8000":"https://ai-healthcare-agent-eje2.onrender.com",U=10*1024*1024,O=document.getElementById("sidebar"),q=document.getElementById("toggle-sidebar-btn"),z=document.getElementById("mobile-menu-btn"),v=document.getElementById("sidebar-backdrop"),_=document.getElementById("new-chat-btn"),A=document.getElementById("recent-list"),w=document.getElementById("chat-feed"),l=document.getElementById("chat-input"),C=document.getElementById("file-input"),T=document.getElementById("file-badge"),G=document.getElementById("file-badge-name"),V=document.getElementById("remove-file-btn"),k=document.getElementById("voice-input-btn"),L=document.getElementById("predict-disease-btn"),D=document.getElementById("download-report-btn"),g=document.getElementById("send-msg-btn"),S=document.getElementById("app-modal"),J=document.getElementById("modal-title"),K=document.getElementById("modal-body"),Y=document.getElementById("modal-close-btn"),Z=document.getElementById("help-link"),Q=document.getElementById("activity-link"),X=document.getElementById("settings-link"),ee=document.getElementById("user-profile-btn");let i=[],d=!1,b=!1,u=window.innerWidth>=768,f=!1,P="",x=null;async function R(e=!1){var a;const t={},s=((a=window.APP_CONFIG)==null?void 0:a.API_KEY)||typeof import.meta<"u"&&($==null?void 0:$.VITE_API_KEY)||"";if(s)return t["X-API-Key"]=s,t;if(!x||e)try{const n=await fetch(`${p}/auth/session`,{method:"POST"});n.ok&&(x=(await n.json()).access_token)}catch(n){console.warn("Could not acquire session token:",n)}return x&&(t.Authorization=`Bearer ${x}`),t}async function y(e,t={}){let s=await R(),a={...t,headers:{...t.headers,...s}},n=await fetch(e,a);if(n.status===401&&(console.info("Session token expired or invalid; renewing token..."),s=await R(!0),a={...t,headers:{...t.headers,...s}},n=await fetch(e,a)),n.status===429){const o=n.headers.get("retry-after")||"60";throw new Error(`Rate limit exceeded. Please wait ${o} seconds before trying again.`)}return n}try{const e=localStorage.getItem("healthcare_chats");e&&(i=JSON.parse(e));const t=localStorage.getItem("sidebar_open");t!==null&&(u=JSON.parse(t))}catch(e){console.error("Failed to load local storage state:",e)}function E(){u?(O.classList.remove("collapsed"),window.innerWidth<768?v.classList.remove("hidden"):v.classList.add("hidden")):(O.classList.add("collapsed"),v.classList.add("hidden"))}const te=`
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
`;function se(e){if(!e)return"";const t=e.split(`
`);let s="";return t.forEach(a=>{const n=a.trim();if(!n){s+='<div class="ai-paragraph-space"></div>';return}const o=/^\d+\.\s+/.test(n)||n.startsWith("###")||n.startsWith("##"),c=n.startsWith("-")||n.startsWith("*");let I=n;n.startsWith("###")?I=n.replace(/^###\s*/,""):n.startsWith("##")?I=n.replace(/^##\s*/,""):c&&(I=n.replace(/^[-*]\s*/,""));const M=I.split(/(\*\*.*?\*\*)/g).map(B=>B.startsWith("**")&&B.endsWith("**")?`<strong class="ai-bold-text">${B.slice(2,-2)}</strong>`:B).join("");o?s+=`<h3 class="ai-heading">${M}</h3>`:c?s+=`
        <div class="ai-bullet-row">
          <span class="ai-bullet-dot">●</span>
          <span class="ai-bullet-text">${M}</span>
        </div>`:s+=`<p class="ai-paragraph">${M}</p>`}),s}function ne(){var e;if(A.innerHTML="",i.length>0){const t=((e=i.find(n=>n.type==="user"))==null?void 0:e.text)||"Active Conversation",s=t.substring(0,24)+(t.length>24?"...":""),a=document.createElement("div");a.className="recent-item",a.innerHTML=`
      <div class="recent-item-left">
        <svg class="chat-bubble-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="recent-item-text">${s}</span>
      </div>
      <button class="delete-chat-btn" title="Clear active conversation">
        <svg class="delete-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    `,a.querySelector(".delete-chat-btn").addEventListener("click",n=>{n.stopPropagation(),j()}),A.appendChild(a)}else{const t=document.createElement("div");t.className="recent-empty",t.textContent="No recent chats",A.appendChild(t)}}function r(){if(w.innerHTML="",i.length===0){const e=document.createElement("div");e.className="landing-container",e.innerHTML=`
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
    `,e.querySelector(".card-pdf").addEventListener("click",()=>{C.click()}),e.querySelector(".card-symptoms").addEventListener("click",()=>{l.value="I am having dry cough, fever, and chest tightness.",m(),l.focus()}),e.querySelector(".card-lifestyle").addEventListener("click",()=>{l.value="What is a recommended heart-healthy diet plan for hypertension?",m(),l.focus()}),e.querySelector(".card-checklist").addEventListener("click",()=>{l.value="What questions should I ask my doctor about high blood pressure during my checkup?",m(),l.focus()}),w.appendChild(e)}else{const e=document.createElement("div");if(e.className="chat-thread-container",i.forEach(t=>{const s=document.createElement("div");t.type==="user"?(s.className="chat-message-row user-row animate-fade-in-up",s.innerHTML=`
          <div class="user-bubble-wrapper">
            <div class="user-bubble">${t.text}</div>
            <div class="user-avatar-small">HB</div>
          </div>
        `):(s.className="chat-message-row ai-row animate-fade-in-up",s.innerHTML=`
          <div class="ai-bubble-wrapper">
            <div class="ai-avatar-small">
              ${te}
            </div>
            <div class="ai-bubble-content">
              <div class="ai-bubble-label">Siri Healthcare Agent</div>
              <div class="ai-formatted-text">${se(t.text)}</div>
            </div>
          </div>
        `),e.appendChild(s)}),d){const t=document.createElement("div");t.className="chat-message-row ai-row",t.innerHTML=`
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
      `,e.appendChild(t)}w.appendChild(e),setTimeout(()=>{w.scrollTop=w.scrollHeight},50)}f=i.some(e=>e.type==="ai"&&(e.text.includes("Findings")||e.text.includes("Recommendations")||e.text.includes("Analysis")||e.text.includes("Report"))),f?D.classList.remove("hidden"):D.classList.add("hidden"),ne()}function m(){l.value.trim().length>0&&!d?(g.removeAttribute("disabled"),g.classList.remove("disabled"),g.classList.add("active"),L.removeAttribute("disabled"),L.classList.remove("disabled")):(g.setAttribute("disabled","true"),g.classList.add("disabled"),g.classList.remove("active"),L.setAttribute("disabled","true"),L.classList.add("disabled"))}async function F(){const e=l.value.trim();if(!e||d)return;const t={type:"user",text:e};i.push(t),l.value="",m(),d=!0,h(),r();try{const s=await y(`${p}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:t.text})});if(!s.ok){const n=await s.json().catch(()=>({}));throw new Error(n.detail||`Server error (${s.status})`)}const a=await s.json();i.push({type:"ai",text:a.reply||"No response received."})}catch(s){console.error(s),i.push({type:"ai",text:`❌ ${s.message||"Backend connection failed. Please check if your server is running."}`})}finally{d=!1,h(),r()}}async function ae(){const e=l.value.trim();if(!e||d)return;const t=e;i.push({type:"user",text:`🩺 Check symptoms: ${t}`}),l.value="",m(),d=!0,h(),r();try{const s=await y(`${p}/predict-disease`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({symptoms:t})});if(!s.ok){const n=await s.json().catch(()=>({}));throw new Error(n.detail||`Server error (${s.status})`)}const a=await s.json();i.push({type:"ai",text:a.prediction||"No prediction result returned."})}catch(s){console.error(s),i.push({type:"ai",text:`❌ ${s.message||"Prediction failed. Please verify the backend is running."}`})}finally{d=!1,h(),r()}}async function ie(e){if(!e||d)return;if(e.size>U){i.push({type:"ai",text:"❌ Upload rejected: File exceeds the maximum allowed size of 10 MB. Please choose a smaller report."}),r();return}if(!e.name.toLowerCase().endsWith(".pdf")){i.push({type:"ai",text:"❌ Upload rejected: Please select a valid document ending in .pdf"}),r();return}const t=new FormData;t.append("file",e),i.push({type:"user",text:`📄 Uploaded pathology report: ${e.name}`}),d=!0,h(),r();try{const s=await y(`${p}/analyze-report/`,{method:"POST",body:t});if(!s.ok){const n=await s.json().catch(()=>({}));throw new Error(n.detail||`Upload failed (${s.status})`)}const a=await s.json();P=a.medical_analysis||"",i.push({type:"ai",text:a.medical_analysis||"No analysis received."}),f=!0}catch(s){console.error(s),i.push({type:"ai",text:`❌ ${s.message||"PDF Analysis Failed. Please verify your connection or file content."}`})}finally{d=!1,h(),r()}}async function oe(e){if(!e||d)return;if(e.size>U){i.push({type:"ai",text:"❌ Upload rejected: Image exceeds the 10 MB limit. Please select a smaller photo."}),r();return}const t=new FormData;t.append("file",e),i.push({type:"user",text:`📷 Uploaded image for skin/wound analysis: ${e.name}`}),d=!0,h(),r();try{const s=await y(`${p}/predict-image`,{method:"POST",body:t});if(!s.ok){const n=await s.json().catch(()=>({}));throw new Error(n.detail||`Upload failed (${s.status})`)}const a=await s.json();P=a.analysis||"",i.push({type:"ai",text:a.analysis||"No response received."}),f=!0}catch(s){console.error(s),i.push({type:"ai",text:`❌ ${s.message||"Image Analysis Failed. Please check your backend connection."}`})}finally{d=!1,h(),r()}}async function re(){try{let e=P;if(!e){const o=[...i].reverse().find(c=>c.type==="ai"&&(c.text.includes("Findings")||c.text.includes("Analysis")||c.text.includes("Report")));o&&(e=o.text)}const t=await y(`${p}/generate-pdf/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:e||"No report generated yet."})});if(!t.ok){const o=await t.json().catch(()=>({}));throw new Error(o.detail||"PDF generation failed")}const s=await t.blob(),a=window.URL.createObjectURL(s),n=document.createElement("a");n.href=a,n.download="Siri_Healthcare_Report.pdf",document.body.appendChild(n),n.click(),document.body.removeChild(n),window.URL.revokeObjectURL(a)}catch(e){console.error(e),i.push({type:"ai",text:`❌ Failed to download PDF: ${e.message||"Please ensure an analysis has been completed."}`}),r()}}function j(){i=[],f=!1,P="",localStorage.removeItem("healthcare_chats"),r()}function h(){try{localStorage.setItem("healthcare_chats",JSON.stringify(i))}catch(e){console.error("Local storage save failed:",e)}}function de(){const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(!e){i.push({type:"ai",text:"ℹ️ Voice recognition is not supported in this browser. Please type your query in the input bar."}),r();return}if(b)return;const t=new e;t.lang="en-US",b=!0,k.classList.add("listening"),t.start(),t.onresult=s=>{const a=s.results[0][0].transcript;l.value=a,m(),b=!1,k.classList.remove("listening")},t.onerror=s=>{console.warn("Speech recognition notice:",s.error),b=!1,k.classList.remove("listening")},t.onend=()=>{b=!1,k.classList.remove("listening")}}function N(e,t){J.textContent=e,K.innerHTML=t,S.classList.remove("hidden")}function H(){S.classList.add("hidden")}Y.addEventListener("click",H);S.addEventListener("click",e=>{e.target===S&&H()});Z.addEventListener("click",e=>{e.preventDefault(),N("Help & Clinical Guidance",`
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
  `)});Q.addEventListener("click",e=>{var a;e.preventDefault();const t=i.filter(n=>n.type==="user").length,s=i.filter(n=>n.type==="ai").length;N("Session Activity",`
    <div class="modal-section">
      <div class="modal-section-title">📊 Current Session Metrics</div>
      <div class="modal-card">
        <div><strong>Total Messages:</strong> ${i.length}</div>
        <div><strong>User Questions:</strong> ${t}</div>
        <div><strong>Assistant Insights:</strong> ${s}</div>
        <div><strong>Report Active:</strong> ${f?"Yes":"None"}</div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">🧹 Manage Session Data</div>
      <p>All conversation history is stored locally in your browser and is never shared across users.</p>
      <button id="modal-clear-history-btn" class="modal-btn" style="background: #dc2626;">Clear Conversation History</button>
    </div>
  `),(a=document.getElementById("modal-clear-history-btn"))==null||a.addEventListener("click",()=>{j(),H()})});function W(){var e;N("Application Settings & Health",`
    <div class="modal-section">
      <div class="modal-section-title">🌐 Backend Service Status</div>
      <div class="modal-card">
        <div><strong>Target API:</strong> <code>${p}</code></div>
        <div><strong>Session Authentication:</strong> ${x?"Active":"Not authenticated yet"}</div>
        <div id="settings-health-status" style="margin-top: 8px;">Checking backend health...</div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">⚡ Test AI Pipeline</div>
      <p>Test the Groq LLM inference connectivity directly from your browser.</p>
      <button id="settings-test-ai-btn" class="modal-btn">Run AI Connection Test</button>
      <div id="settings-ai-result" class="modal-card hidden" style="margin-top: 10px;"></div>
    </div>
  `),fetch(`${p}/health`).then(t=>t.json()).then(t=>{const s=document.getElementById("settings-health-status");s&&(s.innerHTML=`🟢 <strong>Status:</strong> ${t.status} (v${t.version||"1.0.0"})`)}).catch(()=>{const t=document.getElementById("settings-health-status");t&&(t.innerHTML="🔴 <strong>Status:</strong> Unreachable or waking up...")}),(e=document.getElementById("settings-test-ai-btn"))==null||e.addEventListener("click",async()=>{var s;const t=document.getElementById("settings-ai-result");t&&(t.classList.remove("hidden"),t.textContent="Querying /ai-test endpoint...");try{const a=await y(`${p}/ai-test`);if(!a.ok)throw new Error(`HTTP ${a.status}`);const n=await a.json();t&&(t.textContent=`✅ AI Response: ${(s=n.response)==null?void 0:s.substring(0,100)}...`)}catch(a){t&&(t.textContent=`❌ AI Test Error: ${a.message}`)}})}X.addEventListener("click",e=>{e.preventDefault(),W()});ee.addEventListener("click",W);q.addEventListener("click",()=>{u=!u,E(),localStorage.setItem("sidebar_open",JSON.stringify(u))});z.addEventListener("click",()=>{u=!u,E()});v.addEventListener("click",()=>{u=!1,E()});_.addEventListener("click",()=>{j(),window.innerWidth<768&&(u=!1,E())});l.addEventListener("input",m);l.addEventListener("keydown",e=>{e.key==="Enter"&&!d&&F()});L.addEventListener("click",ae);g.addEventListener("click",F);k.addEventListener("click",de);D.addEventListener("click",re);C.addEventListener("change",e=>{if(e.target.files&&e.target.files[0]){const t=e.target.files[0],s=t.type.startsWith("image/")||/\.(jpe?g|png|webp)$/i.test(t.name);G.textContent=`${s?"📷":"📄"} ${t.name}`,T.classList.remove("hidden"),(s?oe(t):ie(t)).then(()=>{C.value="",T.classList.add("hidden")})}});V.addEventListener("click",()=>{C.value="",T.classList.add("hidden")});window.addEventListener("resize",()=>{window.innerWidth>=768&&v&&v.classList.add("hidden")});E();r();m();
