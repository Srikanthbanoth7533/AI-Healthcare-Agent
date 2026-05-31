import {
  useEffect,
  useRef,
  useState
} from "react";

function App() {

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] =
    useState(null);

  const [chats, setChats] = useState(() => {

    const savedChats =
      localStorage.getItem(
        "healthcare_chats"
      );

    return savedChats
      ? JSON.parse(savedChats)
      : [];
  });

  const chatEndRef = useRef(null);

  useEffect(() => {

    localStorage.setItem(
      "healthcare_chats",
      JSON.stringify(chats)
    );

  }, [chats]);

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [chats, loading]);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = {
      type: "user",
      text: message,
    };

    setChats((prev) => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,
          }),
        }
      );

      const data =
        await response.json();

      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text:
            data.reply ||
            "No response received.",
        },
      ]);

    } catch {

      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text:
            "❌ Backend connection failed",
        },
      ]);

    } finally {

      setLoading(false);
      setMessage("");
    }
  };

  const startVoiceInput = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert(
        "Voice recognition not supported"
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = (event) => {

      setMessage(
        event.results[0][0].transcript
      );
    };
  };

  const uploadPDF = async () => {

    if (!selectedFile) {

      alert("Select PDF");
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedFile
    );

    setLoading(true);

    setChats((prev) => [
      ...prev,
      {
        type: "user",
        text:
          `📄 Uploaded: ${selectedFile.name}`,
      },
    ]);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/analyze-report/",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text:
            data.medical_analysis ||
            "No analysis received.",
        },
      ]);

    } catch {

      setChats((prev) => [
        ...prev,
        {
          type: "ai",
          text:
            "❌ PDF Analysis Failed",
        },
      ]);

    } finally {

      setLoading(false);
    }
  };

  const clearChats = () => {

    setChats([]);

    localStorage.removeItem(
      "healthcare_chats"
    );
  };
  const downloadPDF = async () => {

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/generate-pdf/",
      {
        method: "POST",
      }
    );

    const blob =
      await response.blob();

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "AI_Report.pdf";

    link.click();

  } catch {

    alert(
      "Failed to download PDF"
    );
  }
};
const predictDisease = async () => {

  if (!message.trim()) return;

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/predict-disease",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: message,
        }),
      }
    );

    const data = await response.json();

    setChats((prev) => [
      ...prev,
      {
        type: "user",
        text: `🩺 Symptoms: ${message}`,
      },
      {
        type: "ai",
        text: data.prediction,
      },
    ]);

  } catch (error) {

    console.error(error);

    alert("Prediction failed");
  }
};
  return (

    <div className="h-screen flex bg-[#212121] text-white">

      {/* SIDEBAR */}

      <div className="hidden md:flex flex-col w-64 bg-[#171717] border-r border-gray-800 p-4">

        <button
          onClick={clearChats}
          className="bg-[#2f2f2f] hover:bg-[#3a3a3a] p-3 rounded-xl text-left"
        >
          + New Chat
        </button>

        <div className="mt-6 text-gray-400 text-sm">
          Healthcare Assistant
        </div>

      </div>

      {/* MAIN */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <div className="border-b border-gray-700 p-4">

          <h1 className="text-xl font-bold">
            🩺 AI Healthcare Assistant
          </h1>

        </div>

        {/* CHAT AREA */}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chats.map((chat, index) => (

            <div
              key={index}
              className={
                chat.type === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >

              <div
                className={
                  chat.type === "user"
                    ? "bg-[#303030] max-w-3xl p-5 rounded-3xl shadow-lg"
                    : "bg-[#2a2a2a] max-w-3xl p-5 rounded-3xl shadow-lg"
                }
              >

                <div className="font-bold mb-3">

                  {
                    chat.type === "user"
                      ? "🧑 You"
                      : "🤖 AI Doctor"
                  }

                </div>

                <div className="whitespace-pre-wrap leading-8">
                  {chat.text}
                </div>

              </div>

            </div>

          ))}

          {loading && (

            <div className="flex justify-start">

              <div className="bg-[#2a2a2a] p-5 rounded-3xl">

                <div className="font-bold mb-2">
                  🤖 AI Doctor
                </div>

                <div className="animate-pulse">
                  ● ● ●
                </div>

              </div>

            </div>

          )}

          <div ref={chatEndRef}></div>

        </div>

        {/* INPUT AREA */}

        <div className="border-t border-gray-700 p-4 bg-[#171717]">

          <div className="flex flex-col gap-3">

            <div className="flex gap-2">

              <input
                type="text"
                value={message}
                placeholder="Ask healthcare question..."
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {

                  if (
                    e.key === "Enter" &&
                    !loading
                  ) {

                    sendMessage();
                  }
                }}
                className="flex-1 bg-[#303030] rounded-xl p-4 outline-none border border-gray-700"
              />

              <button
                onClick={startVoiceInput}
                className="bg-purple-600 hover:bg-purple-700 px-5 rounded-xl"
              >
                🎤
              </button>

              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-white text-black hover:bg-gray-200 px-6 rounded-xl font-semibold"
              >
                Send
              </button>

            </div>

            <div className="flex flex-wrap gap-2">

              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setSelectedFile(
                    e.target.files[0]
                  )
                }
                className="bg-[#303030] p-2 rounded-xl"
              />

              <button
                onClick={uploadPDF}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
              >
                Upload PDF
              </button>

              <button
                onClick={clearChats}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
              >
                Clear Chat
              </button>
              <button
  onClick={downloadPDF}
  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
>
  Download Report
</button>
<button
  onClick={predictDisease}
  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl"
>
  Predict Disease
</button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default App;